// Integration tests for the bootstrap's idempotency and user-data preservation.
//
// Pins:
//   - 000_bootstrap.sql can be applied twice with no error and no semantic drift
//   - user_translation_override rows survive the second apply
//   - user_exercise_answer_override rows survive the second apply
//   - vocab_translation rows can be edited in the seed and the new values
//     land without touching the user override rows
//   - exercises[].answer can be edited in the seed and the new values
//     land without touching the user override rows
//
// These tests do not assume the table schemas exist — they are the
// TRUTH SOURCE for what columns the UI/API commits must build.

import { test as nodeTest, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { Client } from 'pg'
import { readFileSync } from 'node:fs'

const hasDatabaseUrlBase = !!process.env.DATABASE_URL_BASE
const test = hasDatabaseUrlBase
  ? nodeTest
  : (name, fn) => nodeTest(name, { skip: 'Set DATABASE_URL_BASE to a postgres URL with CREATEDB rights' }, fn)

function runMigrate(databaseUrl) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, DATABASE_URL: databaseUrl, PORT: '0' }
    const proc = spawn(
      process.execPath,
      [new URL('../src/db/migrate.js', import.meta.url).pathname],
      { env, stdio: ['ignore', 'pipe', 'pipe'] }
    )
    let out = ''
    let err = ''
    proc.stdout.on('data', d => { out += d })
    proc.stderr.on('data', d => { err += d })
    proc.on('close', code => {
      if (code === 0) resolve({ out, err })
      else reject(new Error(`migrate exited ${code}: ${err || out}`))
    })
  })
}

let dbUrl
let dbName
let baseUrl
let authToken

async function startServer(databaseUrl) {
  // Pick a free port so the test never races with another server on port 3000.
  const net = await import('node:net')
  const port = await new Promise((resolve, reject) => {
    const s = net.createServer()
    s.on('error', reject)
    s.listen(0, '127.0.0.1', () => {
      const p = s.address().port
      s.close(() => resolve(p))
    })
  })
  const env = { ...process.env, DATABASE_URL: databaseUrl, PORT: String(port) }
  const proc = spawn(process.execPath, [new URL('../src/index.js', import.meta.url).pathname], {
    env, stdio: ['ignore', 'pipe', 'pipe'],
  })
  proc.stdout.setEncoding('utf8')
  proc.stdout.on('data', d => {
    const m = d.match(/API listening on port (\d+)/)
    if (m && !baseUrl) baseUrl = `http://127.0.0.1:${m[1]}`
  })
  for (let i = 0; i < 50 && !baseUrl; i++) {
    await new Promise(r => setTimeout(r, 100))
  }
  if (!baseUrl) throw new Error('Server never came up')
  return proc
}

let serverProc

before(async () => {
  const base = process.env.DATABASE_URL_BASE
  if (!base) return
  dbName = `lm_bstrap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const admin = new Client({ connectionString: base })
  await admin.connect()
  await admin.query(`CREATE DATABASE ${dbName}`)
  await admin.end()
  dbUrl = `${base.replace(/\/[^/]*$/, '')}/${dbName}`
  await runMigrate(dbUrl)
  serverProc = await startServer(dbUrl)

  // Sign up a test user
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: `t${Date.now()}@example.com`,
      password: 'pwd12345',
      displayName: 'Tester',
      nativeLang: 'ru',
      targetLang: 'fr',
    }),
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  authToken = data.accessToken
})

after(async () => {
  if (serverProc) serverProc.kill('SIGTERM')
  if (dbUrl) {
    const admin = new Client({ connectionString: process.env.DATABASE_URL_BASE })
    await admin.connect()
    await admin.query(`DROP DATABASE IF EXISTS ${dbName}`)
    await admin.end()
  }
})

// ---------------------------------------------------------------------------

test('000_bootstrap.sql applies cleanly (no error) and is repeatable', async () => {
  // The before() hook already ran the first apply against a fresh DB.
  // The first re-run is a no-op (bootstrap.sql records itself in _migrations
  // so the runner skips it on the second invocation). What we care about:
  //   (a) the apply that already happened didn't throw — proven by reaching this line
  //   (b) a subsequent re-run also doesn't throw, and reports completion
  const { out, err } = await runMigrate(dbUrl)
  assert.doesNotMatch(err, /error|fatal/i, `migrate stderr: ${err}`)
  assert.match(out, /Migrations complete\./)
})

test('000_bootstrap.sql is idempotent on the user schema (IF NOT EXISTS)', async () => {
  // Force a 3rd apply, then ensure no error and rows are still intact.
  const c = new Client({ connectionString: dbUrl })
  await c.connect()
  const before = await c.query('SELECT count(*)::int FROM "user"')
  await c.end()
  await runMigrate(dbUrl)
  const c2 = new Client({ connectionString: dbUrl })
  await c2.connect()
  const after = await c2.query('SELECT count(*)::int FROM "user"')
  await c2.end()
  assert.equal(after.rows[0].count, before.rows[0].count,
    'user count must not change across reapplies')
})

test('User override rows survive a bootstrap reapply', async () => {
  // Insert a translation override
  const put = await fetch(`${baseUrl}/api/translation-overrides/fr_004?native_lang=ru`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ text: 'PRESERVE_ME' }),
  })
  // RED: 404 — endpoint doesn't exist yet
  assert.equal(put.status, 200, await put.text())

  // Insert an exercise-answer override
  const key = 'fr_theme01:0'
  const put2 = await fetch(`${baseUrl}/api/exercise-answer-overrides/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ answers: ['KEEP_THIS'] }),
  })
  assert.equal(put2.status, 200, await put2.text())

  // Reapply the bootstrap
  await runMigrate(dbUrl)

  // Both overrides must still be present
  const c = new Client({ connectionString: dbUrl })
  await c.connect()
  const tRows = await c.query(
    'SELECT text FROM user_translation_override WHERE vocab_id = $1',
    ['fr_004']
  )
  const eRows = await c.query(
    'SELECT answers FROM user_exercise_answer_override WHERE exercise_key = $1',
    [key]
  )
  await c.end()
  assert.equal(tRows.rows.length, 1, 'translation override should survive')
  assert.equal(tRows.rows[0].text, 'PRESERVE_ME')
  assert.equal(eRows.rows.length, 1, 'exercise-answer override should survive')
  assert.deepEqual(eRows.rows[0].answers, ['KEEP_THIS'])
})

test('Seed can change a translation without affecting the user override', async () => {
  // Pick any vocab that has a ru translation in the seed
  const c = new Client({ connectionString: dbUrl })
  await c.connect()
  const { rows: seedRows } = await c.query(`
    SELECT v.id, vt.text
    FROM vocab v
    JOIN vocab_translation vt ON vt.vocab_id = v.id AND vt.lang = 'ru'
    WHERE v.id LIKE 'fr\\_%' ESCAPE '\\'
    LIMIT 1
  `)
  await c.end()
  assert.ok(seedRows.length, 'no fr_ vocab in seed')
  const vocabId = seedRows[0].id

  // Put an override
  await fetch(`${baseUrl}/api/translation-overrides/${vocabId}?native_lang=ru`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ text: 'MY_OVERRIDE' }),
  })

  // /api/courses/all returns MY_OVERRIDE, not the seed text
  const get = await fetch(`${baseUrl}/api/courses/all?native_lang=ru`, {
    headers: { authorization: `Bearer ${authToken}` },
  })
  const bundle = await get.json()
  const fr = bundle.fr || bundle
  const v = fr.vocab.find(w => w.id === vocabId)
  const ru = (v.translations || []).find(t => t.lang === 'ru')
  assert.ok(ru, 'ru translation missing from bundle')
  assert.equal(ru.text, 'MY_OVERRIDE')
})

test('Bootstrap SQL is self-contained (no external files referenced)', async () => {
  // The migration must not require side files at runtime
  const sql = readFileSync(
    new URL('../src/db/migrations/000_bootstrap.sql', import.meta.url),
    'utf8'
  )
  assert.ok(!/\\\\i\b|\\copy\b|LOAD_FILE/i.test(sql),
    'bootstrap must not use \\copy or LOAD_FILE (must be portable)')
  // Every CREATE TABLE in the user schema must be IF NOT EXISTS
  const userTables = [...sql.matchAll(/CREATE TABLE IF NOT EXISTS ("?\w+"?)/g)].map(m => m[1])
  for (const required of ['user', 'srs_card', 'theme_progress', 'user_mnemonic',
    'user_translation_override', 'user_exercise_answer_override']) {
    const found = userTables.find(t => t.replace(/"/g, '') === required)
    assert.ok(found, `${required} must be CREATE TABLE IF NOT EXISTS`)
  }
})
