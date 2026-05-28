import { useState, useRef } from 'react'
import { useT } from '../../i18n'

// Category color mapping — background fills matched to dark theme
// Labels now come from i18n keys: email_cat_spelling, email_cat_grammar, etc.
const CATEGORY_STYLES = {
  spelling: {
    bg: 'bg-red-500/25',
    border: 'border-red-500/50',
    text: 'text-red-400',
    labelKey: 'email_cat_spelling',
    labelBg: 'bg-red-500/20',
    dot: 'bg-red-500',
  },
  grammar: {
    bg: 'bg-orange-500/25',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    labelKey: 'email_cat_grammar',
    labelBg: 'bg-orange-500/20',
    dot: 'bg-orange-500',
  },
  style: {
    bg: 'bg-blue-500/25',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    labelKey: 'email_cat_style',
    labelBg: 'bg-blue-500/20',
    dot: 'bg-blue-500',
  },
  vocabulary: {
    bg: 'bg-yellow-500/25',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    labelKey: 'email_cat_vocabulary',
    labelBg: 'bg-yellow-500/20',
    dot: 'bg-yellow-500',
  },
}

const POPOVER_WIDTH = 320

export default function EmailResultView({ userText, errors, selectedErrorIdx, onSelectError, isLoading, onAddWord, addedWords, themes = [] }) {
  const { t } = useT()
  const [hovered, setHovered] = useState(null) // { err, rect }
  const closeTimer = useRef(null)

  if (!userText) return null

  const openPopover = (err, target) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setHovered({ err, rect: target.getBoundingClientRect() })
  }
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setHovered(null), 140)
  }
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  // Build segments: array of { type: 'normal' | 'error', text, errorIdx?, err? }
  const segments = []
  let lastIdx = 0

  // Backend returns errors pre-sorted by startOffset; sort defensively anyway.
  const sorted = [...(errors || [])].sort((a, b) => a.startOffset - b.startOffset)

  for (const err of sorted) {
    const start = err.startOffset
    const end = err.endOffset

    // Skip invalid ranges
    if (start < lastIdx || end <= start || start >= userText.length) continue

    if (start > lastIdx) {
      segments.push({ type: 'normal', text: userText.slice(lastIdx, start) })
    }

    segments.push({
      type: 'error',
      text: userText.slice(start, end),
      errorIdx: sorted.indexOf(err),
      err,
    })

    lastIdx = end
  }

  if (lastIdx < userText.length) {
    segments.push({ type: 'normal', text: userText.slice(lastIdx) })
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm text-text-muted uppercase tracking-wide">
          {t('email_your_text', 'Twój tekst')}
          {isLoading
            ? ` — ${t('email_checking', 'Sprawdzanie...')}`
            : ` — ${t('email_errors_found', '{n} błędów znaleziono').replace('{n}', errors?.length || 0)}`
          }
        </h3>
        {!isLoading && (
          <div className="flex gap-2 text-xs">
            {Object.entries(CATEGORY_STYLES).map(([key, style]) => (
              <span key={key} className={`px-2 py-0.5 rounded-full ${style.labelBg} ${style.text}`}>
                {t(style.labelKey, style.labelKey)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-bg rounded-lg p-4 font-mono text-base leading-relaxed whitespace-pre-wrap">
        {segments.map((seg, i) => {
          if (seg.type === 'normal') {
            return <span key={i}>{seg.text}</span>
          }

          const style = CATEGORY_STYLES[seg.err.category] || CATEGORY_STYLES.grammar
          const isSelected = selectedErrorIdx === seg.errorIdx
          const isHovered = hovered?.err === seg.err

          return (
            <span
              key={i}
              onClick={() => onSelectError(seg.errorIdx)}
              onMouseEnter={(e) => openPopover(seg.err, e.currentTarget)}
              onMouseLeave={scheduleClose}
              className={`relative cursor-pointer rounded px-0.5 -mx-0.5 transition-all
                ${style.bg} border-b-2 ${style.border}
                ${isSelected || isHovered ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg' : 'hover:brightness-125'}`}
            >
              {seg.text}
              {/* Small category indicator dot */}
              <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${style.labelBg} border ${style.border}`} />
            </span>
          )
        })}
      </div>

      {/* Hover popover */}
      {hovered && (
        <ErrorPopover
          err={hovered.err}
          rect={hovered.rect}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          onAddWord={onAddWord}
          addedWords={addedWords}
          themes={themes}
        />
      )}

      {/* Loading spinner */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-3 text-text-muted text-sm">
          <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>{t('email_checking', 'Sprawdzanie...')}</span>
        </div>
      )}

      {/* Fallback if no segments were built (all errors out of range) */}
      {segments.length === 0 && (
        <div className="bg-bg rounded-lg p-4 font-mono text-base leading-relaxed whitespace-pre-wrap text-text-primary">
          {userText}
        </div>
      )}
    </div>
  )
}

function ErrorPopover({ err, rect, onMouseEnter, onMouseLeave, onAddWord, addedWords, themes = [] }) {
  const { t } = useT()
  const style = CATEGORY_STYLES[err.category] || CATEGORY_STYLES.grammar

  // Position relative to the viewport (the span rect is viewport-relative)
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8))
  const below = rect.bottom + 300 < window.innerHeight
  const top = below ? rect.bottom + 8 : rect.top - 8

  // Build the list of addable cards: AI proposals, or fall back to the correction itself.
  const proposals = (err.proposedWords && err.proposedWords.length > 0)
    ? err.proposedWords
    : (err.correction
        ? [{ target: err.correction, translation: err.explanation || '' }]
        : [])

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed z-50 rounded-xl border border-border bg-surface shadow-2xl shadow-black/40 p-3 text-left"
      style={{
        left,
        top,
        width: POPOVER_WIDTH,
        transform: below ? 'none' : 'translateY(-100%)',
      }}
    >
      {/* Category */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
        <span className={`text-xs font-bold uppercase ${style.text}`}>
          {t(style.labelKey, style.labelKey)}
        </span>
      </div>

      {/* Original → Correction */}
      <div className="space-y-1 mb-2">
        {err.originalText && (
          <div className="text-sm text-red-400 line-through break-words">{err.originalText}</div>
        )}
        {err.correction && (
          <div className="text-sm text-green-400 font-semibold break-words">{err.correction}</div>
        )}
      </div>

      {/* Explanation */}
      {err.explanation && (
        <p className="text-xs text-text-muted leading-relaxed mb-3">{err.explanation}</p>
      )}

      {/* Add to cards */}
      {onAddWord && proposals.length > 0 && (
        <div className="space-y-2 border-t border-border pt-2">
          <p className="text-xs text-text-muted font-medium">
            {t('email_learn_words', 'Dodaj do nauki')}
          </p>
          {proposals.map((pw, i) => (
            <ProposalRow
              key={i}
              pw={pw}
              hint={err.explanation}
              themes={themes}
              isAdded={addedWords?.has(pw.target)}
              onAddWord={onAddWord}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProposalRow({ pw, hint, themes, isAdded, onAddWord, t }) {
  // Prefill with the AI's suggested theme when it matches a real theme,
  // otherwise default to "other" so the user can place the word deliberately.
  const validSuggested =
    pw.suggestedThemeId && themes.some(th => th.id === pw.suggestedThemeId) ? pw.suggestedThemeId : ''
  const [themeId, setThemeId] = useState(validSuggested)

  return (
    <div
      className={`rounded-lg border text-sm p-2
        ${isAdded ? 'bg-accent/10 border-accent/30' : 'bg-white/5 border-border'}`}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium truncate">{pw.target}</div>
          {pw.translation && (
            <div className="text-xs text-text-muted truncate">{pw.translation}</div>
          )}
        </div>
        {isAdded ? (
          <span className="text-xs text-green-400 font-medium flex-shrink-0">
            ✓ {t('email_word_added', 'Dodane')}
          </span>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onAddWord(pw.target, pw.translation, themeId || null, hint || null) }}
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-accent/20 text-accent hover:bg-accent/40
                       flex items-center justify-center text-base font-bold transition-colors"
            title={t('email_add_to_srs', 'Dodaj do nauki')}
          >
            +
          </button>
        )}
      </div>
      {!isAdded && themes.length > 0 && (
        <select
          value={themeId}
          onChange={(e) => setThemeId(e.target.value)}
          className="mt-2 w-full text-xs bg-bg text-white border border-border rounded-lg px-2 py-1.5
                     focus:outline-none focus:border-accent"
        >
          <option value="">{t('email_theme_other', 'Inny temat')}</option>
          {themes.map(th => (
            <option key={th.id} value={th.id}>{th.title_ru || th.title}</option>
          ))}
        </select>
      )}
    </div>
  )
}
