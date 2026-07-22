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
// classes are due at once. The same priority applies to the new-card
// list: a user card with no srs_card (or `reps === 0 && !lastReviewed`)
// wins the tie over a seed card in the same state. The priority is
// consistent across both lists so a user card never silently loses
// its precedence because of which list it landed in.
// Returns the same split as getStudyableCards but as named halves so
// callers can introspect the two lists separately. The server-side
// sessionStart log uses this to show what the client actually
// computed from the pool+cards, before any client-side BATCH_SIZE
// slice.
export function getStudyableCardsDetailed(pool, cards, excludeIds) {
  const now = Date.now()
  const dueRank = (w) => (w.id?.startsWith?.('usr_') ? 0 : 1)
  const due = pool
    .filter((w) => !excludeIds.has(w.id) && cards[w.id]?.due <= now)
    .slice()
    .sort((a, b) => {
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
    .slice()
    .sort((a, b) => dueRank(a) - dueRank(b))
  return { due, newC, queue: [...due, ...newC] }
}

export function getStudyableCards(pool, cards, excludeIds) {
  return getStudyableCardsDetailed(pool, cards, excludeIds).queue
}
