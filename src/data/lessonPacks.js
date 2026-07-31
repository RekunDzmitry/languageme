// Learning packs — coarse-grained groupings of themes inside one target language.
//
// Each pack declares its contents as an explicit `themeIds` list. We do NOT
// derive membership from a theme-id order range: the polish-themes reorg put
// non-contiguous themes into the PL_TELC pack (orthography 01-09, then
// vocab/grammar 10-18, then email 19 and 22), so a contiguous range filter
// would be wrong. Explicit lists make the pack contents self-documenting and
// keep membership stable as new themes are added in the future.
//
// Conventions:
//   - Every theme id must carry a language prefix (fr_themeNN, pl_themeNN, …).
//     This is enforced by the invariant check at the bottom of this file.
//   - The "target language" of a pack is the langPrefix. We do not maintain a
//     separate `targetLang` field; the prefix is the source of truth.
//   - A pack's `id` is stable across renames of UI labels — never use it as a
//     user-facing string. The UI pulls title/shortTitle/subtitle/badge/level
//     through i18n with pack_<id>_title, pack_<id>_short, etc.
//   - A pack-scoped catch-all theme ("<pack.id>_other") is treated as
//     belonging to the pack automatically — no need to list it in themeIds.

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
    themeIds: [
      'fr_theme01', 'fr_theme02', 'fr_theme03', 'fr_theme04', 'fr_theme05',
      'fr_theme06', 'fr_theme07', 'fr_theme08',
    ],
    primaryRoute: '/themes',
    modes: ['themes', 'training', 'cards'],
    accentClass: 'from-sky-500 to-indigo-500',
  },
  {
    // Polish B1/B2 (the TELC exam level). Holds all polish content
    // that targets B1/B2: orthography drills (themes 01-09), vocab
    // and grammar (themes 10-18), and the email writing drills
    // (themes 19 and 22). Themes 20 and 21 ("Глаголы на -m и
    // вежливое обращение", "Глаголы 2-го спряжения и существительные
    // мужского рода") live in the A1/A2 pack because their content
    // is A1/A2 intro material.
    id: PACK_IDS.PL_TELC,
    langPrefix: 'pl',
    themeIds: [
      'pl_theme01', 'pl_theme02', 'pl_theme03', 'pl_theme04', 'pl_theme05',
      'pl_theme06', 'pl_theme07', 'pl_theme08', 'pl_theme09',
      'pl_theme10', 'pl_theme11', 'pl_theme12', 'pl_theme13', 'pl_theme14',
      'pl_theme15', 'pl_theme16', 'pl_theme17', 'pl_theme18',
      'pl_theme19', 'pl_theme22',
    ],
    primaryRoute: '/themes',
    modes: ['themes', 'training', 'cards'],
    accentClass: 'from-violet-500 to-fuchsia-500',
  },
  {
    // Polish A1/A2. Holds the two themes whose content is genuinely
    // beginner material: theme 20 ("Глаголы на -m и вежливое
    // обращение") and theme 21 ("Глаголы 2-го спряжения и
    // существительные мужского рода"). Both are demoted to
    // vocab-only — no write_answer exercises and no email drills.
    id: PACK_IDS.PL_A1_A2,
    langPrefix: 'pl',
    themeIds: ['pl_theme20', 'pl_theme21'],
    primaryRoute: '/themes',
    modes: ['themes', 'training', 'cards'],
    accentClass: 'from-emerald-500 to-cyan-500',
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
 *
 * Membership rule:
 *   1. Pack-scoped catch-all ("<pack.id>_other") belongs to the pack
 *      automatically — no need to list it in themeIds.
 *   2. Otherwise the theme id must be in the pack's `themeIds` list.
 *
 * The list is the source of truth: we don't infer membership from the
 * theme id's order number, so non-contiguous packs (like PL_TELC,
 * which contains 01-09, 10-18, 19 and 22 — but not 20, 21) work
 * without a regex/range.
 */
export function isThemeInPack(themeId, pack) {
  if (!pack || !themeId) return false
  if (themeId === `${pack.id}_other`) return true
  return Array.isArray(pack.themeIds) && pack.themeIds.includes(themeId)
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
          `[lessonPacks] theme id "${theme.id}" matches no pack (lang="${themeLang}" order=${getOrderFromThemeId(theme.id)}). Add it to a pack's themeIds list.`
        )
      } else if (matching.length > 1) {
        const ids = matching.map((p) => p.id).join(', ')
        messages.push(
          `[lessonPacks] theme id "${theme.id}" is in multiple packs: ${ids}. Pack themeIds lists must be disjoint.`
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
