import { VOCAB, THEMES } from './vocab'
import { hints as ruHints } from './hints/ru'
import { hints as plHints } from './hints/pl'

export const COURSE = {
  id: 'fr-ru',
  name: 'Français',
  nativeName: 'Русский',
  nativeLang: 'ru',
  flag: '🇫🇷',
  totalThemes: 30,
}

export { VOCAB, THEMES, ruHints, plHints }

// Get hints for current native language
export function getHints(nativeLang) {
  switch (nativeLang) {
    case 'pl': return plHints
    case 'ru':
    default: return ruHints
  }
}
