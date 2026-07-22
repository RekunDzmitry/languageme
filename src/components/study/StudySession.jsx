import { useState, useCallback, useEffect, useRef } from 'react'
import { useProgress } from '../../stores/UserProgressContext'
import { useSettings } from '../../stores/SettingsContext'
import { useT } from '../../i18n'
import { getVocab } from '../../data/courses'
import { getStudyableCards, getStudyableCardsDetailed } from './studyQueue'
import { stopSpeaking } from '../../utils/audio'
import { studyApi } from '../../api/client'
import Flashcard from './Flashcard'
import VocabNoteModal from '../themes/exercises/VocabNoteModal'

const BATCH_SIZE = 10

export default function StudySession({ themeVocab = null, route = 'learn', themeId = null }) {
  const { cards, isProgressLoading, userVocab, rateCard, userMnemonics, vocabNotes, saveVocabNote, clearVocabNote, showNotification, incrementStreak } = useProgress()
  const { settings } = useSettings()
  const { t } = useT()
  const targetLang = settings.targetLang
  const VOCAB = getVocab(targetLang)
  const seenIdsRef = useRef(new Set())
  const cardsRef = useRef(cards)
  useEffect(() => { cardsRef.current = cards }, [cards])
  // Guard against React 18 StrictMode double-invoke. The ref
  // persists across the two render passes (same component instance)
  // so the guard fires sessionStart exactly once.
  const sessionStartFiredRef = useRef(false)

  const [queue, setQueue] = useState(() => {
    const pool = themeVocab || VOCAB
    const initial = getStudyableCards(pool, cards, seenIdsRef.current).slice(0, BATCH_SIZE)
    initial.forEach(w => seenIdsRef.current.add(w.id))
    return initial
  })

  // Fire sessionStart AFTER the queue stabilizes. The lazy useState
  // init above runs before fetchProgress completes (cards is still
  // null), so the initial queue doesn't include user cards that load
  // Fire sessionStart AFTER the queue stabilizes. Three conditions
  // must hold: (1) the progress fetch has completed (isProgressLoading
  // flipped to false) so userVocab is populated from the database,
  // (2) the queue has been built from the lazy init, and (3) the
  // 500ms debounce has elapsed so any async refill of missing
  // cards (from a freshly-loaded userVocab) has settled. Without
  // the isProgressLoading guard, the timer fires while fetchProgress
  // is still in flight — userVocab is {} so the pool is static-only
  // and a user card filed seconds earlier is silently absent from
  // the logged queue.
  useEffect(() => {
    if (sessionStartFiredRef.current) return
    if (isProgressLoading) return
    const timer = setTimeout(() => {
      if (sessionStartFiredRef.current) return
      sessionStartFiredRef.current = true
      // Recompute the due/newC halves at fire-time so the server log
      // shows exactly what the client built from the pool+cards,
      // not the BATCH_SIZE-sliced queue. The refill effect may have
      // already prepended user cards by this point, so the
      const pool = themeVocab || VOCAB
      const { due, newC, queue: allQueue } = getStudyableCardsDetailed(pool, cards, seenIdsRef.current)
      // Diagnostic stats so the server log can pinpoint where the
      // user card is being filtered out: userVocabCount = how many
      // user cards the React context has after fetchProgress;
      // poolUsrCount = how many of those actually made it into
      // the pool (i.e. matched the scope filter); cardsCount = how
      // many srs_card rows the client has. If userVocabCount > 0
      // but poolUsrCount === 0, the scope filter is dropping the
      // card (themeId mismatch). If poolUsrCount > 0 but the user
      // card is missing from queue, the BATCH_SIZE slice dropped
      // it (position >= 10 in due+newC).
      const poolUsrCount = pool.filter((w) => w.id?.startsWith?.('usr_')).length
      const userVocabCount = userVocab ? Object.keys(userVocab).length : 0
      const cardsCount = cards ? Object.keys(cards).length : 0
      studyApi.sessionStart({
        route,
        themeId,
        targetLang,
        queue: queue.map(w => w.id),
        due: due.map(w => w.id),
        newC: newC.map(w => w.id),
        poolSize: allQueue.length,
        userVocabCount,
        poolUsrCount,
        cardsCount,
      }).catch(() => {})
    }, 500)
    return () => clearTimeout(timer)
  }, [isProgressLoading, queue, route, themeId, targetLang])
  const [flipped, setFlipped] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const [sessionComplete, setSessionComplete] = useState(false)
  const [allWordsExhausted, setAllWordsExhausted] = useState(false)
  const [vocabNoteModal, setVocabNoteModal] = useState(null) // { vocabId, word }
  const currentWordRef = useRef(null)

  useEffect(() => { currentWordRef.current = queue[0] || null })
  // The lazy useState init above only runs once, so it captures
  // themeVocab at mount time. For pages that load user-authored
  // cards asynchronously (e.g. /learn for a pack whose user cards
  // load after the static pool, or /study/<catch-all-theme> right
  // after the user creates a card), the pool arrives AFTER the
  // queue is already populated with seed cards. Without this
  // effect, the user card never reaches the queue. Whenever the
  // pool changes, prepend any missing cards (up to the batch
  // room). The user-first tiebreaker in getStudyableCards means
  // a newly-arrived user card is prepended, so the learner
  // sees their own card first without waiting for the next
  // manual refresh. This is a no-op for the steady-state case
  // (pool unchanged, queue has all available cards) and for
  // the mid-session case (the pool doesn't grow while a user
  // is studying, so `missing` stays empty).
  useEffect(() => {
    if (sessionComplete) return
    const pool = themeVocab || VOCAB
    const allAvailable = getStudyableCards(pool, cards, seenIdsRef.current)
    const inQueue = new Set(queue.map((w) => w.id))
    const missing = allAvailable.filter((w) => !inQueue.has(w.id))
    if (missing.length === 0) return
    // Make room at the tail if the initial batch of seed cards
    // already filled BATCH_SIZE — a newly-arrived user card must
    // still be prepended (user-first priority) even at the cost
    // of dropping the last seed card from the current batch.
    // Cap overflow at queue.length: missing can be much larger
    // than the batch (all the unqueued seed cards), but we only
    // ever drop from the existing tail.
    const overflow = Math.min(
      queue.length,
      Math.max(0, queue.length + missing.length - BATCH_SIZE)
    )
    if (overflow > 0) {
      for (let i = 0; i < overflow; i++) {
        seenIdsRef.current.delete(queue[queue.length - 1 - i].id)
      }
    }
    const roomAfterDrop = BATCH_SIZE - (queue.length - overflow)
    const toAdd = missing.slice(0, roomAfterDrop)
    if (toAdd.length === 0) return
    toAdd.forEach((w) => seenIdsRef.current.add(w.id))
    setQueue((prev) => [...toAdd, ...prev.slice(0, prev.length - overflow)])
  }, [themeVocab, cards, sessionComplete])

  const handleRate = useCallback((quality) => {
    if (!currentWordRef.current) return
    stopSpeaking()
    const word = currentWordRef.current
    // Compute the remaining queue the same way the setQueue updater
    // below does, so we can pass it to rateCard for the analytics
    // log. Mirrors the setQueue logic exactly to avoid drift.
    const remainingForLog = queue.slice(1)
    if (quality === 0) remainingForLog.push(queue[0])
    rateCard(word.id, quality, remainingForLog.map(w => w.id))

    setQueue(prev => {
      const remaining = prev.slice(1)
      if (quality === 0) remaining.push(prev[0])
      if (remaining.length === 0) {
        const pool = themeVocab || VOCAB
        const nextBatch = getStudyableCards(pool, cardsRef.current, seenIdsRef.current)
          .slice(0, BATCH_SIZE)
        if (nextBatch.length > 0) {
          nextBatch.forEach(w => seenIdsRef.current.add(w.id))
          return [...remaining, ...nextBatch]
        }
        setAllWordsExhausted(true)
        setSessionComplete(true)
      }
      return remaining
    })
    setFlipped(false)
  }, [rateCard, themeVocab, queue])

  // Handle session completion notification
  useEffect(() => {
    if (!sessionComplete) return
    incrementStreak()
    showNotification(t('study_complete', { count: sessionStats.total }), 'success')
  }, [sessionComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentWord = queue[0] || null
  const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0

  if (!currentWord) {
    return (
      <div className="max-w-xl mx-auto px-5 py-10 text-center">
        <div className="text-5xl mb-4">{allWordsExhausted ? '🏆' : '🎉'}</div>
        <h2 className="text-2xl font-extrabold text-white mb-2">
          {allWordsExhausted
            ? t('study_all_words_learned')
            : sessionStats.total > 0 ? t('study_complete', { count: sessionStats.total }) : t('study_all_caught_up')}
        </h2>
        {sessionStats.total > 0 && (
          <div className="text-lg text-text-muted mt-1">
            {t('study_words_studied', { count: sessionStats.total })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-5 pb-24">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1">
          <div className="bg-white/[0.08] rounded-md h-1.5 overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-md transition-width"
              style={{ width: `${accuracy}%` }}
            />
          </div>
          <span className="text-xs text-text-muted">
            {sessionStats.total} {t('study_done')}
          </span>
        </div>
        <button
          onClick={() => { setSessionComplete(true); setQueue([]) }}
          className="px-3 py-1.5 text-xs font-medium text-text-muted bg-white/[0.08] hover:bg-white/[0.15] rounded-lg transition-colors"
        >
          {t('study_finish')}
        </button>
      </div>

      <Flashcard
        word={currentWord}
        flipped={flipped}
        onFlip={() => setFlipped(true)}
        userMnemonic={userMnemonics[currentWord.id]}
        vocabNote={vocabNotes?.[currentWord.id]}
        onNoteClick={() => setVocabNoteModal({ vocabId: currentWord.id, word: currentWord })}
        onRate={handleRate}
      />

      {/* Vocab note modal */}
      {vocabNoteModal && (
        <VocabNoteModal
          vocabId={vocabNoteModal.vocabId}
          vocabNote={vocabNotes?.[vocabNoteModal.vocabId]}
          wordPrompt={vocabNoteModal.word?.translations?.ru || vocabNoteModal.word?.target || vocabNoteModal.vocabId}
          onSave={saveVocabNote}
          onDelete={clearVocabNote}
          onClose={() => setVocabNoteModal(null)}
        />
      )}
    </div>
  )
}
