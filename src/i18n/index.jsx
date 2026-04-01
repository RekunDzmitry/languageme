import { createContext, useContext, useState, useCallback } from 'react'
import ru from './locales/ru.json'
import fr from './locales/fr.json'

const locales = { ru, fr }
const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lm_uiLang') || 'ru')

  const setLanguage = useCallback((l) => {
    setLang(l)
    localStorage.setItem('lm_uiLang', l)
  }, [])

  const t = useCallback((key, params) => {
    let str = locales[lang]?.[key] || locales.ru[key] || key
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
