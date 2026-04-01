import { useState, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../../i18n'
import { useProgress } from '../../stores/UserProgressContext'
import { buildSessionQueue, conjugateEr, conjCardKey } from '../../utils/conjugation'
import { themes } from '../../data/courses/fr/themes/theme01-pronouns-present'
import { getThemeConjugationMastery, getConjugationDueCount } from '../../utils/progress'
import ConjugationExercise from './ConjugationExercise'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ConjugationSession({ themeId = null }) {
  const { conjugationCards, rateConjugation, userMnemonics, saveMnemonic } = useProgress()
  const { t } = useT()
  const navigate = useNavigate()

  const [started, setStarted] = useState(false)

  // Collect verbs: from a specific theme or all themes with content
  const verbList = useMemo(() => {
    if (themeId) {
      const theme = themes.find(th => th.id === themeId)
      return theme?.verbList || []
    }
    const seen = new Set()
    const verbs = []
    for (const theme of themes) {
      if (theme.verbList?.length > 0) {
        for (const verb of theme.verbList) {
          const dedup = `${verb.infinitive}:${verb.participePasse ? 'pc' : 'pr'}`
          if (!seen.has(dedup)) {
            seen.add(dedup)
            verbs.push(verb)
          }
        }
      }
    }
    return verbs
  }, [themeId])

  const themeName = useMemo(() => {
    if (!themeId) return null
    const theme = themes.find(th => th.id === themeId)
    return theme?.titleRu || themeId
  }, [themeId])

  const dueCount = useMemo(
    () => getConjugationDueCount(conjugationCards, verbList),
    [conjugationCards, verbList]
  )

  const mastery = useMemo(
    () => getThemeConjugationMastery(conjugationCards, verbList),
    [conjugationCards, verbList]
  )

  const seenKeysRef = useRef(new Set())
  const conjCardsRef = useRef(conjugationCards)
  conjCardsRef.current = conjugationCards

  const [queue, setQueue] = useState([])
  const [done, setDone] = useState(0)
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const [sessionComplete, setSessionComplete] = useState(false)
  const [allWordsExhausted, setAllWordsExhausted] = useState(false)

  const handleStart = useCallback(() => {
    const initial = buildSessionQueue(conjugationCards, verbList)
    const q = themeId ? initial : shuffle(initial)
    q.forEach(item => seenKeysRef.current.add(item.key))
    setQueue(q)
    setStarted(true)
  }, [conjugationCards, verbList, themeId])

  const current = queue[0] || null
  const totalInSession = done + queue.length

  const handleResult = useCallback((quality) => {
    if (!current) return
    console.log(`[handleResult] key="${current.key}", quality=${quality}, queueLen=${queue.length}`)
    rateConjugation(current.key, quality)

    const correct = quality >= 2
    setSessionStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))

    const remaining = queue.slice(1)
    if (quality === 0) remaining.push(current)
    console.log(`[handleResult] remaining=${remaining.length}, requeued=${quality === 0}`)

    setDone(d => d + 1)

    if (remaining.length === 0) {
      const nextBatch = buildSessionQueue(conjCardsRef.current, verbList)
        .filter(item => !seenKeysRef.current.has(item.key))
        .slice(0, 12)
      nextBatch.forEach(item => seenKeysRef.current.add(item.key))
      if (nextBatch.length > 0) {
        setQueue([...remaining, ...(themeId ? nextBatch : shuffle(nextBatch))])
        return
      }
      setAllWordsExhausted(true)
      setSessionComplete(true)
    }

    setQueue(remaining)
  }, [current, queue, rateConjugation, verbList, themeId])

  const accuracy = sessionStats.total > 0
    ? Math.round((sessionStats.correct / sessionStats.total) * 100)
    : 0

  // Pre-session screen
  if (!started) {
    return (
      <div className="max-w-xl mx-auto px-5 py-10">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">{themeId ? '📖' : '🎲'}</div>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            {themeName || t('learn_random_practice')}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{dueCount}</div>
            <div className="text-xs text-text-muted mt-1">{t('due_for_review')}</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{verbList.length}</div>
            <div className="text-xs text-text-muted mt-1">{t('learn_verbs')}</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{mastery.percent}%</div>
            <div className="text-xs text-text-muted mt-1">{t('learn_mastery')}</div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleStart}
            className="group relative w-36 h-36 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 border-none cursor-pointer flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-shadow"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 animate-pulse opacity-30" />
            <span className="text-white text-4xl font-extrabold tracking-wider relative z-10 group-hover:scale-110 transition-transform">GO</span>
          </button>
        </div>
        <div className="text-center mt-4 text-sm text-text-muted">{t('learn_start_session')}</div>
      </div>
    )
  }

  // Completion screen
  if (!current) {
    return (
      <div className="max-w-xl mx-auto px-5 py-10 text-center">
        <div className="text-5xl mb-4">{allWordsExhausted ? '🏆' : '🎉'}</div>
        <h2 className="text-2xl font-extrabold text-white mb-2">
          {allWordsExhausted ? t('study_all_words_learned') : t('session_complete')}
        </h2>
        {sessionStats.total > 0 && (
          <div className="text-lg text-text-muted mt-1 mb-6">
            {t('study_words_studied', { count: sessionStats.total })}
          </div>
        )}
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          {t('back_home')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-5 pb-24">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <div className="bg-white/[0.08] rounded-md h-2 overflow-hidden mb-1.5">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-md transition-width"
              style={{ width: totalInSession > 0 ? `${(done / totalInSession) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs text-text-muted">
            {done} {t('study_done')}
          </span>
        </div>
        <button
          onClick={() => { setSessionComplete(true); setQueue([]) }}
          className="px-3 py-1.5 text-xs font-medium text-text-muted bg-white/[0.08] hover:bg-white/[0.15] rounded-lg transition-colors"
        >
          {t('study_finish')}
        </button>
      </div>

      <ConjugationExercise item={current} onResult={handleResult} userMnemonics={userMnemonics} onSaveMnemonic={saveMnemonic} />
    </div>
  )
}
