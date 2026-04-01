import { useState, useEffect } from 'react'
import { useT } from '../../i18n'
import { speak } from '../../utils/audio'
import { PRONOUNS } from '../../utils/conjugation'
import { THEME01_RU_CONJUGATIONS } from '../../data/courses/fr/themes/theme01-conjugations-ru'
import { VOCAB } from '../../data/courses/fr/vocab'
import { hints as ruHints } from '../../data/courses/fr/hints/ru'
import SpeakerButton from '../common/SpeakerButton'

const vocabByTarget = Object.fromEntries(VOCAB.map(w => [w.target, w]))

export default function ConjugationExercise({ item, onResult, userMnemonics = {}, onSaveMnemonic }) {
  const { t } = useT()
  const [revealed, setRevealed] = useState(false)

  const ruForms = THEME01_RU_CONJUGATIONS[item.verb.infinitive]
  const ruConjugated = ruForms ? ruForms[item.pronounIdx] : ''
  const pronoun = PRONOUNS[item.pronounIdx]
  const prompt = `${pronoun.ru.charAt(0).toUpperCase() + pronoun.ru.slice(1)} ${ruConjugated}`
  const fullAnswer = item.answer

  const vocabEntry = vocabByTarget[item.verb.infinitive]
  const vocabId = vocabEntry?.id
  const defaultHint = vocabId ? ruHints[vocabId] : ''
  const userHint = vocabId ? userMnemonics[vocabId] : ''
  const hint = userHint || defaultHint || ''

  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    setRevealed(false)
    setEditing(false)
  }, [item.key])

  function handleReveal() {
    setRevealed(true)
    speak(fullAnswer)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Badge */}
      <div className="self-end bg-surface border border-border rounded-lg px-3 py-1 text-xs font-semibold text-accent">
        {t('ru_to_fr')}
      </div>

      {/* Prompt */}
      <div className="text-center">
        <div className="text-3xl font-extrabold text-white mb-2">{prompt}</div>
      </div>

      {!revealed ? (
        <button
          onClick={handleReveal}
          className="w-full max-w-sm py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 transition-opacity"
        >
          {t('study_tap_reveal')}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="text-text-muted text-sm">{t('correct_answer')}:</div>
          <div className="flex items-center gap-2">
            <span className="text-white text-2xl font-bold">{fullAnswer}</span>
            <SpeakerButton text={fullAnswer} size="sm" />
          </div>

          {/* Mnemonic section */}
          {(hint || vocabId) && (
            <div className="w-full max-w-sm mt-1">
              {!editing ? (
                <div
                  onClick={() => { setEditing(true); setEditText(userHint || defaultHint || '') }}
                  className="bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/20 rounded-xl p-3 px-4 cursor-pointer hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-accent font-bold uppercase tracking-wide">{t('memory_hook')}</span>
                    <span className="text-[10px] text-white/30">&#9998;</span>
                  </div>
                  {hint ? (
                    <div className="text-sm text-text-muted leading-relaxed">{hint}</div>
                  ) : (
                    <div className="text-sm text-white/20 italic">{t('mnemonic_placeholder')}</div>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/40 rounded-xl p-3 px-4">
                  <div className="text-[11px] text-accent font-bold uppercase tracking-wide mb-1.5">{t('your_mnemonic')}</div>
                  <textarea
                    autoFocus
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white resize-none focus:outline-none focus:border-accent/50"
                    placeholder={t('mnemonic_placeholder')}
                  />
                  <div className="flex gap-2 mt-2 justify-end">
                    <button
                      onClick={() => setEditing(false)}
                      className="px-3 py-1 text-xs text-text-muted hover:text-white transition-colors"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={() => {
                        if (onSaveMnemonic && vocabId) {
                          onSaveMnemonic(vocabId, editText.trim())
                        }
                        setEditing(false)
                      }}
                      className="px-3 py-1 text-xs font-bold text-accent bg-accent/10 border border-accent/30 rounded-lg hover:bg-accent/20 transition-colors"
                    >
                      {t('save_mnemonic')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-text-muted mt-2">{t('study_how_well')}</div>
          <div className="flex gap-3">
            <button
              onClick={() => onResult(3)}
              className="px-8 py-3 rounded-xl font-bold text-green-400 border border-green-400/40 hover:bg-green-400/10 transition-colors"
            >
              {t('rating_easy')}
            </button>
            <button
              onClick={() => onResult(2)}
              className="px-8 py-3 rounded-xl font-bold text-blue-400 border border-blue-400/40 hover:bg-blue-400/10 transition-colors"
            >
              {t('rating_good')}
            </button>
            <button
              onClick={() => onResult(1)}
              className="px-8 py-3 rounded-xl font-bold text-orange-400 border border-orange-400/40 hover:bg-orange-400/10 transition-colors"
            >
              {t('rating_hard')}
            </button>
            <button
              onClick={() => onResult(0)}
              className="px-8 py-3 rounded-xl font-bold text-red-400 border border-red-400/40 hover:bg-red-400/10 transition-colors"
            >
              {t('rating_again')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
