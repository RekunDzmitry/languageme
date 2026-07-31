// Quick smoke test for lessonPacks data-driven logic
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
  const frPack = LESSON_PACKS.find(p => p.id === PACK_IDS.FR_FOUNDATIONS)
  const plA1 = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_A1_A2)
  const plTelc = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_TELC)
  if (!isThemeInPack('fr_theme05', frPack)) throw new Error('fr_theme05 in fr')
  if (isThemeInPack('fr_theme05', plA1)) throw new Error('fr_theme05 not in pl-a1')
  if (isThemeInPack('pl_theme05', frPack)) throw new Error('pl_theme05 not in fr')
  if (!isThemeInPack('pl_theme05', plTelc)) throw new Error('pl_theme05 in pl-telc (orthography)')
  if (!isThemeInPack('pl_theme15', plTelc)) throw new Error('pl_theme15 in pl-telc (vocab/grammar)')
  if (!isThemeInPack('pl_theme22', plTelc)) throw new Error('pl_theme22 in pl-telc (email phrases)')
  if (!isThemeInPack('pl_theme20', plA1)) throw new Error('pl_theme20 in pl-a1')
  if (!isThemeInPack('pl_theme21', plA1)) throw new Error('pl_theme21 in pl-a1')
  if (isThemeInPack('pl_theme20', plTelc)) throw new Error('pl_theme20 not in pl-telc')
  if (isThemeInPack('pl_theme21', plTelc)) throw new Error('pl_theme21 not in pl-telc')
  if (isThemeInPack('pl_theme05', plA1)) throw new Error('pl_theme05 not in pl-a1 (orthography is in pl-telc)')
})

t('isThemeInPack accepts the pack-scoped catch-all', () => {
  const plA1 = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_A1_A2)
  const plTelc = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_TELC)
  if (!isThemeInPack('pl-a1-a2_other', plA1)) throw new Error('pl-a1-a2_other in pl-a1')
  if (!isThemeInPack('pl-telc_other', plTelc)) throw new Error('pl-telc_other in pl-telc')
  if (isThemeInPack('pl-telc_other', plA1)) throw new Error('pl-telc_other not in pl-a1')
  if (isThemeInPack('pl-a1-a2_other', plTelc)) throw new Error('pl-a1-a2_other not in pl-telc')
})

t('isThemeInPack uses the explicit list (no range inference)', () => {
  const plA1 = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_A1_A2)
  if (isThemeInPack('pl_theme01', plA1)) throw new Error('pl_theme01 not in pl-a1 (only 20, 21 are A1/A2)')
  if (isThemeInPack('pl_theme09', plA1)) throw new Error('pl_theme09 not in pl-a1')
})

t('getPackForThemeId finds the correct pack', () => {
  if (getPackForThemeId('fr_theme05')?.id !== PACK_IDS.FR_FOUNDATIONS) throw new Error('fr_theme05 -> fr')
  if (getPackForThemeId('pl_theme01')?.id !== PACK_IDS.PL_TELC) throw new Error('pl_theme01 -> pl-telc (orthography)')
  if (getPackForThemeId('pl_theme19')?.id !== PACK_IDS.PL_TELC) throw new Error('pl_theme19 -> pl-telc (email)')
  if (getPackForThemeId('pl_theme20')?.id !== PACK_IDS.PL_A1_A2) throw new Error('pl_theme20 -> pl-a1 (intro grammar)')
  if (getPackForThemeId('pl_theme21')?.id !== PACK_IDS.PL_A1_A2) throw new Error('pl_theme21 -> pl-a1 (intro grammar)')
  if (getPackForThemeId('pl_theme22')?.id !== PACK_IDS.PL_TELC) throw new Error('pl_theme22 -> pl-telc (email phrases)')
  if (getPackForThemeId('pl-a1-a2_other')?.id !== PACK_IDS.PL_A1_A2) throw new Error('catch-all -> pl-a1')
  if (getPackForThemeId('theme01') !== null) throw new Error('bare -> null')
  if (getPackForThemeId(null) !== null) throw new Error('null -> null')
})

t('getDefaultPackId returns the first pack for the lang', () => {
  if (getDefaultPackId('fr') !== PACK_IDS.FR_FOUNDATIONS) throw new Error('fr default')
  if (getDefaultPackId('pl') !== PACK_IDS.PL_TELC) throw new Error('pl default (TELC is first in LESSON_PACKS)')
  if (getDefaultPackId('xx') !== LESSON_PACKS[0].id) throw new Error('unknown lang -> first pack')
})

t('filterThemesByPack returns only matching themes', () => {
  const themes = [
    { id: 'pl_theme01' }, { id: 'pl_theme05' },
    { id: 'pl_theme10' }, { id: 'pl_theme19' },
    { id: 'pl_theme20' }, { id: 'pl_theme21' },
    { id: 'pl_theme22' },
    { id: 'fr_theme01' },
  ]
  const telc = filterThemesByPack(themes, PACK_IDS.PL_TELC, 'pl')
  if (telc.length !== 5) throw new Error(`pl-telc expected 5 (01, 05, 10, 19, 22), got ${telc.length}`)
  const telcIds = telc.map(t => t.id).sort()
  if (JSON.stringify(telcIds) !== JSON.stringify(['pl_theme01', 'pl_theme05', 'pl_theme10', 'pl_theme19', 'pl_theme22'])) {
    throw new Error(`pl-telc ids mismatch: ${telcIds.join(', ')}`)
  }
  const a1 = filterThemesByPack(themes, PACK_IDS.PL_A1_A2, 'pl')
  if (a1.length !== 2) throw new Error(`pl-a1 expected 2 (20, 21), got ${a1.length}`)
  const a1Ids = a1.map(t => t.id).sort()
  if (JSON.stringify(a1Ids) !== JSON.stringify(['pl_theme20', 'pl_theme21'])) {
    throw new Error(`pl-a1 ids mismatch: ${a1Ids.join(', ')}`)
  }
})

t('pack membership matches the explicit TELC_THEME_IDS / A1A2_THEME_IDS arrays', () => {
  const plTelc = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_TELC)
  const plA1 = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_A1_A2)
  for (const id of TELC_THEME_IDS) {
    if (!isThemeInPack(id, plTelc)) throw new Error(`TELC_THEME_IDS says ${id} is in pl-telc but isThemeInPack disagrees`)
  }
  for (const id of A1A2_THEME_IDS) {
    if (!isThemeInPack(id, plA1)) throw new Error(`A1A2_THEME_IDS says ${id} is in pl-a1 but isThemeInPack disagrees`)
  }
  for (const id of TELC_THEME_IDS) {
    if (isThemeInPack(id, plA1)) throw new Error(`${id} is in both TELC_THEME_IDS and A1A2_THEME_IDS (should be disjoint)`)
  }
  for (const id of A1A2_THEME_IDS) {
    if (isThemeInPack(id, plTelc)) throw new Error(`${id} is in both A1A2_THEME_IDS and TELC_THEME_IDS (should be disjoint)`)
  }
})

t('packs expose langPrefix, not targetLang', () => {
  for (const pack of LESSON_PACKS) {
    if (!pack.langPrefix) throw new Error(`${pack.id} missing langPrefix`)
    if (pack.targetLang) throw new Error(`${pack.id} still has targetLang (should be removed)`)
    if (!Array.isArray(pack.themeIds) || pack.themeIds.length === 0) {
      throw new Error(`${pack.id} missing or empty themeIds`)
    }
  }
})

t('assertPackInvariants: warns on bare theme ids', () => {
  const original = console.warn
  let captured = []
  console.warn = (msg) => captured.push(msg)
  try {
    _resetInvariantWarnedForTests()
    assertPackInvariants({ fr: [{ id: 'theme01' }] })
    if (captured.length === 0) throw new Error('expected warning for bare theme id')
    if (!captured[0].includes('theme id "theme01" has no lang prefix')) {
      throw new Error(`unexpected warning: ${captured[0]}`)
    }
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
    assertPackInvariants({ ge: [{ id: 'ge_theme01' }] })
    if (captured.length === 0) throw new Error('expected warning for orphan lang')
    if (!captured[0].includes('matches no pack')) {
      throw new Error(`unexpected warning: ${captured[0]}`)
    }
  } finally {
    console.warn = original
  }
})

t('assertPackInvariants: silent on healthy config', () => {
  const original = console.warn
  let captured = []
  console.warn = (msg) => captured.push(msg)
  try {
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
  const original = console.warn
  let captured = []
  console.warn = (msg) => captured.push(msg)
  try {
    _resetInvariantWarnedForTests()
    assertPackInvariants({ pl })
    if (captured.length > 0) {
      throw new Error(`invariant violations in real data:\n${captured.join('\n')}`)
    }
    const plInPacks = pl.filter(t => getPackForThemeId(t.id) != null).length
    if (plInPacks !== pl.length) {
      throw new Error(`${pl.length - plInPacks} PL themes not in any pack`)
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
console.log(`\n${tests.length - failed}/${tests.length} passed`)
process.exit(failed > 0 ? 1 : 0)
