// Quick smoke test for lessonPacks data-driven logic
import {
  PACK_IDS, LESSON_PACKS,
  getLangFromThemeId, getOrderFromThemeId,
  isThemeInPack, getPackForThemeId,
  getDefaultPackId, getLessonPack, filterThemesByPack,
  assertPackInvariants, _resetInvariantWarnedForTests,
} from '../src/data/lessonPacks.js'

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

t('isThemeInPack respects langPrefix', () => {
  const frPack = LESSON_PACKS.find(p => p.id === PACK_IDS.FR_FOUNDATIONS)
  const plA1 = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_A1_A2)
  const plTelc = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_TELC)
  if (!isThemeInPack('fr_theme05', frPack)) throw new Error('fr_theme05 in fr')
  if (isThemeInPack('fr_theme05', plA1)) throw new Error('fr_theme05 not in pl-a1')
  if (isThemeInPack('pl_theme05', frPack)) throw new Error('pl_theme05 not in fr')
  if (!isThemeInPack('pl_theme05', plA1)) throw new Error('pl_theme05 in pl-a1')
  if (!isThemeInPack('pl_theme15', plTelc)) throw new Error('pl_theme15 in pl-telc')
  if (isThemeInPack('pl_theme05', plTelc)) throw new Error('pl_theme05 not in pl-telc')
})

t('isThemeInPack respects range', () => {
  const plA1 = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_A1_A2)
  const plTelc = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_TELC)
  if (isThemeInPack('pl_theme09', plTelc)) throw new Error('pl_theme09 not in pl-telc (range starts at 10)')
  if (isThemeInPack('pl_theme10', plA1)) throw new Error('pl_theme10 not in pl-a1 (range ends at 9)')
  if (!isThemeInPack('pl_theme09', plA1)) throw new Error('pl_theme09 in pl-a1 (boundary)')
  if (!isThemeInPack('pl_theme10', plTelc)) throw new Error('pl_theme10 in pl-telc (boundary)')
})

t('getPackForThemeId finds correct pack', () => {
  if (getPackForThemeId('fr_theme15')?.id !== PACK_IDS.FR_FOUNDATIONS) throw new Error('fr_theme15 -> fr')
  if (getPackForThemeId('pl_theme03')?.id !== PACK_IDS.PL_A1_A2) throw new Error('pl_theme03 -> pl-a1')
  if (getPackForThemeId('pl_theme15')?.id !== PACK_IDS.PL_TELC) throw new Error('pl_theme15 -> pl-telc')
  if (getPackForThemeId('theme01') !== null) throw new Error('bare -> null')
  if (getPackForThemeId(null) !== null) throw new Error('null -> null')
})

t('getDefaultPackId returns first pack for lang', () => {
  if (getDefaultPackId('fr') !== PACK_IDS.FR_FOUNDATIONS) throw new Error('fr default')
  if (getDefaultPackId('pl') !== PACK_IDS.PL_A1_A2) throw new Error('pl default (first match)')
  if (getDefaultPackId('xx') !== LESSON_PACKS[0].id) throw new Error('unknown lang -> first pack')
})

t('filterThemesByPack returns only matching themes', () => {
  const themes = [
    { id: 'pl_theme01' }, { id: 'pl_theme05' },
    { id: 'pl_theme10' }, { id: 'pl_theme15' },
    { id: 'fr_theme01' },
  ]
  const result = filterThemesByPack(themes, PACK_IDS.PL_A1_A2, 'pl')
  if (result.length !== 2) throw new Error(`pl-a1 expected 2, got ${result.length}`)
  if (result[0].id !== 'pl_theme01') throw new Error('first should be pl_theme01')
  if (result[1].id !== 'pl_theme05') throw new Error('second should be pl_theme05')
})

t('invariant: PL_A1_A2 ranges are 1-9, PL_TELC 10-22', () => {
  const plA1 = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_A1_A2)
  const plTelc = LESSON_PACKS.find(p => p.id === PACK_IDS.PL_TELC)
  if (plA1.themeRange.from !== 1 || plA1.themeRange.to !== 9) throw new Error('pl-a1 range')
  if (plTelc.themeRange.from !== 10 || plTelc.themeRange.to !== 22) throw new Error('pl-telc range')
})

t('packs expose langPrefix, no targetLang', () => {
  for (const pack of LESSON_PACKS) {
    if (!pack.langPrefix) throw new Error(`${pack.id} missing langPrefix`)
    if (pack.targetLang) throw new Error(`${pack.id} still has targetLang (should be removed)`)
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
        { id: 'fr_theme01' }, { id: 'fr_theme05' }, { id: 'fr_theme31' },
      ],
      pl: [
        { id: 'pl_theme01' }, { id: 'pl_theme09' },
        { id: 'pl_theme10' }, { id: 'pl_theme22' },
      ],
    })
    if (captured.length !== 0) throw new Error(`expected no warnings, got: ${captured.join('\n')}`)
  } finally {
    console.warn = original
  }
})

t('integration: every real theme maps to exactly one pack', async () => {
  const fr = (await import('../src/data/courses/fr/index.js')).THEMES
  const pl = (await import('../src/data/courses/pl/index.js')).THEMES
  const original = console.warn
  let captured = []
  console.warn = (msg) => captured.push(msg)
  try {
    _resetInvariantWarnedForTests()
    assertPackInvariants({ fr, pl })
    // Surface any invariant violations loudly so CI fails.
    if (captured.length > 0) {
      throw new Error(`invariant violations in real data:\n${captured.join('\n')}`)
    }
    // Spot-check that all PL themes are accounted for.
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
    fn()
    console.log(`  ✓ ${name}`)
  } catch (e) {
    console.log(`  ✗ ${name}: ${e.message}`)
    failed++
  }
}
console.log(`\n${tests.length - failed}/${tests.length} passed`)
process.exit(failed > 0 ? 1 : 0)
