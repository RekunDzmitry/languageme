import { pool } from '../db/pool.js';

export async function getStats(userId) {
  // Total reviewed
  const { rows: [totals] } = await pool.query(
    'SELECT COALESCE(SUM(reviews_count), 0)::int AS total_reviewed, COALESCE(SUM(correct_count), 0)::int AS total_correct FROM user_daily_stat WHERE user_id = $1',
    [userId]
  );

  // Today's reviews
  const { rows: [today] } = await pool.query(
    'SELECT COALESCE(reviews_count, 0)::int AS today_reviewed FROM user_daily_stat WHERE user_id = $1 AND study_date = CURRENT_DATE',
    [userId]
  );

  // Mastered count (reps >= 3)
  const { rows: [mastered] } = await pool.query(
    'SELECT COUNT(*)::int AS mastered_count FROM srs_card WHERE user_id = $1 AND reps >= 3',
    [userId]
  );

  // Streak calculation
  const { rows: days } = await pool.query(
    'SELECT study_date FROM user_daily_stat WHERE user_id = $1 AND reviews_count > 0 ORDER BY study_date DESC',
    [userId]
  );

  let streak = 0;
  const now = new Date();
  let expected = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const row of days) {
    const d = new Date(row.study_date);
    const dayDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dayDate.getTime() === expected.getTime()) {
      streak++;
      expected = new Date(expected.getTime() - 86400000);
    } else if (dayDate.getTime() < expected.getTime()) {
      break;
    }
  }

  return {
    streak,
    totalReviewed: totals.total_reviewed,
    todayReviewed: today?.today_reviewed || 0,
    masteredCount: mastered.mastered_count,
  };
}

export async function getHistory(userId, days) {
  const { rows } = await pool.query(
    `SELECT study_date, reviews_count, correct_count
     FROM user_daily_stat
     WHERE user_id = $1 AND study_date >= CURRENT_DATE - $2::int
     ORDER BY study_date`,
    [userId, days]
  );
  return rows;
}
