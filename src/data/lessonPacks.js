// Learning packs — coarse-grained groupings of themes inside one target language.
// A pack is described entirely by its metadata (langPrefix + themeRange); the
// set of "themes in this pack" is derived, not enumerated, so adding a new
// theme to the lang/band automatically includes it in the right pack.
//
// Conventions:
//   - Every theme id must carry a language prefix (fr_themeNN, pl_themeNN, …).
//     This is enforced by the invariant check at the bottom of this file.
//   - The "target language" of a pack is the langPrefix. We do not maintain a
//     separate `targetLang` field; the prefix is the source of truth.
//   - A pack's `id` is stable across renames of UI labels — never use it as a
//     user-facing string. The UI pulls title/shortTitle/subtitle/badge/level
//     through i18n with pack_<id>_title, pack_<id>_short, etc.

export const PACK_IDS = {
  FR_FOUNDATIONS: 'fr-foundations',
  PL_A1_A2: 'pl-a1-a2',
  PL_TELC: 'pl-telc',
}

// Packs are described as data. The order in this array is the order they
// appear in the dashboard and the language switcher dropdown.
export const LESSON_PACKS = [
  {
    id: PACK_IDS.FR_FOUNDATIONS,
    langPrefix: 'fr',
    // French has 31 themes (theme01..theme31). Range is inclusive.
    themeRange: { from: 1, to: 31 },
    primaryRoute: '/themes',
    modes: ['themes', 'training', 'cards'],
    accentClass: 'from-sky-500 to-indigo-500',
  },
  {
    id: PACK_IDS.PL_A1_A2,
    langPrefix: 'pl',
    // Polish A1/A2: orthography (pl_theme01..09).
    themeRange: { from: 1, to: 9 },
    primaryRoute: '/themes',
    modes: ['themes', 'training', 'cards'],
    accentClass: 'from-emerald-500 to-cyan-500',
  },
  {
    id: PACK_IDS.PL_TELC,
    langPrefix: 'pl',
    // Polish B1/B2: vocabulary, grammar and email drills (pl_theme10..22).
    themeRange: { from: 10, to: 22 },
    primaryRoute: '/email',
    modes: ['themes', 'training', 'email', 'cards'],
    accentClass: 'from-violet-500 to-fuchsia-500',
  },
]

// ────────────────────────────────────────────────────────────────────────────
// Derivation helpers — these are the only way the rest of the app should
// resolve pack membership. Don't add new callers that bypass them; if a
// caller needs information that's not exposed here, extend the helpers first.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Pull the language prefix out of a theme id, e.g. "pl_theme01" -> "pl".
 * Returns null if the id doesn't follow the `<lang>_theme\d+` convention.
 *
 * The convention is that the underscore separates lang and the literal
 * "theme" keyword. This intentionally rejects bare "theme01" ids so that a
 * mis-prefixed or legacy theme id surfaces loudly in callers that need a
 * real language.
 */
export function getLangFromThemeId(themeId) {
  if (typeof themeId !== 'string') return null
  const m = themeId.match(/^([a-z]+)_theme\d+$/i)
  return m ? m[1].toLowerCase() : null
}

/**
 * Pull the order number out of a theme id, e.g. "pl_theme07" -> 7.
 * Returns null if the id doesn't follow the convention.
 */
export function getOrderFromThemeId(themeId) {
  if (typeof themeId !== 'string') return null
  const m = themeId.match(/^[a-z]+_theme(\d+)$/i)
  return m ? parseInt(m[1], 10) : null
}

/**
 * Does this theme belong to this pack? Pure data, no Set allocation.
 */
export function isThemeInPack(themeId, pack) {
  if (!pack || !themeId) return false
  // Pack-scoped catch-all: "<pack.id>_other" (e.g. "pl-a1-a2_other"
  // belongs to the pl-a1-a2 pack). Checked before the regular theme
  // pattern because these ids don't match `^<lang>_theme\d+$`.
  if (themeId === `${pack.id}_other`) return true
  const lang = getLangFromThemeId(themeId)
  if (lang !== pack.langPrefix) return false
  const order = getOrderFromThemeId(themeId)
  if (order == null) return false
  return order >= pack.themeRange.from && order <= pack.themeRange.to
}

/**
 * Resolve the pack that owns a given theme id. Returns null when the theme
 * is unknown or the lang has no packs (which the invariant check will catch
 * in dev — in prod it just means the theme is orphaned).
 */
export function getPackForThemeId(themeId) {
  if (!themeId) return null
  return LESSON_PACKS.find((pack) => isThemeInPack(themeId, pack)) || null
}

/**
 * Default pack for a target language: the first pack that matches the prefix.
 */
export function getDefaultPackId(targetLang) {
  const match = LESSON_PACKS.find((pack) => pack.langPrefix === targetLang)
  return match?.id || LESSON_PACKS[0].id
}

/**
 * Resolve a pack by id, falling back to the language default.
 */
export function getLessonPack(packId, targetLang) {
  return (
    LESSON_PACKS.find((pack) => pack.id === packId)
    || LESSON_PACKS.find((pack) => pack.id === getDefaultPackId(targetLang))
  )
}

/**
 * Filter a theme list to only themes in the given pack.
 */
export function filterThemesByPack(themes, packId, targetLang) {
  const pack = getLessonPack(packId, targetLang)
  if (!pack) return themes
  return themes.filter((theme) => isThemeInPack(theme.id, pack))
}

/**
 * The canonical route for a pack.
 */
export function getPackRoute(pack) {
  return pack?.primaryRoute || '/themes'
}

// ────────────────────────────────────────────────────────────────────────────
// Shared "open a pack" helper — used by DashboardPage and the
// LanguageSwitcher. Centralised so a future UI change (e.g. prefetch,
// analytics, confirm dialog) only has to be made in one place.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Set the active pack, switch the target language, and navigate to the
 * pack's primary route. Caller passes the navigate function and
 * updateSettings (so this stays a plain function rather than a hook).
 */
export function openPack(pack, { navigate, updateSettings }) {
  if (!pack) return
  updateSettings({ activePackId: pack.id, targetLang: pack.langPrefix })
  navigate(getPackRoute(pack))
}

// ────────────────────────────────────────────────────────────────────────────
// Invariant check — runs in dev (and silently in prod builds via the same
// call) to catch mis-prefixed or orphaned theme ids. A misconfigured theme
// would otherwise disappear from every pack-scoped view with no error, which
// is exactly the failure mode that motivated this refactor.
// ────────────────────────────────────────────────────────────────────────────

let _invariantWarned = false

// Reset the "already warned this session" flag. Exposed for tests; not used
// in app code (the flag's job is to dedupe warnings in dev, not to be a
// correctness gate).
export function _resetInvariantWarnedForTests() {
  _invariantWarned = false
}

/**
 * Walk every pack and assert that all themes for the pack's lang prefix
 * belong to exactly one pack. Logs a warning for any theme that is:
 *   - un-prefixed (legacy bare "themeNN" — should not exist anymore)
 *   - prefixed but in zero packs (orphaned, e.g. ge_theme01 before a
 *     German pack is added)
 *   - prefixed but in two packs (overlapping ranges, a config bug)
 *
 * Call this from app boot. Re-runs cheaply because it's a single pass per
 * language over the theme list.
 */
export function assertPackInvariants(themesByLang) {
  if (themesByLang == null || typeof themesByLang !== 'object') return

  const messages = []
  for (const [lang, themes] of Object.entries(themesByLang)) {
    if (!Array.isArray(themes)) continue
    for (const theme of themes) {
      if (!theme || typeof theme.id !== 'string') continue
      const themeLang = getLangFromThemeId(theme.id)
      if (themeLang == null) {
        messages.push(
          `[lessonPacks] theme id "${theme.id}" has no lang prefix; expected "<lang>_themeNN".`
        )
        continue
      }
      if (themeLang !== lang) {
        messages.push(
          `[lessonPacks] theme id "${theme.id}" is registered under lang="${lang}" but its id declares lang="${themeLang}".`
        )
        continue
      }
      const matching = LESSON_PACKS.filter((pack) =>
        isThemeInPack(theme.id, pack)
      )
      if (matching.length === 0) {
        messages.push(
          `[lessonPacks] theme id "${theme.id}" matches no pack (lang="${themeLang}" order=${getOrderFromThemeId(theme.id)}). Add a pack for this lang/band.`
        )
      } else if (matching.length > 1) {
        const ids = matching.map((p) => p.id).join(', ')
        messages.push(
          `[lessonPacks] theme id "${theme.id}" is in multiple packs: ${ids}. Pack themeRanges must be disjoint.`
        )
      }
    }
  }

  if (messages.length > 0 && !_invariantWarned) {
    _invariantWarned = true
    console.warn(
      `Pack invariant violations (${messages.length}):\n` + messages.join('\n')
    )
  }
}
