import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { errorHandler } from './middleware/error.js';

// Load Passport OAuth strategies (must import before routes)
import './services/passport.js';

import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/user.js';
import vocabRoutes from './routes/vocab.js';
import themesRoutes from './routes/themes.js';
import studyRoutes from './routes/study.js';
import progressRoutes from './routes/progress.js';
import mnemonicsRoutes from './routes/mnemonics.js';
import statsRoutes from './routes/stats.js';
import migrateRoutes from './routes/migrate.js';
import adminRoutes from './routes/admin.js';
import exportRoutes from './routes/export.js';
import importRoutes from './routes/import.js';
import exerciseNotesRoutes from './routes/exerciseNotes.js';
import vocabNotesRoutes from './routes/vocabNotes.js';
import userCardsRoutes from './routes/userCards.js';
import emailRoutes from './routes/email.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(passport.initialize());

// Disable caching for all API responses
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', userRoutes);
app.use('/api/vocab', vocabRoutes);
app.use('/api/themes', themesRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/mnemonics', mnemonicsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/migrate', migrateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/import', importRoutes);
app.use('/api/exercise-notes', exerciseNotesRoutes);
app.use('/api/vocab-notes', vocabNotesRoutes);
app.use('/api/user-cards', userCardsRoutes);
app.use('/api/email', emailRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'db unreachable' });
  }
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`API listening on port ${config.port}`);
});
