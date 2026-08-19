import { useEffect, useMemo, useState } from 'react'
import { useT } from '../../i18n'
import { speak } from '../../utils/audio'
import { useSpeechLang } from '../../hooks/useSpeechLang'
import { PRONOUNS, themeFormType } from '../../utils/conjugation'
import { useCourseData } from '../../lib/courseData'
import { useSettings } from '../../stores/SettingsContext'
import { useProgress } from '../../stores/UserProgressContext'
import { useAuth } from '../../stores/AuthContext'
import { conjugationPromptOverridesApi, conjugationMnemonicsApi } from '../../api/client'
import SpeakerButton from '../common/SpeakerButton'
import ExerciseNotePanel from '../themes/exercises/ExerciseNotePanel'

// Catch-all theme for notes on cards that belong to no specific theme
// (e.g. the un-scoped /learn conjugation session).
const GENERAL_NOTE_THEME = 'fr_conjugation_general'

export default function ConjugationExercise({ item, formType = 'aff', themeId = null, onResult, userMnemonics = {}, onSaveMnemonic }) {
  const { t } = useT()
  const { settings } = useSettings()
  const { isAuthenticated } = useAuth()
  const speechLang = useSpeechLang()
  const { exerciseNotes, saveExerciseNote, clearExerciseNote } = useProgress()
  const course = useCourseData()
  const vocabByTarget = useMemo(
    () => Object.fromEntries(course.vocab.map(w => [w.target, w])),
    [course.vocab]
  )
  const [revealed, setRevealed] = useState(false)

  // Russian gloss forms come from theme_conjugation, exposed as
  // conjugationsByTheme[themeId][infinitive] = [6 forms]. Prefer the
  // active theme's table; fall back to a merged view so the un-scoped
  // /learn session (themeId === null) and themes that carry verbs but
  // no table of their own still get a prompt.
  //
  // The merged view is filtered by form type: theme02's table holds
  // negative glosses, and mixing it into an affirmative drill would
  // prompt "Я не говорю" for the answer "je parle".
  const ruFormsByInfinitive = useMemo(() => {
    const byTheme = course.conjugationsByTheme || {}
    const merged = {}
    for (const [id, table] of Object.entries(byTheme)) {
      if (themeFormType(id) !== formType) continue
      Object.assign(merged, table)
    }
    return { scoped: (themeId && byTheme[themeId]) || {}, merged }
  }, [course.conjugationsByTheme, themeId, formType])

  const infinitive = item.verb.infinitive
  const ruForms = ruFormsByInfinitive.scoped[infinitive] || ruFormsByInfinitive.merged[infinitive]
  const ruConjugated = ruForms ? ruForms[item.pronounIdx] : ''
  const pronoun = PRONOUNS[item.pronounIdx]
  const subject = pronoun.ru.charAt(0).toUpperCase() + pronoun.ru.slice(1)
  // theme_conjugation only carries gloss tables for themes 01/02, so verbs
  // introduced later (themes 07/08) have no per-person Russian form. Fall
  // back to the infinitive's translation from theme_verb.ru — still a
  // answerable prompt, instead of a bare pronoun with a blank after it.
  const fullAnswer = item.answer

  const vocabEntry = vocabByTarget[item.verb.infinitive]
  const vocabId = vocabEntry?.id
  const builtinHint = (vocabEntry && (vocabEntry.hint || course.hintsByVocab[vocabId])) || ''
  // Per-cell mnemonic override joined into the bundle by /api/courses
  // as conjugationMnemonicsByTheme[themeId][infinitive][pronounIdx].
  // The resolution chain matches the server-side comment on
  // user_conjugation_mnemonic:
  //   1. user_conjugation_mnemonic[theme,verb,pronoun,lang]  (cell-level)
  //   2. user_mnemonic[vocab_id]                            (verb-wide)
  //   3. vocab_hint[vocab_id, lang]                         (seed)
  // The local mnemonicOverride state layers on top — set by the
  // inline editor, persists for the session, and is rehydrated by
  // the next bundle fetch. Cell-level mnemonics are scoped to the
  // active theme; the un-scoped /learn session (themeId === null)
  // falls back to the verb-wide path, which is the right behaviour
  // (an un-scoped drill has no specific cell to attach to).
  const cellMnemonic = (themeId && course.conjugationMnemonicsByTheme?.[themeId]?.[infinitive]?.[item.pronounIdx]) || ''
  const [mnemonicOverride, setMnemonicOverride] = useState(null)
  const effectiveCellMnemonic = mnemonicOverride !== null ? mnemonicOverride : cellMnemonic
  const hint = effectiveCellMnemonic
    || userMnemonics[vocabId]
    || builtinHint

  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  // Local prompt override. Hydrated from the bundle (the server already
  // injects user rows into conjugationsByTheme), but also settable from
  // the inline edit field so the UI can react instantly. A real save
  // hits /api/conjugation-prompt-overrides and refetches the bundle
  // so other clients / page reloads see the same value.
  const [promptOverride, setPromptOverride] = useState(null)
  const [promptEditing, setPromptEditing] = useState(false)
  const [promptDraft, setPromptDraft] = useState('')
  const [promptSaving, setPromptSaving] = useState(false)
  const [mnemonicSaving, setMnemonicSaving] = useState(false)

  // Reset all per-card local state when the card changes so a leftover
  // override from the previous card doesn't bleed into the next one.
  useEffect(() => {
    setRevealed(false)
    setEditing(false)
    setNoteOpen(false)
    setPromptOverride(null)
    setPromptEditing(false)
    setPromptDraft('')
    setPromptSaving(false)
    setMnemonicOverride(null)
    setMnemonicSaving(false)
  }, [item.key])

  const noteThemeId = themeId || GENERAL_NOTE_THEME
  // Notes are namespaced by theme to match the write-exercise flow in
  // ExerciseSection and TrainingPage (which read `exerciseNotes[themeId:key]`
  // and save under the same composite). Without the prefix, saveExerciseNote
  // would write to `exerciseNotes[item.key]` while the read happens at
  // `exerciseNotes[${noteThemeId}:${item.key}]` — the dict lookup misses
  // and the saved note appears empty on the next reveal.
  const noteKey = `${noteThemeId}:${item.key}`
  const note = exerciseNotes?.[noteKey] || null

  function handleReveal() {
    setRevealed(true)
    speak(fullAnswer, speechLang)
  }

  function startPromptEdit() {
    setPromptDraft(promptOverride || ruConjugated)
    setPromptEditing(true)
  }

  function cancelPromptEdit() {
    setPromptEditing(false)
    setPromptDraft('')
  }

  async function savePromptEdit() {
    const trimmed = promptDraft.trim()
    if (!trimmed || trimmed === (promptOverride || ruConjugated)) {
      // Empty / unchanged: treat as cancel.
      cancelPromptEdit()
      return
    }
    setPromptOverride(trimmed) // optimistic
    setPromptEditing(false)
    if (!isAuthenticated) {
      // Anonymous users get the local-only override; it lives for the
      // session and disappears on the next bundle refetch. That's the
      // honest contract — login to persist.
      setPromptDraft('')
      return
    }
    setPromptSaving(true)
    try {
      await conjugationPromptOverridesApi.save({
        themeId: themeId || GENERAL_NOTE_THEME,
        infinitive,
        pronounIdx: item.pronounIdx,
        lang: settings.nativeLang,
        text: trimmed,
      })
    } catch (err) {
      console.error('Failed to save prompt override:', err)
      // Roll back the optimistic update so the user sees their input
      // didn't actually land.
      setPromptOverride(null)
    } finally {
      setPromptSaving(false)
      setPromptDraft('')
    }
  }

  // Save a cell-level mnemonic override. Themes that drill pronoun ×
  // verb (fr_theme01, pl_theme*) get a per-cell mnemonic; the un-scoped
  // /learn session (themeId === null) has no specific cell to attach
  // to, so it falls back to the verb-wide user_mnemonic via the
  // onSaveMnemonic prop. Anonymous users get the local-only override
  // (lives for the session, disappears on next bundle refetch) — the
  // same honest contract the prompt editor uses.
  async function saveCellMnemonic(text) {
    const trimmed = (text || '').trim()
    const baseline = mnemonicOverride !== null ? mnemonicOverride : cellMnemonic
    if (trimmed === baseline) {
      setEditing(false)
      return
    }
    if (!themeId) {
      // No theme scope — write to the verb-wide user_mnemonic table
      // (legacy contract; still used by /learn).
      if (onSaveMnemonic && vocabId) onSaveMnemonic(vocabId, trimmed)
      setEditing(false)
      return
    }
    // Empty + scoped: clear the cell-level override. The save() API
    // rejects empty text, so use remove() instead.
    if (!trimmed) {
      setMnemonicOverride('')
      setEditing(false)
      if (!isAuthenticated) return
      try {
        await conjugationMnemonicsApi.remove({
          themeId,
          infinitive,
          pronounIdx: item.pronounIdx,
          lang: settings.nativeLang,
        })
      } catch (err) {
        console.error('Failed to clear cell mnemonic:', err)
        setMnemonicOverride(baseline || null)
      }
      return
    }
    setMnemonicOverride(trimmed) // optimistic
    setEditing(false)
    if (!isAuthenticated) return
    setMnemonicSaving(true)
    try {
      await conjugationMnemonicsApi.save({
        themeId,
        infinitive,
        pronounIdx: item.pronounIdx,
        lang: settings.nativeLang,
        text: trimmed,
      })
    } catch (err) {
      console.error('Failed to save cell mnemonic:', err)
      // Roll back so the user sees their input didn't actually land.
      setMnemonicOverride(baseline || null)
    } finally {
      setMnemonicSaving(false)
    }
  }

  const effectiveRuConjugated = promptOverride || ruConjugated
  const isPromptOverridden = !!promptOverride && promptOverride !== ruConjugated

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Top bar: RU → FR pill on the left, Notes pill on the right.
          The Notes pill is the single entry point to the per-card
          ExerciseNotePanel — the panel is rendered below the prompt
          when open, regardless of whether the card is face-down or
          face-up, so the user can jot a note before answering, after
          answering, or after a break. */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="bg-surface border border-border rounded-lg px-3 py-1 text-xs font-semibold text-accent">
          {t('ru_to_fr')}
        </div>
        <button
          type="button"
          onClick={() => setNoteOpen(open => !open)}
          aria-pressed={noteOpen}
          title={note
            ? t('edit_exercise_note', 'Редактировать заметку')
            : t('add_exercise_note', 'Добавить заметку')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold border transition-colors ${
            note
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/40 hover:bg-amber-500/25'
              : 'bg-surface text-accent border-border hover:border-accent/40'
          }`}
        >
          <span aria-hidden="true">📝</span>
          <span>{t('notes_pill', 'Notes')}</span>
        </button>
      </div>

      {/* Prompt — the conjugated form after the pronoun is editable on
          click. The pronoun prefix ("Я", "Ты", ...) stays as a static
          marker because it's structural, not a translation choice. */}
      <div className="text-center">
        <div className="text-3xl font-extrabold text-white mb-2">
          <span>{subject} </span>
          {ruConjugated ? (
            promptEditing ? (
              <span className="inline-flex flex-col items-center gap-2 align-middle">
                <input
                  autoFocus
                  value={promptDraft}
                  onChange={e => setPromptDraft(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      savePromptEdit()
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      cancelPromptEdit()
                    }
                  }}
                  aria-label={t('edit_prompt_label', 'Edit conjugation prompt')}
                  className="bg-white/10 border border-accent/40 rounded-lg px-3 py-1 text-2xl font-extrabold text-white focus:outline-none focus:border-accent"
                />
                <span className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={cancelPromptEdit}
                    className="px-2 py-1 rounded text-text-muted hover:text-white transition-colors"
                  >
                    {t('cancel', 'Отмена')}
                  </button>
                  <button
                    type="button"
                    onClick={savePromptEdit}
                    disabled={promptSaving}
                    className="px-2 py-1 rounded font-bold text-accent bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-colors disabled:opacity-50"
                  >
                    {t('save', 'Сохранить')}
                  </button>
                </span>
              </span>
            ) : (
              <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 align-middle">
                <button
                  type="button"
                  onClick={startPromptEdit}
                  title={t('edit_prompt_label', 'Edit conjugation prompt')}
                  className={`underline decoration-dotted decoration-2 underline-offset-4 hover:decoration-solid transition-colors ${
                    isPromptOverridden ? 'text-amber-400' : 'text-white hover:text-accent'
                  }`}
                >
                  {effectiveRuConjugated}
                </button>
                <button
                  type="button"
                  onClick={startPromptEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent hover:bg-accent/20 transition-colors"
                >
                  <span aria-hidden="true">&#9998;</span>
                  <span>{t('edit_prompt_label', 'Edit conjugation prompt')}</span>
                </button>
              </span>
            )
          ) : (
            <span className="text-text-muted">({item.verb.ru || infinitive})</span>
          )}
        </div>
        {isPromptOverridden && (
          <div className="text-[10px] text-amber-400/80 uppercase tracking-wide">
            {t('prompt_overridden', 'Кастомная подсказка')}
          </div>
        )}
      </div>

      {/* Notes panel (opened from the top-right Notes pill). Rendered
          outside the reveal branch so the user can jot a note before
          answering, after answering, or even after a long session
          break — the pill is the single entry point. */}
      {noteOpen && (
        <div className="w-full max-w-sm">
          <ExerciseNotePanel
            existingNote={note}
            exerciseKey={noteKey}
            themeId={noteThemeId}
            onSave={saveExerciseNote}
            onDelete={clearExerciseNote}
            onClose={() => setNoteOpen(false)}
          />
        </div>
      )}

      {!revealed ? (
        <button
          onClick={handleReveal}
          className="w-full max-w-sm py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 transition-opacity"
        >
          {t('study_tap_reveal')}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3 animate-fade-in w-full">
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
                  onClick={() => {
                    // Seed the textarea with whatever's currently
                    // displayed: cell-level if present, else verb-wide
                    // user mnemonic, else the seed vocab_hint. The
                    // user can edit on top of any of these layers.
                    setEditing(true)
                    setEditText(
                      (mnemonicOverride !== null ? mnemonicOverride : cellMnemonic)
                      || userMnemonics[vocabId]
                      || builtinHint
                      || ''
                    )
                  }}
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
                      onClick={() => saveCellMnemonic(editText)}
                      disabled={mnemonicSaving}
                      className="px-3 py-1 text-xs font-bold text-accent bg-accent/10 border border-accent/30 rounded-lg hover:bg-accent/20 transition-colors disabled:opacity-50"
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
