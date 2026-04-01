import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { rows: [user] } = await pool.query(
      'SELECT id, email, display_name, native_lang, target_lang, ui_lang, auto_play_audio, is_admin, created_at FROM "user" WHERE id = $1',
      [req.user.sub]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
});

router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const allowed = ['display_name', 'native_lang', 'target_lang', 'ui_lang', 'auto_play_audio'];
    // Map camelCase input to snake_case columns
    const keyMap = {
      displayName: 'display_name',
      nativeLang: 'native_lang',
      targetLang: 'target_lang',
      uiLang: 'ui_lang',
      autoPlayAudio: 'auto_play_audio',
    };

    const sets = [];
    const vals = [];
    let i = 1;

    for (const [key, value] of Object.entries(req.body)) {
      const col = keyMap[key] || key;
      if (!allowed.includes(col)) continue;
      sets.push(`${col} = $${i++}`);
      vals.push(value);
    }

    if (!sets.length) return res.status(400).json({ error: 'No valid fields to update' });

    vals.push(req.user.sub);
    const { rows: [user] } = await pool.query(
      `UPDATE "user" SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING id, email, display_name, native_lang, target_lang, ui_lang, auto_play_audio`,
      vals
    );
    res.json(user);
  } catch (err) { next(err); }
});

export default router;
