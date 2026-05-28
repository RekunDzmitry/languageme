// Attempt levels with labels, colors, and SM-2 quality values
// Used by WriteAnswer component to track attempt quality
export const ATTEMPT_LEVELS = {
  EASY: { label: 'easy', quality: 3, color: 'bg-green-500', textColor: 'text-green-400', icon: '😄' },
  GOOD: { label: 'good', quality: 2, color: 'bg-blue-500', textColor: 'text-blue-400', icon: '🙂' },
  HARD: { label: 'hard', quality: 1, color: 'bg-amber-500', textColor: 'text-amber-400', icon: '🤔' },
  AGAIN: { label: 'again', quality: 0, color: 'bg-red-500', textColor: 'text-red-400', icon: '🔄' },
}

export function getAttemptLevel(attempts) {
  if (attempts === 1) return ATTEMPT_LEVELS.EASY
  if (attempts === 2) return ATTEMPT_LEVELS.GOOD
  if (attempts === 3) return ATTEMPT_LEVELS.HARD
  return ATTEMPT_LEVELS.AGAIN
}

// Level reported for a submitted answer. AGAIN is reserved for wrong answers;
// a correct answer always lands on EASY/GOOD/HARD even after many attempts so
// the card is counted as answered (SRS reps advance).
export function getResultLevel(attempts, isCorrect) {
  if (!isCorrect) return ATTEMPT_LEVELS.AGAIN
  if (attempts <= 1) return ATTEMPT_LEVELS.EASY
  if (attempts === 2) return ATTEMPT_LEVELS.GOOD
  return ATTEMPT_LEVELS.HARD
}

export function getQualityFromAttempts(attempts, isCorrect) {
  return getResultLevel(attempts, isCorrect).quality
}
