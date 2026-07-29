// Behavioral check: import the theme data and replicate the
// WriteAnswer normalize/getAcceptedAnswers logic to confirm the new
// alternatives are accepted for prompts "Пишу по поводу языкового курса."
// and "в завершение".
import theme from '../src/data/courses/pl/themes/theme22-email-zwroty.js'

const splitAnswerAlternatives = (answer) => String(answer || '')
  .split(/\s*\/\s*/)
  .map(a => a.trim())
  .filter(Boolean)

const normalizeAnswer = (str) => String(str || '')
  .split(/\s*\/\s*/)
  .map(part => part
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?…]+$/u, '')
    .trim()
    .toLowerCase())
  .filter(Boolean)
  .join(' / ')

const dedupeAnswers = (answers) => {
  const deduped = []
  const seen = new Set()
  const indexes = new Map()
  answers.forEach(answer => {
    const normalized = normalizeAnswer(answer)
    if (!normalized) return
    if (seen.has(normalized)) return
    seen.add(normalized)
    indexes.set(normalized, deduped.length)
    deduped.push(answer)
  })
  return deduped
}

const getAcceptedAnswers = (exercise) => {
  const answers = Array.isArray(exercise.answers) ? exercise.answers : [exercise.answer]
  return dedupeAnswers(answers.flatMap(answer => {
    const alternatives = splitAnswerAlternatives(answer)
    return alternatives.length > 1 ? [answer, ...alternatives] : [answer]
  }))
}

const exercises = theme.sections
  .filter(s => s.type === 'exercises')
  .flatMap(s => s.exercises)
  .filter(e => e.type === 'write_answer')

const findByPrompt = (prompt) => exercises.find(e => e.prompt === prompt)

const cases = [
  {
    prompt: 'Пишу по поводу языкового курса.',
    accept: [
      'Kontaktuję się w sprawie kursu językowego.',
      'Piszę z powodu kursu językowego.',
      'Piszę z powodu kursu językowego', // no trailing period — the user might omit it
    ],
    reject: [
      'Kontaktuje sie w sprawie kursu jezykowego', // missing diacritics — should NOT pass
    ],
  },
  {
    prompt: 'в завершение',
    accept: ['na zakończenie', 'na koniec'],
    reject: [],
  },
]

let failed = 0
for (const c of cases) {
  const ex = findByPrompt(c.prompt)
  if (!ex) {
    console.error(`MISSING exercise for prompt: ${c.prompt}`)
    failed++
    continue
  }
  const accepted = getAcceptedAnswers(ex)
  const acceptedNorm = accepted.map(normalizeAnswer)
  for (const want of c.accept) {
    if (acceptedNorm.includes(normalizeAnswer(want))) {
      console.log(`OK   [${c.prompt}] accepts: ${want}`)
    } else {
      console.error(`FAIL [${c.prompt}] does NOT accept: ${want}`)
      console.error(`        accepted: ${JSON.stringify(accepted)}`)
      failed++
    }
  }
  for (const nope of c.reject) {
    if (!acceptedNorm.includes(normalizeAnswer(nope))) {
      console.log(`OK   [${c.prompt}] correctly rejects: ${nope}`)
    } else {
      console.error(`FAIL [${c.prompt}] wrongly accepts: ${nope}`)
      failed++
    }
  }
}

console.log(`\n${failed === 0 ? 'PASS' : `FAIL (${failed} failures)`}`)
process.exit(failed > 0 ? 1 : 0)
