// Polish for Russian speakers - main course entry
// This course provides all content for learning Polish

import { VOCAB } from './vocab.js'
import theme01 from './themes/theme01-ortografia-uo.js'
import theme02 from './themes/theme02-digrafy.js'
import theme03 from './themes/theme03-miekkie.js'
import theme04 from './themes/theme04-rz-z.js'
import theme05 from './themes/theme05-ch-h.js'
import theme06 from './themes/theme06-j-i.js'
import theme07 from './themes/theme07-gie-ge.js'
import theme08 from './themes/theme08-nosowki.js'
import theme09 from './themes/theme09-wielka-litera.js'

export const COURSE = {
  id: 'pl',
  name: 'Polski',
  nativeName: 'Русский',
  nativeLang: 'ru',
  targetLang: 'pl',
  flag: '🇵🇱',
  totalThemes: 9,
}

export const THEMES = [
  theme01,
  theme02,
  theme03,
  theme04,
  theme05,
  theme06,
  theme07,
  theme08,
  theme09,
]

export { VOCAB }

// Get hints (not implemented yet for Polish)
// eslint-disable-next-line no-unused-vars
export function getHints(_nativeLang) {
  return {}
}
