import { test, expect } from '@playwright/test'
import { getStudyableCards } from '../src/components/study/studyQueue.js'

// Unit test for bug 4: when a user-authored card and a seed card
// share the same `due` timestamp, the user-authored card must
// appear first in the study queue. Today the function orders the
// `due` list by source-array order with no priority; this test
// pins the contract that user cards win ties.

test('user-authored card wins the due-timestamp tiebreaker over seed cards', () => {
  // `now` is captured before the call so the cards' `due` is
  // already in the past by the time `Date.now()` runs inside the
  // function.
  const now = Date.now() - 50
  const cards = {
    fr_001: { due: now, reps: 1, lastReviewed: now - 1000 },
    usr_abc: { due: now, reps: 0, lastReviewed: null },
  }
  const pool = [
    { id: 'fr_001', target: 'bonjour' },
    { id: 'usr_abc', target: 'hi' },
  ]
  const result = getStudyableCards(pool, cards, new Set())
  expect(result).toHaveLength(2)
  expect(result[0].id).toBe('usr_abc')
  expect(result[1].id).toBe('fr_001')
})

test('user-authored card and seed card with different dues keep the earlier-due card first', () => {
  // Sanity check: the priority only applies as a TIEBREAKER. If
  // a seed card's `due` is strictly older than a user card's
  // `due`, the seed still wins (existing behaviour).
  const now = Date.now()
  const cards = {
    fr_001: { due: now - 1000, reps: 1, lastReviewed: now - 2000 },
    usr_abc: { due: now - 10, reps: 0, lastReviewed: null },
  }
  const pool = [
    { id: 'fr_001', target: 'bonjour' },
    { id: 'usr_abc', target: 'hi' },
  ]
  const result = getStudyableCards(pool, cards, new Set())
  expect(result[0].id).toBe('fr_001')
  expect(result[1].id).toBe('usr_abc')
})

test('multiple user cards keep their relative order via the secondary due sort', () => {
  const now = Date.now() - 50
  const cards = {
    usr_first: { due: now - 100, reps: 0, lastReviewed: null },
    usr_second: { due: now, reps: 0, lastReviewed: null },
  }
  const pool = [
    { id: 'usr_second', target: 'b' },
    { id: 'usr_first', target: 'a' },
  ]
  const result = getStudyableCards(pool, cards, new Set())
  // Both rank 0 (user), so secondary sort by due puts the older
  // one first.
  expect(result[0].id).toBe('usr_first')
  expect(result[1].id).toBe('usr_second')
})
