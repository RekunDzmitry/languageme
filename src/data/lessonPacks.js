export const PACK_IDS = {
  FR_FOUNDATIONS: 'fr-foundations',
  PL_A1_A2: 'pl-a1-a2',
  PL_TELC: 'pl-telc',
}

const PL_A1_A2_THEME_IDS = new Set([
  'pl_theme01',
  'pl_theme02',
  'pl_theme03',
  'pl_theme04',
  'pl_theme05',
  'pl_theme06',
  'pl_theme07',
  'pl_theme08',
  'pl_theme09',
])

const PL_TELC_THEME_IDS = new Set([
  'pl_theme10',
  'pl_theme11',
  'pl_theme12',
  'pl_theme13',
  'pl_theme14',
  'pl_theme15',
  'pl_theme16',
  'pl_theme17',
  'pl_theme18',
  'pl_theme19',
  'pl_theme20',
  'pl_theme21',
  'pl_theme22',
])

export const LESSON_PACKS = [
  {
    id: PACK_IDS.FR_FOUNDATIONS,
    targetLang: 'fr',
    title: 'Французский',
    shortTitle: 'Français',
    subtitle: 'Грамматика, словарь и спряжения',
    badge: 'RU -> FR',
    level: 'A1-B2',
    primaryRoute: '/themes',
    modes: ['themes', 'training', 'cards'],
    accentClass: 'from-sky-500 to-indigo-500',
    includesTheme: (theme) => /^theme\d+$/.test(theme.id),
  },
  {
    id: PACK_IDS.PL_A1_A2,
    targetLang: 'pl',
    title: 'Польский A1/A2',
    shortTitle: 'Polski A1/A2',
    subtitle: 'Основы, орфография и начальный словарь',
    badge: 'RU -> PL',
    level: 'A1/A2',
    primaryRoute: '/themes',
    modes: ['themes', 'training', 'cards'],
    accentClass: 'from-emerald-500 to-cyan-500',
    includesTheme: (theme) => PL_A1_A2_THEME_IDS.has(theme.id),
  },
  {
    id: PACK_IDS.PL_TELC,
    targetLang: 'pl',
    title: 'Польский TELC',
    shortTitle: 'TELC B1/B2',
    subtitle: 'B1/B2 словарь, грамматика и письма',
    badge: 'RU -> PL',
    level: 'B1/B2',
    primaryRoute: '/email',
    modes: ['themes', 'training', 'email', 'cards'],
    accentClass: 'from-violet-500 to-fuchsia-500',
    includesTheme: (theme) => PL_TELC_THEME_IDS.has(theme.id),
  },
]

export function getDefaultPackId(targetLang = 'fr') {
  return targetLang === 'pl' ? PACK_IDS.PL_A1_A2 : PACK_IDS.FR_FOUNDATIONS
}

export function getLessonPack(packId, targetLang) {
  return LESSON_PACKS.find((pack) => pack.id === packId) || LESSON_PACKS.find((pack) => pack.id === getDefaultPackId(targetLang))
}

export function getPackForThemeId(themeId) {
  return LESSON_PACKS.find((pack) => pack.includesTheme({ id: themeId }))
}

export function filterThemesByPack(themes, packId, targetLang) {
  const pack = getLessonPack(packId, targetLang)
  if (!pack) return themes
  return themes.filter((theme) => pack.includesTheme(theme))
}

export function getPackRoute(pack) {
  return pack?.primaryRoute || '/themes'
}
