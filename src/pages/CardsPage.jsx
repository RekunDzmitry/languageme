import { useState, useMemo } from 'react'
import { useT } from '../i18n'
import { useProgress } from '../stores/UserProgressContext'
import { useSettings } from '../stores/SettingsContext'
import { getVocab, getHintsByLang, getThemes, getThemeTitle } from '../data/courses'
import { filterThemesByPack } from '../data/lessonPacks'
import { getCardStatus, formatDueDate, STATUS_COLORS } from '../utils/cardStatus'
import UserCardModal from '../components/cards/UserCardModal'

const STATUS_FILTERS = ['all', 'due', 'learning', 'mastered', 'new']
const SORT_OPTIONS = ['due', 'word', 'ease', 'reps']

// Per-language catch-all theme ids. These are the LEGACY catch-alls
// from migration 025; new user cards should use the pack-scoped
// catch-all (e.g. pl-a1-a2_other) computed in the component from
// the active pack id. Kept here as a fallback for the rare case
// where the pack's _other row hasn't been seeded yet.
const LEGACY_OTHER_THEME_IDS = {
  fr: 'fr_other',
  pl: 'pl_other',
}

 export default function CardsPage() {
   const { t } = useT()
   const { settings } = useSettings()
   const targetLang = settings.targetLang
   const hints = getHintsByLang(settings.nativeLang)
   const allThemes = getThemes(targetLang)
   const themes = useMemo(
     () => filterThemesByPack(allThemes, settings.activePackId, targetLang),
     [allThemes, settings.activePackId, targetLang]
   )
   const activeThemeIds = useMemo(() => new Set(themes.map((theme) => theme.id)), [themes])
  // Pack-scoped catch-all — a card filed here is tied to the active
  // pack (e.g. Польский A1/A2) and won't leak into another pack's
  // "Мои карточки" section. Falls back to the per-language legacy
  // id if the active pack doesn't have a _other row yet.
  const packCatchAll = settings.activePackId ? `${settings.activePackId}_other` : null
  const otherThemeId = packCatchAll || LEGACY_OTHER_THEME_IDS[targetLang] || null

  // Static vocab is scoped to the active pack so the cards list mirrors
  // what the user can actually study. User cards are NOT pack-scoped —
  // a learner on the FR pack 1 should still see their own card filed
  // under fr_other. We build the two halves separately and concat, so
  // the existing filter/sort code (which is downstream) can stay generic.
  const staticVocab = useMemo(
    () => getVocab(targetLang).filter((word) => word.themeIds?.some((themeId) => activeThemeIds.has(themeId))),
    [targetLang, activeThemeIds]
  )

  const {
    cards, userMnemonics, userVocab, resetCard, updateCard,
    createUserCard, updateUserCard, deleteUserCard, showNotification,
  } = useProgress()
  const [expandedId, setExpandedId] = useState(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [themeFilter, setThemeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('due')
  const [editingId, setEditingId] = useState(null)
  const [editEase, setEditEase] = useState(2.5)
  const [editDue, setEditDue] = useState('')
  const [modalState, setModalState] = useState(null) // null | 'new' | { id, mode: 'edit' }

  const editingCard = modalState && modalState !== 'new'
    ? userVocab[modalState.id]
    : null

  // Enrich + concat. Static cards first (they drive the count stats)
  // followed by user cards. Each row carries `source: 'user'` so the
  // list can render the edit/delete affordances.
  //
  // The user-card half is scoped to the active pack so a card filed
  // under pl-a1-a2_other doesn't bleed into the pl-telc pack's
  // /cards view (or its stats). Without this filter, switching
  // packs would still surface every user card for the lang.
  const enrichedCards = useMemo(() => {
    const attachCard = (word) => {
      const card = cards[word.id] || { ease: 2.5, interval: 1, reps: 0, due: Date.now(), lastReviewed: null }
      return { ...word, card, status: getCardStatus(card) }
    }
    const staticRows = staticVocab.map(attachCard)
    const userScopeIds = new Set([
      ...activeThemeIds,
      packCatchAll,
      LEGACY_OTHER_THEME_IDS[targetLang],
    ].filter(Boolean))
    const userRows = Object.values(userVocab)
      .filter((v) => Array.isArray(v.themeIds) && v.themeIds.some((id) => userScopeIds.has(id)))
      .map(attachCard)
    return [...staticRows, ...userRows]
  }, [staticVocab, userVocab, cards, activeThemeIds, packCatchAll, targetLang])
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

  async function handleModalSubmit(data) {
    if (modalState === 'new') {
      await createUserCard({ targetLang, ...data })
      showNotification(t('user_card_created', '✓ Карточка создана'), 'success')
    } else if (modalState && modalState.mode === 'edit') {
      await updateUserCard(modalState.id, data)
      showNotification(t('user_card_updated', '✓ Сохранено'), 'success')
    }
  }

  async function handleDelete(card) {
    if (!confirm(t('user_card_delete_confirm'))) return
    try {
      await deleteUserCard(card.id)
      showNotification(t('user_card_deleted', '✓ Удалено'), 'success')
    } catch (err) {
      showNotification(err?.message || t('user_card_save_error'), 'error')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('cards_title', 'Карточки')}</h1>
          <div className="flex flex-wrap gap-4 mt-3">
            <StatBadge label={t('cards_total', 'Всего')} value={stats.total} color="text-text-primary" />
            <StatBadge label={t('cards_due', 'К повторению')} value={stats.due} color="text-orange-400" />
            <StatBadge label={t('cards_learning', 'В процессе')} value={stats.learning} color="text-blue-400" />
            <StatBadge label={t('cards_mastered', 'Изучено')} value={stats.mastered} color="text-green-400" />
            <StatBadge label={t('cards_new', 'Новые')} value={stats.new} color="text-gray-400" />
          </div>
        </div>
        <button
          onClick={() => setModalState('new')}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90"
        >
          + {t('user_card_new')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('cards_search', 'Поиск...')}
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
                {t(`cards_filter_${s}`, s)}
              </button>
            ))}
          </div>

          {/* Theme filter — pack themes + the catch-all "Other" so user
              cards filed there are reachable. The value is the resolved
              `<lang>_other` id, not the literal "other", so the
              downstream themeIds?.includes(themeFilter) check just works. */}
          <select
            value={themeFilter}
            onChange={e => setThemeFilter(e.target.value)}
            className="bg-bg border border-border rounded-lg px-2 py-1 text-sm text-text-primary"
          >
            <option value="all">{t('all_themes')}</option>
            {themes.map(th => (
              <option key={th.id} value={th.id}>{getThemeTitle(th, targetLang)}</option>
            ))}
            {otherThemeId && (
              <option value={otherThemeId}>{t('theme_other')}</option>
            )}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-bg border border-border rounded-lg px-2 py-1 text-sm text-text-primary"
          >
            {SORT_OPTIONS.map(s => (
              <option key={s} value={s}>{t(`cards_sort_${s}`, s)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards list */}
      {filtered.length === 0 ? (
        <div className="text-center text-text-muted py-12">
          {t('cards_no_cards', 'Нет карточек')}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto_auto] gap-3 px-4 py-2 text-xs text-text-muted font-medium">
            <span>{targetLang.toUpperCase()}</span>
            <span>{settings.nativeLang.toUpperCase()}</span>
            <span>{t('cards_status', 'Статус')}</span>
            <span>{t('cards_due_label', 'К повторению')}</span>
            <span>{t('cards_reps', 'Повт.')}</span>
            <span>{t('cards_ease', 'Лёгк.')}</span>
            <span>{t('cards_interval', 'Интервал')}</span>
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
                  {item.source === 'user' && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-accent/80">· {t('user_card_badge', 'своя')}</span>
                  )}
                </div>
                <span className="text-text-muted text-sm">{item.translations?.ru || item.translations?.en}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[item.status]}`}>
                  {t(`cards_filter_${item.status}`, item.status)}
                </span>
                <span className="text-text-muted text-xs w-24 text-center">
                  {item.card.reps > 0 ? formatDueDate(item.card.due, t) : '—'}
                </span>
                <span className="text-text-muted text-xs w-10 text-center">{item.card.reps}</span>
                <span className="text-text-muted text-xs w-10 text-center">{item.card.ease.toFixed(1)}</span>
                <span className="text-text-muted text-xs w-16 text-center">
                  {item.card.interval} {t('cards_days', { count: item.card.interval, defaultValue: 'дн.' })}
                </span>
                <div className="flex items-center gap-2">
                  {item.source === 'user' ? (
                    <>
                      <button
                        onClick={() => setModalState({ id: item.id, mode: 'edit' })}
                        className="text-accent hover:text-accent/80 text-xs font-medium"
                      >
                        {t('user_card_edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium"
                      >
                        {t('user_card_delete')}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => editingId === item.id ? setEditingId(null) : startEdit(item)}
                      className="text-accent hover:text-accent/80 text-xs font-medium"
                    >
                      {editingId === item.id ? '✕' : t('cards_edit', 'Изменить')}
                    </button>
                  )}
                </div>
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
                    {item.source === 'user' && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-accent/80">· {t('user_card_badge', 'своя')}</span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[item.status]}`}>
                    {t(`cards_filter_${item.status}`, item.status)}
                  </span>
                </div>
                <div className="text-text-muted text-sm">{item.translations?.[settings.nativeLang] || item.translations?.ru}</div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>{t('cards_reps', 'Повт.')}: {item.card.reps}</span>
                  <span>{t('cards_ease', 'Лёгк.')}: {item.card.ease.toFixed(1)}</span>
                  <span>{item.card.interval} {t('cards_days', { count: item.card.interval, defaultValue: 'дн.' })}</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {item.source === 'user' ? (
                    <>
                      <button
                        onClick={() => setModalState({ id: item.id, mode: 'edit' })}
                        className="px-2 py-1 bg-bg text-accent border border-border rounded text-xs font-medium"
                      >
                        {t('user_card_edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="px-2 py-1 bg-bg text-red-400 border border-border rounded text-xs font-medium"
                      >
                        {t('user_card_delete')}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => editingId === item.id ? setEditingId(null) : startEdit(item)}
                      className="text-accent font-medium"
                    >
                      {editingId === item.id ? '✕' : t('cards_edit', 'Изменить')}
                    </button>
                  )}
                </div>
                {item.card.reps > 0 && (
                  <div className="text-xs text-text-muted">
                    {formatDueDate(item.card.due, t)}
                    {item.card.lastReviewed && ` · ${t('cards_last_reviewed', 'повторено')}: ${formatDate(item.card.lastReviewed)}`}
                  </div>
                )}
              </div>

              {/* Expanded details: examples & mnemonics */}
              {expandedId === item.id && (
                <CardDetails
                  item={item}
                  examples={EXAMPLES[item.id]}
                  builtinHint={hints[item.id] || item.hint}
                  userMnemonic={userMnemonics[item.id]}
                  t={t}
                />
              )}

              {/* Inline edit (only for static cards) */}
              {editingId === item.id && item.source !== 'user' && (
                <div className="border-t border-border px-4 py-3 bg-bg/50 space-y-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-text-muted">
                      {t('cards_ease', 'Лёгк.')}:
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
                      {t('cards_reschedule', 'Перенести')}:
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
                      {t('cards_reset', 'Сброс')}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-bg text-text-muted border border-border rounded-lg text-sm font-medium hover:text-text-primary"
                    >
                      {t('cards_cancel', 'Отмена')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <UserCardModal
        open={modalState !== null}
        mode={modalState === 'new' ? 'new' : (modalState?.mode || 'new')}
        initial={editingCard}
        themes={allThemes}
        targetLang={targetLang}
        activePackId={settings.activePackId}
        onSubmit={handleModalSubmit}
        onClose={() => setModalState(null)}
      />
    </div>
  )
}

function CardDetails({ item, examples, builtinHint, userMnemonic, t }) {
  const hasContent = examples?.length || builtinHint || userMnemonic || item.usage
  if (!hasContent) {
    return (
      <div className="border-t border-border px-4 py-3 text-xs text-text-muted italic">
        {t('cards_no_details', 'Нет деталей')}
      </div>
    )
  }

  return (
    <div className="border-t border-border px-4 py-3 space-y-2 text-sm">
      {item.ipa && (
        <div><span className="text-text-muted">{t('ipa_label', 'Произношение')}: </span><span className="text-text-primary">{item.ipa}</span></div>
      )}
      {builtinHint && (
        <div><span className="text-text-muted">{t('memory_hook', 'Подсказка')}: </span><span className="text-text-primary">{builtinHint}</span></div>
      )}
      {userMnemonic && (
        <div><span className="text-text-muted">{t('your_mnemonic')}: </span><span className="text-text-primary">{userMnemonic}</span></div>
      )}
      {examples?.length > 0 && (
        <ul className="list-disc list-inside text-text-muted text-xs space-y-1">
          {examples.map((ex, i) => (
            <li key={i}><span className="text-text-primary">{ex.target}</span> — {ex.translation}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function StatBadge({ label, value, color }) {
  return (
    <div className="text-xs">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-text-muted">{label}</div>
    </div>
  )
}
