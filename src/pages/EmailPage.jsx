import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useSettings } from '../stores/SettingsContext'
import { useAuth } from '../stores/AuthContext'
import { getThemes, getThemeTitle } from '../data/courses'
import { emailApi } from '../api/client'
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

  // History
  const { isAuthenticated } = useAuth()
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [expandedHistoryId, setExpandedHistoryId] = useState(null)
  const [historyDetail, setHistoryDetail] = useState(null)
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false)
  const historyFetched = useRef(false)

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return
    setHistoryLoading(true)
    try {
      const rows = await emailApi.getHistory(20)
      setHistory(rows || [])
    } catch (e) {
      console.error('Failed to fetch email history:', e)
    } finally {
      setHistoryLoading(false)
      historyFetched.current = true
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!historyFetched.current && historyOpen) {
      fetchHistory()
    }
  }, [historyOpen, fetchHistory])

  const loadHistoryDetail = useCallback(async (id) => {
    if (expandedHistoryId === id) {
      setExpandedHistoryId(null)
      setHistoryDetail(null)
      return
    }
    setExpandedHistoryId(id)
    setHistoryDetailLoading(true)
    setHistoryDetail(null)
    try {
      const detail = await emailApi.getHistoryDetail(id)
      setHistoryDetail(detail)
    } catch (e) {
      console.error('Failed to fetch history detail:', e)
    } finally {
      setHistoryDetailLoading(false)
    }
  }, [expandedHistoryId])

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
        {/* History section */}
        <div className="border-t border-border">
          <button
            onClick={() => setHistoryOpen(prev => !prev)}
            className="w-full px-3 py-2.5 flex items-center justify-between text-xs text-text-muted hover:text-white transition-colors"
          >
            <span>📋 {t('email_history', 'Historia')}</span>
            <span className={`text-[10px] transition-transform ${historyOpen ? 'rotate-90' : ''}`}>›</span>
          </button>
          {historyOpen && (
            <div className="max-h-64 overflow-y-auto border-t border-border/50">
              {historyLoading ? (
                <div className="px-3 py-4 text-center">
                  <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin inline-block" />
                </div>
              ) : history.length === 0 ? (
                <p className="px-3 py-4 text-[10px] text-text-muted/60 text-center">
                  {t('email_no_history', 'Brak zapisanych prób')}
                </p>
              ) : (
                <div className="py-1">
                  {history.map((entry) => {
                    const theme = themes.find(th => th.id === entry.theme_id)
                    const themeTitle = theme ? getThemeTitle(theme, settings?.targetLang || 'pl') : entry.theme_id
                    const isExpanded = expandedHistoryId === entry.id

                    return (
                      <div key={entry.id} className="border-b border-border/30 last:border-b-0">
                        <button
                          onClick={() => loadHistoryDetail(entry.id)}
                          className={`w-full text-left px-3 py-2 transition-colors hover:bg-white/[0.04] ${isExpanded ? 'bg-accent/10' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] text-text-muted line-clamp-1 leading-tight">
                              {themeTitle}
                            </span>
                            <ScorePill score={entry.score} />
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[9px] text-text-muted/50">
                              {formatHistoryDate(entry.created_at)}
                            </span>
                            {entry.error_count > 0 && (
                              <span className="text-[9px] text-red-400/70">
                                {entry.error_count} {t('email_errors_short', 'bł.')}
                              </span>
                            )}
                          </div>
                        </button>
                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="px-3 pb-3">
                            {historyDetailLoading ? (
                              <div className="flex justify-center py-3">
                                <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin inline-block" />
                              </div>
                            ) : historyDetail ? (
                              <div className="space-y-2">
                                {/* Score + feedback */}
                                {historyDetail.ai_evaluation?.overallFeedback && (
                                  <p className="text-[10px] text-text-muted leading-relaxed">
                                    {historyDetail.ai_evaluation.overallFeedback}
                                  </p>
                                )}
                                {/* Error summary */}
                                {historyDetail.ai_evaluation?.errors?.length > 0 && (
                                  <div className="space-y-1">
                                    {historyDetail.ai_evaluation.errors.slice(0, 5).map((err, i) => (
                                      <div key={i} className="text-[10px] flex gap-1">
                                        <span className="text-red-400 line-through flex-shrink-0">{err.originalText}</span>
                                        {err.correction && (
                                          <>
                                            <span className="text-text-muted/40">→</span>
                                            <span className="text-green-400">{err.correction}</span>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* User text preview */}
                                <details>
                                  <summary className="text-[9px] text-text-muted/60 cursor-pointer hover:text-text-muted">
                                    {t('email_show_full_text', 'Pokaż pełny tekst')}
                                  </summary>
                                  <p className="mt-1 text-[10px] text-white/70 whitespace-pre-wrap leading-relaxed bg-bg rounded p-2">
                                    {historyDetail.user_text}
                                  </p>
                                </details>
                              </div>
                            ) : (
                              <p className="text-[10px] text-text-muted/50">
                                {t('email_load_error', 'Nie udało się załadować')}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
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
              onAttemptSaved={fetchHistory}
              sessionId={sessionId}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ScorePill({ score }) {
  if (score == null) return null
  let color
  if (score >= 80) color = 'bg-green-500/20 text-green-400 border-green-500/30'
  else if (score >= 60) color = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  else color = 'bg-red-500/20 text-red-400 border-red-500/30'

  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${color} flex-shrink-0`}>
      {score}
    </span>
  )
}

function formatHistoryDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'przed chwilą'
  if (mins < 60) return `${mins} min temu`
  if (hours < 24) return `${hours} godz. temu`
  if (days < 7) return `${days} dni temu`
  return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
}
