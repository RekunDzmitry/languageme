import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(path, import.meta.url), 'utf8')
}

function createTableBody(sql, tableName) {
  const escaped = tableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = sql.match(new RegExp(`CREATE TABLE(?: IF NOT EXISTS)? ${escaped} \\(([\\s\\S]*?)\\n\\);`))
  assert.ok(match, `missing CREATE TABLE for ${tableName}`)
  return match[1]
}

function promiseAllEndpoints(source) {
  const start = source.indexOf('return Promise.all([')
  assert.notEqual(start, -1, 'fetchProgress must use Promise.all for progress bootstrap')
  const destructureMarker = ']).then((['
  const destructureStart = source.indexOf(destructureMarker, start)
  assert.notEqual(destructureStart, -1, 'fetchProgress must destructure Promise.all results')
  const body = source.slice(start, destructureStart)
  const namesStart = destructureStart + destructureMarker.length
  const namesEnd = source.indexOf(']) =>', namesStart)
  assert.notEqual(namesEnd, -1, 'fetchProgress destructuring must close before the then body')

  const endpoints = [...body.matchAll(/api\.get\((['`])([^'`]+)\1\)/g)].map(m => m[2])
  const names = source.slice(namesStart, namesEnd).split(',').map(s => s.trim()).filter(Boolean)
  return { endpoints, names }
}

test('canonical bootstrap keeps every column used by conjugation_card routes', () => {
  const bootstrap = read('../src/db/migrations/000_bootstrap.sql')
  const body = createTableBody(bootstrap, 'conjugation_card')

  for (const column of ['reps', 'due', 'updated_at']) {
    assert.match(
      body,
      new RegExp(`\\b${column}\\b`, 'i'),
      `conjugation_card must define ${column}; study.js selects or updates it`
    )
  }
})

test('legacy cutover schema creates user override tables before marking bootstrap applied', () => {
  const schemaOnly = read('../src/db/migrations/_schema_only.sql')

  for (const table of [
    'user_translation_override',
    'user_exercise_answer_override',
    'user_conjugation_prompt_override',
    'user_conjugation_mnemonic',
  ]) {
    assert.match(
      schemaOnly,
      new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`, 'i'),
      `_schema_only.sql must create ${table} for existing DB cutovers`
    )
  }
})

test('fetchProgress destructuring matches the Promise.all request order', () => {
  const source = read('../../src/stores/UserProgressContext.jsx')
  const { endpoints, names } = promiseAllEndpoints(source)

  const expectedByEndpoint = new Map([
    ['/api/stats', 'statsData'],
    ['/api/progress/themes', 'themesData'],
    ['/api/mnemonics', 'mnemonicsData'],
    ['/api/translation-overrides', 'translationOverridesData'],
    ['/api/exercise-answer-overrides', 'exerciseAnswerOverridesData'],
    ['/api/study/cards?target=${targetLang}', 'cardsData'],
    ['/api/study/conjugation', 'conjCardsData'],
    ['/api/progress/themes/unlock-status', 'unlockData'],
    ['/api/study/exercises', 'exCardsData'],
    ['/api/exercise-notes', 'exNotesData'],
    ['/api/vocab-notes', 'vocabNotesData'],
    ['/api/user-cards?target=${targetLang}', 'userCardsData'],
  ])

  assert.equal(names.length, endpoints.length, 'Promise.all result count must match destructuring count')

  endpoints.forEach((endpoint, index) => {
    const expected = expectedByEndpoint.get(endpoint)
    assert.ok(expected, `unexpected fetchProgress endpoint: ${endpoint}`)
    assert.equal(
      names[index],
      expected,
      `${endpoint} must destructure into ${expected}, got ${names[index]}`
    )
  })
})

test('course APIs flatten theme_section.content into the section object consumed by React', () => {
  const courses = read('../src/routes/courses.js')
  const themes = read('../src/routes/themes.js')

  for (const [label, source] of [['courses.js', courses], ['themes.js', themes]]) {
    assert.match(
      source,
      /\.\.\.(?:s\.)?content|Object\.assign\([^)]*(?:s\.)?content/s,
      `${label} must expose content fields like exercises, notes, tables, and vocabIds at section top level`
    )
  }
})

test('dashboard and themes list define derived variables before rendering', () => {
  const dashboard = read('../../src/pages/DashboardPage.jsx')
  const themesList = read('../../src/pages/ThemesListPage.jsx')

  assert.match(
    dashboard,
    /const\s+themeIds\s*=\s*new Set\(/,
    'DashboardPage getPackStats must define themeIds before filtering vocab'
  )
  assert.match(
    themesList,
    /const\s+numberedThemes\s*=\s*allThemes\.map\(/,
    'ThemesListPage must derive numberedThemes before rendering'
  )
})

test('training grids tolerate progress maps that are still missing', () => {
  const trainingPage = read('../../src/pages/TrainingPage.jsx')

  for (const [mapName, keyName] of [
    ['exerciseCards', 'key'],
    ['cards', 'id'],
    ['conjugationCards', 'key'],
  ]) {
    assert.match(
      trainingPage,
      new RegExp(`const\\s+card\\s*=\\s*${mapName}\\?\\.\\[${keyName}\\]`),
      `TrainingPage must not crash when ${mapName} is undefined while a theme is expanded`
    )
  }
})

test('training progress helpers tolerate progress maps that are still missing', () => {
  const progress = read('../../src/utils/progress.js')
  const conjugation = read('../../src/utils/conjugation.js')
  const userProgress = read('../../src/stores/UserProgressContext.jsx')
  const verbList = read('../../src/components/themes/VerbListSection.jsx')
  const exerciseSection = read('../../src/components/themes/ExerciseSection.jsx')

  for (const mapName of ['cards', 'conjugationCards', 'exerciseCards']) {
    assert.match(
      progress,
      new RegExp(`const\\s+cardMap\\s*=\\s*${mapName}\\s*\\|\\|\\s*\\{\\}`),
      `progress helpers must default missing ${mapName} to an empty map`
    )
  }

  assert.match(
    conjugation,
    /const\s+cardMap\s*=\s*conjugationCards\s*\|\|\s*\{\}/,
    'buildSessionQueue must default missing conjugationCards to an empty map'
  )

  for (const mapName of ['srsCards', 'exerciseCards', 'conjugationCards']) {
    assert.match(
      userProgress,
      new RegExp(`const\\s+${mapName}\\s*=\\s*prev\\.${mapName}\\s*\\|\\|\\s*\\{\\}`),
      `UserProgressContext must default missing ${mapName} before optimistic updates`
    )
  }

  assert.match(
    verbList,
    /const\s+cardMap\s*=\s*conjugationCards\s*\|\|\s*\{\}/,
    'VerbListSection must default missing conjugationCards to an empty map'
  )

  assert.match(
    exerciseSection,
    /const\s+cardMap\s*=\s*cards\s*\|\|\s*\{\}/,
    'ExerciseSection must default missing exercise cards to an empty map when building the queue'
  )
  assert.match(
    exerciseSection,
    /note=\{exerciseNotes\?\.\[exerciseKey\]\s*\|\|\s*null\}/,
    'ExerciseSection must tolerate missing exerciseNotes when a theme opens'
  )
  assert.match(
    exerciseSection,
    /userAnswerOverride=\{exerciseAnswerOverrides\?\.\[exerciseKey\]\}/,
    'ExerciseSection must tolerate missing exerciseAnswerOverrides when a theme opens'
  )
})

test('course bundle exposes theme verbs as verbList for conjugation consumers', () => {
  const courses = read('../src/routes/courses.js')

  assert.match(
    courses,
    /verbList:\s*verbsByTheme\.get\(t\.id\)\s*\|\|\s*\[\]/,
    '/api/courses/all must expose theme verbs as theme.verbList, matching the old JS bundle shape'
  )
  assert.doesNotMatch(
    courses,
    /\n\s*verbs:\s*verbsByTheme\.get\(t\.id\)/,
    'theme.verbs is not read by the frontend conjugation views; use theme.verbList'
  )
})

test('course bundle theme vocabIds are vocab ids, not reverse-map theme id arrays', () => {
  const courses = read('../src/routes/courses.js')
  const start = courses.indexOf('vocabIds:')
  assert.notEqual(start, -1, 'course bundle must expose theme.vocabIds')
  const block = courses.slice(start, courses.indexOf('}))', start))

  assert.match(
    block,
    /\.map\(\(\[\s*vid\s*\]\)\s*=>\s*vid\)/,
    'themeIdsByVocab.entries() yields [vocabId, themeIds], so theme.vocabIds must map the first tuple item'
  )
  assert.doesNotMatch(
    block,
    /\.map\(\(\[\s*,\s*vid\s*\]\)\s*=>\s*vid\)/,
    'mapping the second tuple item returns theme-id arrays instead of vocab ids'
  )
})
