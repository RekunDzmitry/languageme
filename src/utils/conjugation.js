const PRONOUNS = [
  { fr: 'je', ru: 'я', ending: 'e' },
  { fr: 'tu', ru: 'ты', ending: 'es' },
  { fr: 'il', ru: 'он', ending: 'e' },
  { fr: 'nous', ru: 'мы', ending: 'ons' },
  { fr: 'vous', ru: 'вы', ending: 'ez' },
  { fr: 'ils', ru: 'они', ending: 'ent' },
]

export { PRONOUNS }

export function conjCardKey(verb, pronounIdx, formType = 'aff') {
  const tense = verb.participePasse ? 'pc' : 'pr'
  return `conj:${verb.infinitive}:${tense}:${formType}:${pronounIdx}`
}

const VOWELS = 'aeéèêëiîïoôuûùüyhæœàâ'

function startsWithVowelOrH(word) {
  return VOWELS.includes(word[0].toLowerCase()) || word[0].toLowerCase() === 'h'
}

// Verbs where the final consonant doubles before silent endings
const DOUBLE_T_VERBS = ['jeter', 'rejeter', 'projeter']
const DOUBLE_L_VERBS = ['appeler', 'rappeler', 'épeler', 'renouveler']

// Silent ending positions: je, tu, il/elle, ils/elles (indices 0,1,2,5)
const SILENT = [0, 1, 2, 5]

export function conjugateEr(infinitive) {
  const stem = infinitive.slice(0, -2)
  const isGer = infinitive.endsWith('ger')
  const isCer = infinitive.endsWith('cer')
  const isDoubleT = DOUBLE_T_VERBS.includes(infinitive)
  const isDoubleL = DOUBLE_L_VERBS.includes(infinitive)
  // e→è: penultimate e before consonant+er (acheter, lever, mener, peser, geler…)
  // but NOT doubling verbs
  const eToGrave = !isDoubleT && !isDoubleL && /e[bcdfghjklmnpqrstvwxz]er$/.test(infinitive)
  // é→è: last accented é before consonant(s)+er (préférer, espérer, céder…)
  const eAcuteToGrave = /é[bcdfghjklmnpqrstvwxz]+er$/.test(infinitive)
  // -yer → -ier before silent endings (employer, envoyer, essayer, nettoyer…)
  const isYer = infinitive.endsWith('yer')

  return PRONOUNS.map((p, i) => {
    let s = stem
    const ending = p.ending
    const isSilent = SILENT.includes(i)

    if (isSilent) {
      if (isDoubleT) {
        s = stem + stem.slice(-1) // jet → jett
      } else if (isDoubleL) {
        s = stem + stem.slice(-1) // appel → appell
      } else if (eToGrave) {
        s = stem.replace(/e([bcdfghjklmnpqrstvwxz])$/, 'è$1')
      } else if (eAcuteToGrave) {
        s = stem.replace(/é([bcdfghjklmnpqrstvwxz]+)$/, 'è$1')
      } else if (isYer) {
        s = stem.replace(/y$/, 'i')
      }
    }

    // -ger verbs: insert e before -ons (nous mangeons)
    if (isGer && i === 3) {
      s = stem + 'e'
    }

    // -cer verbs: c→ç before -ons (nous commençons)
    if (isCer && i === 3) {
      s = stem.slice(0, -1) + 'ç'
    }

    const conjugated = s + ending

    // Elision: je → j' before vowel/h
    let pronoun = p.fr
    if (i === 0 && startsWithVowelOrH(conjugated)) {
      pronoun = "j'"
      return `${pronoun}${conjugated}`
    }

    return `${pronoun} ${conjugated}`
  })
}

export function buildSessionQueue(conjugationCards, verbList, formType = 'aff') {
  const due = []
  const unseen = []

  for (const verb of verbList) {
    for (let pi = 0; pi < 6; pi++) {
      const key = conjCardKey(verb, pi, formType)
      const card = conjugationCards[key]
      if (!card || (card.reps === 0 && !card.lastReviewed)) {
        unseen.push({ verb, pronounIdx: pi, key })
      } else if (card.due <= Date.now()) {
        due.push({ verb, pronounIdx: pi, key })
      }
    }
  }

  // Add up to 5 new verb×pronoun combos, introducing all 6 forms of a verb before next
  const newItems = []
  const seenVerbs = new Set()
  for (const item of unseen) {
    if (newItems.length >= 6 && !seenVerbs.has(item.verb.infinitive)) {
      // Already have 6+ items and this is a new verb — check if we have room
      if (newItems.length >= 12) break
    }
    seenVerbs.add(item.verb.infinitive)
    newItems.push(item)
    if (seenVerbs.size >= 2 && newItems.length >= 12) break
  }

  // Limit new items: at most 2 verbs (12 forms) if no due, otherwise 1 verb (6 forms)
  const maxNew = due.length === 0 ? 12 : 6
  const selected = newItems.slice(0, maxNew)

  const queue = [...due, ...selected]

  return queue.map(item => {
    const forms = conjugateEr(item.verb.infinitive)
    const answer = formType === 'neg'
      ? buildNegativeForm(forms[item.pronounIdx])
      : forms[item.pronounIdx]
    return {
      verb: item.verb,
      pronounIdx: item.pronounIdx,
      key: item.key,
      answer,
    }
  })
}

function buildNegativeForm(affirmativeForm) {
  // "je parle" → "je ne parle pas"
  // "j'aime" → "je n'aime pas"
  const startsWithJ = affirmativeForm.startsWith("j'")
  const verbPart = startsWithJ ? affirmativeForm.slice(2) : affirmativeForm.split(' ').slice(1).join(' ')
  const pronoun = startsWithJ ? "j'" : affirmativeForm.split(' ')[0]
  const neForm = startsWithJ ? "n'" : 'ne'
  return `${pronoun} ${neForm} ${verbPart} pas`
}
