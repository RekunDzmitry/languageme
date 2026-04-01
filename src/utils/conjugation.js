const PRONOUNS = [
  { fr: 'je', ru: 'я', ending: 'e' },
  { fr: 'tu', ru: 'ты', ending: 'es' },
  { fr: 'il', ru: 'он', ending: 'e' },
  { fr: 'nous', ru: 'мы', ending: 'ons' },
  { fr: 'vous', ru: 'вы', ending: 'ez' },
  { fr: 'ils', ru: 'они', ending: 'ent' },
]

export { PRONOUNS }

export function conjCardKey(verb, pronounIdx) {
  const tense = verb.participePasse ? 'pc' : 'pr'
  return `conj:${verb.infinitive}:${tense}:${pronounIdx}`
}

const VOWELS = 'aeéèêëiîïoôuûùüyhæœàâ'

function startsWithVowelOrH(word) {
  return VOWELS.includes(word[0].toLowerCase()) || word[0].toLowerCase() === 'h'
}

export function conjugateEr(infinitive) {
  const stem = infinitive.slice(0, -2)
  const isGer = infinitive.endsWith('ger')
  const isCer = infinitive.endsWith('cer')
  const isAcheter = infinitive === 'acheter'
  const isEssayer = infinitive === 'essayer'

  return PRONOUNS.map((p, i) => {
    let s = stem
    let ending = p.ending

    // acheter: e→è for je/tu/il/ils (indices 0,1,2,5)
    if (isAcheter && [0, 1, 2, 5].includes(i)) {
      s = 'achèt'
    }

    // essayer: y→i for je/tu/il/ils
    if (isEssayer && [0, 1, 2, 5].includes(i)) {
      s = 'essai'
    }

    // -ger verbs: insert e before -ons
    if (isGer && i === 3) {
      s = stem + 'e'
    }

    // -cer verbs: c→ç before -ons
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

export function buildSessionQueue(conjugationCards, verbList) {
  const due = []
  const unseen = []

  for (const verb of verbList) {
    for (let pi = 0; pi < 6; pi++) {
      const key = conjCardKey(verb, pi)
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
    return {
      verb: item.verb,
      pronounIdx: item.pronounIdx,
      key: item.key,
      answer: forms[item.pronounIdx],
    }
  })
}
