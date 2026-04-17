import { createContext, useContext, useState, useCallback } from 'react'

const SettingsContext = createContext()

// Native language (what the learner already knows) - Russian only
export const NATIVE_LANGUAGES = {
  ru: { name: 'Русский', flag: '🇷🇺' },
}

// Target languages (what the learner is studying)
export const TARGET_LANGUAGES = {
  fr: { name: 'Français', flag: '🇫🇷' },
  pl: { name: 'Polski', flag: '🇵🇱' },
}

// UI languages (interface display)
export const UI_LANGUAGES = {
  ru: { name: 'Русский', flag: '🇷🇺' },
  pl: { name: 'Polski', flag: '🇵🇱' },
  fr: { name: 'Français', flag: '🇫🇷' },
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('lm_settings')
    return saved ? JSON.parse(saved) : {
      nativeLang: 'ru',
      targetLang: 'fr',
      uiLang: 'ru',
      autoPlayAudio: true,
    }
  })

  const updateSettings = useCallback((updates) => {
    setSettings(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem('lm_settings', JSON.stringify(next))
      return next
    })
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
