// Deterministic error discovery for the email evaluator.
//
// The Hungarian-style spell checker (Hunspell via `nspell` + `dictionary-pl`)
// plus the hand-curated Polish punctuation and grammar rules in `polishNlp.js`
// give us byte-precise character offsets for spelling, punctuation, and the
// most common grammar mistakes a B1/B2 learner makes. Re-asking the LLM to
// rediscover these is both slower and less accurate — its offsets are
// notoriously fuzzy, and a fragment-only prompt hides the context it would
// need to decide what's wrong.
//
// This module is a thin, pure wrapper that flattens the per-category results
// of `findAllErrors` into a single sorted array matching the shape the
// frontend annotation resolver and the enrichment LLM both consume.
//
// IMPORTANT: this layer does NOT do style or vocabulary discovery. Those
// categories require context (register fit, lexical choice) that no regex can
// see, so they stay with the LLM — but the LLM now sees the whole email and
// the full list of pre-detected spans in one call, instead of one fragment at
// a time.

import { findAllErrors } from './polishNlp.js';

/**
 * @typedef {Object} DiscoveredError
 * @property {string} id          Stable id ("err_0", "err_1", …) used by the
 *                                enrichment step to match LLM annotations
 *                                back to the deterministic span.
 * @property {string} source      Always "deterministic" for records produced
 *                                here. The enrichment step appends LLM
 *                                records with source "llm-style" / "llm-vocab".
 * @property {"spelling"|"punctuation"|"grammar"} category
 * @property {number} startOffset Inclusive character index in `userText`.
 * @property {number} endOffset   Exclusive character index in `userText`.
 * @property {string} originalText The exact slice `userText.slice(startOffset, endOffset)`.
 * @property {number} severity    0 = informational (missing-end-punct),
 *                                1 = minor, 2 = moderate, 3+ = critical.
 * @property {string|null} ruleId  Grammar rule id when category === "grammar".
 * @property {string|null} message Grammar rule message or punctuation rule message.
 * @property {string[]} suggestions Hunspell suggestions when category === "spelling".
 */

/**
 * Discover spelling, punctuation, and grammar errors deterministically.
 *
 * @param {string} userText The full learner email text.
 * @returns {DiscoveredError[]} Errors sorted by startOffset, each with stable
 *                              sequential ids ("err_0", "err_1", …).
 */
export function discoverErrors(userText) {
  if (!userText || typeof userText !== 'string') return [];

  const { spelling, punctuation, grammar } = findAllErrors(userText);
  const merged = [
    ...spelling.map(e => normalizeSpelling(e, userText)),
    ...punctuation.map(e => normalizePunctuation(e, userText)),
    ...grammar.map(e => normalizeGrammar(e, userText)),
  ];

  // Stable sort by startOffset, then by endOffset (longer span wins on tie —
  // a 5-char spelling span beats the 1-char missing-end-punct that overlaps
  // the last char). The frontend resolver further dedups by overlap, so this
  // sort is purely for deterministic IDs.
  merged.sort((a, b) => {
    if (a.startOffset !== b.startOffset) return a.startOffset - b.startOffset;
    if (a.endOffset !== b.endOffset) return b.endOffset - a.endOffset;
    return a.category.localeCompare(b.category);
  });

  return merged.map((err, idx) => ({ ...err, id: `err_${idx}` }));
}

function normalizeSpelling(raw, userText) {
  return {
    source: 'deterministic',
    category: 'spelling',
    startOffset: raw.offset,
    endOffset: raw.endOffset,
    originalText: userText.slice(raw.offset, raw.endOffset),
    severity: raw.severity ?? 1,
    ruleId: null,
    message: raw.message || 'spelling',
    suggestions: Array.isArray(raw.suggestions) ? raw.suggestions.slice(0, 5) : [],
  };
}

function normalizePunctuation(raw, userText) {
  return {
    source: 'deterministic',
    category: 'punctuation',
    startOffset: raw.offset,
    endOffset: raw.endOffset,
    originalText: userText.slice(raw.offset, raw.endOffset),
    severity: raw.severity ?? 1,
    ruleId: raw.ruleId || raw.id || null,
    message: raw.message || 'punctuation',
    suggestions: [],
  };
}

function normalizeGrammar(raw, userText) {
  return {
    source: 'deterministic',
    category: 'grammar',
    startOffset: raw.offset,
    endOffset: raw.endOffset,
    originalText: userText.slice(raw.offset, raw.endOffset),
    severity: raw.severity ?? 1,
    ruleId: raw.ruleId || null,
    message: raw.message || 'grammar',
    suggestions: [],
  };
}

/**
 * Filter discovery results down to errors whose spans lie entirely within
 * `userText`. Used by tests as a safety check; the production path never has
 * out-of-range offsets (they come from the regex engines directly), but the
 * check is cheap and worth having.
 */
export function validateOffsets(errors, userText) {
  const len = userText.length;
  return errors.every(
    e => Number.isInteger(e.startOffset)
      && Number.isInteger(e.endOffset)
      && e.startOffset >= 0
      && e.endOffset > e.startOffset
      && e.endOffset <= len
      && userText.slice(e.startOffset, e.endOffset) === e.originalText,
  );
}
