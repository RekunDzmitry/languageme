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

const splitAnswerAlternatives = (answer) => String(answer || '')
  .split(/\s*\/\s*/)
  .map(a => a.trim())
  .filter(Boolean)

const normalizeAnswer = (str) => String(str || '')
  .split(/\s*\/\s*/)
  .map(part => part
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?…]+$/u, '')
    .trim()
    .toLowerCase())
  .filter(Boolean)
  .join(' / ')

const hasFinalSentencePunctuation = (answer) => /[.!?…]\s*$/u.test(String(answer || ''))

const dedupeAnswers = (answers) => {
  const deduped = []
  const seen = new Set()
  const indexes = new Map()

  answers.forEach(answer => {
    const normalized = normalizeAnswer(answer)
    if (!normalized) return

    if (seen.has(normalized)) {
      const existingIndex = indexes.get(normalized)
      if (!hasFinalSentencePunctuation(deduped[existingIndex]) && hasFinalSentencePunctuation(answer)) {
        deduped[existingIndex] = answer
      }
      return
    }

    seen.add(normalized)
    indexes.set(normalized, deduped.length)
    deduped.push(answer)
  })

  return deduped
}

const getAcceptedAnswers = (exercise) => {
  const answers = Array.isArray(exercise.answers) ? exercise.answers : [exercise.answer]

  return dedupeAnswers(answers.flatMap(answer => {
    const alternatives = splitAnswerAlternatives(answer)

    return alternatives.length > 1 ? [answer, ...alternatives] : [answer]
  }))
}

const getDisplayAnswer = (exercise) => {
  if (Array.isArray(exercise.answers)) {
    return dedupeAnswers(exercise.answers).join(' / ')
  }

  const alternatives = splitAnswerAlternatives(exercise.answer)

  return alternatives.length > 1
    ? dedupeAnswers(alternatives).join(' / ')
    : exercise.answer
}

// Compose the exercise as the UI sees it: user override beats the seed
// for both the accepted-answers set and the display value. Returning a
// fresh object keeps the rest of the file (which treats `exercise` as
// the source of truth) unchanged.
function withAnswerOverride(exercise, override) {
  if (!Array.isArray(override) || override.length === 0) return exercise
  const ex = exercise || {}
  // Keep the original answer/answers key shape so getAcceptedAnswers /
  // getDisplayAnswer work without further changes.
  if (Array.isArray(ex.answers)) return { ...ex, answers: [...override] }
  return { ...ex, answer: override[0], answers: [...override] }
}

export default function WriteAnswer({ exercise, onAnswer, priorAttempts = 0, exerciseKey, themeId, note, onNoteSave, onNoteDelete, userAnswerOverride, onSaveAnswerOverride, onClearAnswerOverride }) {
  const { t } = useT()
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [hasErrored, setHasErrored] = useState(false)
  const [showNotePanel, setShowNotePanel] = useState(false)
  const [editingAnswers, setEditingAnswers] = useState(false)
  const [answersDraft, setAnswersDraft] = useState('')

  // Apply the user's override on top of the seed exercise object so
  // the rest of the component (checkAnswer, getDisplayAnswer, etc.)
  // reads from the override transparently.
  const effectiveExercise = withAnswerOverride(exercise, userAnswerOverride)

  const startEditAnswers = () => {
    setAnswersDraft(getDisplayAnswer(effectiveExercise))
    setEditingAnswers(true)
  }
  const saveEditAnswers = () => {
    const list = answersDraft
      .split(/[/\n]+/)
      .map(p => p.trim())
      .filter(Boolean)
    if (list.length > 0 && onSaveAnswerOverride) {
      onSaveAnswerOverride(exerciseKey, list)
    }
    setEditingAnswers(false)
  }

  // Close note panel when exercise changes (new key)
  useEffect(() => {
    setShowNotePanel(false)
  }, [exerciseKey])

  // Cumulative attempts across visits in the current session. Used for the
  // attempt-level label so a user who errored previously and now succeeds
  // sees "Со второй попытки" rather than "С первой попытки".
  const totalAttempts = priorAttempts + attempts

  // Check if answer is correct
  const checkAnswer = (userAnswer) => {
    const normalized = normalizeAnswer(userAnswer)

    return getAcceptedAnswers(effectiveExercise).some(a => normalizeAnswer(a) === normalized)
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
        {effectiveExercise.prompt || exercise.prompt}
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
                        {getDisplayAnswer(effectiveExercise)}
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

      {/* Edit expected answers panel */}
      {editingAnswers && (
        <div className="bg-yellow-500/5 border border-yellow-500/30 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-yellow-300 font-bold uppercase tracking-wide">
              {t('edit_expected_answer', 'Изменить ожидаемый ответ')}
            </span>
            <span className="text-[10px] text-white/40 font-mono">{exerciseKey}</span>
          </div>
          <div className="text-[10px] text-white/30">
            {t('edit_expected_answer_hint', 'Через «/» для нескольких вариантов.')}
          </div>
          <textarea
            value={answersDraft}
            onChange={e => setAnswersDraft(e.target.value)}
            autoFocus
            rows={3}
            className="w-full bg-black/40 border border-yellow-500/30 rounded px-2 py-1 text-sm text-white outline-none focus:border-yellow-400 resize-none"
          />
          <div className="flex gap-1.5">
            <button
              onClick={saveEditAnswers}
              className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded hover:bg-yellow-500/30"
            >{t('save', 'Сохранить')}</button>
            {userAnswerOverride && onClearAnswerOverride && (
              <button
                onClick={() => { onClearAnswerOverride(exerciseKey); setEditingAnswers(false) }}
                className="text-[10px] text-red-300 px-2 py-1 rounded hover:bg-red-500/10"
              >{t('reset', 'Сбросить')}</button>
            )}
            <button
              onClick={() => setEditingAnswers(false)}
              className="text-[10px] text-white/40 px-2 py-1 rounded hover:text-white/60"
            >✕</button>
          </div>
        </div>
      )}

      {/* Toggle button (always present, opens the editor) */}
      {exerciseKey && onSaveAnswerOverride && !editingAnswers && (
        <button
          onClick={startEditAnswers}
          className="text-[10px] text-yellow-300/60 hover:text-yellow-300 self-start"
          title={t('edit_expected_answer', 'Изменить ожидаемый ответ')}
        >
          {userAnswerOverride ? '✎ custom' : `+ ${t('edit_expected_answer', 'Изменить ожидаемый ответ')}`}
        </button>
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
