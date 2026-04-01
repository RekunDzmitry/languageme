import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getStats, getHistory } from '../services/streak.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const stats = await getStats(req.user.sub);
    res.json(stats);
  } catch (err) { next(err); }
});

router.get('/history', authenticate, async (req, res, next) => {
  try {
    const days = Math.min(365, Math.max(1, parseInt(req.query.days) || 30));
    const history = await getHistory(req.user.sub, days);
    res.json(history);
  } catch (err) { next(err); }
});

export default router;
