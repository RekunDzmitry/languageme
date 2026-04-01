import { useState, useCallback } from 'react'
import { useT } from '../../i18n'
import { useProgress } from '../../stores/UserProgressContext'
import FillBlank from './exercises/FillBlank'
import MultipleChoice from './exercises/MultipleChoice'
import Conjugation from './exercises/Conjugation'
import Translation from './exercises/Translation'
import Matching from './exercises/Matching'

const EXERCISE_COMPONENTS = {
  fill_blank: FillBlank,
  multiple_choice: MultipleChoice,
  conjugation: Conjugation,
  translation: Translation,
  matching: Matching,
}

export default function ExerciseSection({ section, themeId }) {
  const { t } = useT()
  const { updateThemeProgress } = useProgress()
  const [currentIdx, setCurrentIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const exercises = section.exercises || []

  const handleAnswer = useCallback((correct) => {
    if (correct) setScore(s => s + 1)

    if (currentIdx + 1 >= exercises.length) {
      const finalScore = correct ? score + 1 : score
      const pct = Math.round((finalScore / exercises.length) * 100)
      setCompleted(true)
      updateThemeProgress(themeId, {
        exercisesCompleted: exercises.length,
        bestScore: pct,
        completedAt: pct >= 60 ? new Date().toISOString() : undefined,
      })
    } else {
      setTimeout(() => setCurrentIdx(i => i + 1), 1200)
    }
  }, [currentIdx, exercises.length, score, themeId, updateThemeProgress])

  if (exercises.length === 0) {
    return <div className="text-text-muted text-sm py-4">Нет упражнений для этой темы.</div>
  }

  if (completed) {
    const pct = Math.round((score / exercises.length) * 100)
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'}</div>
        <h3 className="text-2xl font-extrabold text-white mb-2">{t('exercise_score')}: {pct}%</h3>
        <p className="text-text-muted">{score}/{exercises.length}</p>
        <button
          onClick={() => { setCurrentIdx(0); setScore(0); setCompleted(false); }}
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-text-muted">{currentIdx + 1} / {exercises.length}</span>
        <div className="flex gap-1">
          {exercises.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < currentIdx ? 'bg-green-400' : i === currentIdx ? 'bg-accent' : 'bg-white/10'}`}
            />
          ))}
        </div>
      </div>
      <Component exercise={exercise} onAnswer={handleAnswer} />
    </div>
  )
}
