// src/lib/courseData.jsx
//
// Course data provider. Replaces the old src/data/courses/ JS bundles.
// Fetches the full course (themes, vocab, hints, examples, lexicon,
// conjugation tables) from the API once per target language and exposes
// it through React context so the rest of the app can read it
// synchronously the same way it used to read VOCAB / THEMES / hints.
//
// The shape mirrors the legacy JS module surface:
//   - VOCAB:        array of { id, target, ipa, gender, freq, theme, themeIds,
//                              translations: { ru, en }, hint }
//   - THEMES:       array of theme objects with sections[], verbs[]
//   - hints:        map of vocabId -> mnemonic text (per native_lang)
//   - examples:     map of vocabId -> [{ fr, ru }]
//   - lexicon:      map of vocabId -> { synonyms, usage, semantics }
//   - conjugations: map of themeId -> { verb: [forms] }
//
// API contract: GET /api/courses/:lang returns the entire bundle in one
// round-trip. The server packs themes + theme_vocab + theme_section +
// theme_verb + vocab + vocab_translation + vocab_hint + vocab_example +
// vocab_lexicon + theme_conjugation into a single JSON document.

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { api } from '../api/client'

const CourseDataContext = createContext(null)

export function CourseDataProvider({ children, targetLang, nativeLang }) {
  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api.get(`/api/courses/${targetLang}?native_lang=${nativeLang}`)
      .then((data) => {
        if (!cancelled) {
          setBundle(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [targetLang, nativeLang])

  const value = useMemo(() => {
    if (!bundle) return null
    return {
      targetLang,
      nativeLang,
      vocab: bundle.vocab || [],
      themes: bundle.themes || [],
      // map-shaped data for O(1) lookup in components
      hintsByVocab: bundle.hintsByVocab || {},
      examplesByVocab: bundle.examplesByVocab || {},
      lexiconByVocab: bundle.lexiconByVocab || {},
      conjugationsByTheme: bundle.conjugationsByTheme || {},
      loading,
      error,
    }
  }, [bundle, targetLang, nativeLang, loading, error])

  if (loading || !value) {
    // The host page should show its own loading state via the hook's
    // loading field; we render children but components reading the
    // context should check `loading` first.
    return (
      <CourseDataContext.Provider value={value}>
        {children}
      </CourseDataContext.Provider>
    )
  }

  return (
    <CourseDataContext.Provider value={value}>
      {children}
    </CourseDataContext.Provider>
  )
}

export function useCourseData() {
  const ctx = useContext(CourseDataContext)
  if (!ctx) {
    throw new Error('useCourseData must be used inside <CourseDataProvider>')
  }
  return ctx
}

// Selector helpers (replace getVocab / getThemes / getHintsByLang / getExamples)
export function getVocab(ctx) {
  return ctx.vocab
}

export function getThemes(ctx) {
  return ctx.themes
}

export function getHintsByLang(ctx) {
  return ctx.hintsByVocab
}

export function getExamples(ctx) {
  return ctx.examplesByVocab
}

export function getLexicon(ctx) {
  return ctx.lexiconByVocab
}

export function getConjugations(ctx, themeId) {
  return ctx.conjugationsByTheme[themeId] || {}
}

export function getThemeTitle(theme) {
  return theme.titleRu || theme.title
}
