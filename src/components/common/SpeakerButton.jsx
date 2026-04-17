import { useT } from '../../i18n'
import { speak, isSpeechAvailable } from '../../utils/audio'
import { useSpeechLang } from '../../hooks/useSpeechLang'

export default function SpeakerButton({ text, lang, size = 'sm', className = '' }) {
  const { t } = useT()
  const speechLang = useSpeechLang(lang)

  if (!isSpeechAvailable()) return null

  const dim = size === 'md' ? 'w-8 h-8' : 'w-6 h-6'

  return (
    <button
      onClick={(e) => { e.stopPropagation(); speak(text, speechLang) }}
      aria-label={t('audio_play')}
      className={`inline-flex items-center justify-center ${dim} rounded-full bg-transparent text-text-muted hover:text-accent cursor-pointer border-none transition-colors ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={size === 'md' ? 'w-5 h-5' : 'w-4 h-4'}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    </button>
  )
}
