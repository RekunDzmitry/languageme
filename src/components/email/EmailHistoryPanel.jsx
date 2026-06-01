import { useState, useEffect, useCallback, useRef } from 'react'
import { useT } from '../../i18n'
import { useAuth } from '../../stores/AuthContext'
import { emailApi } from '../../api/client'

// ---------------------------------------------------------------------------
// Per-exercise attempt history. Lives in the right column under the AI panel.
// Clicking an attempt loads it into the main window via onSelectAttempt(detail).
// ---------------------------------------------------------------------------

export default function EmailHistoryPanel({
  themeId,
  exerciseIdx,
  refreshKey,
  activeAttemptId,
  onSelectAttempt,
  onAttemptDeleted,
}) {
  const { t } = useT()
  const { isAuthenticated } = useAuth()

  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [loadingId, setLoadingId] = useState(null)
  const [busyId, setBusyId] = useState(null) // row being deleted
  const [clearing, setClearing] = useState(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setLoadError(false)
    try {
      const rows = await emailApi.getHistory(20, themeId, exerciseIdx)
      if (mounted.current) setHistory(rows || [])
    } catch (e) {
      console.error('Failed to fetch email history:', e)
      if (mounted.current) setLoadError(true)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [isAuthenticated, themeId, exerciseIdx])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory, refreshKey])

  const handleSelect = useCallback(async (id) => {
    setLoadingId(id)
    try {
      const detail = await emailApi.getHistoryDetail(id)
      onSelectAttempt?.(detail)
    } catch (e) {
      console.error('Failed to fetch history detail:', e)
    } finally {
      if (mounted.current) setLoadingId(null)
    }
  }, [onSelectAttempt])

  const handleDelete = useCallback(async (id, e) => {
    e.stopPropagation()
    setBusyId(id)
    try {
      await emailApi.deleteAttempt(id)
      if (mounted.current) {
        setHistory(prev => prev.filter(h => h.id !== id))
        onAttemptDeleted?.(id)
      }
    } catch (err) {
      console.error('Failed to delete attempt:', err)
    } finally {
      if (mounted.current) setBusyId(null)
    }
  }, [onAttemptDeleted])

  const handleClear = useCallback(async () => {
    if (!window.confirm(t('email_clear_confirm'))) return
    setClearing(true)
    try {
      await emailApi.clearHistory(themeId, exerciseIdx)
      if (mounted.current) {
        const ids = history.map(h => h.id)
        setHistory([])
        ids.forEach(id => onAttemptDeleted?.(id))
      }
    } catch (err) {
      console.error('Failed to clear history:', err)
    } finally {
      if (mounted.current) setClearing(false)
    }
  }, [t, themeId, exerciseIdx, history, onAttemptDeleted])

  if (!isAuthenticated) return null

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm text-text-muted uppercase tracking-wide">
          {t('email_history')}
        </h3>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="text-[11px] text-text-muted/70 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {t('email_clear_history')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="px-4 py-6 text-center">
          <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin inline-block" />
        </div>
      ) : loadError ? (
        <p className="px-4 py-6 text-xs text-text-muted/60 text-center">
          {t('email_load_error')}
        </p>
      ) : history.length === 0 ? (
        <p className="px-4 py-6 text-xs text-text-muted/60 text-center">
          {t('email_no_history')}
        </p>
      ) : (
        <div className="max-h-72 overflow-y-auto divide-y divide-border/40">
          {history.map((entry) => {
            const isActive = entry.id === activeAttemptId
            return (
              <div
                key={entry.id}
                onClick={() => handleSelect(entry.id)}
                className={`group flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors hover:bg-white/[0.04] ${
                  isActive ? 'bg-accent/10' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted/60">
                      {formatHistoryDate(entry.created_at)}
                    </span>
                    {entry.error_count > 0 && (
                      <span className="text-[10px] text-red-400/70">
                        {entry.error_count} {t('email_errors_short')}
                      </span>
                    )}
                  </div>
                </div>

                {loadingId === entry.id ? (
                  <span className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin inline-block flex-shrink-0" />
                ) : (
                  <ScorePill score={entry.score} />
                )}

                <button
                  onClick={(e) => handleDelete(entry.id, e)}
                  disabled={busyId === entry.id}
                  title={t('email_delete_attempt')}
                  className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-text-muted/40
                             hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50
                             opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
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
