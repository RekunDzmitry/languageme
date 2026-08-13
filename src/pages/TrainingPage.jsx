import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { exerciseApi } from '../api/client'
import { useProgress } from '../stores/UserProgressContext'
import { useSettings } from '../stores/SettingsContext'
import { useCourseData, getThemeTitle } from '../lib/courseData'
import { filterThemesByPack, getLessonPack, PACK_IDS } from '../data/lessonPacks'
import { getThemeConjugationMastery, getConjugationDueCount, getExerciseMastery, getExerciseDueCountByTheme, getVocabMastery, getVocabDueCount } from '../utils/progress'
import { conjCardKey, PRONOUNS, themeFormType } from '../utils/conjugation'
import ExerciseSection from '../components/themes/ExerciseSection'
import ExerciseNoteModal from '../components/themes/exercises/ExerciseNoteModal'
import VocabNoteModal from '../components/themes/exercises/VocabNoteModal'
import ConjugationNotesPicker from '../components/themes/exercises/ConjugationNotesPicker'
// Polish pronouns for targetLang 'pl'
const PL_PRONOUNS = [
  { pl: 'ja', translation: 'я' },
  { pl: 'ty', translation: 'ты' },
  { pl: 'on/ona/ono', translation: 'он/она/оно' },
  { pl: 'my', translation: 'мы' },
  { pl: 'wy', translation: 'вы' },
  { pl: 'oni/one', translation: 'они' },
]

function formatDueShort(ts) {
  const diff = ts - Date.now()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(1, mins)}м`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}ч`
  const days = Math.floor(hours / 24)
  return `${days}д`
}

function ExerciseGrid({ themeId, exercises, exerciseCards, exerciseNotes, t, onNoteClick }) {
  return (
    <div className="mt-3">
      <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {exercises.map((ex, idx) => {
          const key = `${themeId}:${idx}`
          const card = exerciseCards[key]
          const note = exerciseNotes?.[key]
          let color = 'bg-white/[0.06]'
          let title = t('status_new')
          let dueLabel = null
          let isDue = false
          if (card && card.reps > 0) {
            if (card.reps >= 3) {
              color = 'bg-green-500/60'
              title = t('status_mastered')
            } else {
              color = 'bg-amber-500/60'
              title = t('status_learning')
            }
            if (card.due <= Date.now()) {
              isDue = true
              dueLabel = t('cards_now')
            } else {
              dueLabel = formatDueShort(card.due)
            }
          }
          const displayText = ex.prompt?.length > 12 ? ex.prompt.substring(0, 10) + '…' : (ex.prompt || idx + 1)
          const tooltip = `${ex.prompt || ''}${ex.answer ? ` → ${ex.answer}` : ''} · ${title}${note ? ' · 📝' : ''}`
          return (
            <div key={idx} className="flex flex-col items-center gap-0.5" title={tooltip}>
              <button
                onClick={() => onNoteClick(key, ex)}
                className={`relative w-full min-w-[44px] max-w-[80px] h-9 rounded-lg ${color} ${isDue ? 'ring-2 ring-orange-400 animate-pulse' : ''} flex items-center justify-center px-1.5 overflow-hidden text-center leading-tight py-1 group transition-all hover:brightness-125 ${note ? 'ring-1 ring-yellow-400/60' : ''}`}
              >
                <span className="text-[10px] text-white/90 font-medium leading-tight truncate w-full">
                  {displayText}
                </span>
                {note && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />}
              </button>
              {dueLabel && (
                <span className={`text-[8px] leading-tight ${isDue ? 'text-orange-400 font-medium' : 'text-text-muted'}`}>
                  {dueLabel}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-2 px-2 text-[10px] text-text-muted">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-white/[0.06]" /> {t('status_new')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500/60" /> {t('status_learning')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500/60 ring-1 ring-orange-400" /> {t('cards_due_label')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-500/60" /> {t('status_mastered')}</span>
      </div>
    </div>
  )
}

function VocabGrid({ vocabIds, vocab, cards, vocabNotes, t, nativeLang, onNoteClick }) {
  const wordsById = useMemo(() => {
    const map = {}
    for (const w of vocab) map[w.id] = w
    return map
  }, [vocab])

  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {vocabIds.map((id) => {
          const word = wordsById[id]
          const card = cards[id]
          let color = 'bg-white/[0.06]'
          let title = t('status_new')
          let dueLabel = null
          let isDue = false
          if (card && card.reps > 0) {
            if (card.reps >= 3) {
              color = 'bg-green-500/60'
              title = t('status_mastered')
            } else {
              color = 'bg-amber-500/60'
              title = t('status_learning')
            }
            if (card.due <= Date.now()) {
              isDue = true
              dueLabel = t('cards_now')
            } else {
              dueLabel = formatDueShort(card.due)
            }
          }
          const native = word?.translations?.[nativeLang] || word?.translations?.ru || ''
          const label = native || word?.target || id
          const display = label.length > 14 ? label.slice(0, 12) + '…' : label
          const note = vocabNotes?.[id]
          const tooltip = `${native || word?.target || id}${word?.target ? ` → ${word.target}` : ''} · ${title}${note ? ' · 📝' : ''}`
          return (
            <div key={id} className="flex flex-col items-center gap-0.5" title={tooltip}>
              <button
                onClick={() => onNoteClick?.(id, word)}
                className={`relative w-full h-9 rounded-lg ${color} ${isDue ? 'ring-2 ring-orange-400 animate-pulse' : ''} ${note ? 'ring-1 ring-yellow-400/60' : ''} flex items-center justify-center text-[11px] text-white/90 font-medium px-1.5 overflow-hidden text-center leading-tight hover:brightness-125 transition-all`}
              >
                {display}
                {note && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />}
              </button>
              {dueLabel && (
                <span className={`text-[8px] leading-tight ${isDue ? 'text-orange-400 font-medium' : 'text-text-muted'}`}>
                  {dueLabel}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-2 px-2 text-[10px] text-text-muted">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-white/[0.06]" /> {t('status_new')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500/60" /> {t('status_learning')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500/60 ring-1 ring-orange-400" /> {t('cards_due_label')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-500/60" /> {t('status_mastered')}</span>
      </div>
    </div>
  )
}

function VerbGrid({
  theme,
  conjugationCards,
  t,
  formType,
  pronounLabels,
  exerciseNotes,
  onVerbNotesClick,
}) {
  const verbs = theme.verbList || []
  const themeIdForKeys = theme.id

  // Group verbs by their group field
  const sortedVerbs = useMemo(() =>
    [...verbs].sort((a, b) => a.infinitive.localeCompare(b.infinitive, 'fr')),
    [verbs]
  )

  // For each verb, count how many of its 6 cells have a user note.
  // The note key is `${themeId}:${conjCardKey(verb, pi, formType)}`
  // — the same composite ConjugationExercise.jsx uses when saving.
  // Recomputing per render is fine: this is a max-6 lookup per row.
  const notesCountByVerb = useMemo(() => {
    const map = new Map()
    if (!exerciseNotes) return map
    for (const verb of sortedVerbs) {
      let count = 0
      for (let pi = 0; pi < 6; pi++) {
        const key = `${themeIdForKeys}:${conjCardKey(verb, pi, formType)}`
        if (exerciseNotes[key]) count++
      }
      if (count > 0) map.set(verb.infinitive, count)
    }
    return map
  }, [sortedVerbs, exerciseNotes, themeIdForKeys, formType])

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-text-muted font-medium py-1 px-2">{t('learn_verbs')}</th>
            {pronounLabels.map(p => (
              <th key={p} className="text-center text-text-muted font-medium py-1 px-1.5 min-w-[36px]">{p}</th>
            ))}
            <th className="text-center text-text-muted font-medium py-1 px-2 min-w-[60px]">
              {t('verb_notes_column', 'Заметки')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedVerbs.map((verb) => {
            const noteCount = notesCountByVerb.get(verb.infinitive) || 0
            return (
              <tr key={verb.infinitive} className="border-t border-white/[0.05]">
                <td className="py-1.5 px-2 text-white font-medium">{verb.infinitive}</td>
                {pronounLabels.map((_, pi) => {
                  const key = conjCardKey(verb, pi, formType)
                  const card = conjugationCards[key]
                  let color = 'bg-white/[0.06]' // gray — not started
                  let title = t('status_new')
                  let dueLabel = null
                  let isDue = false
                  if (card && card.reps > 0) {
                    if (card.reps >= 3) {
                      color = 'bg-green-500/60'
                      title = t('status_mastered')
                    } else {
                      color = 'bg-amber-500/60'
                      title = t('status_learning')
                    }
                    // Show due info for any started card
                    if (card.due <= Date.now()) {
                      isDue = true
                      dueLabel = t('cards_now')
                    } else {
                      dueLabel = formatDueShort(card.due)
                    }
                  }
                  return (
                    <td key={pi} className="py-1.5 px-1.5 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <div
                          className={`w-5 h-5 rounded ${color} ${isDue ? 'ring-1 ring-orange-400 animate-pulse' : ''}`}
                          title={title}
                        />
                        {dueLabel && (
                          <span className={`text-[8px] leading-tight ${isDue ? 'text-orange-400 font-medium' : 'text-text-muted'}`}>
                            {dueLabel}
                          </span>
                        )}
                      </div>
                    </td>
                  )
                })}
                <td className="py-1.5 px-2 text-center">
                  <button
                    type="button"
                    onClick={() => onVerbNotesClick && onVerbNotesClick(verb)}
                    title={noteCount > 0
                      ? t('verb_notes_count', '{n} из 6 ячеек с заметкой').replace('{n}', String(noteCount))
                      : t('verb_notes_open', 'Открыть заметки')}
                    aria-label={t('verb_notes_open', 'Открыть заметки')}
                    data-testid={`verb-notes-${verb.infinitive}`}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                      noteCount > 0
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                        : 'bg-white/[0.04] text-text-muted/60 border border-transparent hover:bg-white/[0.08] hover:text-text-muted'
                    }`}
                  >
                    <span aria-hidden="true">📝</span>
                    <span className="tabular-nums">{noteCount}/6</span>
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 px-2 text-[10px] text-text-muted">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-white/[0.06]" /> {t('status_new')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500/60" /> {t('status_learning')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500/60 ring-1 ring-orange-400" /> {t('cards_due_label')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-500/60" /> {t('status_mastered')}</span>
      </div>
    </div>
  )
}

function EmailTabContent({ emailThemes, navigate }) {
  const exercises = useMemo(() => {
    const result = []
    for (const th of emailThemes) {
      const section = th.sections?.find(s => s.type === 'email_writing')
      if (section?.exercises) {
        section.exercises.forEach(ex => result.push({ ...ex, _themeId: th.id }))
      }
    }
    return result
  }, [emailThemes])

  if (exercises.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-4xl">📧</span>
        <p className="text-text-muted mt-3 text-sm">Ćwiczenia z pisania e-maili pojawią się wkrótce</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {exercises.map((ex, i) => (
        <button
          key={ex.id || i}
          onClick={() => navigate('/email')}
          className="w-full text-left bg-surface border border-border rounded-xl p-4 hover:border-accent/40 transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                {ex.category}
              </span>
              <p className="text-white text-sm font-medium mt-2 leading-relaxed line-clamp-2">
                {ex.scenario || ex.prompt}
              </p>
              <p className="text-text-muted text-xs mt-1.5">
                {ex.minWords}–{ex.maxWords} słów
              </p>
            </div>
            <span className="flex-shrink-0 mt-1 text-text-muted group-hover:text-accent transition-colors text-lg">✍️</span>
          </div>
        </button>
      ))}
      <div className="mt-2 flex justify-center">
        <button
          onClick={() => navigate('/email')}
          className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-colors text-sm"
        >
          Otwórz trening e-maili →
        </button>
      </div>
    </div>
  )
}

export default function TrainingPage() {
  const { conjugationCards, exerciseCards, cards, exerciseNotes, vocabNotes, saveExerciseNote, clearExerciseNote, saveVocabNote, clearVocabNote } = useProgress()
  const course = useCourseData()
  const { settings } = useSettings()
  const targetLang = settings.targetLang
  const activePackId = settings.activePackId
  const activePack = getLessonPack(activePackId, targetLang)
  const themes = filterThemesByPack(course.themes, activePackId, targetLang)
  const vocab = course.vocab
  const { t } = useT()
  const navigate = useNavigate()
  const [expandedThemeId, setExpandedThemeId] = useState(null)
  const [noteModal, setNoteModal] = useState(null)
  const [vocabNoteModal, setVocabNoteModal] = useState(null)
  // { verb, themeId } — verb object + the theme it belongs to, so the
  // picker can resolve theme-scoped data (the conjugation forms table,
  // the note-key namespace) without an external context lookup.
  const [verbNotesVerb, setVerbNotesVerb] = useState(null)
  const [activeTab, setActiveTab] = useState('exercises')

  const isPolish = targetLang === 'pl'


  // User-authored write_answer drills added from email corrections.
  const [userExercises, setUserExercises] = useState([])
  useEffect(() => {
    if (!isPolish) return
    exerciseApi.getUserExercises().then(setUserExercises).catch(() => setUserExercises([]))
  }, [isPolish])

  // Group drills by theme; unattached ones live under the catch-all "pl_other".
  const userExByTheme = useMemo(() => {
    const map = {}
    for (const ue of userExercises) {
      const key = ue.theme_id || 'pl_other'
      ;(map[key] ||= []).push({
        type: 'write_answer',
        prompt: ue.prompt,
        answer: ue.answer,
        hint: ue.hint || undefined,
        category: 'E-mail',
      })
    }
    return map
  }, [userExercises])

  // Merge user drills into each theme's exercises section (appended after the
  // seeded ones so index-based SRS keys stay stable), plus a synthetic
  // "Moje ćwiczenia" theme for unattached drills.
  //
  // Two exceptions that keep the pack's tab contract honest:
  //
  // 1. PL_A1_A2 pack: themes 20 and 21 are vocab-only. We do NOT merge
  //    user-authored write_answer drills into them because the pack's
  //    contract is "no Ćwiczenia" — surfacing them under Cwiczenia 0/N
  //    would break that. The drills stay in the DB; unattached ones
  //    (theme_id = pl_other) are never reachable from this pack.
  //
  // 2. PL_TELC pack: the Cwiczenia tab is the seeded write_answer
  //    curriculum (orthography themes 01–09 + email phrases theme 22),
  //    not a free-for-all. Themes 10–18 are Słowa/vocab-only and must
  //    stay out of Cwiczenia. So we only inject user drills into
  //    themes that ALREADY have an `exercises` section (the seeded
  //    write_answer curriculum). Drills attached to Słowa-only themes
  //    are surfaced via the catch-all "Moje ćwiczenia" theme below.
  const mergedThemes = useMemo(() => {
    if (!isPolish) return themes
    if (activePackId === PACK_IDS.PL_A1_A2) return themes
    const out = themes.map(theme => {
      const extra = userExByTheme[theme.id]
      if (!extra || extra.length === 0) return theme
      const sections = [...(theme.sections || [])]
      const exIdx = sections.findIndex(s => s.type === 'exercises')
      // PL_TELC: only inject into themes that already have a seeded
      // `exercises` section. Otherwise (e.g. Słowa themes 10–18) the
      // drill would be promoted into Cwiczenia and break the pack's
      // "10 cards" contract. The drill is still surfaced via the
      // catch-all below.
      if (activePackId === PACK_IDS.PL_TELC && exIdx < 0) return theme
      if (exIdx >= 0) {
        sections[exIdx] = { ...sections[exIdx], exercises: [...(sections[exIdx].exercises || []), ...extra] }
      } else {
        sections.push({ type: 'exercises', exercises: extra })
      }
      return { ...theme, sections }
    })
    // Build the catch-all "Moje ćwiczenia" from: (a) drills with no
    // theme_id, plus (b) drills attached to Słowa-only themes in PL_TELC
    // that we deliberately skipped above (so they still surface
    // somewhere instead of being lost).
    if (activePackId === PACK_IDS.PL_TELC) {
      const skipped = themes
        .filter((theme) => {
          const sections = theme.sections || []
          return !sections.some((s) => s.type === 'exercises')
        })
        .flatMap((theme) => userExByTheme[theme.id] || [])
      const otherDrills = userExByTheme.pl_other || []
      const catchAllDrills = [...otherDrills, ...skipped]
      if (catchAllDrills.length) {
        out.push({
          id: 'pl_other',
          order: '★',
          title: 'Moje ćwiczenia',
          titleRu: 'Мои упражнения',
          sections: [{ type: 'exercises', exercises: catchAllDrills }],
          vocabIds: [],
          verbList: [],
        })
      }
    }
    return out
  }, [themes, userExByTheme, isPolish, activePackId])

  const themesWithVerbs = useMemo(() => themes.filter(th => th.verbList?.length > 0), [themes])

  const pronounLabels = useMemo(() => {
    if (targetLang === 'pl') {
      return PL_PRONOUNS.map(p => p.pl)
    }
    return PRONOUNS.map(p => p.fr)
  }, [targetLang])

  // Polish tab classification
  const exerciseThemes = useMemo(() =>
    isPolish ? mergedThemes.filter(th => th.sections?.some(s => s.type === 'exercises' && s.exercises?.length > 0)) : [],
    [mergedThemes, isPolish]
  )
  const vocabThemes = useMemo(() =>
    isPolish ? mergedThemes.filter(th => th.vocabIds?.length > 0) : [],
    [mergedThemes, isPolish]
  )
  const emailThemes = useMemo(() =>
    isPolish ? mergedThemes.filter(th => th.sections?.some(s => s.type === 'email_writing')) : [],
    [mergedThemes, isPolish]
  )

  // Per-tab mastery stats
  const exerciseTabStats = useMemo(() => {
    let total = 0, mastered = 0, due = 0
    for (const theme of exerciseThemes) {
      const ex = theme.sections.find(s => s.type === 'exercises')
      total += ex.exercises.length
      const m = getExerciseMastery(exerciseCards, theme.id, ex.exercises.length)
      mastered += m.mastered
      due += getExerciseDueCountByTheme(exerciseCards, theme.id, ex.exercises.length)
    }
    return { total, mastered, due, percent: total > 0 ? Math.round((mastered / total) * 100) : 0 }
  }, [exerciseThemes, exerciseCards])

  const vocabTabStats = useMemo(() => {
    let total = 0, mastered = 0, due = 0
    for (const theme of vocabThemes) {
      const m = getVocabMastery(cards, theme.vocabIds)
      total += m.total
      mastered += m.mastered
      due += getVocabDueCount(cards, theme.vocabIds)
    }
    return { total, mastered, due, percent: total > 0 ? Math.round((mastered / total) * 100) : 0 }
  }, [vocabThemes, cards])

  const emailTabTotal = useMemo(() =>
    emailThemes.reduce((acc, th) => {
      const section = th.sections?.find(s => s.type === 'email_writing')
      return acc + (section?.exercises?.length || 0)
    }, 0),
    [emailThemes]
  )

  const overallMastery = useMemo(() => {
    if (isPolish) {
      const grandTotal = exerciseTabStats.total + vocabTabStats.total
      const grandMastered = exerciseTabStats.mastered + vocabTabStats.mastered
      return grandTotal > 0 ? Math.round((grandMastered / grandTotal) * 100) : 0
    }
    if (themesWithVerbs.length === 0) return 0
    const allVerbs = []
    for (const theme of themesWithVerbs) {
      allVerbs.push(...theme.verbList)
    }
    return getThemeConjugationMastery(conjugationCards, allVerbs).percent
  }, [conjugationCards, exerciseTabStats, vocabTabStats, themesWithVerbs, isPolish])

  const activeTabStats = activeTab === 'exercises'
    ? exerciseTabStats
    : activeTab === 'vocab'
      ? vocabTabStats
      : { total: emailTabTotal, mastered: 0, due: 0, percent: 0 }
  const activePolishThemes = activeTab === 'exercises'
    ? exerciseThemes
    : activeTab === 'vocab'
      ? vocabThemes
      : emailThemes

  // Compute per-pack display order: the theme's own `order` is a stable
  // global sort key (the same theme id can appear under different orders
  // in different packs), but the user-visible number on the training page
  // should be 1-based within the active pack so that a theme in pl-a1-a2
  // displays as 1 or 2 instead of its old global order.
  const activePolishThemesNumbered = activePolishThemes.map((theme, idx) => ({
    ...theme,
    displayOrder: idx + 1,
  }))

  // Tab visibility is gated on activePack.modes so the Email tab
  // only renders for packs that actually carry email_writing themes.
  // PL_A1/A2 is vocab-only, so its Email tab is suppressed (was
  // rendering as an always-empty "0/0" before this gate).
  const hasEmailMode = !!activePack?.modes?.includes('email')
  const TABS = [
    { id: 'exercises', label: 'Ćwiczenia', stats: exerciseTabStats },
    { id: 'vocab', label: 'Słowa', stats: vocabTabStats },
    ...(hasEmailMode ? [{ id: 'email', label: 'Email', stats: { total: emailTabTotal, mastered: 0 } }] : []),
  ]

  // If the active tab was removed by the activePack.modes gate (e.g.
  // the user had Email selected in PL_TELC and switched to PL_A1/A2,
  // which doesn't expose the Email tab), fall back to the first
  // available tab so the page doesn't render an empty list with no
  // way to switch.
  useEffect(() => {
    if (!TABS.some((t) => t.id === activeTab)) {
      setActiveTab(TABS[0]?.id || 'exercises')
    }
  }, [activeTab, TABS])

  function renderThemeCard(theme) {
    const hasVerbs = theme.verbList?.length > 0
    const exerciseSection = theme.sections?.find(s => s.type === 'exercises')
    const hasExercises = exerciseSection?.exercises?.length > 0
    const exerciseCount = exerciseSection?.exercises?.length || 0
    const hasVocab = theme.vocabIds?.length > 0
    const useExerciseMode = isPolish && activeTab === 'exercises' && hasExercises
    const useVocabMode = isPolish && activeTab === 'vocab' && hasVocab
    const isInteractive = hasVerbs || useExerciseMode || useVocabMode
    const formType = themeFormType(theme.id)
    const themeMastery = hasVerbs
      ? getThemeConjugationMastery(conjugationCards, theme.verbList, formType)
      : (useExerciseMode
        ? getExerciseMastery(exerciseCards, theme.id, exerciseCount)
        : (useVocabMode
          ? getVocabMastery(cards, theme.vocabIds)
          : null))
    const percent = themeMastery ? themeMastery.percent : 0
    const dueCount = hasVerbs
      ? getConjugationDueCount(conjugationCards, theme.verbList, formType)
      : (useExerciseMode
        ? getExerciseDueCountByTheme(exerciseCards, theme.id, exerciseCount)
        : (useVocabMode
          ? getVocabDueCount(cards, theme.vocabIds)
          : 0))
    const isExpanded = expandedThemeId === theme.id

    return (
      <div
        key={theme.id}
        className={`w-full text-left bg-surface border border-border rounded-xl p-4 transition-colors ${
          isInteractive ? '' : 'opacity-50'
        }`}
      >
        <div
          onClick={() => {
            if (isInteractive) setExpandedThemeId(isExpanded ? null : theme.id)
          }}
          className={isInteractive ? 'cursor-pointer' : 'cursor-default'}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-text-muted text-sm font-mono">{theme.displayOrder}.</span>
              <span className="font-bold text-white text-sm">{getThemeTitle(theme, targetLang)}</span>
            </div>
            <div className="flex items-center gap-2">
              {!isInteractive && <span className="text-text-muted text-sm">{t('locked')}</span>}
              {isInteractive && <span className="text-text-muted text-sm">{percent}%</span>}
              {isInteractive && (
                <span className="text-text-muted text-xs">
                  {isExpanded ? '▲' : '▼'}
                </span>
              )}
            </div>
          </div>
          {isInteractive && (
            <div className="bg-white/[0.08] rounded-md h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-md transition-width"
                style={{ width: `${percent}%` }}
              />
            </div>
          )}
          {themeMastery && (
            <div className="flex items-center gap-3 text-xs text-text-muted mt-1.5">
              <span>{themeMastery.mastered} {t('mastered').toLowerCase()}</span>
              {themeMastery.learned - themeMastery.mastered > 0 && (
                <span className="text-amber-400">{themeMastery.learned - themeMastery.mastered} {t('in_progress').toLowerCase()}</span>
              )}
              <span className="text-text-muted/60">{t('training_out_of')} {themeMastery.total}</span>
              {dueCount > 0 && (
                <span className="text-orange-400 font-medium bg-orange-400/10 px-1.5 py-0.5 rounded">
                  {dueCount} {t('cards_due_label').toLowerCase()}
                </span>
              )}
            </div>
          )}
        </div>

        {isExpanded && hasVerbs && (
          <div className="mt-3 border-t border-white/[0.08] pt-3">
            <VerbGrid
              theme={theme}
              conjugationCards={conjugationCards}
              t={t}
              formType={formType}
              pronounLabels={pronounLabels}
              exerciseNotes={exerciseNotes}
              conjugationForms={course.conjugationsByTheme?.[theme.id] || null}
              onVerbNotesClick={(verb) => setVerbNotesVerb({ verb, themeId: theme.id })}
            />
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => navigate(`/training/${theme.id}`)}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-colors text-sm"
              >
                {t('train_start')}
              </button>
            </div>
          </div>
        )}

        {isExpanded && !hasVerbs && useVocabMode && (
          <div className="mt-3 border-t border-white/[0.08] pt-3">
            <VocabGrid vocabIds={theme.vocabIds} vocab={vocab} cards={cards} vocabNotes={vocabNotes} t={t} nativeLang={settings.nativeLang} onNoteClick={(id, word) => setVocabNoteModal({ vocabId: id, word })} />
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => navigate(`/training/${theme.id}`)}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-colors text-sm"
              >
                {t('train_start')}
              </button>
            </div>
          </div>
        )}

        {isExpanded && !hasVerbs && useExerciseMode && (
          <div className="mt-3 border-t border-white/[0.08] pt-3">
            <ExerciseGrid
              themeId={theme.id}
              exercises={exerciseSection.exercises}
              exerciseCards={exerciseCards}
              exerciseNotes={exerciseNotes}
              t={t}
              onNoteClick={(key, ex) => setNoteModal({ exerciseKey: key, exercise: ex, themeId: theme.id })}
            />
            <div className="mt-4 border-t border-white/[0.08] pt-3">
              <ExerciseSection section={exerciseSection} themeId={theme.id} />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-6">
      <h1 className="text-2xl font-extrabold text-white mb-4">{t('training_title')}</h1>

      {isPolish ? (
        <>
          {/* Tab bar */}
          <div className="flex gap-1.5 mb-5 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setExpandedThemeId(null) }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent/20 text-accent shadow-sm'
                    : 'text-text-muted hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${
                  activeTab === tab.id ? 'bg-accent/20 text-accent' : 'bg-white/[0.06] text-text-muted'
                }`}>
                  {tab.stats.mastered}/{tab.stats.total}
                </span>
              </button>
            ))}
          </div>

          {/* Per-tab progress bar */}
          {activeTab !== 'email' && (
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm text-text-muted mb-1.5">
                <span>{t('theme_progress')}</span>
                <span>{activeTabStats.percent}%</span>
              </div>
              <div className="bg-white/[0.08] rounded-md h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-md transition-width"
                  style={{ width: `${activeTabStats.percent}%` }}
                />
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                <span>{activeTabStats.mastered} {t('mastered').toLowerCase()}</span>
                <span className="text-text-muted/60">{t('training_out_of')} {activeTabStats.total}</span>
                {activeTabStats.due > 0 && (
                  <span className="text-orange-400 font-medium">{activeTabStats.due} {t('cards_due_label').toLowerCase()}</span>
                )}
              </div>
            </div>
          )}

          {/* Tab content */}
          {activeTab === 'email' ? (
            <EmailTabContent emailThemes={emailThemes} navigate={navigate} />
          ) : (
            <div className="flex flex-col gap-3">
              {activePolishThemesNumbered.map(theme => renderThemeCard(theme))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Overall progress bar for French */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-text-muted mb-1.5">
              <span>{t('theme_progress')}</span>
              <span>{overallMastery}%</span>
            </div>
            <div className="bg-white/[0.08] rounded-md h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-md transition-width"
                style={{ width: `${overallMastery}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {themes.map(theme => renderThemeCard(theme))}
          </div>
        </>
      )}

      {/* Per-verb conjugation notes picker — opened from the Notes
          column in the VerbGrid. Lists the 6 cells (je / tu / il /
          nous / vous / ils) with their prompt and a marker for
          whether the user has a note; clicking a cell hands off to
          ExerciseNoteModal so the editor is the same as in the
          in-session exercise. */}
      {verbNotesVerb && (
        <ConjugationNotesPicker
          verb={verbNotesVerb.verb}
          themeId={verbNotesVerb.themeId}
          formType={themeFormType(verbNotesVerb.themeId)}
          exerciseNotes={exerciseNotes}
          conjugationForms={course.conjugationsByTheme?.[verbNotesVerb.themeId] || null}
          onSelectCell={(cardKey, prompt) => {
            // Reuse the existing ExerciseNoteModal. The exercise key
            // on the wire is the themeId + ':' + cardKey pair, so we
            // pre-build that here. The modal looks up the note under
            // that same composite key (the UserProgressContext
            // namespacing already handles this — see
            // ConjugationExercise.jsx noteKey computation).
            setNoteModal({
              exerciseKey: `${verbNotesVerb.themeId}:${cardKey}`,
              exercise: { prompt },
              themeId: verbNotesVerb.themeId,
            })
            setVerbNotesVerb(null)
          }}
          onClose={() => setVerbNotesVerb(null)}
        />
      )}

      {/* Exercise note modal */}
      {noteModal && (
        <ExerciseNoteModal
          exerciseKey={noteModal.exerciseKey}
          themeId={noteModal.themeId}
          exerciseNote={exerciseNotes?.[noteModal.exerciseKey]}
          exercisePrompt={noteModal.exercise?.prompt}
          onSave={saveExerciseNote}
          onDelete={clearExerciseNote}
          onClose={() => setNoteModal(null)}
        />
      )}

      {/* Vocab note modal */}
      {vocabNoteModal && (
        <VocabNoteModal
          vocabId={vocabNoteModal.vocabId}
          vocabNote={vocabNotes?.[vocabNoteModal.vocabId]}
          wordPrompt={vocabNoteModal.word?.translations?.ru || vocabNoteModal.word?.target || vocabNoteModal.vocabId}
          onSave={saveVocabNote}
          onDelete={clearVocabNote}
          onClose={() => setVocabNoteModal(null)}
        />
      )}
    </div>
  )
}
