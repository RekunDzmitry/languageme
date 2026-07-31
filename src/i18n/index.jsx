import { createContext, useContext, useState, useCallback } from 'react'
import ru from './locales/ru.json'
import pl from './locales/pl.json'
import fr from './locales/fr.json'

const locales = { ru, pl, fr }
const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lm_uiLang') || 'ru')

  const setLanguage = useCallback((l) => {
    setLang(l)
    localStorage.setItem('lm_uiLang', l)
  }, [])

  // Second argument is overloaded, because both call styles are already
  // used widely across the app:
  //   t('study_complete', { count: 5 })  → interpolate {count}
  //   t('cards_edit', 'Изменить')        → literal fallback if the key
  //                                        is missing from every locale
  // Previously only the object form was honoured; a string fell through
  // to Object.entries('Изменить'), which ran a no-op replace per
  // character and left a missing key rendering as the raw key name.
  const t = useCallback((key, paramsOrFallback) => {
    const isFallback = typeof paramsOrFallback === 'string'
    const fallback = isFallback ? paramsOrFallback : null
    const params = isFallback ? null : paramsOrFallback

    let str = locales[lang]?.[key] ?? locales.ru[key] ?? fallback ?? key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v)
      })
    }
    return str
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useT() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useT must be used within I18nProvider')
  return ctx
}
