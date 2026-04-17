/**
 * WriteAnswer Exercise
 * 
 * User types the answer and system validates it.
 * - Correct → onAnswer(true) - "Easy" in SRS terms
 * - Incorrect → onAnswer(false) - "Again" in SRS terms
 */

import { useState, useRef, useEffect } from 'react'
import { useT } from '../../../i18n'
import SpeakerButton from '../../common/SpeakerButton'

export default function WriteAnswer({ exercise, onAnswer }) {
  const { t } = useT()
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    // Reset local state whenever the parent advances to a new exercise,
    // then refocus the input.
    setValue('')
    setSubmitted(false)
    setIsCorrect(false)
    inputRef.current?.focus()
  }, [exercise])

  // Normalize answer for comparison (trim, lowercase)
  const normalize = (str) => String(str || '').trim().toLowerCase()

  // Check if answer is correct
  const checkAnswer = (userAnswer) => {
    const normalized = normalize(userAnswer)
    
    // Support multiple correct answers
    if (Array.isArray(exercise.answers)) {
      return exercise.answers.some(a => normalize(a) === normalized)
    }
    
    return normalize(exercise.answer) === normalized
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const correct = checkAnswer(value)
    setIsCorrect(correct)
    setSubmitted(true)
    // Result is reported to the parent only when the user clicks Continue,
    // so the parent advances exactly once per exercise.
  }

  const handleSkip = () => {
    // Treat skip as incorrect; result is reported on Continue.
    setIsCorrect(false)
    setSubmitted(true)
  }

  const handleTryAgain = () => {
    setValue('')
    setSubmitted(false)
    setIsCorrect(false)
    inputRef.current?.focus()
  }

  // Show hint after incorrect attempt
  const showHint = () => {
    if (exercise.hint) {
      return (
        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <span className="text-yellow-400 text-sm">💡 {exercise.hint}</span>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      {/* Header */}
      <div className="text-sm text-text-muted mb-1 uppercase tracking-wide">
        {exercise.category || t('exercise_write_answer', 'Впишите ответ')}
      </div>
      
      {/* Prompt */}
      <p className="text-lg text-white mb-4 font-semibold">
        {exercise.prompt}
        {exercise.audio && (
          <SpeakerButton text={exercise.audio} size="sm" className="ml-2" />
        )}
      </p>

      {/* Input or Result */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={exercise.placeholder || t('type_your_answer', 'Введите ответ...')}
              className="w-full px-4 py-3 bg-bg border-2 border-border rounded-xl text-white text-lg
                         placeholder-text-muted/50 focus:border-accent focus:outline-none
                         transition-colors"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {value && (
              <button
                type="button"
                onClick={() => setValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Show expected format hint if available */}
          {exercise.format && (
            <p className="text-sm text-text-muted">
              {exercise.format}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex-1 py-3 rounded-xl font-bold text-white
                         bg-gradient-to-r from-green-600 to-emerald-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         hover:opacity-90 transition-opacity"
            >
              {t('check_answer', 'Проверить')}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="px-6 py-3 rounded-xl font-bold text-text-muted
                         border border-border hover:border-text-muted transition-colors"
            >
              {t('skip', 'Пропустить')}
            </button>
          </div>
        </form>
      ) : (
        <div className="animate-fade-in space-y-4">
          {/* Result */}
          <div className={`p-4 rounded-xl border-2 ${
            isCorrect 
              ? 'bg-green-500/10 border-green-500/50' 
              : 'bg-red-500/10 border-red-500/50'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{isCorrect ? '✅' : '❌'}</span>
              <div>
                <div className={`font-bold text-lg ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect 
                    ? t('correct', 'Правильно!') 
                    : t('incorrect', 'Неправильно')}
                </div>
                {!isCorrect && (
                  <div className="text-sm text-text-muted mt-1">
                    {t('correct_answer_was', 'Правильный ответ:')}
                    <span className="text-white font-semibold ml-2">
                      {Array.isArray(exercise.answers) 
                        ? exercise.answers.join(' / ') 
                        : exercise.answer}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hint after incorrect */}
          {!isCorrect && showHint()}

          {/* Actions */}
          <div className="flex gap-3">
            {!isCorrect && (
              <button
                onClick={handleTryAgain}
                className="flex-1 py-3 rounded-xl font-bold text-white
                           bg-gradient-to-r from-purple-600 to-indigo-600
                           hover:opacity-90 transition-opacity"
              >
                {t('try_again', 'Ещё раз')}
              </button>
            )}
            <button
              onClick={() => onAnswer(isCorrect)}
              className="flex-1 py-3 rounded-xl font-bold text-white
                         bg-gradient-to-r from-blue-600 to-cyan-600
                         hover:opacity-90 transition-opacity"
            >
              {t('continue', 'Продолжить')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
