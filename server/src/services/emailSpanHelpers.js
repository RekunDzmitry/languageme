// Shared text-offset helpers used by the deterministic discovery layer, the
// LLM enrichment layer, and the route layer. Kept in its own module so the
// import graph stays acyclic (enrichment doesn't import from routes).

/**
 * Find every occurrence of `needle` in `text`. Returns a sorted array of
 * non-overlapping {startOffset, endOffset} pairs.
 *
 * @param {string} text
 * @param {string} needle
 * @returns {Array<{startOffset: number, endOffset: number}>}
 */
export function findTextOccurrences(text, needle) {
  if (!text || !needle) return [];
  const occurrences = [];
  let fromIndex = 0;
  while (fromIndex <= text.length) {
    const index = text.indexOf(needle, fromIndex);
    if (index === -1) break;
    occurrences.push({ startOffset: index, endOffset: index + needle.length });
    fromIndex = index + Math.max(needle.length, 1);
  }
  return occurrences;
}

/**
 * @param {{startOffset: number, endOffset: number}} a
 * @param {{startOffset: number, endOffset: number}} b
 * @returns {boolean}
 */
export function rangesOverlap(a, b) {
  return a.startOffset < b.endOffset && b.startOffset < a.endOffset;
}

/**
 * Resolve `originalText` to the first occurrence in `userText` that does NOT
 * overlap any of the `accepted` ranges. Used by the enrichment parser when
 * the LLM emits offsets that drift: fall back to fuzzy indexOf, then give up.
 *
 * @param {string} userText
 * @param {string} originalText
 * @param {Array<{startOffset: number, endOffset: number}>} [accepted]
 * @returns {{startOffset: number, endOffset: number, originalText: string, resolved: boolean}}
 */
export function resolveErrorSpan(userText, originalText, accepted = []) {
  const candidates = [originalText, String(originalText || '').trim()]
    .filter((item, idx, arr) => item && arr.indexOf(item) === idx);
  for (const candidate of candidates) {
    for (const occurrence of findTextOccurrences(userText, candidate)) {
      if (accepted.some(existing => rangesOverlap(existing, occurrence))) continue;
      return {
        ...occurrence,
        originalText: userText.slice(occurrence.startOffset, occurrence.endOffset),
        resolved: true,
      };
    }
  }
  return {
    startOffset: -1,
    endOffset: -1,
    originalText: String(originalText || '').trim(),
    resolved: false,
  };
}
