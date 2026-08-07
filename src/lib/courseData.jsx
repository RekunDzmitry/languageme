// src/lib/courseData.jsx
//
// Course data provider. Replaces the old src/data/courses/ JS bundles.
// Fetches the full course (themes, vocab, hints, examples, lexicon,
// conjugation tables) for ALL target languages in a single round-trip
// and exposes it via React context so components can read synchronously.
//
// API contract: GET /api/courses/all?native_lang=ru returns a map of
// lang → bundle.

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { api } from '../api/client'

const CourseDataContext = createContext(null)

// Module-level cache. Keyed by `all|${nativeLang}`.
const bundleCache = new Map()
const inflight = new Map()

async function loadAllBundles(nativeLang) {
  const key = `all|${nativeLang}`
  if (bundleCache.has(key)) return bundleCache.get(key)
  if (inflight.has(key)) return inflight.get(key)
  const p = api.get(`/api/courses/all?native_lang=${nativeLang}`)
    .then(data => {
      bundleCache.set(key, data)
      inflight.delete(key)
      return data
    })
    .catch(err => {
      inflight.delete(key)
      throw err
    })
  inflight.set(key, p)
  return p
}

// Preload helper used by App.jsx. Loads all langs in one request so
// pages that show packs across both FR and PL (DashboardPage, etc.)
// have the data on mount.
export async function preloadBundle(_targetLang, nativeLang) {
  return loadAllBundles(nativeLang || 'ru')
}

export function CourseDataProvider({ children, targetLang, nativeLang }) {
  const [all, setAll] = useState(() => {
    const key = `all|${nativeLang}`
    return bundleCache.get(key) || null
  })
  const [loading, setLoading] = useState(() => {
    const key = `all|${nativeLang}`
    return !bundleCache.has(key)
  })

  useEffect(() => {
    const key = `all|${nativeLang}`
    if (bundleCache.has(key)) {
      setAll(bundleCache.get(key))
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    loadAllBundles(nativeLang)
      .then(data => {
        if (!cancelled) {
          setAll(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setLoading(false)
          // eslint-disable-next-line no-console
          console.error('course data load failed', err)
        }
      })
    return () => { cancelled = true }
  }, [nativeLang])

  // Pick the bundle for the active target lang; the others stay
  // available on the cache for pages that show packs across langs.
  const activeBundle = (all && all[targetLang]) || null

  const value = useMemo(() => {
    const empty = {
      targetLang,
      nativeLang,
      loading,
      vocab: [],
      themes: [],
      hintsByVocab: {},
      examplesByVocab: {},
      lexiconByVocab: {},
      conjugationsByTheme: {},
    }
    if (!activeBundle) return empty
    return {
      targetLang,
      nativeLang,
      loading,
      vocab: activeBundle.vocab || [],
      themes: activeBundle.themes || [],
      hintsByVocab: activeBundle.hintsByVocab || {},
      examplesByVocab: activeBundle.examplesByVocab || {},
      lexiconByVocab: activeBundle.lexiconByVocab || {},
      conjugationsByTheme: activeBundle.conjugationsByTheme || {},
      // Cross-lang access for pages like Dashboard that render all packs
      allByLang: all || {},
    }
  }, [activeBundle, all, targetLang, nativeLang, loading])

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

// Convenience selectors
export function getVocab(ctx) { return ctx.vocab }
export function getThemes(ctx) { return ctx.themes }
export function getHintsByLang(ctx) { return ctx.hintsByVocab }
export function getExamples(ctx) { return ctx.examplesByVocab }
export function getLexicon(ctx) { return ctx.lexiconByVocab }
export function getConjugations(ctx, themeId) {
  return ctx.conjugationsByTheme[themeId] || {}
}
export function getThemeTitle(theme) {
  return theme.titleRu || theme.title
}
