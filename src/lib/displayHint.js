// src/lib/displayHint.js
//
// Centralised hint resolver. Used by every component that renders a
// mnemonic/hint for a vocab word. The fallback chain (matching the
// plan) is:
//
//   1. user override (user_mnemonic) — caller passes this in
//   2. built-in hint for the user's native_lang — caller passes this in
//   3. empty string
//
// Keeping the policy in one place means a future change (e.g. add a
// shared mnemonics pool) only touches this function.
export function resolveHint({ userMnemonic, builtinHint }) {
  return userMnemonic || builtinHint || ''
}
