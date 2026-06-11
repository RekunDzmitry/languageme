import { useState, useCallback, useEffect, useRef } from 'react'
import { useT } from '../../i18n'
import { emailApi, themesApi } from '../../api/client'
import EmailInputPanel from './EmailInputPanel'
import EmailResultView from './EmailResultView'
import EmailSidePanel from './EmailSidePanel'
import EmailHistoryPanel from './EmailHistoryPanel'

// Module-level state cache — survives component unmounts so users can
// switch between exercises without losing their text or timer progress.
const stateCache = {}
const EMAIL_TARGET_LEVELS = ['B1', 'B2']

function normalizeEmailTargetLevel(level) {
  return EMAIL_TARGET_LEVELS.includes(level) ? level : 'B1'
}

function cacheKey(sessionId, themeId, exerciseIdx) {
  return `${sessionId}:${themeId}:${exerciseIdx}`
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function EmailExercise({ exercise, themeId, exerciseIdx, onContinue, sessionId }) {
  const { t } = useT()
  const TIME_LIMIT = exercise.timeLimit || 30 * 60 // 30 min default (TELC exam standard)
  const ck = cacheKey(sessionId, themeId, exerciseIdx)
  const saved = stateCache[ck]

  const [stage, setStage] = useState(saved?.stage || 'empty') // empty | ready | loading | evaluated
  const [targetLevel, setTargetLevel] = useState(normalizeEmailTargetLevel(saved?.targetLevel))
  const [userText, setUserText] = useState(saved?.userText || '')
  const [evaluation, setEvaluation] = useState(saved?.evaluation || null)
  const [error, setError] = useState(saved?.error || null)
  const [selectedErrorIdx, setSelectedErrorIdx] = useState(saved?.selectedErrorIdx ?? null)
  const [attemptId, setAttemptId] = useState(saved?.attemptId || null)
  const [addedWords, setAddedWords] = useState(
    saved?.addedWords?.length ? new Set(saved.addedWords) : new Set()
  )
  const [timeLeft, setTimeLeft] = useState(saved?.timeLeft ?? TIME_LIMIT)
  const [timerRunning, setTimerRunning] = useState(saved?.timerRunning ?? false)
  const [timerExpired, setTimerExpired] = useState(saved?.timerExpired ?? false)
  const [themes, setThemes] = useState([])
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)

  // Theme options for the "add to learning" picker — only themes for the
  // language being practised (email exercises are Polish-only today).
  useEffect(() => {
    let active = true
    themesApi.list()
      .then(rows => {
        // Exclude the catch-all "other" theme — it's the implicit fallback.
        if (active) setThemes(rows.filter(th => th.lang === 'pl' && th.id !== 'pl_other'))
      })
      .catch(() => { /* picker just falls back to "other" */ })
    return () => { active = false }
  }, [])

  // Ref for current state — kept in sync every render, saved to cache on unmount
  const stateRef = useRef({})
  useEffect(() => {
    stateRef.current = {
      stage,
      targetLevel,
      userText,
      evaluation,
      error,
      selectedErrorIdx,
      attemptId,
      addedWords: [...addedWords],
      timeLeft,
      timerRunning,
      timerExpired,
    }
  })

  // Save to cache when component unmounts (exercise switched)
  useEffect(() => {
    return () => {
      stateCache[ck] = stateRef.current
    }
  }, [ck])

  // Refs for timer callback to avoid stale closures
  const stageRef = useRef(stage)
  const userTextRef = useRef(userText)
  const handleEvaluateRef = useRef(null)
  const timerRunningRef = useRef(timerRunning)

  useEffect(() => { stageRef.current = stage }, [stage])
  useEffect(() => { userTextRef.current = userText }, [userText])
  useEffect(() => { timerRunningRef.current = timerRunning }, [timerRunning])

  const handleTextChange = useCallback((text) => {
    setUserText(text)
    setStage(text.trim().length > 0 ? 'ready' : 'empty')
    setError(null)
  }, [])

  const handleEvaluate = useCallback(async () => {
    if (!userText.trim() || stage === 'loading') return

    setStage('loading')
    setError(null)
    setEvaluation(null)

    try {
      const result = await emailApi.evaluate(
        userText,
        exercise.scenario || exercise.prompt,
        'pl',
        'ru',
        exercise.points,
        exercise.register,
        exercise.etiquetteHint,
        targetLevel
      )

      setEvaluation(result)
      setStage('evaluated')

      // Save attempt to history
      try {
        const saved = await emailApi.saveAttempt(
          themeId,
          exerciseIdx,
          userText,
          result.score,
          result
        )
        setAttemptId(saved.id)
        // The backend auto-files each correction into its matched theme's
        // drills; reflect those as already added so the popover shows ✓.
        if (Array.isArray(saved.autoAdded)) {
          setAddedWords(new Set(saved.autoAdded))
        }
        setHistoryRefreshKey(k => k + 1)
      } catch (saveErr) {
        console.error('Failed to save attempt:', saveErr)
      }
    } catch (err) {
      setError(err.message || t('email_eval_error', 'Błąd sprawdzania. Spróbuj ponownie.'))
      setStage('ready')
    }
  }, [userText, stage, exercise, themeId, exerciseIdx, t, targetLevel])

  // Keep handleEvaluate ref in sync
  useEffect(() => { handleEvaluateRef.current = handleEvaluate }, [handleEvaluate])

  // Timer countdown — only runs when timerRunning is true
  useEffect(() => {
    if (!timerRunning) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        // Pause countdown during loading/evaluated (shouldn't happen but guard)
        if (stageRef.current === 'loading' || stageRef.current === 'evaluated') return prev
        const next = prev - 1
        if (next <= 0) {
          setTimerExpired(true)
          setTimerRunning(false)
          if (userTextRef.current.trim() && stageRef.current !== 'evaluated') {
            // Use setTimeout to avoid setState-during-render
            setTimeout(() => handleEvaluateRef.current?.(), 0)
          }
          return 0
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerRunning])

  const handleSelectError = useCallback((idx) => {
    setSelectedErrorIdx(idx)
  }, [])

  const handleAddWord = useCallback(async (wordTarget, wordTranslation, themeId = null, hint = null) => {
    try {
      await emailApi.addExercise(attemptId, wordTarget, wordTranslation, hint, themeId)
      setAddedWords(prev => new Set([...prev, wordTarget]))
    } catch (err) {
      console.error('Failed to add exercise:', err)
    }
  }, [attemptId])

  const handleNewExercise = useCallback(() => {
    // Clear this exercise from cache so next visit starts fresh
    delete stateCache[ck]
    setStage('empty')
    setUserText('')
    setEvaluation(null)
    setError(null)
    setSelectedErrorIdx(null)
    setAttemptId(null)
    setAddedWords(new Set())
    setTargetLevel('B1')
    setTimeLeft(TIME_LIMIT)
    setTimerRunning(false)
    setTimerExpired(false)
    if (onContinue) onContinue()
  }, [onContinue, TIME_LIMIT, ck])

  const handleRestartExercise = useCallback(() => {
    // Reset current exercise from scratch — same exercise, blank slate
    delete stateCache[ck]
    setStage('empty')
    setUserText('')
    setEvaluation(null)
    setError(null)
    setSelectedErrorIdx(null)
    setAttemptId(null)
    setAddedWords(new Set())
    setTargetLevel('B1')
    setTimeLeft(TIME_LIMIT)
    setTimerRunning(false)
    setTimerExpired(false)
  }, [TIME_LIMIT, ck])

  // Load a past attempt into the main window — renders exactly like a fresh grade
  const handleSelectAttempt = useCallback((detail) => {
    if (!detail) return
    setUserText(detail.user_text || '')
    setEvaluation(detail.ai_evaluation || null)
    setTargetLevel(normalizeEmailTargetLevel(detail.ai_evaluation?.targetLevel))
    setAttemptId(detail.id)
    setSelectedErrorIdx(null)
    setAddedWords(new Set())
    setStage('evaluated')
    setTimerRunning(false)
  }, [])

  // When an attempt is removed, drop the main view if it's the one being shown
  const handleAttemptDeleted = useCallback((deletedId) => {
    if (deletedId !== attemptId) return
    // Reset to a fresh, blank writing state
    delete stateCache[ck]
    setStage('empty')
    setUserText('')
    setEvaluation(null)
    setError(null)
    setSelectedErrorIdx(null)
    setAttemptId(null)
    setAddedWords(new Set())
    setTargetLevel('B1')
    setTimeLeft(TIME_LIMIT)
    setTimerRunning(false)
    setTimerExpired(false)
  }, [attemptId, ck, TIME_LIMIT])

  const toggleTimer = useCallback(() => {
    setTimerRunning(prev => !prev)
  }, [])

  const resetTimer = useCallback(() => {
    setTimeLeft(TIME_LIMIT)
    setTimerRunning(false)
    setTimerExpired(false)
  }, [TIME_LIMIT])

  const taskPoints = exercise.points || []

  // Timer bar color state
  const timerUrgency = timeLeft <= 60 ? 'critical' : timeLeft <= 300 ? 'warning' : 'normal'
  const timerColors = {
    normal:  { bg: 'bg-surface', border: 'border-border', text: 'text-white', bar: 'bg-accent' },
    warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', bar: 'bg-yellow-500' },
    critical:{ bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' },
  }
  const tc = timerColors[timerUrgency]
  const elapsedPct = Math.min(100, ((TIME_LIMIT - timeLeft) / TIME_LIMIT) * 100)
  const isFresh = !timerRunning && !timerExpired && timeLeft === TIME_LIMIT

  return (
    <div className="flex flex-col gap-4">
      {/* Timer bar — visible only while writing */}
      {stage !== 'evaluated' && (
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${tc.bg} ${tc.border} transition-colors duration-500`}>
          {/* Play / Pause toggle */}
          <button
            onClick={toggleTimer}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-all
              ${timerRunning
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : isFresh
                  ? 'bg-accent/20 hover:bg-accent/40 text-accent'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            title={timerRunning ? 'Zatrzymaj' : isFresh ? 'Rozpocznij odliczanie' : 'Wznów odliczanie'}
          >
            {timerRunning ? '⏸' : '▶'}
          </button>

          {/* Reset — only visible when timer has been modified */}
          {!isFresh && (
            <button
              onClick={resetTimer}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0
                         bg-white/5 hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-all"
              title="Resetuj"
            >
              ↺
            </button>
          )}

          {/* Time display */}
          <span className={`font-mono text-lg font-bold tabular-nums ${tc.text} transition-colors duration-500`}>
            {formatTime(timeLeft)}
          </span>

          {/* Progress bar */}
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timerRunning ? tc.bar : 'bg-white/10'}`}
              style={{ width: `${elapsedPct}%` }}
            />
          </div>

          {/* Status label */}
          {timerExpired && (
            <span className={`text-xs font-bold ${tc.text} animate-pulse`}>Czas minął!</span>
          )}
          {!timerRunning && !timerExpired && (
            <span className="text-xs text-text-muted font-medium">
              {isFresh ? 'kliknij ▶' : 'wstrzymany'}
            </span>
          )}
        </div>
      )}

      {/* Task description — TELC format */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/20 text-accent">
            {exercise.category || t('email_exercise', 'E-mail')}
          </span>
          {exercise.level && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
              {exercise.level}
            </span>
          )}
          {exercise.register && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
              {exercise.register}
            </span>
          )}
          <span className="text-xs text-text-muted ml-auto">
            {t('email_min_words', '{min}–{max} słów').replace('{min}', exercise.minWords || 0).replace('{max}', exercise.maxWords || 0)}
          </span>
        </div>

        {/* Scenario */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            Sytuacja
          </p>
          <p className="text-white text-sm leading-relaxed italic">
            {exercise.scenario || exercise.prompt}
          </p>
        </div>

        {/* Recipient */}
        {exercise.recipient && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Adresat
            </p>
            <p className="text-white text-sm">
              {exercise.recipient}
            </p>
          </div>
        )}

        {/* Mandatory points */}
        {taskPoints.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Punkty obowiązkowe <span className="text-accent">*</span>
            </p>
            <ol className="space-y-1.5">
              {taskPoints.map((pt, i) => (
                <li key={i} className="text-sm text-white flex gap-2 items-start">
                  <span className="text-accent font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Etiquette hint */}
        {exercise.etiquetteHint && (
          <p className="text-xs text-accent/80 italic mt-2">
             {exercise.etiquetteHint}
          </p>
        )}

        {/* Useful phrases (collapsible, structured sections) */}
        {exercise.usefulPhrases && exercise.usefulPhrases.length > 0 && (
          <details className="mt-3">
            <summary className="text-sm text-text-muted cursor-pointer hover:text-white transition-colors">
              Przydatne zwroty
            </summary>
            <div className="mt-2 space-y-2.5">
              {exercise.usefulPhrases.map((section, i) => (
                <div key={i}>
                  <span className="text-xs text-accent font-medium">{section.label}:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {section.phrases.map((phrase, j) => (
                      <span key={j} className="text-xs px-2 py-1 rounded-full bg-white/5 text-text-muted border border-border">
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Main 2-column layout (stacks on mobile) */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: email input or result */}
        <div className="flex-1 min-w-0">
          {(stage === 'empty' || stage === 'ready') ? (
            <EmailInputPanel
              userText={userText}
              onTextChange={handleTextChange}
              onEvaluate={handleEvaluate}
              isLoading={stage === 'loading'}
              error={error}
              placeholder={exercise.placeholder || t('email_placeholder', 'Wpisz lub wklej treść e-maila...')}
              targetLevel={targetLevel}
              onTargetLevelChange={setTargetLevel}
            />
          ) : (
            <EmailResultView
              userText={userText}
              errors={evaluation?.errors || []}
              isLoading={stage === 'loading'}
              selectedErrorIdx={selectedErrorIdx}
              onSelectError={handleSelectError}
              onAddWord={handleAddWord}
              addedWords={addedWords}
              themes={themes}
            />
          )}
        </div>

        {/* Right: side panel + per-exercise history */}
        <div className="lg:w-96 lg:flex-shrink-0 flex flex-col gap-4">
          <EmailSidePanel
            evaluation={evaluation}
            stage={stage}
            onNewExercise={handleNewExercise}
            onRestartExercise={handleRestartExercise}
            taskPoints={taskPoints}
            register={exercise.register}
          />
          <EmailHistoryPanel
            themeId={themeId}
            exerciseIdx={exerciseIdx}
            refreshKey={historyRefreshKey}
            activeAttemptId={attemptId}
            onSelectAttempt={handleSelectAttempt}
            onAttemptDeleted={handleAttemptDeleted}
          />
        </div>
      </div>

    </div>
  )
}
