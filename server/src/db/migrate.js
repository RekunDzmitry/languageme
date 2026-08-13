import { pool } from './pool.js'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import process from 'node:process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, 'migrations')

// Names of the legacy migrations that were applied by the old incremental
// runner. Detecting any of these in _migrations means the DB was bootstrapped
// by the pre-refactor runner and we need to perform the legacy cutover.
const LEGACY_MIGRATION_NAMES = [
  '001_initial.sql',
  '002_seed_vocab.sql',
  '003_seed_themes.sql',
  '004_conjugation_cards.sql',
  '004_seed_stem_changing_verbs.sql',
  '005_ai_assistant.sql',
  '006_exercise_cards.sql',
  '007_seed_polish_themes.sql',
  '008_exercise_card_ease_real.sql',
  '009_exercise_notes.sql',
  '010_vocab_notes.sql',
  '011_seed_polish_vocab.sql',
  '012_seed_polish_themes_10_11.sql',
  '013_seed_polish_themes_12_14.sql',
  '014_seed_polish_themes_15_18.sql',
  '015_theme_lang_scope_order.sql',
  '016_email_exercises.sql',
  '017_email_word_vocab.sql',
  '018_user_write_exercises.sql',
  '019_seed_polish_theme20.sql',
  '020_update_polish_theme20_mikitko_examples.sql',
  '021_progressive_email_evaluation.sql',
  '022_seed_pl_theme22.sql',
  '023_oauth_social_login.sql',
  '023_rename_fr_themes_to_fr_prefix.sql',
  '024_ai_request_log.sql',
  '025_user_cards.sql',
  '026_pack_other_themes.sql',
  '027_email_scoring_metrics.sql',
  '027_per_pack_theme_order.sql',
  '028_swap_pl_pack_ranges.sql',
  '029_demote_pl_theme20_21_to_vocab.sql',
  '030_seed_pl_theme19.sql',
  '031_seed_pl_theme21.sql',
  '032_pl_pack_reorg.sql',
  '033_drop_ai_helper_tables.sql',
]

const BOOTSTRAP_NAME = '000_bootstrap.sql'
const SCHEMA_ONLY_NAME = '_schema_only.sql'
const DATA_ONLY_NAME = '_data_only.sql'

// Migration runner.
//
// Two phases:
//   1. Bootstrap (000_bootstrap.sql) — single canonical seed for schema + reference
//      data. It is refreshed on every run: reference tables are DROP+recreate,
//      while user tables use IF NOT EXISTS so user-created data/progress is
//      preserved and newly-added user tables become available on existing DBs.
//   2. Additive migrations (NNN_*.sql where NNN > 0) — schema-only deltas that
//      cannot be expressed in the bootstrap (e.g. a new column on a user
//      table, a new index).
//
// Legacy DB cutover: if _migrations contains any of the historical filenames,
// the runner marks the bootstrap as applied (without re-running schema) and
// re-runs the DATA section so reference tables are replaced with the new
// canonical content. User tables and user data are preserved.
//
// The runner records each applied file in _migrations to prevent
// re-execution on subsequent runs.
async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  const { rows: applied } = await pool.query(
    'SELECT name FROM _migrations ORDER BY name'
  )
  const appliedSet = new Set(applied.map(r => r.name))

  // ---- Phase 1: bootstrap/reference refresh ----
  const hasLegacy = applied.some(r => LEGACY_MIGRATION_NAMES.includes(r.name))
  if (!appliedSet.has(BOOTSTRAP_NAME) && hasLegacy) {
    console.log('[migrate] legacy DB detected; squashing historical migrations into 000_bootstrap.sql')
    console.log('[migrate]   user tables are preserved as-is; reference data is the new canonical seed')
    // Apply new schema additions from the bootstrap (new tables like
    // vocab_example, vocab_lexicon, theme_conjugation; srs_card.archived_at).
    // The DROP TABLE IF EXISTS CASCADE statements at the top of the schema
    // section are no-ops for tables that don't exist yet on a legacy DB.
    // The CREATE TABLE statements add the missing reference tables and any
    // new user-table columns.
    const schemaSql = readFileSync(join(migrationsDir, SCHEMA_ONLY_NAME), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(schemaSql)
      await client.query('COMMIT')
      console.log('  applied: schema additions (new tables, columns)')
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Failed to apply schema additions:', err.message)
      process.exit(1)
    } finally {
      client.release()
    }
    // Rebuild reference data from the canonical seed.
    const dataSql = readFileSync(join(migrationsDir, DATA_ONLY_NAME), 'utf8')
    const client2 = await pool.connect()
    try {
      await client2.query('BEGIN')
      await client2.query(dataSql)
      await client2.query('COMMIT')
      console.log('  applied: reference data rebuild')
    } catch (err) {
      await client2.query('ROLLBACK')
      console.error('Failed to rebuild reference data:', err.message)
      process.exit(1)
    } finally {
      client2.release()
    }
    await pool.query(
      `INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT DO NOTHING`,
      [BOOTSTRAP_NAME]
    )
  } else {
    console.log(appliedSet.has(BOOTSTRAP_NAME)
      ? `  refresh: ${BOOTSTRAP_NAME}`
      : `  apply: ${BOOTSTRAP_NAME}`)
    const sql = readFileSync(join(migrationsDir, BOOTSTRAP_NAME), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query(
        `INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT DO NOTHING`,
        [BOOTSTRAP_NAME]
      )
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`Migration ${BOOTSTRAP_NAME} failed:`, err.message)
      process.exit(1)
    } finally {
      client.release()
    }
  }

  // ---- Phase 2: additive migrations ----
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .filter(f => f !== BOOTSTRAP_NAME)
    .filter(f => !f.startsWith('_'))  // skip _archive/, _schema_only.sql, _data_only.sql
    .sort()

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`  skip: ${file}`)
      continue
    }
    console.log(`  apply: ${file}`)
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query(
        `INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT DO NOTHING`,
        [file]
      )
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`Migration ${file} failed:`, err.message)
      process.exit(1)
    } finally {
      client.release()
    }
  }

  console.log('Migrations complete.')
}

migrate()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
