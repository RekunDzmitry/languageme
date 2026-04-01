// Port of src/utils/sm2.js for server-side use
export function sm2(card, quality) {
  // quality: 0=Again, 1=Hard, 2=Good, 3=Easy
  let { ease, interval_days: interval, reps } = card;
  const q = [0, 2, 4, 5][quality]; // map to SM-2 scale

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
  const due = new Date(Date.now() + interval * 86400000);
  return { ease, interval_days: interval, reps, due, last_reviewed: new Date() };
}
