export function findTextOccurrences(text, needle) {
  if (!text || !needle) return []

  const occurrences = []
  let fromIndex = 0

  while (fromIndex <= text.length) {
    const index = text.indexOf(needle, fromIndex)
    if (index === -1) break

    occurrences.push({
      startOffset: index,
      endOffset: index + needle.length,
    })
    fromIndex = index + Math.max(needle.length, 1)
  }

  return occurrences
}

function toValidOffset(value) {
  return Number.isInteger(value) ? value : null
}

function closestOccurrence(occurrences, preferredStart) {
  return occurrences.reduce((best, occurrence) => {
    if (!best) return occurrence

    const bestDistance = Math.abs(best.startOffset - preferredStart)
    const distance = Math.abs(occurrence.startOffset - preferredStart)
    if (distance !== bestDistance) return distance < bestDistance ? occurrence : best

    return occurrence.startOffset < best.startOffset ? occurrence : best
  }, null)
}

function resolveAnnotationRange(userText, err) {
  const startOffset = toValidOffset(err.startOffset)
  const endOffset = toValidOffset(err.endOffset)
  const hasValidOffsets = startOffset !== null &&
    endOffset !== null &&
    startOffset >= 0 &&
    endOffset > startOffset &&
    startOffset < userText.length

  const originalText = typeof err.originalText === 'string' ? err.originalText : ''

  if (hasValidOffsets) {
    const boundedEnd = Math.min(endOffset, userText.length)
    const highlighted = userText.slice(startOffset, boundedEnd)

    if (!originalText || highlighted === originalText) {
      return {
        startOffset,
        endOffset: boundedEnd,
        originalText: highlighted,
      }
    }
  }

  const searchTexts = [
    originalText,
    originalText.trim(),
  ].filter((text, idx, arr) => text && arr.indexOf(text) === idx)

  for (const searchText of searchTexts) {
    const occurrences = findTextOccurrences(userText, searchText)
    if (occurrences.length === 0) continue

    const preferredStart = startOffset ?? 0
    const range = closestOccurrence(occurrences, preferredStart)
    return {
      ...range,
      originalText: userText.slice(range.startOffset, range.endOffset),
    }
  }

  return null
}

function rangesOverlap(a, b) {
  return a.startOffset < b.endOffset && b.startOffset < a.endOffset
}

function compareCandidates(a, b) {
  const lengthDiff = (a.endOffset - a.startOffset) - (b.endOffset - b.startOffset)
  if (lengthDiff !== 0) return lengthDiff

  if (a.startOffset !== b.startOffset) return a.startOffset - b.startOffset

  return a.originalIndex - b.originalIndex
}

export function resolveEmailAnnotations(userText, errors = []) {
  if (!userText || !Array.isArray(errors)) return []

  const candidates = errors
    .map((err, originalIndex) => {
      const range = resolveAnnotationRange(userText, err || {})
      if (!range) return null

      return {
        ...err,
        ...range,
        annotationId: err?.id ?? originalIndex,
        originalIndex,
      }
    })
    .filter(Boolean)
    .sort(compareCandidates)

  const accepted = []

  for (const candidate of candidates) {
    if (accepted.some(existing => rangesOverlap(existing, candidate))) continue
    accepted.push(candidate)
  }

  return accepted.sort((a, b) => {
    if (a.startOffset !== b.startOffset) return a.startOffset - b.startOffset
    return a.originalIndex - b.originalIndex
  })
}

