import { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useSettings } from '../stores/SettingsContext'
import { getThemes } from '../data/courses'
import EmailExercise from '../components/email/EmailExercise'

export default function EmailPage() {
  const { themeId } = useParams()
  const navigate = useNavigate()
  const { t } = useT()
  const { settings } = useSettings()
  const targetLang = settings?.targetLang || 'pl'

  const themes = useMemo(() => getThemes(targetLang), [targetLang])

  const emailThemes = useMemo(() =>
    themes.filter(th =>
      th.sections?.some(s => s.type === 'email_writing')
    ),
    [themes]
  )

  const allExercises = useMemo(() => {
    const exercises = []
    const sourceThemes = themeId
      ? emailThemes.filter(th => th.id === themeId)
      : emailThemes

    for (const th of sourceThemes) {
      for (const section of (th.sections || [])) {
        if (section.type === 'email_writing' && section.exercises) {
          for (let i = 0; i < section.exercises.length; i++) {
            exercises.push({
              ...section.exercises[i],
              _themeId: th.id,
              _exerciseIdx: i,
              _themeTitle: th.title,
            })
          }
        }
      }
    }
    return exercises
  }, [emailThemes, themeId])

  const [currentIdx, setCurrentIdx] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [sessionId, setSessionId] = useState(() => Date.now())

  const currentExercise = allExercises[currentIdx]

  const handleContinue = useCallback(() => {
    if (currentIdx + 1 < allExercises.length) {
      setCurrentIdx(prev => prev + 1)
    } else {
      setCompleted(true)
    }
  }, [currentIdx, allExercises.length])

  const handleSelectExercise = useCallback((idx) => {
    setCurrentIdx(idx)
    setCompleted(false)
  }, [])

  if (allExercises.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <span className="text-4xl">📧</span>
          <h2 className="text-xl text-white font-bold mt-4">
            {t('email_no_exercises', 'Brak ćwiczeń z pisania e-maili')}
          </h2>
          <p className="text-text-muted mt-2">
            {t('email_no_exercises_hint', 'Ćwiczenia z pisania e-maili nie zostały jeszcze dodane dla tego języka.')}
          </p>
          <button
            onClick={() => navigate('/themes')}
            className="mt-6 px-6 py-2.5 rounded-xl font-bold text-white bg-accent hover:opacity-90 transition-opacity"
          >
            Do tematów
          </button>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-surface border border-border rounded-2xl">
          <span className="text-5xl">🎉</span>
          <h2 className="text-2xl text-white font-bold mt-4">
            {t('email_all_done', 'Wszystkie ćwiczenia wykonane!')}
          </h2>
          <p className="text-text-muted mt-2 mb-6">
            {t('email_all_done_hint', 'Ukończyłeś wszystkie dostępne ćwiczenia z pisania e-maili.')}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => { setCurrentIdx(0); setCompleted(false); setSessionId(Date.now()) }}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-accent hover:opacity-90 transition-opacity"
            >
              {t('email_restart', 'Zacznij od nowa')}
            </button>
            <button
              onClick={() => navigate('/themes')}
              className="px-6 py-2.5 rounded-xl font-bold text-text-muted border border-border hover:border-text-muted transition-colors"
            >
              Do tematów
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      {/* Left sidebar — task list */}
      <aside className="w-56 flex-shrink-0 border-r border-border flex flex-col overflow-hidden">
        <div className="px-3 py-3 border-b border-border">
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
            Zadania
          </p>
          <p className="text-[11px] text-text-muted/60 mt-0.5">
            polish · e-mail
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {allExercises.map((ex, i) => (
            <button
              key={ex.id || i}
              onClick={() => handleSelectExercise(i)}
              className={`w-full text-left px-3 py-2.5 transition-colors group ${
                i === currentIdx
                  ? 'bg-accent/15 border-r-2 border-accent'
                  : 'hover:bg-white/[0.04] border-r-2 border-transparent'
              }`}
            >
              <p className={`text-xs font-medium leading-snug line-clamp-2 ${
                i === currentIdx ? 'text-white' : 'text-text-muted group-hover:text-white/80'
              }`}>
                {ex.category || `Zadanie ${i + 1}`}
              </p>
              <p className={`text-[10px] mt-0.5 ${
                i === currentIdx ? 'text-accent/80' : 'text-text-muted/50'
              }`}>
                {ex.minWords}–{ex.maxWords} {t('email_words', 'słów')}
              </p>
            </button>
          ))}
        </div>

        <div className="px-3 py-3 border-t border-border">
          <button
            onClick={() => navigate('/training')}
            className="w-full text-xs text-text-muted hover:text-white transition-colors text-left"
          >
            ← Do treningu
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-5 py-5">
          {/* Breadcrumb + nav */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-text-muted">
              <span>polish</span>
              <span className="mx-1.5 opacity-50">›</span>
              <span>email writing</span>
              <span className="mx-1.5 opacity-50">›</span>
              <span className="text-white/70">{currentExercise?.category || 'zadanie'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectExercise(Math.max(0, currentIdx - 1))}
                disabled={currentIdx === 0}
                className="px-2.5 py-1 rounded-lg text-xs text-text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-border hover:border-white/20 transition-all"
              >
                ‹ Zadanie
              </button>
              <span className="text-xs text-text-muted font-mono">{currentIdx + 1}/{allExercises.length}</span>
              <button
                onClick={() => handleSelectExercise(Math.min(allExercises.length - 1, currentIdx + 1))}
                disabled={currentIdx === allExercises.length - 1}
                className="px-2.5 py-1 rounded-lg text-xs text-text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed border border-border hover:border-white/20 transition-all"
              >
                Zadanie ›
              </button>
            </div>
          </div>

          {currentExercise && (
            <EmailExercise
              key={`${sessionId}-${currentExercise._themeId}-${currentExercise._exerciseIdx}`}
              exercise={currentExercise}
              themeId={currentExercise._themeId}
              exerciseIdx={currentExercise._exerciseIdx}
              onContinue={handleContinue}
              sessionId={sessionId}
            />
          )}
        </div>
      </div>
    </div>
  )
}
