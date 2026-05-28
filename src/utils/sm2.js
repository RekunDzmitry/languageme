export function sm2(card, quality) {
  // quality: 0=Again, 1=Hard, 2=Good, 3=Easy
  let { ease, interval, reps } = card;
  // Map to SM-2 scale. Hard maps to 3 (passing) so reps advance — matches
  // Anki semantics where Again is the only fail grade.
  const q = [0, 3, 4, 5][quality];

  if (q < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ease);
    reps += 1;
  }

  ease = Math.max(1.3, ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  const due = Date.now() + interval * 86400000;
  return { ease, interval, reps, due, lastReviewed: Date.now() };
}

export function createCard() {
  return { ease: 2.5, interval: 1, reps: 0, due: Date.now(), lastReviewed: null };
}
