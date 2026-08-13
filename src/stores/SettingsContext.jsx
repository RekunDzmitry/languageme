/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { getDefaultPackId } from '../data/lessonPacks'

const SettingsContext = createContext()

// Native language (what the learner already knows) - Russian only.
// TODO(multilang): when the multilang phase lands, surface this in a
// onboarding picker and let users pick from any language we have a course for.
// Until then, hard-coded to ru so callers can rely on the shape.
export const NATIVE_LANGUAGES = {
  ru: { name: 'Русский', flag: '🇷🇺' },
}

// Target languages (what the learner is studying).
// TODO(multilang): drive this from the list of courses that actually have
// theme content (fr, pl, ge, esp, …). The list grows as new course bundles
// are added; consumers should not import this directly once the data is
// derived. For now it mirrors the lang prefixes used in lessonPacks.js.
export const TARGET_LANGUAGES = {
  fr: { name: 'Français', flag: '🇫🇷' },
  pl: { name: 'Polski', flag: '🇵🇱' },
}

// CEFR levels the learner can target
export const CEFR_LEVELS = {
  A1: { name: 'A1', desc: 'Początkujący' },
  A2: { name: 'A2', desc: 'Podstawowy' },
  B1: { name: 'B1', desc: 'Średnio zaawansowany' },
  B2: { name: 'B2', desc: 'Wyższy średnio zaawansowany' },
  C1: { name: 'C1', desc: 'Zaawansowany' },
}

// UI languages (interface display). Sourced from i18n/locales.
export const UI_LANGUAGES = {
  ru: { name: 'Русский', flag: '🇷🇺' },
  pl: { name: 'Polski', flag: '🇵🇱' },
  fr: { name: 'Français', flag: '🇫🇷' },
}

const DEFAULT_SETTINGS = {
  nativeLang: 'ru',
  targetLang: 'fr',
  uiLang: 'ru',
  targetLevel: 'B1',
  autoPlayAudio: true,
}

function loadSettings() {
  const saved = localStorage.getItem('lm_settings')
  if (!saved) return DEFAULT_SETTINGS

  try {
    const parsed = JSON.parse(saved)
    return parsed && typeof parsed === 'object' ? parsed : DEFAULT_SETTINGS
  } catch {
    localStorage.removeItem('lm_settings')
    return DEFAULT_SETTINGS
  }
}

function normalizeSettings(settings) {
  const targetLang = TARGET_LANGUAGES[settings.targetLang] ? settings.targetLang : DEFAULT_SETTINGS.targetLang
  const uiLang = UI_LANGUAGES[settings.uiLang] ? settings.uiLang : DEFAULT_SETTINGS.uiLang
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    nativeLang: 'ru',
    targetLang,
    uiLang,
    activePackId: settings.activePackId || getDefaultPackId(targetLang),
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    return normalizeSettings(loadSettings())
  })

  const updateSettings = useCallback((updates) => {
    setSettings(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem('lm_settings', JSON.stringify(next))
      return next
    })
  }, [])

  // Memo the context value so consumers (e.g. DashboardPage's packStats
  // useMemo) get a stable reference unless settings actually change. Without
  // this the value object is rebuilt every render, which previously caused
  // downstream useMemo deps that include the whole context to invalidate on
  // every parent render.
  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings])

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
