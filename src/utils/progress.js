import { conjCardKey } from './conjugation'

export function getDueCards(cards, vocab) {
  const cardMap = cards || {}
  return vocab
    .filter(w => cardMap[w.id]?.due <= Date.now())
    .sort((a, b) => cardMap[a.id].due - cardMap[b.id].due)
}

export function getNewCards(cards, vocab, limit = 5) {
  const cardMap = cards || {}
  return vocab
    .filter(w => !cardMap[w.id] || cardMap[w.id].reps === 0)
    .sort((a, b) => a.freq - b.freq)
    .slice(0, limit)
}

export function isThemeUnlocked(theme, themeProgress) {
  // Themes with unlockCondition: null are always unlocked
  if (theme.unlockCondition === null) return true
  // Theme 1 is always unlocked
  if (theme.id === 'fr_theme01') return true
  // Extract previous theme number (only for un-prefixed legacy IDs; lang-prefixed
  // themes use the unlockCondition object instead of positional chain).
  const match = theme.id.match(/^theme(\d+)$/)
  if (!match) return true
  const num = parseInt(match[1], 10)
  if (num <= 1) return true
  const prevId = `fr_theme${String(num - 1).padStart(2, '0')}`
  const prev = themeProgress[prevId]
  return prev && prev.bestScore >= 60
}

export function getThemeMastery(theme, cards) {
  if (!theme.vocabIds || theme.vocabIds.length === 0) return 0
  const cardMap = cards || {}
  const mastered = theme.vocabIds.filter(id => cardMap[id]?.reps >= 3).length
  return Math.round((mastered / theme.vocabIds.length) * 100)
}

export function getThemeConjugationMastery(conjugationCards, verbList, formType = 'aff') {
  if (!verbList || verbList.length === 0) return { learned: 0, mastered: 0, total: 0, percent: 0 }
  const cardMap = conjugationCards || {}
  const total = verbList.length * 6
  let learned = 0
  let mastered = 0
  for (const verb of verbList) {
    for (let pi = 0; pi < 6; pi++) {
      const card = cardMap[conjCardKey(verb, pi, formType)]
      if (card && card.reps > 0) learned++
      if (card && card.reps >= 3) mastered++
    }
  }
  return { learned, mastered, total, percent: Math.round((mastered / total) * 100) }
}

export function getConjugationDueCount(conjugationCards, verbList, formType = 'aff') {
  if (!verbList) return 0
  const cardMap = conjugationCards || {}
  let count = 0
  for (const verb of verbList) {
    for (let pi = 0; pi < 6; pi++) {
      const card = cardMap[conjCardKey(verb, pi, formType)]
      if (card && card.reps > 0 && card.due <= Date.now()) count++
    }
  }
  return count
}

// Exercise card mastery for Polish spelling themes
export function getExerciseMastery(exerciseCards, themeId, exerciseCount) {
  if (!exerciseCount || exerciseCount === 0) return { learned: 0, mastered: 0, total: 0, percent: 0 }
  const cardMap = exerciseCards || {}
  let learned = 0
  let mastered = 0
  for (let i = 0; i < exerciseCount; i++) {
    const card = cardMap[`${themeId}:${i}`]
    if (card && card.reps > 0) learned++
    if (card && card.reps >= 3) mastered++
  }
  return { learned, mastered, total: exerciseCount, percent: Math.round((mastered / exerciseCount) * 100) }
}

// Count of due exercise cards
export function getExerciseDueCountByTheme(exerciseCards, themeId, exerciseCount) {
  if (!exerciseCount) return 0
  const cardMap = exerciseCards || {}
  let count = 0
  for (let i = 0; i < exerciseCount; i++) {
    const card = cardMap[`${themeId}:${i}`]
    if (card && card.reps > 0 && card.due <= Date.now()) count++
  }
  return count
}

// Vocab SRS mastery for vocabIds-based themes (Polish work/edu)
export function getVocabMastery(cards, vocabIds) {
  if (!vocabIds || vocabIds.length === 0) return { learned: 0, mastered: 0, total: 0, percent: 0 }
  const cardMap = cards || {}
  let learned = 0
  let mastered = 0
  for (const id of vocabIds) {
    const card = cardMap[id]
    if (card && card.reps > 0) learned++
    if (card && card.reps >= 3) mastered++
  }
  return { learned, mastered, total: vocabIds.length, percent: Math.round((mastered / vocabIds.length) * 100) }
}

export function getVocabDueCount(cards, vocabIds) {
  if (!vocabIds) return 0
  const cardMap = cards || {}
  let count = 0
  for (const id of vocabIds) {
    const card = cardMap[id]
    if (card && card.reps > 0 && card.due <= Date.now()) count++
  }
  return count
}
