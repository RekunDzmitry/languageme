import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../../i18n'
import { useSettings, UI_LANGUAGES } from '../../stores/SettingsContext'
import { LESSON_PACKS, getDefaultPackId, openPack } from '../../data/lessonPacks'

// Pack ids use hyphens (e.g. "fr-foundations"); i18n keys use underscores
// (e.g. "pack_fr_foundations_short"). Centralise the mapping so a new pack
// automatically gets the right key shape.
const packI18nKey = (packId, slot) => `pack_${packId.replace(/-/g, '_')}_${slot}`

export default function LanguageSwitcher() {
  const { t, lang, setLanguage } = useT()
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const currentPack = LESSON_PACKS.find((pack) => pack.id === settings.activePackId)
    || LESSON_PACKS.find((pack) => pack.id === getDefaultPackId(settings.targetLang))

  function handleSelectPack(pack) {
    openPack(pack, { navigate, updateSettings })
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 ml-2 px-2 py-1 bg-bg rounded-lg text-xs transition-colors hover:bg-surface-hover"
        type="button"
      >
        <span className="text-text-muted font-medium max-w-[120px] truncate">
          {currentPack ? t(packI18nKey(currentPack.id, 'short')) : ''}
        </span>
        <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-surface border border-border rounded-xl shadow-xl z-50 p-2">
          <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-2 py-1">
            {t('pack_section_learning')}
          </div>
          {LESSON_PACKS.map((pack) => (
            <button
              key={pack.id}
              onClick={() => handleSelectPack(pack)}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                currentPack?.id === pack.id ? 'bg-accent/20 text-accent' : 'text-text-primary hover:bg-surface-hover'
              }`}
              type="button"
            >
              <span className={`mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r ${pack.accentClass}`} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{t(packI18nKey(pack.id, 'short'))}</span>
                <span className="block text-xs text-text-muted truncate">{t(packI18nKey(pack.id, 'subtitle'))}</span>
              </span>
              {currentPack?.id === pack.id && <span className="text-accent">✓</span>}
            </button>
          ))}

          <div className="border-t border-border mt-2 pt-2">
            <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-2 py-1">
              {t('pack_section_interface')}
            </div>
            {Object.entries(UI_LANGUAGES).map(([code, { name, flag }]) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  lang === code ? 'bg-white/[0.06] text-text-primary' : 'text-text-muted hover:bg-surface-hover hover:text-text-primary'
                }`}
                type="button"
              >
                <span>{flag}</span>
                <span className="text-xs font-medium">{name}</span>
                {lang === code && <span className="ml-auto text-accent">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}
