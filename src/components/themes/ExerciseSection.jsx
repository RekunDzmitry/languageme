import { useState, useCallback, useMemo, useEffect } from 'react'
import { useT } from '../../i18n'
import { useProgress } from '../../stores/UserProgressContext'
import FillBlank from './exercises/FillBlank'
import MultipleChoice from './exercises/MultipleChoice'
import Conjugation from './exercises/Conjugation'
import Translation from './exercises/Translation'
import Matching from './exercises/Matching'
import WriteAnswer from './exercises/WriteAnswer'
import { getQualityFromAttempts } from './exercises/attemptLevels'

const EXERCISE_COMPONENTS = {
  fill_blank: FillBlank,
  multiple_choice: MultipleChoice,
  conjugation: Conjugation,
  translation: Translation,
  matching: Matching,
  write_answer: WriteAnswer,
}

function buildInitialQueue(exercises, themeId, cards) {
  const cardMap = cards || {}
  const now = Date.now()
  return exercises
    .map((_, idx) => idx)
    .filter(idx => {
      const key = `${themeId}:${idx}`
      const card = cardMap[key]
      // Include if: no card exists, never reviewed (reps=0), or past due date
      return !card || card.reps === 0 || (card.due && card.due <= now)
    })
}

export default function ExerciseSection({ section, themeId, onExerciseAnswer }) {
  const { t } = useT()
  const { rateExercise, updateThemeProgress, exerciseCards, exerciseNotes, saveExerciseNote, clearExerciseNote, exerciseAnswerOverrides, saveExerciseAnswerOverride, clearExerciseAnswerOverride } = useProgress()
  const exercises = useMemo(() => section.exercises || [], [section.exercises])

  const [queueRevision, setQueueRevision] = useState(0)
  // Queue is state, not derived. When a wrong answer rotates an exercise to
  // the end of the queue we manipulate the array explicitly; deriving the
  // queue from an errored-set while also incrementing queuePos caused the
  // next index to skip a slot (the prior bug).
  const [queue, setQueue] = useState(() =>
    buildInitialQueue(exercises, themeId, exerciseCards)
  )
  const [queuePos, setQueuePos] = useState(0)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  // Purely for visual indicators (orange dots, retry warning) — queue ordering
  // lives in `queue` state now.
  const [erroredExercises, setErroredExercises] = useState(new Set())
  const [sessionResults, setSessionResults] = useState({})
  // Cumulative attempts per exercise idx across visits in the current session.
  // Persisting across visits lets the SM-2 rating reflect accumulated
  // difficulty (a word missed twice then answered right = "Hard", not "Easy").
  const [attemptCounts, setAttemptCounts] = useState({})

  // Reset session and rebuild queue when theme, exercises, or user-requested
  // restart (queueRevision) changes. exerciseCards is intentionally excluded
  // from deps so mid-session card updates (from rateExercise) don't reshuffle
  // the queue and drop the just-answered exercise.
  useEffect(() => {
    setQueue(buildInitialQueue(exercises, themeId, exerciseCards))
    setQueuePos(0)
    setScore(0)
    setCompleted(false)
    setErroredExercises(new Set())
    setSessionResults({})
    setAttemptCounts({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeId, exercises, queueRevision])

  const currentIdx = queue[queuePos]

  const handleAnswer = useCallback((correct, extra = {}) => {
    const { hasErrored = false, attempts = 1 } = extra || {}
    const idx = currentIdx
    if (idx === undefined) return

    const exerciseKey = `${themeId}:${idx}`
    const prevCumulative = attemptCounts[idx] || 0
    const totalAttempts = prevCumulative + attempts
    // Quality is computed from cumulative attempts so multiple failed visits
    // accumulate into the final rating instead of resetting to "Easy" when the
    // user eventually answers correctly.
    const quality = getQualityFromAttempts(totalAttempts, correct)

    setAttemptCounts(prev => ({ ...prev, [idx]: totalAttempts }))
    setSessionResults(prev => ({
      ...prev,
      [idx]: { correct, quality, attempts: totalAttempts }
    }))

    if (correct) {
      setScore(s => s + 1)
    }

    rateExercise(exerciseKey, themeId, quality)

    if (correct && erroredExercises.has(idx)) {
      setErroredExercises(prev => {
        const next = new Set(prev)
        next.delete(idx)
        return next
      })
    } else if (!correct && hasErrored) {
      setErroredExercises(prev => new Set([...prev, idx]))
    }

    if (onExerciseAnswer) {
      onExerciseAnswer(exerciseKey, correct)
    }

    const isLast = queuePos + 1 >= queue.length

    if (isLast) {
      const finalScore = correct ? score + 1 : score
      const pct = Math.round((finalScore / queue.length) * 100)
      setCompleted(true)
      updateThemeProgress(themeId, {
        exercisesCompleted: queue.length,
        bestScore: pct,
        completedAt: pct >= 60 ? new Date().toISOString() : undefined,
      })
    } else if (!correct && hasErrored) {
      // Rotate current item to the end so the user revisits it later in the
      // session. queuePos stays — the next item naturally shifts into view.
      setQueue(q => {
        const next = [...q]
        const [item] = next.splice(queuePos, 1)
        next.push(item)
        return next
      })
    } else {
      setTimeout(() => setQueuePos(p => p + 1), 1200)
    }
  }, [currentIdx, queue.length, queuePos, score, themeId, updateThemeProgress, rateExercise, onExerciseAnswer, erroredExercises, attemptCounts])

  // Session stats
  const sessionStats = useMemo(() => {
    const stats = { easy: 0, good: 0, hard: 0, again: 0 }
    Object.values(sessionResults).forEach(result => {
      if (result.quality === 3) stats.easy++
      else if (result.quality === 2) stats.good++
      else if (result.quality === 1) stats.hard++
      else stats.again++
    })
    return stats
  }, [sessionResults])

  if (exercises.length === 0) {
    return <div className="text-text-muted text-sm py-4">Нет упражнений для этой темы.</div>
  }

  if (queue.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl font-extrabold text-white mb-2">{t('all_caught_up', 'Всё пройдено!')}</h3>
        <p className="text-text-muted text-sm">{t('come_back_later', 'Возвращайтесь, когда карточки снова будут готовы к повторению.')}</p>
      </div>
    )
  }

  if (completed) {
    const finalPct = Math.round((score / queue.length) * 100)

    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">{finalPct >= 80 ? '🎉' : finalPct >= 60 ? '👍' : '💪'}</div>
        <h3 className="text-2xl font-extrabold text-white mb-2">{t('exercise_score')}: {finalPct}%</h3>

        {/* Result breakdown */}
        <div className="flex justify-center gap-4 mt-4 mb-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10">
            <span className="text-green-400 font-bold">{sessionStats.easy}</span>
            <span className="text-green-400 text-sm">😄</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10">
            <span className="text-blue-400 font-bold">{sessionStats.good}</span>
            <span className="text-blue-400 text-sm">🙂</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10">
            <span className="text-amber-400 font-bold">{sessionStats.hard}</span>
            <span className="text-amber-400 text-sm">🤔</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10">
            <span className="text-red-400 font-bold">{sessionStats.again}</span>
            <span className="text-red-400 text-sm">🔄</span>
          </div>
        </div>

        <p className="text-text-muted">{score}/{queue.length}</p>
        <button
          onClick={() => setQueueRevision(r => r + 1)}
          className="mt-4 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl border-none cursor-pointer hover:scale-105 transition-transform"
        >
          {t('rating_again')}
        </button>
      </div>
    )
  }

  const exercise = exercises[currentIdx]
  const Component = EXERCISE_COMPONENTS[exercise.type]

  if (!Component) {
    return <div className="text-red-400">Unknown exercise type: {exercise.type}</div>
  }

  // Get current exercise prompt (word in native language) for display
  const currentPrompt = exercise?.prompt || `${queuePos + 1}`
  const exerciseKey = `${themeId}:${currentIdx}`

  return (
    <div>
      {/* Session stats bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-text-muted">{currentPrompt} / {queue.length}</span>

        {/* Running stats */}
        <div className="flex items-center gap-2">
          {sessionStats.easy > 0 && (
            <span className="text-xs text-green-400" title="Easy (1st try)">😄 {sessionStats.easy}</span>
          )}
          {sessionStats.good > 0 && (
            <span className="text-xs text-blue-400" title="Good (2nd try)">🙂 {sessionStats.good}</span>
          )}
          {sessionStats.hard > 0 && (
            <span className="text-xs text-amber-400" title="Hard (3rd try)">🤔 {sessionStats.hard}</span>
          )}
          {sessionStats.again > 0 && (
            <span className="text-xs text-red-400" title="Again (4+ tries)">🔄 {sessionStats.again}</span>
          )}
        </div>
      </div>

      {/* Queue progress dots with errored indicators */}
      <div className="flex gap-1 mb-4">
        {queue.map((idx, i) => {
          const result = sessionResults[idx]
          const isErrored = erroredExercises.has(idx)
          let dotClass = 'bg-white/10'

          if (result) {
            if (result.quality === 3) dotClass = 'bg-green-400'
            else if (result.quality === 2) dotClass = 'bg-blue-400'
            else if (result.quality === 1) dotClass = 'bg-amber-400'
            else dotClass = 'bg-red-400'
          }

          return (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i === queuePos ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg' : ''} ${dotClass} ${isErrored && !result ? 'animate-pulse bg-orange-400' : ''}`}
              title={`${exercises[idx]?.prompt || idx + 1}${isErrored ? ' ❌' : ''}`}
            />
          )
        })}
      </div>

      {/* Warning if next exercise is errored */}
      {queuePos < queue.length - 1 && erroredExercises.has(queue[queuePos + 1]) && (
        <div className="mb-3 px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-xs text-orange-400">
          ⚠️ {t('errored_will_retry', 'Ошибка будет повторена позже')}
        </div>
      )}

      <Component
        key={currentIdx}
        exercise={exercise}
        onAnswer={handleAnswer}
        priorAttempts={attemptCounts[currentIdx] || 0}
        exerciseKey={exerciseKey}
        themeId={themeId}
        note={exerciseNotes?.[exerciseKey] || null}
        onNoteSave={saveExerciseNote}
        onNoteDelete={clearExerciseNote}
        userAnswerOverride={exerciseAnswerOverrides?.[exerciseKey]}
        onSaveAnswerOverride={saveExerciseAnswerOverride}
        onClearAnswerOverride={clearExerciseAnswerOverride}
      />
    </div>
  )
}
