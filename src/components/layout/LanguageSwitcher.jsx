import { useT } from '../../i18n'

export default function LanguageSwitcher() {
  const { lang, setLanguage } = useT()

  return (
    <div className="flex items-center gap-1 ml-2 bg-bg rounded-lg p-0.5">
      {[
        { code: 'ru', label: 'RU' },
        { code: 'fr', label: 'FR' },
      ].map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={`px-2 py-1 rounded-md text-xs font-bold transition-colors border-none cursor-pointer
            ${lang === code ? 'bg-accent-glow text-accent' : 'bg-transparent text-text-muted hover:text-text-primary'}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
