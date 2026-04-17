// Polish for Russian speakers - main course entry
// This course provides all content for learning Polish

import { VOCAB, THEMES } from './vocab.js'

export const COURSE = {
  id: 'pl',
  name: 'Polski',
  nativeName: 'Русский',
  nativeLang: 'ru',
  targetLang: 'pl',
  flag: '🇵🇱',
  totalThemes: 10,
}

export { VOCAB, THEMES }

// Get hints (not implemented yet for Polish)
export function getHints(nativeLang) {
  return {}
}
