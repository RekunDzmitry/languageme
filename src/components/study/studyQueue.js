// Study queue ordering — extracted from StudySession so it can be
// unit-tested without spinning up React.
//
// `getStudyableCards` returns the union of `due` and `new` cards for
// the given pool. The order matters: due cards come first (so the
// learner drills the most-overdue material), followed by new cards
// (so the session is full even when the due queue is empty).
//
// Within the due list, user-authored cards (`usr_…` ids) get a
// tiebreaker priority over seed cards with the same `due` timestamp
// — the user expects their own cards to surface first when both
// classes are due at once. The new-card list keeps the source order.
export function getStudyableCards(pool, cards, excludeIds) {
  const now = Date.now()
  const dueRank = (w) => (w.id?.startsWith?.('usr_') ? 0 : 1)
  const due = pool
    .filter((w) => !excludeIds.has(w.id) && cards[w.id]?.due <= now)
    .slice()
    .sort((a, b) => {
      // Primary: earlier `due` first (most-overdue material
      // drills first). Tiebreaker: user-authored card wins so a
      // learner who just created a card sees it surface as soon
      // as it's due, even if a seed card ties on the same
      // timestamp.
      const dueDiff = (cards[a.id]?.due || 0) - (cards[b.id]?.due || 0)
      if (dueDiff !== 0) return dueDiff
      return dueRank(a) - dueRank(b)
    })
  const newC = pool
    .filter(
      (w) =>
        !excludeIds.has(w.id) &&
        (!cards[w.id] || (cards[w.id].reps === 0 && !cards[w.id].lastReviewed))
    )
    .filter((c) => !due.find((d) => d.id === c.id))
  return [...due, ...newC]
}
