// Integration tests for the user-override surface.
//
// These tests pin the contract that a user can override:
//   - vocab translation: "I want this word to mean *my* translation, not the
//     one in 000_bootstrap.sql's vocab_translation table"
//   - write-exercise expected answers: "I want this prompt to be graded
//     against *my* answers, not the ones in theme_section.content.exercises[].answer"
//
// Three layers are tested:
//   1. Schema — both tables exist with the right columns after bootstrap
//   2. API    — both routes exist and round-trip a user's overrides
//   3. Read   — /api/courses/all injects the user override over the seed
//
// The tests are hermetic: a fresh DB per run (DATABASE_URL_TEST), the migrate
// runner executed once, then a real Express app booted on a random port.
//
// RED at landing: the tables and endpoints don't exist yet, so every test
// below fails. GREEN only after the SQL + UI commits land.

import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { Client } from 'pg'

// Re-use the project's own migrate.js by exec'ing node.
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
let app
let baseUrl
let authToken
let userId

async function startServer() {
  // Pick a free port and bind to it explicitly so the test never races
  // with another instance of the server on the same machine.
  const net = await import('node:net')
  const port = await new Promise((resolve, reject) => {
    const s = net.createServer()
    s.on('error', reject)
    s.listen(0, '127.0.0.1', () => {
      const p = s.address().port
      s.close(() => resolve(p))
    })
  })
  const env = { ...process.env, DATABASE_URL: dbUrl, PORT: String(port) }
  const proc = spawn(process.execPath, [new URL('../src/index.js', import.meta.url).pathname], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  proc.stdout.setEncoding('utf8')
  proc.stderr.setEncoding('utf8')
  proc.stdout.on('data', d => {
    const m = d.match(/API listening on port (\d+)/)
    if (m && !baseUrl) {
      baseUrl = `http://127.0.0.1:${m[1]}`
    }
  })
  for (let i = 0; i < 50 && !baseUrl; i++) {
    await new Promise(r => setTimeout(r, 100))
  }
  if (!baseUrl) throw new Error('Server never came up.')
  app = proc
}

function stopServer() {
  if (app) app.kill('SIGTERM')
  app = null
  baseUrl = null
}

async function signUp(email) {
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'pwd12345', displayName: 'Tester', nativeLang: 'ru', targetLang: 'fr' }),
  })
  if (!res.ok) throw new Error(`signup failed: ${res.status} ${await res.text()}`)
  const data = await res.json()
  authToken = data.accessToken
  const me = await fetch(`${baseUrl}/api/me`, {
    headers: { authorization: `Bearer ${authToken}` },
  })
  if (!me.ok) throw new Error(`me failed: ${me.status} ${await me.text()}`)
  const meJson = await me.json()
  userId = meJson.id
}

before(async () => {
  // Spin up a fresh DB. The test runner is responsible for exposing
  // DATABASE_URL_BASE (admin DB) so we can CREATE/DROP a scratch DB.
  const base = process.env.DATABASE_URL_BASE
  if (!base) {
    throw new Error('Set DATABASE_URL_BASE to a postgres URL with CREATEDB rights')
  }
  const name = `lm_overrides_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const admin = new Client({ connectionString: base })
  await admin.connect()
  await admin.query(`CREATE DATABASE ${name}`)
  await admin.end()
  dbUrl = `${base.replace(/\/[^/]*$/, '')}/${name}`
  await runMigrate(dbUrl)
  await startServer()
  await signUp(`u${Date.now()}@example.com`)
})

after(async () => {
  stopServer()
  if (dbUrl) {
    const admin = new Client({ connectionString: process.env.DATABASE_URL_BASE })
    await admin.connect()
    const dbName = dbUrl.split('/').pop()
    await admin.query(`DROP DATABASE IF EXISTS ${dbName}`)
    await admin.end()
  }
})

// ---- 1. Schema ----------------------------------------------------------------

test('user_translation_override table exists with the expected shape', async () => {
  const c = new Client({ connectionString: dbUrl })
  await c.connect()
  try {
    const { rows } = await c.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_translation_override'
      ORDER BY ordinal_position
    `)
    const cols = Object.fromEntries(rows.map(r => [r.column_name, r.data_type]))
    assert.ok(cols.user_id, 'user_id column missing')
    assert.ok(cols.vocab_id, 'vocab_id column missing')
    assert.ok(cols.native_lang, 'native_lang column missing')
    assert.ok(cols.text, 'text column missing')
    assert.ok(cols.created_at, 'created_at column missing')
    assert.ok(cols.updated_at, 'updated_at column missing')
  } finally { await c.end() }
})

test('user_exercise_answer_override table exists with the expected shape', async () => {
  const c = new Client({ connectionString: dbUrl })
  await c.connect()
  try {
    const { rows } = await c.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_exercise_answer_override'
      ORDER BY ordinal_position
    `)
    const cols = Object.fromEntries(rows.map(r => [r.column_name, r.data_type]))
    assert.ok(cols.user_id, 'user_id column missing')
    assert.ok(cols.exercise_key, 'exercise_key column missing')
    assert.ok(cols.answers, 'answers column missing (TEXT[])')
    assert.equal(cols.answers, 'ARRAY', 'answers must be TEXT[]')
    assert.ok(cols.created_at, 'created_at column missing')
    assert.ok(cols.updated_at, 'updated_at column missing')
  } finally { await c.end() }
})

// ---- 2. API -------------------------------------------------------------------

test('PUT /api/translation-overrides/:vocabId upserts and GET returns it', async () => {
  const put = await fetch(`${baseUrl}/api/translation-overrides/fr_001?native_lang=ru`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ text: 'мОЁ приветствие' }),
  })
  const putText = await put.text()
  assert.equal(put.status, 200, putText)
  const putJson = JSON.parse(putText)
  assert.equal(putJson.vocab_id, 'fr_001')
  assert.equal(putJson.text, 'мОЁ приветствие')

  const get = await fetch(`${baseUrl}/api/translation-overrides`, {
    headers: { authorization: `Bearer ${authToken}` },
  })
  assert.equal(get.status, 200)
  const rows = await get.json()
  assert.ok(rows.some(r => r.vocab_id === 'fr_001' && r.text === 'мОЁ приветствие'))
})

test('DELETE /api/translation-overrides/:vocabId drops a user override', async () => {
  const put = await fetch(`${baseUrl}/api/translation-overrides/fr_002?native_lang=ru`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ text: 'override' }),
  })
  assert.equal(put.status, 200)
  const del = await fetch(`${baseUrl}/api/translation-overrides/fr_002?native_lang=ru`, {
    method: 'DELETE',
    headers: { authorization: `Bearer ${authToken}` },
  })
  assert.equal(del.status, 200)
  const get = await fetch(`${baseUrl}/api/translation-overrides`, {
    headers: { authorization: `Bearer ${authToken}` },
  })
  const rows = await get.json()
  assert.ok(!rows.some(r => r.vocab_id === 'fr_002'), 'override should be gone')
})

test('PUT /api/exercise-answer-overrides/:key upserts an array of answers', async () => {
  const key = 'fr_theme01:0'
  const put = await fetch(`${baseUrl}/api/exercise-answer-overrides/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ answers: ['mon 1er mot', 'my first word'] }),
  })
  assert.equal(put.status, 200, await put.text())
  const get = await fetch(`${baseUrl}/api/exercise-answer-overrides`, {
    headers: { authorization: `Bearer ${authToken}` },
  })
  const rows = await get.json()
  const row = rows.find(r => r.exercise_key === key)
  assert.ok(row, 'override not returned by GET')
  assert.deepEqual(row.answers.sort(), ['mon 1er mot', 'my first word'])
})

// ---- 3. Read path: /api/courses/all injects overrides --------------------------

test('GET /api/courses/all injects user_translation_override over the seed translation', async () => {
  // Seed: pick a vocab id and the seed translation
  const c = new Client({ connectionString: dbUrl })
  await c.connect()
  const { rows: seedRows } = await c.query(`
    SELECT v.id, vt.text AS seed_text
    FROM vocab v
    JOIN vocab_translation vt ON vt.vocab_id = v.id AND vt.lang = 'ru'
    WHERE v.id = 'fr_001'
  `)
  await c.end()
  assert.ok(seedRows.length, 'seed must include fr_001/ru translation')
  const seedText = seedRows[0].seed_text

  // Put the override
  const put = await fetch(`${baseUrl}/api/translation-overrides/fr_001?native_lang=ru`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ text: '!!!USER_OVERRIDE!!!' }),
  })
  assert.equal(put.status, 200)

  // /api/courses/all must surface the override
  const get = await fetch(`${baseUrl}/api/courses/all?native_lang=ru`, {
    headers: { authorization: `Bearer ${authToken}` },
  })
  assert.equal(get.status, 200)
  const bundle = await get.json()
  const fr = bundle.fr || bundle
  const v = fr.vocab.find(w => w.id === 'fr_001')
  assert.ok(v, 'fr_001 not in bundle')
  // vocab[].translations is an array of { lang, text } per the bundle shape
  const ru = (v.translations || []).find(t => t.lang === 'ru')
  assert.ok(ru, 'ru translation not in bundle')
  assert.equal(ru.text, '!!!USER_OVERRIDE!!!')
  assert.notEqual(ru.text, seedText, 'override must replace seed')
})

test('GET /api/courses/all injects user_exercise_answer_override into the exercises[]', async () => {
  // pl_theme01 carries write_answer exercises in the canonical seed.
  const key = 'pl_theme01:0'
  await fetch(`${baseUrl}/api/exercise-answer-overrides/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ answers: ['!!!MY_ANSWER!!!'] }),
  })

  const get = await fetch(`${baseUrl}/api/courses/all?native_lang=ru`, {
    headers: { authorization: `Bearer ${authToken}` },
  })
  const bundle = await get.json()
  const pl = bundle.pl || bundle
  const theme = pl.themes.find(t => t.id === 'pl_theme01')
  assert.ok(theme, 'fr_theme01 missing from bundle')
  const exerciseSections = (theme.sections || []).filter(s => s.type === 'exercises')
  assert.ok(exerciseSections.length, 'no exercises section in pl_theme01')
  // The seed stores the exercises array inside the section's content JSONB
  const ex0 = exerciseSections[0].content.exercises[0]
  // The expected answer is replaced
  if (Array.isArray(ex0.answers)) {
    assert.ok(ex0.answers.includes('!!!MY_ANSWER!!!'),
      'exercise.answers should contain the user override')
  } else {
    assert.equal(ex0.answer, '!!!MY_ANSWER!!!',
      'exercise.answer should equal the user override')
  }
})

// ---- 4. Idempotency: a second bootstrap run preserves overrides ---------------

test('Bootstrap is idempotent: reapplying 000_bootstrap.sql preserves user_translation_override rows', async () => {
  const put = await fetch(`${baseUrl}/api/translation-overrides/fr_003?native_lang=ru`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ text: 'PERSIST_THIS' }),
  })
  assert.equal(put.status, 200)

  // Re-run the bootstrap
  await runMigrate(dbUrl)

  // Override should still be there
  const c = new Client({ connectionString: dbUrl })
  await c.connect()
  const { rows } = await c.query(
    'SELECT text FROM user_translation_override WHERE user_id = $1 AND vocab_id = $2 AND native_lang = $3',
    [userId, 'fr_003', 'ru']
  )
  await c.end()
  assert.equal(rows.length, 1)
  assert.equal(rows[0].text, 'PERSIST_THIS')
})

test('Bootstrap is idempotent: reapplying 000_bootstrap.sql preserves user_exercise_answer_override rows', async () => {
  const key = 'fr_theme01:1'
  const put = await fetch(`${baseUrl}/api/exercise-answer-overrides/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ answers: ['PERSIST_ANS'] }),
  })
  assert.equal(put.status, 200)

  await runMigrate(dbUrl)

  const c = new Client({ connectionString: dbUrl })
  await c.connect()
  const { rows } = await c.query(
    'SELECT answers FROM user_exercise_answer_override WHERE user_id = $1 AND exercise_key = $2',
    [userId, key]
  )
  await c.end()
  assert.equal(rows.length, 1)
  assert.deepEqual(rows[0].answers, ['PERSIST_ANS'])
})
