import { useState, useEffect } from 'react'
import { useT } from '../../../i18n'
import { speak } from '../../../utils/audio'
import SpeakerButton from '../../common/SpeakerButton'

export default function FillBlank({ exercise, onAnswer }) {
  const { t } = useT()
  const [revealed, setRevealed] = useState(false)

  const fullSentence = exercise.sentence.replace('___', exercise.answer)

  function handleReveal() {
    setRevealed(true)
    speak(fullSentence)
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-lg text-white mb-4 leading-relaxed">
        {exercise.sentence.split('___').map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 && (
              <span className="inline-block min-w-[80px] border-b-2 border-accent mx-1 text-accent font-bold">
                {revealed ? exercise.answer : ''}
              </span>
            )}
          </span>
        ))}
      </p>
      {!revealed ? (
        <button
          onClick={handleReveal}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 transition-opacity"
        >
          {t('study_tap_reveal')}
        </button>
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-text-muted">{t('correct_answer')}:</span>
            <span className="text-white font-bold">{exercise.answer}</span>
            <SpeakerButton text={fullSentence} size="sm" />
          </div>
          <div className="text-sm text-text-muted mb-2">{t('study_how_well')}</div>
          <div className="flex gap-3">
            <button
              onClick={() => onAnswer(true)}
              className="px-6 py-2.5 rounded-xl font-bold text-green-400 border border-green-400/40 hover:bg-green-400/10 transition-colors"
            >
              {t('exercise_correct')}
            </button>
            <button
              onClick={() => onAnswer(false)}
              className="px-6 py-2.5 rounded-xl font-bold text-red-400 border border-red-400/40 hover:bg-red-400/10 transition-colors"
            >
              {t('exercise_incorrect')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
