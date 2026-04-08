import { VOCAB } from '../data/courses/fr/vocab'
import { conjCardKey } from './conjugation'

export function getDueCards(cards) {
  return VOCAB
    .filter(w => cards[w.id]?.due <= Date.now())
    .sort((a, b) => cards[a.id].due - cards[b.id].due)
}

export function getNewCards(cards, limit = 5) {
  return VOCAB
    .filter(w => !cards[w.id] || cards[w.id].reps === 0)
    .sort((a, b) => a.freq - b.freq)
    .slice(0, limit)
}

export function isThemeUnlocked(theme, themeProgress) {
  // Theme 1 is always unlocked
  if (theme.id === 'theme01') return true
  // Extract previous theme number
  const match = theme.id.match(/^theme(\d+)$/)
  if (!match) return true
  const num = parseInt(match[1], 10)
  if (num <= 1) return true
  const prevId = `theme${String(num - 1).padStart(2, '0')}`
  const prev = themeProgress[prevId]
  return prev && prev.bestScore >= 60
}

export function getThemeMastery(theme, cards) {
  if (!theme.vocabIds || theme.vocabIds.length === 0) return 0
  const mastered = theme.vocabIds.filter(id => cards[id]?.reps >= 3).length
  return Math.round((mastered / theme.vocabIds.length) * 100)
}

export function getThemeConjugationMastery(conjugationCards, verbList, formType = 'aff') {
  if (!verbList || verbList.length === 0) return { learned: 0, mastered: 0, total: 0, percent: 0 }
  const total = verbList.length * 6
  let learned = 0
  let mastered = 0
  for (const verb of verbList) {
    for (let pi = 0; pi < 6; pi++) {
      const card = conjugationCards[conjCardKey(verb, pi, formType)]
      if (card && card.reps > 0) learned++
      if (card && card.reps >= 3) mastered++
    }
  }
  return { learned, mastered, total, percent: Math.round((mastered / total) * 100) }
}

export function getConjugationDueCount(conjugationCards, verbList, formType = 'aff') {
  if (!verbList) return 0
  let count = 0
  for (const verb of verbList) {
    for (let pi = 0; pi < 6; pi++) {
      const card = conjugationCards[conjCardKey(verb, pi, formType)]
      if (card && card.reps > 0 && card.due <= Date.now()) count++
    }
  }
  return count
}
