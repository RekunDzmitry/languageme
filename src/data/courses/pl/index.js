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
import theme10 from './themes/theme10-praca.js'
import theme11 from './themes/theme11-edukacja.js'
import theme12 from './themes/theme12-ochrona-srodowiska.js'
import theme13 from './themes/theme13-katastrofy-naturalne.js'
import theme14 from './themes/theme14-smieci-i-zasoby.js'
import theme15 from './themes/theme15-cyfrowy-nomadyzm.js'
import theme16 from './themes/theme16-konstrukcje-z-przypadkami.js'
import theme17 from './themes/theme17-media-spolecznosciowe.js'
import theme18 from './themes/theme18-my-i-media.js'
import theme19 from './themes/theme19-email-writing.js'
import theme20 from './themes/theme20-verbs-m-polite-address.js'

export const COURSE = {
  id: 'pl',
  name: 'Polski',
  nativeName: 'Русский',
  nativeLang: 'ru',
  targetLang: 'pl',
  flag: '🇵🇱',
  totalThemes: 20,
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
  theme10,
  theme11,
  theme12,
  theme13,
  theme14,
  theme15,
  theme16,
  theme17,
  theme18,
  theme19,
  theme20,
]

export { VOCAB }

// Get hints (not implemented yet for Polish)
// eslint-disable-next-line no-unused-vars
export function getHints(_nativeLang) {
  return {}
}
