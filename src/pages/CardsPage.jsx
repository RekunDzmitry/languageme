import { useState, useMemo } from 'react'
import { useT } from '../i18n'
import { useProgress } from '../stores/UserProgressContext'
import { VOCAB } from '../data/courses/fr/vocab'
import { themes } from '../data/courses/fr/themes/theme01-pronouns-present'
import { EXAMPLES } from '../data/courses/fr/examples'
import { hints } from '../data/courses/fr/hints/ru'
import { getCardStatus, formatDueDate, STATUS_COLORS } from '../utils/cardStatus'
import SpeakerButton from '../components/common/SpeakerButton'

const STATUS_FILTERS = ['all', 'due', 'learning', 'mastered', 'new']
const SORT_OPTIONS = ['due', 'word', 'ease', 'reps']

export default function CardsPage() {
  const { t } = useT()
  const { cards, userMnemonics, resetCard, updateCard } = useProgress()
  const [expandedId, setExpandedId] = useState(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [themeFilter, setThemeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('due')
  const [editingId, setEditingId] = useState(null)
  const [editEase, setEditEase] = useState(2.5)
  const [editDue, setEditDue] = useState('')

  // Merge vocab with card data
  const enrichedCards = useMemo(() => {
    return VOCAB.map(word => {
      const card = cards[word.id] || { ease: 2.5, interval: 1, reps: 0, due: Date.now(), lastReviewed: null }
      return { ...word, card, status: getCardStatus(card) }
    })
  }, [cards])

  // Stats
  const stats = useMemo(() => {
    const s = { total: enrichedCards.length, due: 0, mastered: 0, learning: 0, new: 0 }
    enrichedCards.forEach(c => { s[c.status]++ })
    return s
  }, [enrichedCards])

  // Filter & sort
  const filtered = useMemo(() => {
    let list = enrichedCards

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.target.toLowerCase().includes(q) ||
        (c.translations?.ru || '').toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      list = list.filter(c => c.status === statusFilter)
    }

    if (themeFilter !== 'all') {
      list = list.filter(c => c.themeIds?.includes(themeFilter))
    }

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case 'due': return (a.card.due || 0) - (b.card.due || 0)
        case 'word': return a.target.localeCompare(b.target)
        case 'ease': return a.card.ease - b.card.ease
        case 'reps': return b.card.reps - a.card.reps
        default: return 0
      }
    })

    return list
  }, [enrichedCards, search, statusFilter, themeFilter, sortBy])

  function startEdit(item) {
    setEditingId(item.id)
    setEditEase(item.card.ease)
    const dueDate = new Date(item.card.due)
    setEditDue(dueDate.toISOString().slice(0, 10))
  }

  function saveEdit(wordId) {
    updateCard(wordId, {
      ease: parseFloat(editEase),
      due: new Date(editDue).getTime(),
    })
    setEditingId(null)
  }

  function handleReset(wordId) {
    if (confirm(t('cards_reset_confirm'))) {
      resetCard(wordId)
      setEditingId(null)
    }
  }

  function formatDate(ts) {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('cards_title')}</h1>
        <div className="flex flex-wrap gap-4 mt-3">
          <StatBadge label={t('cards_total')} value={stats.total} color="text-text-primary" />
          <StatBadge label={t('cards_due')} value={stats.due} color="text-orange-400" />
          <StatBadge label={t('cards_learning')} value={stats.learning} color="text-blue-400" />
          <StatBadge label={t('cards_mastered')} value={stats.mastered} color="text-green-400" />
          <StatBadge label={t('cards_new')} value={stats.new} color="text-gray-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('cards_search')}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent"
        />
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <div className="flex flex-wrap gap-1">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors
                  ${statusFilter === s ? 'bg-accent text-white' : 'bg-bg text-text-muted hover:text-text-primary'}`}
              >
                {t(`cards_filter_${s}`)}
              </button>
            ))}
          </div>

          {/* Theme filter */}
          <select
            value={themeFilter}
            onChange={e => setThemeFilter(e.target.value)}
            className="bg-bg border border-border rounded-lg px-2 py-1 text-sm text-text-primary"
          >
            <option value="all">{t('all_themes')}</option>
            {themes.map(th => (
              <option key={th.id} value={th.id}>{th.titleRu || th.title}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-bg border border-border rounded-lg px-2 py-1 text-sm text-text-primary"
          >
            {SORT_OPTIONS.map(s => (
              <option key={s} value={s}>{t(`cards_sort_${s}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards list */}
      {filtered.length === 0 ? (
        <div className="text-center text-text-muted py-12">{t('cards_no_cards')}</div>
      ) : (
        <div className="space-y-2">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto_auto] gap-3 px-4 py-2 text-xs text-text-muted font-medium">
            <span>FR</span>
            <span>RU</span>
            <span>{t('cards_status')}</span>
            <span>{t('cards_due_label')}</span>
            <span>{t('cards_reps')}</span>
            <span>{t('cards_ease')}</span>
            <span>{t('cards_interval')}</span>
            <span></span>
          </div>

          {filtered.map(item => (
            <div key={item.id} className="bg-surface border border-border rounded-xl overflow-hidden">
              {/* Main row — desktop */}
              <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto_auto] gap-3 items-center px-4 py-3">
                <div
                  className="cursor-pointer"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <span className="text-text-primary font-medium">{item.target}</span>
                  {item.ipa && <span className="text-text-muted text-xs ml-2">{item.ipa}</span>}
                  <span className="text-text-muted text-xs ml-1">{expandedId === item.id ? '▾' : '▸'}</span>
                </div>
                <span className="text-text-muted text-sm">{item.translations?.ru}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[item.status]}`}>
                  {t(`cards_filter_${item.status}`)}
                </span>
                <span className="text-text-muted text-xs w-24 text-center">
                  {item.card.reps > 0 ? formatDueDate(item.card.due, t) : '—'}
                </span>
                <span className="text-text-muted text-xs w-10 text-center">{item.card.reps}</span>
                <span className="text-text-muted text-xs w-10 text-center">{item.card.ease.toFixed(1)}</span>
                <span className="text-text-muted text-xs w-16 text-center">
                  {item.card.interval} {t('cards_days', { count: item.card.interval })}
                </span>
                <button
                  onClick={() => editingId === item.id ? setEditingId(null) : startEdit(item)}
                  className="text-accent hover:text-accent/80 text-xs font-medium"
                >
                  {editingId === item.id ? '✕' : t('cards_edit')}
                </button>
              </div>

              {/* Main row — mobile */}
              <div className="md:hidden px-4 py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className="cursor-pointer"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <span className="text-text-primary font-medium">{item.target}</span>
                    {item.ipa && <span className="text-text-muted text-xs ml-2">{item.ipa}</span>}
                    <span className="text-text-muted text-xs ml-1">{expandedId === item.id ? '▾' : '▸'}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[item.status]}`}>
                    {t(`cards_filter_${item.status}`)}
                  </span>
                </div>
                <div className="text-text-muted text-sm">{item.translations?.ru}</div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>{t('cards_reps')}: {item.card.reps}</span>
                  <span>{t('cards_ease')}: {item.card.ease.toFixed(1)}</span>
                  <span>{item.card.interval} {t('cards_days', { count: item.card.interval })}</span>
                  <button
                    onClick={() => editingId === item.id ? setEditingId(null) : startEdit(item)}
                    className="text-accent font-medium"
                  >
                    {editingId === item.id ? '✕' : t('cards_edit')}
                  </button>
                </div>
                {item.card.reps > 0 && (
                  <div className="text-xs text-text-muted">
                    {formatDueDate(item.card.due, t)}
                    {item.card.lastReviewed && ` · ${t('cards_last_reviewed')}: ${formatDate(item.card.lastReviewed)}`}
                  </div>
                )}
              </div>

              {/* Expanded details: examples & mnemonics */}
              {expandedId === item.id && (
                <CardDetails
                  item={item}
                  examples={EXAMPLES[item.id]}
                  builtinHint={hints[item.id]}
                  userMnemonic={userMnemonics[item.id]}
                  t={t}
                />
              )}

              {/* Inline edit */}
              {editingId === item.id && (
                <div className="border-t border-border px-4 py-3 bg-bg/50 space-y-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-text-muted">
                      {t('cards_ease')}:
                      <input
                        type="range"
                        min="1.3"
                        max="3.0"
                        step="0.1"
                        value={editEase}
                        onChange={e => setEditEase(e.target.value)}
                        className="w-28 accent-accent"
                      />
                      <span className="text-text-primary font-medium w-8">{parseFloat(editEase).toFixed(1)}</span>
                    </label>

                    <label className="flex items-center gap-2 text-sm text-text-muted">
                      {t('cards_reschedule')}:
                      <input
                        type="date"
                        value={editDue}
                        onChange={e => setEditDue(e.target.value)}
                        className="bg-bg border border-border rounded px-2 py-1 text-text-primary text-sm"
                      />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90"
                    >
                      {t('save_mnemonic')}
                    </button>
                    <button
                      onClick={() => handleReset(item.id)}
                      className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30"
                    >
                      {t('cards_reset')}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-bg text-text-muted border border-border rounded-lg text-sm font-medium hover:text-text-primary"
                    >
                      {t('cards_cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CardDetails({ item, examples, builtinHint, userMnemonic, t }) {
  const hasContent = examples?.length || builtinHint || userMnemonic || item.usage
  if (!hasContent) {
    return (
      <div className="border-t border-border px-4 py-3 text-xs text-text-muted italic">
        {t('cards_no_details')}
      </div>
    )
  }

  return (
    <div className="border-t border-border px-4 py-3 space-y-2 bg-bg/30">
      {/* Usage examples */}
      {examples?.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-text-muted">{t('example_usage')}</span>
          {examples.map((ex, i) => (
            <div key={i} className="text-sm pl-3 border-l-2 border-accent/30">
              <div className="flex items-center gap-1.5">
                <span className="text-text-primary">{ex.fr}</span>
                <SpeakerButton text={ex.fr} size="sm" />
              </div>
              <div className="text-text-muted text-xs">{ex.ru}</div>
            </div>
          ))}
        </div>
      )}

      {/* Lexicon usage note */}
      {item.usage && (
        <div className="space-y-0.5">
          <span className="text-xs font-medium text-text-muted">{t('cards_usage')}</span>
          <div className="text-sm text-text-primary pl-3 border-l-2 border-blue-500/30">{item.usage}</div>
        </div>
      )}

      {/* Mnemonics */}
      {(builtinHint || userMnemonic) && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-text-muted">{t('memory_hook')}</span>
          {builtinHint && (
            <div className="text-sm text-text-muted pl-3 border-l-2 border-purple-500/30">
              {builtinHint}
            </div>
          )}
          {userMnemonic && (
            <div className="text-sm text-accent pl-3 border-l-2 border-accent/50">
              <span className="text-xs text-text-muted">{t('custom')}: </span>{userMnemonic}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatBadge({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-bold ${color}`}>{value}</span>
      <span className="text-text-muted text-sm">{label}</span>
    </div>
  )
}
