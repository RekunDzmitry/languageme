import { useState } from 'react'
import { useT } from '../../i18n'

export default function WordProposalCard({ target, translation, suggestedThemeId, themes = [], isAdded, onAdd }) {
  const { t } = useT()

  // Prefill with the AI's suggested theme when it matches a real theme,
  // otherwise leave on "other" so the user can place it deliberately.
  const validSuggested =
    suggestedThemeId && themes.some(th => th.id === suggestedThemeId) ? suggestedThemeId : ''
  const [themeId, setThemeId] = useState(validSuggested)

  if (isAdded) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/30">
        <span className="text-sm">
          <span className="text-white font-medium">{target}</span>
          <span className="text-text-muted mx-1.5">→</span>
          <span className="text-text-muted">{translation}</span>
        </span>
        <span className="ml-auto text-xs text-green-400 font-medium">
          ✓ {t('email_word_added', 'Dodane')}
        </span>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white/5 border border-border hover:bg-white/10 transition-colors p-2.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white font-medium truncate">{target}</div>
          <div className="text-xs text-text-muted truncate">{translation}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(themeId || null) }}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/20 text-accent hover:bg-accent/40
                     flex items-center justify-center text-lg font-bold transition-colors"
          title={t('email_add_to_srs', 'Dodaj do nauki')}
        >
          +
        </button>
      </div>
      {themes.length > 0 && (
        <select
          value={themeId}
          onClick={(e) => e.stopPropagation()}
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
