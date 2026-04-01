import { useState } from 'react'
import SpeakerButton from '../common/SpeakerButton'
import { useProgress } from '../../stores/UserProgressContext'
import { conjCardKey } from '../../utils/conjugation'

const VOWELS = 'aeiouyàâéèêëïîôùûæœ'

function conjugateEr(infinitive) {
  const stem = infinitive.slice(0, -2)
  const startsWithVowel = VOWELS.includes(stem[0]?.toLowerCase())

  let nousForm = stem + 'ons'
  if (infinitive.endsWith('ger')) nousForm = stem + 'eons'
  if (infinitive.endsWith('cer')) nousForm = stem.slice(0, -1) + 'çons'

  return [
    { pronoun: startsWithVowel ? "j'" : 'je', form: stem + 'e' },
    { pronoun: 'tu', form: stem + 'es' },
    { pronoun: 'il/elle', form: stem + 'e' },
    { pronoun: 'nous', form: nousForm },
    { pronoun: 'vous', form: stem + 'ez' },
    { pronoun: 'ils/elles', form: stem + 'ent' },
  ]
}

const AVOIR = [
  { pronoun: "j'", form: 'ai' },
  { pronoun: 'tu', form: 'as' },
  { pronoun: 'il/elle', form: 'a' },
  { pronoun: 'nous', form: 'avons' },
  { pronoun: 'vous', form: 'avez' },
  { pronoun: 'ils/elles', form: 'ont' },
]

const ETRE = [
  { pronoun: 'je', form: 'suis' },
  { pronoun: 'tu', form: 'es' },
  { pronoun: 'il/elle', form: 'est' },
  { pronoun: 'nous', form: 'sommes' },
  { pronoun: 'vous', form: 'êtes' },
  { pronoun: 'ils/elles', form: 'sont' },
]

function conjugatePasseCompose(verb) {
  const aux = verb.auxiliaire === 'être' ? ETRE : AVOIR
  const pp = verb.participePasse
  const isEtre = verb.auxiliaire === 'être'

  return aux.map(({ pronoun, form }) => {
    let participe = pp
    if (isEtre) {
      if (pronoun === 'ils/elles') participe = pp + '(s/es)'
      else if (pronoun === 'nous' || pronoun === 'vous') participe = pp + '(s)'
      else participe = pp + '(e)'
    }
    return { pronoun, form: form + ' ' + participe }
  })
}

function ConjugationDialog({ verb, onClose }) {
  const isPasseCompose = !!verb.participePasse
  const rows = isPasseCompose ? conjugatePasseCompose(verb) : conjugateEr(verb.infinitive)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-surface border border-border rounded-2xl w-full max-w-sm overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-3 bg-accent-glow border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-accent font-bold text-lg">{verb.infinitive}</span>
            <SpeakerButton text={verb.infinitive} size="sm" />
            <span className="text-text-muted text-sm">— {verb.ru}</span>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white bg-transparent border-none cursor-pointer text-xl leading-none p-1"
          >
            ×
          </button>
        </div>

        {isPasseCompose && (
          <div className="px-5 py-2 border-b border-border bg-white/[0.02]">
            <span className="text-xs text-text-muted">
              Вспомогательный глагол: <span className="text-accent font-semibold">{verb.auxiliaire}</span>
              <span className="mx-2">•</span>
              Participe passé: <span className="text-accent font-semibold">{verb.participePasse}</span>
            </span>
          </div>
        )}

        <table className="w-full">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}>
                <td className="px-5 py-2.5 text-text-muted text-sm font-medium w-1/3">{row.pronoun}</td>
                <td className="px-5 py-2.5 text-text-primary font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    {row.form}
                    <SpeakerButton text={`${row.pronoun} ${row.form}`} size="sm" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3 border-t border-border">
          {isPasseCompose ? (
            <p className="text-xs text-text-muted">
              <span className="text-accent font-mono">{verb.auxiliaire}</span>
              <span className="mx-1">+</span>
              <span className="text-accent font-mono">{verb.participePasse}</span>
              {verb.auxiliaire === 'être' && (
                <span className="ml-2">(согласуется с подлежащим)</span>
              )}
            </p>
          ) : (
            <p className="text-xs text-text-muted">
              <span className="text-accent font-mono">{verb.infinitive.slice(0, -2)}</span>
              <span className="text-text-muted font-mono">-er</span>
              <span className="mx-2">→</span>
              окончания: <span className="font-mono text-accent">-e, -es, -e, -ons, -ez, -ent</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function getVerbSrsStatus(conjugationCards, verb) {
  let due = 0, learned = 0, nextDue = null
  for (let pi = 0; pi < 6; pi++) {
    const card = conjugationCards[conjCardKey(verb, pi)]
    if (!card || card.reps === 0) continue
    learned++
    if (card.due <= Date.now()) {
      due++
    } else if (!nextDue || card.due < nextDue) {
      nextDue = card.due
    }
  }
  return { due, learned, nextDue }
}

function formatDue(ts) {
  const now = Date.now()
  const diff = ts - now
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'скоро'
  if (hours < 24) return `${hours}ч`
  const days = Math.floor(hours / 24)
  return `${days}д`
}

export default function VerbListSection({ verbs }) {
  const [selected, setSelected] = useState(null)
  const { conjugationCards } = useProgress()

  if (!verbs?.length) return null

  const isPasseCompose = !!verbs[0]?.participePasse

  // Group verbs by their group field, preserving order
  const groups = []
  const seen = new Set()
  for (const v of verbs) {
    const g = v.group || 'Другие'
    if (!seen.has(g)) {
      seen.add(g)
      groups.push({ name: g, verbs: [] })
    }
    groups.find(gr => gr.name === g).verbs.push(v)
  }

  return (
    <>
      <div className="bg-surface border border-border rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-1">
          {isPasseCompose ? 'Глаголы в passé composé' : 'Глаголы 1-й группы (-er)'}
        </h3>
        <p className="text-xs text-text-muted mb-3">Нажмите на глагол, чтобы увидеть спряжение</p>
        <div className="max-h-[28rem] overflow-y-auto pr-1 -mr-1 space-y-4">
          {groups.map(group => (
            <div key={group.name}>
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5 px-1">{group.name}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {group.verbs.map(v => {
                  const status = getVerbSrsStatus(conjugationCards, v)
                  return (
                    <button
                      key={v.infinitive}
                      onClick={() => setSelected(v)}
                      className="flex items-start justify-between gap-1 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-accent-glow border border-transparent hover:border-accent/30 transition-colors cursor-pointer text-left"
                    >
                      <div>
                        <span className="text-accent font-semibold text-sm block">{v.infinitive}</span>
                        <span className="text-text-muted text-xs">{v.ru}</span>
                      </div>
                      {status.learned > 0 && (
                        <div className="flex flex-col items-end shrink-0 mt-0.5">
                          {status.due > 0 ? (
                            <span className="text-[10px] font-medium text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">
                              {status.due}/6
                            </span>
                          ) : status.nextDue ? (
                            <span className="text-[10px] text-text-muted">
                              {formatDue(status.nextDue)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-green-400">✓</span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <ConjugationDialog verb={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
