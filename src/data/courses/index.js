// Course selector based on target language
// Returns the appropriate course module

import { COURSE as FR_COURSE, VOCAB as FR_VOCAB, THEMES as FR_THEMES, getHints } from './fr/index.js'
import { COURSE as PL_COURSE, VOCAB as PL_VOCAB, THEMES as PL_THEMES } from './pl/index.js'
import { hints as ruHints } from './fr/hints/ru'

// Course registry by target language
export const COURSES = {
  fr: {
    ...FR_COURSE,
    VOCAB: FR_VOCAB,
    themes: FR_THEMES,
  },
  pl: {
    ...PL_COURSE,
    VOCAB: PL_VOCAB,
    themes: PL_THEMES,
  },
}

// Get the course for a given target language
export function getCourse(targetLang) {
  return COURSES[targetLang] || COURSES.fr
}

// Get vocabulary for a given target language
export function getVocab(targetLang) {
  return getCourse(targetLang).VOCAB
}

// Get themes for a given target language
export function getThemes(targetLang) {
  return getCourse(targetLang).themes
}

// Get hints (always in native language - Russian)
export function getHintsByLang(nativeLang) {
  return ruHints
}

// Get theme title based on target language
export function getThemeTitle(theme, targetLang) {
  // Prefer Russian translation for Russian native speakers
  if (theme.titleRu) return theme.titleRu
  return theme.title
}

// Re-export everything from fr (default French course)
export * from './fr/index.js'
