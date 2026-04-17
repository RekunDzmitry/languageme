import { useSettings } from '../stores/SettingsContext'

// Map targetLang codes to BCP 47 language tags for speech synthesis
const LANG_MAP = {
  fr: 'fr-FR',
  pl: 'pl-PL',
  de: 'de-DE',
  es: 'es-ES',
  it: 'it-IT',
  en: 'en-US',
}

/**
 * Returns the BCP 47 language tag for speech synthesis based on targetLang.
 * Can be overridden by passing a custom lang parameter.
 */
export function useSpeechLang(customLang) {
  const { settings } = useSettings()
  return customLang || LANG_MAP[settings.targetLang] || 'fr-FR'
}

export { LANG_MAP }
