const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

export function getCardStatus(card) {
  if (!card || card.reps === 0) return 'new'
  if (card.reps >= 3 || (card.due && card.due - Date.now() > ONE_YEAR_MS)) return 'mastered'
  if (card.due <= Date.now()) return 'due'
  return 'learning'
}

export function formatDueDate(due, t) {
  if (!due) return ''
  const now = Date.now()
  const diff = due - now
  const absDiff = Math.abs(diff)

  const minutes = Math.floor(absDiff / 60000)
  const hours = Math.floor(absDiff / 3600000)
  const days = Math.floor(absDiff / 86400000)

  if (absDiff < 60000) return t('cards_now')

  let timeStr
  if (days > 0) timeStr = `${days} ${t('cards_days', { count: days })}`
  else if (hours > 0) timeStr = `${hours} ${t('cards_hours', { count: hours })}`
  else timeStr = `${minutes} ${t('cards_minutes', { count: minutes })}`

  return diff > 0
    ? t('cards_due_in', { time: timeStr })
    : t('cards_overdue', { time: timeStr })
}

export const STATUS_COLORS = {
  mastered: 'bg-green-500/20 text-green-400 border-green-500/30',
  learning: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  due: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  new: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}
