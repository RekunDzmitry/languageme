/**
 * WriteAnswer Exercise
 * 
 * User types the answer and system validates it.
 * Tracks attempts for quality rating:
 * - Easy: correct from 1st attempt (quality 3)
 * - Good: correct from 2nd attempt (quality 2)
 * - Hard: correct from 3rd attempt (quality 1)
 * - Again: 4+ attempts until correct (quality 0)
 * 
 * For Polish exercises: auto-advances after showing verbose result.
 * No Try Again / Continue buttons - system auto-advances.
 */

import { useState, useEffect } from 'react'
import { useT } from '../../../i18n'
import SpeakerButton from '../../common/SpeakerButton'
import { getResultLevel, getQualityFromAttempts } from './attemptLevels'
import ExerciseNotePanel from './ExerciseNotePanel'

export default function WriteAnswer({ exercise, onAnswer, priorAttempts = 0, exerciseKey, themeId, note, onNoteSave, onNoteDelete }) {
  const { t } = useT()
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [hasErrored, setHasErrored] = useState(false)
  const [showNotePanel, setShowNotePanel] = useState(false)

  // Close note panel when exercise changes (new key)
  useEffect(() => {
    setShowNotePanel(false)
  }, [exerciseKey])

  // Cumulative attempts across visits in the current session. Used for the
  // attempt-level label so a user who errored previously and now succeeds
  // sees "Со второй попытки" rather than "С первой попытки".
  const totalAttempts = priorAttempts + attempts

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

    const newAttempts = attempts + 1
    const correct = checkAnswer(value)
    
    setIsCorrect(correct)
    setSubmitted(true)
    setAttempts(newAttempts)
    
    if (!correct) {
      setHasErrored(true)
      // Don't auto-advance on incorrect - wait for user to click Continue
    } else {
      // Auto-advance after showing result on correct
      setTimeout(() => {
        const quality = getQualityFromAttempts(newAttempts, correct)
        onAnswer(correct, { quality, hasErrored: false, attempts: newAttempts })
      }, 1500)
    }
  }

  const handleSkip = () => {
    const newAttempts = attempts + 1
    setIsCorrect(false)
    setSubmitted(true)
    setAttempts(newAttempts)
    setHasErrored(true)
    // Don't auto-advance on skip - wait for user to click Continue
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

  // Attempt level shown to the user. AGAIN is reserved for wrong answers, so
  // a correct answer after 4+ attempts still lands on HARD rather than AGAIN.
  const attemptLevel = getResultLevel(totalAttempts, isCorrect)

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-text-muted uppercase tracking-wide">
          {exercise.category || t('exercise_write_answer', 'Впишите ответ')}
        </div>
        <div className="flex items-center gap-2">
          {/* Note toggle button */}
          {exerciseKey && onNoteSave && (
            <button
              type="button"
              onClick={() => setShowNotePanel(p => !p)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors
                ${showNotePanel || note
                  ? 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25'
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
                }`}
              title={t('exercise_note', 'Заметка')}
            >
              📝 {note && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
            </button>
          )}
          {attempts > 0 && submitted && (
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${attemptLevel.color} bg-opacity-20`}>
              <span className="text-sm">{attemptLevel.icon}</span>
              <span className={`text-xs font-medium ${attemptLevel.textColor}`}>
                {attemptLevel.quality === 3 && t('rating_easy', 'Легко')}
                {attemptLevel.quality === 2 && t('rating_good', 'Хорошо')}
                {attemptLevel.quality === 1 && t('rating_hard', 'Трудно')}
                {attemptLevel.quality === 0 && t('rating_again', 'Снова')}
              </span>
            </div>
          )}
        </div>
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
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={exercise.placeholder || t('type_your_answer', 'Введите ответ...')}
              className="w-full px-4 py-3 bg-bg border-2 border-border rounded-xl text-white text-lg
                         placeholder-text-muted/50 focus:border-accent focus:outline-none
                         transition-colors"
              autoFocus
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
          {/* Verbose Result Message */}
          <div className={`p-4 rounded-xl border-2 ${
            isCorrect 
              ? 'bg-green-500/10 border-green-500/50' 
              : 'bg-red-500/10 border-red-500/50'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-3xl mt-0.5">{isCorrect ? '✅' : '❌'}</span>
              <div className="flex-1">
                {isCorrect ? (
                  /* Correct message */
                  <div>
                    <div className="font-bold text-green-400 text-lg mb-1">
                      {t('correct', 'Правильно!')}
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${attemptLevel.color} bg-opacity-20`}>
                      <span className="text-lg">{attemptLevel.icon}</span>
                      <span className={`font-medium ${attemptLevel.textColor}`}>
                        {totalAttempts === 1 && t('from_first_attempt', 'С первой попытки!')}
                        {totalAttempts === 2 && t('from_second_attempt', 'Со второй попытки')}
                        {totalAttempts === 3 && t('from_third_attempt', 'С третьей попытки')}
                        {totalAttempts >= 4 && t('after_attempts', 'После {n} попыток').replace('{n}', totalAttempts)}
                      </span>
                    </div>
                    <div className="text-text-muted text-sm mt-2">
                      {t('your_answer_was', 'Ваш ответ:')}
                      <span className="text-white font-semibold ml-2">{value}</span>
                    </div>
                  </div>
                ) : (
                  /* Incorrect message */
                  <div>
                    <div className="font-bold text-red-400 text-lg mb-1">
                      {t('incorrect_attempt', 'Неправильно').replace('{n}', totalAttempts)} — {t('attempts_used', '{n} попытка').replace('{n}', totalAttempts === 1 ? '1' : totalAttempts === 2 ? '2' : totalAttempts === 3 ? '3' : totalAttempts + '')}
                    </div>
                    <div className="text-text-muted text-sm mb-2">
                      {t('your_answer_was', 'Ваш ответ:')}
                      <span className="text-white font-semibold ml-2 line-through">{value}</span>
                    </div>
                    <div className="text-text-muted text-sm">
                      {t('correct_answer_is', 'Правильный ответ:')}
                      <span className="text-green-400 font-semibold ml-2">
                        {Array.isArray(exercise.answers) 
                          ? exercise.answers.join(' / ') 
                          : exercise.answer}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hint after incorrect */}
          {!isCorrect && showHint()}

          {/* Continue button - only shown after incorrect answer (correct auto-advances) */}
          {!isCorrect && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => {
                  const quality = getQualityFromAttempts(attempts, isCorrect)
                  onAnswer(isCorrect, { quality, hasErrored: !isCorrect && hasErrored, attempts })
                }}
                className="px-8 py-3 rounded-xl font-bold text-white
                           bg-gradient-to-r from-blue-600 to-cyan-600
                           hover:opacity-90 transition-opacity"
              >
                {t('continue', 'Продолжить')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Exercise note panel */}
      {showNotePanel && exerciseKey && onNoteSave && (
        <ExerciseNotePanel
          existingNote={note}
          exerciseKey={exerciseKey}
          themeId={themeId}
          onSave={onNoteSave}
          onDelete={onNoteDelete}
          onClose={() => setShowNotePanel(false)}
        />
      )}
    </div>
  )
}
