import { useState, useEffect } from 'react'
import { useT } from '../../../i18n'
import { speak } from '../../../utils/audio'
import SpeakerButton from '../../common/SpeakerButton'

export default function Translation({ exercise, onAnswer }) {
  const { t } = useT()
  const [revealed, setRevealed] = useState(false)

  function handleReveal() {
    setRevealed(true)
    speak(exercise.answer)
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="text-sm text-text-muted mb-1 uppercase tracking-wide">Перевод</div>
      <p className="text-lg text-white mb-4 font-semibold">{exercise.prompt}</p>
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
            <span className="text-white text-xl font-bold">{exercise.answer}</span>
            <SpeakerButton text={exercise.answer} size="sm" />
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
