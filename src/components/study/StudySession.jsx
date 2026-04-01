import { useState, useCallback, useEffect, useRef } from 'react'
import { useProgress } from '../../stores/UserProgressContext'
import { useSettings } from '../../stores/SettingsContext'
import { useT } from '../../i18n'
import { VOCAB } from '../../data/courses/fr/vocab'
// getDueCards/getNewCards replaced by inline getStudyableCards
import { stopSpeaking } from '../../utils/audio'
import Flashcard from './Flashcard'
import RatingButtons from './RatingButtons'

const BATCH_SIZE = 10

function getStudyableCards(pool, cards, excludeIds) {
  const now = Date.now()
  const due = pool.filter(w => !excludeIds.has(w.id) && cards[w.id]?.due <= now)
  const newC = pool.filter(w => !excludeIds.has(w.id) && (!cards[w.id] || (cards[w.id].reps === 0 && !cards[w.id].lastReviewed)))
    .filter(c => !due.find(d => d.id === c.id))
  return [...due, ...newC]
}

export default function StudySession({ themeVocab = null }) {
  const { cards, rateCard, userMnemonics, showNotification, incrementStreak } = useProgress()
  const { settings } = useSettings()
  const { t } = useT()
  const seenIdsRef = useRef(new Set())
  const cardsRef = useRef(cards)
  useEffect(() => { cardsRef.current = cards }, [cards])

  const [queue, setQueue] = useState(() => {
    const pool = themeVocab || VOCAB
    const initial = getStudyableCards(pool, cards, seenIdsRef.current).slice(0, BATCH_SIZE)
    initial.forEach(w => seenIdsRef.current.add(w.id))
    return initial
  })
  const [flipped, setFlipped] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const [sessionComplete, setSessionComplete] = useState(false)
  const [allWordsExhausted, setAllWordsExhausted] = useState(false)
  const currentWordRef = useRef(null)

  useEffect(() => { currentWordRef.current = queue[0] || null })

  const handleRate = useCallback((quality) => {
    if (!currentWordRef.current) return
    stopSpeaking()
    const word = currentWordRef.current
    rateCard(word.id, quality)

    const correct = quality >= 2
    setSessionStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))

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
  }, [rateCard, themeVocab])

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
        autoPlay={settings.autoPlayAudio}
      />

      {flipped && <RatingButtons onRate={handleRate} />}
    </div>
  )
}
