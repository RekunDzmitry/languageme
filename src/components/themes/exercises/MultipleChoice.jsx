import { useState, useEffect } from 'react'
import { useT } from '../../../i18n'
import { speak } from '../../../utils/audio'
import SpeakerButton from '../../common/SpeakerButton'

export default function MultipleChoice({ exercise, onAnswer }) {
  const { t } = useT()
  const [result, setResult] = useState(null)
  const [selectedIdx, setSelectedIdx] = useState(null)

  const correctAnswer = exercise.options[exercise.correctIndex]

  const handleSelect = (idx) => {
    if (result !== null) return
    setSelectedIdx(idx)
    const correct = idx === exercise.correctIndex
    setResult(correct)
    onAnswer(correct)
  }

  useEffect(() => {
    if (result !== null) speak(correctAnswer)
  }, [result]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-lg text-white mb-4 font-semibold">{exercise.prompt}</p>
      <div className="space-y-2">
        {exercise.options.map((opt, i) => {
          let cls = 'bg-bg border border-border hover:border-accent/50'
          if (result !== null) {
            if (i === exercise.correctIndex) cls = 'bg-green-500/10 border border-green-500'
            else if (i === selectedIdx) cls = 'bg-red-500/10 border border-red-500'
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full text-left px-4 py-3 rounded-lg text-text-primary font-medium cursor-pointer transition-colors ${cls}`}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {result !== null && (
        <div className="mt-3 flex items-center gap-2">
          <div className={`text-sm font-bold ${result ? 'text-green-400' : 'text-red-400'}`}>
            {result ? t('exercise_correct') : t('exercise_incorrect')}
          </div>
          <SpeakerButton text={correctAnswer} size="sm" />
        </div>
      )}
    </div>
  )
}
