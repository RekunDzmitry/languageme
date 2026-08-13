import { useMemo } from 'react'
import { useT } from '../../../i18n'
import { PRONOUNS, conjCardKey, conjugateEr, themeFormType } from '../../../utils/conjugation'

// Per-verb conjugation notes picker.
//
// Triggered from the VerbGrid in the TrainingPage theme breakdown: the
// "Notes" column on the right of the verb table shows a button that
// opens this picker. The picker lists the 6 conjugation cells for the
// verb (je / tu / il / nous / vous / ils), each annotated with the
// current Russian prompt and a marker for whether the user has a
// note on that cell. Clicking a row hands off to ExerciseNoteModal
// (the same modal the in-session exercise uses) so the editing
// surface is consistent.
//
// Two notes on the prompt rendering here:
//   1. We use the form TypeScript at construction time via
//      conjugateEr() — this matches the in-session "Я завершаю"
//      display so the picker shows exactly what the user drilled.
//   2. The negative form (theme02) wraps the affirmative in ne...pas
//      to mirror ConjugationSession. We keep the form-2 display
//      consistent with the in-session exercise.
export default function ConjugationNotesPicker({
  verb,
  themeId,
  formType = 'aff',
  exerciseNotes,                       // { [noteKey]: { content, ... } }
  conjugationForms,                    // { [infinitive]: [6 forms] } | null
  onSelectCell,                        // (exerciseKey, prompt) => void
  onClose,
}) {
  const { t } = useT()
  const pronoun = (i) => PRONOUNS[i].ru.charAt(0).toUpperCase() + PRONOUNS[i].ru.slice(1)

  // The 6 cell keys for this verb match what ConjugationExercise builds
  // and what UserProgressContext.saveExerciseNote writes under
  // (themeId + ':' + conjCardKey). Building them here so the picker can
  // look up note state without reaching into the store.
  const cells = useMemo(() => {
    const out = []
    const sessionForms = (() => {
      // Mirror the ConjugationSession.buildSessionQueue logic: derive
      // the form the in-session exercise would prompt with. If the
      // bundle had a forms table, prefer it (so the user override
      // shows up). Otherwise fall back to the JS conjugator.
      const fromTable = conjugationForms && conjugationForms[verb.infinitive]
      if (Array.isArray(fromTable) && fromTable.length === 6) return fromTable
      const aff = conjugateEr(verb.infinitive)
      if (formType === 'neg') {
        return aff.map(buildNegative)
      }
      return aff
    })()
    for (let pi = 0; pi < 6; pi++) {
      const key = conjCardKey(verb, pi, formType)
      const noteKey = `${themeId || 'fr_conjugation_general'}:${key}`
      out.push({
        pronounIdx: pi,
        pronoun: pronoun(pi),
        form: sessionForms[pi] || '',
        key,
        noteKey,
        hasNote: !!exerciseNotes?.[noteKey],
        // Short snippet of the note for the row preview. Truncated so
        // a long note doesn't break the row layout.
        snippet: exerciseNotes?.[noteKey]?.content?.slice(0, 80) || '',
      })
    }
    return out
  }, [verb, themeId, formType, exerciseNotes, conjugationForms])

  const notesCount = cells.filter(c => c.hasNote).length

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-white">
            {verb.infinitive}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close', 'Закрыть')}
            className="w-7 h-7 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="text-xs text-text-muted mb-3">
          {t('verb_notes_subtitle', 'Заметки по спряжению')} · {notesCount}/6
        </div>
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
          {cells.map(cell => (
            <button
              key={cell.pronounIdx}
              type="button"
              onClick={() => onSelectCell(cell.key, `${cell.pronoun} ${cell.form}`)}
              className="w-full text-left rounded-lg px-3 py-2 bg-white/[0.04] hover:bg-white/[0.10] border border-transparent hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-xs uppercase tracking-wide w-12">
                  {cell.pronoun}
                </span>
                <span className="text-white text-sm flex-1">
                  {cell.form || <span className="text-text-muted/40">—</span>}
                </span>
                {cell.hasNote ? (
                  <span
                    className="text-amber-400 text-base"
                    title={t('has_note', 'Есть заметка')}
                    aria-label={t('has_note', 'Есть заметка')}
                  >
                    📝
                  </span>
                ) : (
                  <span className="text-text-muted/30 text-base" aria-hidden="true">·</span>
                )}
              </div>
              {cell.hasNote && cell.snippet && (
                <div className="text-[11px] text-text-muted/80 mt-1 line-clamp-2 pl-14">
                  {cell.snippet}
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-4 text-[11px] text-text-muted/70 text-center">
          {t('verb_notes_hint', 'Выберите ячейку, чтобы открыть или создать заметку')}
        </div>
      </div>
    </div>
  )
}

// Mirror ConjugationSession.buildNegativeForm so the picker shows the
// same form the in-session exercise would prompt with. The function
// lives in conjugation.js as a private helper; copy the one-liner
// here to avoid a refactor for a 3-line dep.
function buildNegative(affirmativeForm) {
  const startsWithJ = affirmativeForm.startsWith("j'")
  const verbPart = startsWithJ ? affirmativeForm.slice(2) : affirmativeForm.split(' ').slice(1).join(' ')
  const pronoun = startsWithJ ? "j'" : affirmativeForm.split(' ')[0]
  const neForm = startsWithJ ? "n'" : 'ne'
  return `${pronoun} ${neForm} ${verbPart} pas`
}

// themeFormType is re-exported so callers can pass the same value
// they pass to ConjugationSession if they want. We import but don't
// use it directly — kept available for the (verb, theme) form
// computation the parent could plug in.
void themeFormType
