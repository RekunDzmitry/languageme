// Quick smoke test for lessonPacks data-driven logic.
import {
  PACK_IDS, LESSON_PACKS,
  getLangFromThemeId, getOrderFromThemeId,
  isThemeInPack, getPackForThemeId,
  getDefaultPackId, filterThemesByPack,
  assertPackInvariants, _resetInvariantWarnedForTests,
} from '../src/data/lessonPacks.js'

// Explicit lists — no regex. We add new themes to these arrays by hand
// when new content lands so the data model doesn't have to learn a
// new pattern each time.
const TELC_THEME_IDS = [
  'pl_theme01', 'pl_theme02', 'pl_theme03', 'pl_theme04', 'pl_theme05',
  'pl_theme06', 'pl_theme07', 'pl_theme08', 'pl_theme09',
  'pl_theme10', 'pl_theme11', 'pl_theme12', 'pl_theme13', 'pl_theme14',
  'pl_theme15', 'pl_theme16', 'pl_theme17', 'pl_theme18',
  'pl_theme19', 'pl_theme22',
]
const A1A2_THEME_IDS = ['pl_theme20', 'pl_theme21']

const tests = []
const t = (name, fn) => tests.push({ name, fn })

t('getLangFromThemeId extracts prefix', () => {
  if (getLangFromThemeId('pl_theme01') !== 'pl') throw new Error('pl_theme01 -> pl')
  if (getLangFromThemeId('fr_theme15') !== 'fr') throw new Error('fr_theme15 -> fr')
  if (getLangFromThemeId('theme01') !== null) throw new Error('bare theme01 -> null')
  if (getLangFromThemeId('') !== null) throw new Error('empty -> null')
  if (getLangFromThemeId(null) !== null) throw new Error('null -> null')
})

t('getOrderFromThemeId extracts number', () => {
  if (getOrderFromThemeId('pl_theme01') !== 1) throw new Error('pl_theme01 -> 1')
  if (getOrderFromThemeId('fr_theme22') !== 22) throw new Error('fr_theme22 -> 22')
  if (getOrderFromThemeId('pl_theme') !== null) throw new Error('pl_theme -> null')
})

t('isThemeInPack uses pack.themeIds', () => {
  const pack = LESSON_PACKS.find((p) => p.id === PACK_IDS.PL_TELC)
  if (!isThemeInPack('pl_theme01', pack)) throw new Error('pl_theme01 should be in pl-telc')
  if (isThemeInPack('pl_theme20', pack)) throw new Error('pl_theme20 should NOT be in pl-telc')
})

t('isThemeInPack accepts the pack-scoped catch-all', () => {
  const pack = LESSON_PACKS.find((p) => p.id === PACK_IDS.PL_TELC)
  if (!isThemeInPack('pl-telc_other', pack)) throw new Error('pl-telc_other should belong to pl-telc')
  if (isThemeInPack('pl-a1-a2_other', pack)) throw new Error('pl-a1-a2_other should NOT belong to pl-telc')
})

t('isThemeInPack uses the explicit list (no range inference)', () => {
  // Sanity check: the explicit list is what's used. Add a new theme
  // id that's NOT in the pack and verify it's rejected.
  const pack = LESSON_PACKS.find((p) => p.id === PACK_IDS.PL_TELC)
  if (isThemeInPack('pl_theme99', pack)) throw new Error('pl_theme99 should NOT be in pl-telc')
})

t('getPackForThemeId finds the correct pack', () => {
  if (getPackForThemeId('pl_theme01')?.id !== PACK_IDS.PL_TELC) throw new Error('pl_theme01 -> pl-telc')
  if (getPackForThemeId('pl_theme20')?.id !== PACK_IDS.PL_A1_A2) throw new Error('pl_theme20 -> pl-a1-a2')
  if (getPackForThemeId('fr_theme05')?.id !== PACK_IDS.FR_FOUNDATIONS) throw new Error('fr_theme05 -> fr-foundations')
})

t('getDefaultPackId returns the first pack for the lang', () => {
  if (getDefaultPackId('pl') !== PACK_IDS.PL_TELC) throw new Error('pl -> pl-telc')
  if (getDefaultPackId('fr') !== PACK_IDS.FR_FOUNDATIONS) throw new Error('fr -> fr-foundations')
})

t('filterThemesByPack returns only matching themes', () => {
  const themes = [
    { id: 'pl_theme01' },
    { id: 'pl_theme20' },
    { id: 'fr_theme01' },
  ]
  const telc = filterThemesByPack(themes, PACK_IDS.PL_TELC, 'pl')
  if (telc.length !== 1) throw new Error(`expected 1 theme in pl-telc, got ${telc.length}`)
  if (telc[0].id !== 'pl_theme01') throw new Error('pl_theme01 should be in pl-telc')

  const a1a2 = filterThemesByPack(themes, PACK_IDS.PL_A1_A2, 'pl')
  if (a1a2.length !== 1) throw new Error(`expected 1 theme in pl-a1-a2, got ${a1a2.length}`)
  if (a1a2[0].id !== 'pl_theme20') throw new Error('pl_theme20 should be in pl-a1-a2')
})

t('pack membership matches the explicit TELC_THEME_IDS / A1A2_THEME_IDS arrays', () => {
  const telc = LESSON_PACKS.find((p) => p.id === PACK_IDS.PL_TELC)
  const a1a2 = LESSON_PACKS.find((p) => p.id === PACK_IDS.PL_A1_A2)
  for (const id of TELC_THEME_IDS) {
    if (!isThemeInPack(id, telc)) throw new Error(`${id} should be in pl-telc`)
  }
  for (const id of A1A2_THEME_IDS) {
    if (!isThemeInPack(id, a1a2)) throw new Error(`${id} should be in pl-a1-a2`)
  }
  // The two lists are disjoint (a theme can't be in both packs).
  for (const id of TELC_THEME_IDS) {
    if (isThemeInPack(id, a1a2)) throw new Error(`${id} should NOT be in pl-a1-a2`)
  }
  for (const id of A1A2_THEME_IDS) {
    if (isThemeInPack(id, telc)) throw new Error(`${id} should NOT be in pl-telc`)
  }
})

t('packs expose langPrefix, not targetLang', () => {
  for (const pack of LESSON_PACKS) {
    if (typeof pack.langPrefix !== 'string') throw new Error(`${pack.id} missing langPrefix`)
    if ('targetLang' in pack) throw new Error(`${pack.id} still has targetLang (should be langPrefix only)`)
  }
})

t('assertPackInvariants: warns on bare theme ids', () => {
  const original = console.warn
  let captured = []
  console.warn = (msg) => captured.push(msg)
  try {
    _resetInvariantWarnedForTests()
    assertPackInvariants({ fr: [{ id: 'theme01' }] })
    if (captured.length === 0) throw new Error('expected warning about bare theme id')
  } finally {
    console.warn = original
  }
})

t('assertPackInvariants: warns on orphan lang', () => {
  const original = console.warn
  let captured = []
  console.warn = (msg) => captured.push(msg)
  try {
    _resetInvariantWarnedForTests()
    assertPackInvariants({ es: [{ id: 'es_theme01' }] })
    if (captured.length === 0) throw new Error('expected warning about es having no packs')
  } finally {
    console.warn = original
  }
})

t('assertPackInvariants: silent on healthy config', () => {
  const original = console.warn
  let captured = []
  console.warn = (msg) => captured.push(msg)
  try {
    _resetInvariantWarnedForTests()
    assertPackInvariants({
      fr: [
        { id: 'fr_theme01' }, { id: 'fr_theme05' }, { id: 'fr_theme08' },
      ],
      pl: [
        { id: 'pl_theme01' }, { id: 'pl_theme09' },
        { id: 'pl_theme10' }, { id: 'pl_theme18' },
        { id: 'pl_theme19' }, { id: 'pl_theme20' },
        { id: 'pl_theme21' }, { id: 'pl_theme22' },
      ],
    })
    if (captured.length !== 0) throw new Error(`expected no warnings, got: ${captured.join('\n')}`)
  } finally {
    console.warn = original
  }
})

t('integration: every real theme maps to exactly one pack', async () => {
  const pl = (await import('../src/data/courses/pl/index.js')).THEMES
  const fr = (await import('../src/data/courses/fr/index.js')).THEMES
  const original = console.warn
  let captured = []
  console.warn = (msg) => captured.push(msg)
  try {
    _resetInvariantWarnedForTests()
    assertPackInvariants({ pl, fr })
    if (captured.length > 0) {
      throw new Error(`invariant violations in real data:\n${captured.join('\n')}`)
    }
    const plInPacks = pl.filter(t => getPackForThemeId(t.id) != null).length
    if (plInPacks !== pl.length) {
      throw new Error(`${pl.length - plInPacks} PL themes not in any pack`)
    }
    const frInPacks = fr.filter(t => getPackForThemeId(t.id) != null).length
    if (frInPacks !== fr.length) {
      throw new Error(`${fr.length - frInPacks} FR themes not in any pack (FR_FOUNDATIONS.themeIds must cover every fr_theme id)`)
    }
  } finally {
    console.warn = original
  }
})

let failed = 0
for (const { name, fn } of tests) {
  try {
    await fn()
    console.log(`  ✓ ${name}`)
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message}`)
    failed++
  }
}

console.log(failed === 0 ? `${tests.length}/${tests.length} passed` : `${tests.length - failed}/${tests.length} passed`)
process.exit(failed > 0 ? 1 : 0)
