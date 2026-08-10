// src/lib/displayHint.js
//
// Centralised hint + translation resolvers. Used by every component
// that renders a vocab word. The fallback chain (matching the plan) is:
//
//   translation: user_translation_override -> vocab.translations[nativeLang]
//                -> vocab.translations.ru -> vocab.translations.en -> ''
//   hint:        user_mnemonic             -> vocab.hint or course.hintsByVocab[id]
//                -> ''
//
// Keeping the policy in one place means a future change (e.g. add a
// shared mnemonics pool) only touches this function.

export function resolveHint({ userMnemonic, builtinHint }) {
  return userMnemonic || builtinHint || ''
}

/**
 * Resolve the displayed translation for a vocab word.
 *
 * @param {object} args
 * @param {Array<{lang: string, text: string}>} args.translations
 *   The vocab.translations array shape returned by the API:
 *   `[{ lang: 'ru', text: '...' }, ...]`.
 * @param {string} args.nativeLang  The user's native language code.
 * @param {string} [args.fallback]  An optional override text that
 *   takes precedence over the seed translations. Used to surface a
 *   user_translation_override that was already injected into the
 *   bundle by the API (i.e. round-trips through /api/courses/all).
 *   Components that need the override *before* it round-trips can
 *   also pass it here directly.
 */
export function resolveTranslation({ translations, nativeLang, fallback }) {
  if (fallback) return fallback
  const arr = Array.isArray(translations) ? translations : []
  const byLang = new Map(arr.map(t => [t.lang, t.text]))
  return (
    byLang.get(nativeLang) ||
    byLang.get('ru') ||
    byLang.get('en') ||
    ''
  )
}

/**
 * Invalidate the course bundle cache so the next loadAllBundles
 * fetches the freshest data from the server. Called after a user
 * writes a translation / answer override so the rest of the UI
 * picks it up without a hard reload.
 */
export function invalidateCourseBundleCache() {
  // The cache lives in courseData.jsx — reach for it via a window-
  // level hook so this helper stays importable from anywhere without
  // a circular dep.
  if (typeof window !== 'undefined' && window.__lmInvalidateCourseBundleCache) {
    window.__lmInvalidateCourseBundleCache()
  }
}
