import { pool } from './pool.js'
import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, 'migrations')

// Incremental migration runner.
//
// Applies every NNN_*.sql file in the migrations directory in lexical
// order. Each file runs in its own transaction on a single client.
// Some migration files include their own BEGIN/COMMIT (which is a
// no-op inside a transaction in Postgres); the runner also records
// the migration in _migrations after success.
//
// Idempotency: applied files are recorded in _migrations and skipped
// on subsequent runs. Re-runs are safe.
//
// Some migration files (e.g. 004) record themselves in _migrations
// without the ".sql" suffix. The runner normalises both forms when
// checking the applied set.
async function migrate() {
  // _migrations must exist before any migration tries to record itself
  // (004 onwards do this from inside the migration file).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)

  const { rows: applied } = await pool.query('SELECT name FROM _migrations ORDER BY name')
  const appliedSet = new Set(applied.map((r) => r.name))

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const stem = file.replace(/\.sql$/, '')
    if (appliedSet.has(file) || appliedSet.has(stem)) {
      console.log(`  skip: ${file}`)
      continue
    }
    console.log(`  apply: ${file}`)
    const sql = readFileSync(join(migrationsDir, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT DO NOTHING', [file])
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
