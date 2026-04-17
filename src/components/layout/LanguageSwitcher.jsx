import { useState } from 'react'
import { useT } from '../../i18n'
import { useSettings, NATIVE_LANGUAGES, TARGET_LANGUAGES } from '../../stores/SettingsContext'

export default function LanguageSwitcher() {
  const { lang, setLanguage } = useT()
  const { settings, updateSettings } = useSettings()
  const [open, setOpen] = useState(false)

  const currentTarget = TARGET_LANGUAGES[settings.targetLang] || TARGET_LANGUAGES.fr

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 ml-2 px-2 py-1 bg-bg rounded-lg text-xs transition-colors hover:bg-surface-hover"
      >
        <span>{currentTarget.flag}</span>
        <span className="text-text-muted font-medium">{currentTarget.name}</span>
        <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-surface border border-border rounded-lg shadow-lg py-2 z-50">
          {/* Native Language (learner's mother tongue) */}
          <div className="px-3 py-1.5">
            <div className="text-[10px] text-text-muted uppercase tracking-wide mb-1.5">
              {lang === 'pl' ? 'Mój język' : 'Язык носителя'}
            </div>
            <div className="space-y-0.5">
              {Object.entries(NATIVE_LANGUAGES).map(([code, { name, flag }]) => (
                <button
                  key={code}
                  onClick={() => { 
                    updateSettings({ nativeLang: code }); 
                    setLanguage(code);
                    setOpen(false) 
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors
                    ${settings.nativeLang === code ? 'bg-accent/20 text-accent' : 'text-text-primary hover:bg-surface-hover'}`}
                >
                  <span>{flag}</span>
                  <span>{name}</span>
                  {settings.nativeLang === code && <span className="ml-auto text-accent">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border my-1.5" />

          {/* Target Language (being studied) */}
          <div className="px-3 py-1.5">
            <div className="text-[10px] text-text-muted uppercase tracking-wide mb-1.5">
              {lang === 'pl' ? 'Uczę się' : 'Изучаемый язык'}
            </div>
            <div className="space-y-0.5">
              {Object.entries(TARGET_LANGUAGES).map(([code, { name, flag }]) => (
                <button
                  key={code}
                  onClick={() => { 
                    updateSettings({ targetLang: code }); 
                    setOpen(false) 
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors
                    ${settings.targetLang === code ? 'bg-accent/20 text-accent' : 'text-text-primary hover:bg-surface-hover'}`}
                >
                  <span>{flag}</span>
                  <span>{name}</span>
                  {settings.targetLang === code && <span className="ml-auto text-accent">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  )
}
