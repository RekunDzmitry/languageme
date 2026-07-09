import { useEffect, useState, useCallback, useMemo } from 'react'
import { useT } from '../i18n'
import { adminApi } from '../api/client'

const DEFAULT_SYSTEM_PROMPT = `Ты дружелюбный помощник для изучения французского языка в приложении LanguageMe.
Отвечай на русском, но можешь смешивать с французским для примеров.
Будь краток, полезен и используй примеры из реальной жизни.

Когда пользователь спрашивает о слове или глаголе, объясняй:
1. Точное значение и оттенки
2. Контекст использования (формальный/неформальный)
3. Примеры предложений
4. Синонимы и антонимы если есть`

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch {
    return iso
  }
}

function StatusBadge({ status, error }) {
  if (error) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300">error</span>
  }
  if (status && status >= 400) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-300">{status}</span>
  }
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-300">{status || 'ok'}</span>
}

function Summary({ data, t }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-bg/40 border border-border rounded-xl p-3">
        <div className="text-xs text-text-muted">{t('admin_total')}</div>
        <div className="text-2xl font-bold">{data?.total ?? '—'}</div>
      </div>
      <div className="bg-bg/40 border border-border rounded-xl p-3">
        <div className="text-xs text-text-muted">{t('admin_24h')}</div>
        <div className="text-2xl font-bold">{data?.last_24h ?? '—'}</div>
      </div>
      <div className="bg-bg/40 border border-border rounded-xl p-3">
        <div className="text-xs text-text-muted">{t('admin_sandbox_count')}</div>
        <div className="text-2xl font-bold">{data?.sandbox ?? '—'}</div>
      </div>
      <div className="bg-bg/40 border border-border rounded-xl p-3">
        <div className="text-xs text-text-muted">{t('admin_errors')}</div>
        <div className="text-2xl font-bold">{data?.errors ?? '—'}</div>
      </div>
    </div>
  )
}

function LogDetail({ log }) {
  if (!log) return null
  const messages = Array.isArray(log.messages) ? log.messages : []
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div><span className="text-text-muted">{/* id */}id</span> <span className="font-mono">{log.id}</span></div>
        <div><span className="text-text-muted">user</span> {log.user_email || '—'}</div>
        <div><span className="text-text-muted">source</span> {log.source}</div>
        <div><span className="text-text-muted">sandbox</span> {log.is_sandbox ? 'yes' : 'no'}</div>
        <div><span className="text-text-muted">model</span> {log.model}</div>
        <div><span className="text-text-muted">provider</span> {log.provider}</div>
        <div><span className="text-text-muted">duration</span> {log.duration_ms != null ? `${log.duration_ms} ms` : '—'}</div>
        <div><span className="text-text-muted">tokens</span> {log.input_tokens ?? '—'} / {log.output_tokens ?? '—'}</div>
        <div className="col-span-2 sm:col-span-4"><span className="text-text-muted">exercise</span> {log.exercise_key || '—'} ({log.exercise_type || '—'})</div>
      </div>
      {log.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2 text-red-200">
          {log.error}
        </div>
      )}
      <div>
        <div className="text-xs text-text-muted mb-1">system prompt</div>
        <pre className="bg-bg/40 border border-border rounded-lg p-2 whitespace-pre-wrap text-xs max-h-60 overflow-auto">{log.system_prompt}</pre>
      </div>
      <div>
        <div className="text-xs text-text-muted mb-1">messages</div>
        <div className="space-y-2 max-h-72 overflow-auto">
          {messages.map((m, i) => (
            <div key={i} className="bg-bg/40 border border-border rounded-lg p-2">
              <div className="text-xs text-text-muted mb-0.5">{m.role}</div>
              <pre className="whitespace-pre-wrap text-xs">{m.content}</pre>
            </div>
          ))}
        </div>
      </div>
      {log.assistant_message && (
        <div>
          <div className="text-xs text-text-muted mb-1">assistant response</div>
          <pre className="bg-bg/40 border border-border rounded-lg p-2 whitespace-pre-wrap text-xs max-h-60 overflow-auto">{log.assistant_message}</pre>
        </div>
      )}
    </div>
  )
}

function LogsTab({ t }) {
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ isSandbox: '', q: '' })
  const [openLogId, setOpenLogId] = useState(null)
  const [openLog, setOpenLog] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [list, sum] = await Promise.all([
        adminApi.listLogs({
          limit: 50,
          isSandbox: filters.isSandbox === '' ? undefined : filters.isSandbox === 'true',
          q: filters.q || undefined,
        }),
        adminApi.getLogsSummary(),
      ])
      setRows(list.rows || [])
      setSummary(sum)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters.isSandbox, filters.q])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!openLogId) { setOpenLog(null); return }
    setLoadingDetail(true)
    adminApi.getLog(openLogId)
      .then(setOpenLog)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingDetail(false))
  }, [openLogId])

  return (
    <div className="space-y-4">
      <Summary data={summary} t={t} />
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={filters.isSandbox}
          onChange={(e) => setFilters((f) => ({ ...f, isSandbox: e.target.value }))}
          className="bg-bg/40 border border-border rounded-lg px-2 py-1.5 text-sm"
        >
          <option value="">{t('admin_filter_all')}</option>
          <option value="false">{t('admin_filter_chat')}</option>
          <option value="true">{t('admin_filter_sandbox')}</option>
        </select>
        <input
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          placeholder={t('admin_filter_search')}
          className="bg-bg/40 border border-border rounded-lg px-2 py-1.5 text-sm flex-1 min-w-[180px]"
        />
        <button onClick={load} className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-semibold">
          {t('admin_refresh')}
        </button>
      </div>
      {error && <div className="text-red-300 text-sm">{error}</div>}
      {loading && <div className="text-text-muted text-sm">{t('admin_loading')}</div>}
      <div className="space-y-2">
        {rows.length === 0 && !loading && (
          <div className="text-text-muted text-sm">{t('admin_logs_empty')}</div>
        )}
        {rows.map((row) => {
          const isOpen = openLogId === row.id
          return (
            <div key={row.id} className="bg-bg/40 border border-border rounded-xl">
              <button
                onClick={() => setOpenLogId(isOpen ? null : row.id)}
                className="w-full text-left p-3 flex flex-wrap items-center gap-3"
              >
                <StatusBadge status={row.http_status} error={row.error} />
                <span className="text-xs text-text-muted w-44">{fmtDate(row.created_at)}</span>
                <span className="text-sm font-semibold flex-1 min-w-[120px] truncate">
                  {row.user_email || (row.is_sandbox ? t('admin_sandbox_short') : '—')}
                </span>
                <span className="text-xs text-text-muted">
                  {row.source}{row.exercise_key ? ` · ${row.exercise_key}` : ''}
                </span>
                <span className="text-xs text-text-muted">
                  {row.model} · {row.duration_ms != null ? `${row.duration_ms} ms` : '—'}
                </span>
                <span className="text-xs">{isOpen ? '▾' : '▸'}</span>
              </button>
              {isOpen && (
                <div className="border-t border-border p-3">
                  {loadingDetail ? (
                    <div className="text-text-muted text-sm">{t('admin_loading')}</div>
                  ) : (
                    <LogDetail log={openLog} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SandboxTab({ t, onLogCreated }) {
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [useDefaultPrompt, setUseDefaultPrompt] = useState(true)
  const [exerciseContext, setExerciseContext] = useState({ verb: '', prompt: '', answer: '' })
  const [useContext, setUseContext] = useState(false)
  const [history, setHistory] = useState([])
  const [message, setMessage] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)
  const [lastMeta, setLastMeta] = useState(null)

  const trimmedMessage = message.trim()

  const builtContext = useMemo(() => {
    if (!useContext) return null
    const ctx = {}
    if (exerciseContext.verb?.trim()) {
      const [infinitive, meaning, group] = exerciseContext.verb.split('|').map((s) => s.trim())
      if (infinitive) {
        ctx.verb = { infinitive, meaning: meaning || '', group: group || undefined }
      }
    }
    if (exerciseContext.prompt?.trim()) ctx.prompt = exerciseContext.prompt.trim()
    if (exerciseContext.answer?.trim()) ctx.answer = exerciseContext.answer.trim()
    return Object.keys(ctx).length > 0 ? ctx : null
  }, [useContext, exerciseContext])

  const run = useCallback(async () => {
    if (!trimmedMessage || running) return
    setRunning(true)
    setError(null)
    const sentMessage = trimmedMessage
    setMessage('')
    const optimistic = [...history, { role: 'user', content: sentMessage }]
    setHistory(optimistic)
    try {
      const res = await adminApi.runSandbox({
        systemPrompt: useDefaultPrompt ? null : systemPrompt,
        exerciseContext: builtContext,
        message: sentMessage,
        history: history,
      })
      setHistory([...optimistic, { role: 'assistant', content: res.message }])
      setLastMeta({ logId: res.logId, durationMs: res.durationMs, tokens: `${res.inputTokens ?? '—'} / ${res.outputTokens ?? '—'}` })
      if (res.logId) onLogCreated?.(res.logId)
    } catch (err) {
      setError(err.message || t('admin_sandbox_error'))
      // Roll back optimistic turn on error
      setHistory(history)
    } finally {
      setRunning(false)
    }
  }, [trimmedMessage, running, history, useDefaultPrompt, systemPrompt, builtContext, onLogCreated, t])

  const reset = () => {
    setHistory([])
    setMessage('')
    setLastMeta(null)
    setError(null)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="bg-bg/40 border border-border rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold">{t('admin_sandbox_prompt')}</label>
            <label className="text-xs flex items-center gap-1 text-text-muted">
              <input
                type="checkbox"
                checked={useDefaultPrompt}
                onChange={(e) => setUseDefaultPrompt(e.target.checked)}
              />
              {t('admin_sandbox_use_default')}
            </label>
          </div>
          <textarea
            disabled={useDefaultPrompt}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full h-48 bg-bg/60 border border-border rounded-lg p-2 text-xs font-mono disabled:opacity-50"
          />
        </div>
        <div className="bg-bg/40 border border-border rounded-xl p-3 space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <input
              type="checkbox"
              checked={useContext}
              onChange={(e) => setUseContext(e.target.checked)}
            />
            {t('admin_sandbox_context')}
          </label>
          {useContext && (
            <div className="space-y-2">
              <input
                value={exerciseContext.verb}
                onChange={(e) => setExerciseContext((c) => ({ ...c, verb: e.target.value }))}
                placeholder={t('admin_sandbox_context_verb_ph')}
                className="w-full bg-bg/60 border border-border rounded-lg p-2 text-sm"
              />
              <input
                value={exerciseContext.prompt}
                onChange={(e) => setExerciseContext((c) => ({ ...c, prompt: e.target.value }))}
                placeholder={t('admin_sandbox_context_prompt_ph')}
                className="w-full bg-bg/60 border border-border rounded-lg p-2 text-sm"
              />
              <input
                value={exerciseContext.answer}
                onChange={(e) => setExerciseContext((c) => ({ ...c, answer: e.target.value }))}
                placeholder={t('admin_sandbox_context_answer_ph')}
                className="w-full bg-bg/60 border border-border rounded-lg p-2 text-sm"
              />
            </div>
          )}
        </div>
        <div className="bg-bg/40 border border-border rounded-xl p-3 space-y-2">
          <label className="text-sm font-semibold">{t('admin_sandbox_message')}</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                run()
              }
            }}
            placeholder={t('admin_sandbox_message_ph')}
            className="w-full h-24 bg-bg/60 border border-border rounded-lg p-2 text-sm"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={run}
              disabled={!trimmedMessage || running}
              className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-semibold disabled:opacity-50"
            >
              {running ? t('admin_sandbox_running') : t('admin_sandbox_run')}
            </button>
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded-lg border border-border text-sm"
            >
              {t('admin_sandbox_reset')}
            </button>
            {lastMeta && (
              <span className="text-xs text-text-muted">
                {lastMeta.durationMs != null ? `${lastMeta.durationMs} ms` : ''}
                {lastMeta.tokens ? ` · ${lastMeta.tokens}` : ''}
                {lastMeta.logId ? ` · ${lastMeta.logId.slice(0, 8)}` : ''}
              </span>
            )}
          </div>
          {error && <div className="text-red-300 text-sm">{error}</div>}
        </div>
      </div>
      <div className="bg-bg/40 border border-border rounded-xl p-3 flex flex-col min-h-[300px]">
        <div className="text-sm font-semibold mb-2">{t('admin_sandbox_transcript')}</div>
        <div className="flex-1 space-y-2 overflow-auto max-h-[60vh]">
          {history.length === 0 && (
            <div className="text-text-muted text-sm">{t('admin_sandbox_empty')}</div>
          )}
          {history.map((m, i) => (
            <div key={i} className={`p-2 rounded-lg text-sm ${m.role === 'user' ? 'bg-accent/10' : 'bg-bg/60'}`}>
              <div className="text-xs text-text-muted mb-0.5">{m.role}</div>
              <pre className="whitespace-pre-wrap text-sm">{m.content}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { t } = useT()
  const [tab, setTab] = useState('logs')
  const [bumpLogs, setBumpLogs] = useState(0)

  return (
    <div className="px-4 sm:px-6 py-5 max-w-6xl mx-auto">
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl font-bold">{t('admin_title')}</h1>
      </div>
      <div className="flex gap-1 mb-4 border-b border-border">
        {[
          ['logs', t('admin_tab_logs')],
          ['sandbox', t('admin_tab_sandbox')],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors
              ${tab === key ? 'border-accent text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'logs'
        ? <div key={`logs-${bumpLogs}`}><LogsTab t={t} /></div>
        : <SandboxTab t={t} onLogCreated={() => setBumpLogs((n) => n + 1)} />
      }
    </div>
  )
}
