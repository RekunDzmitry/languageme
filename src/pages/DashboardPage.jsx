import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../stores/UserProgressContext'
import { useSettings } from '../stores/SettingsContext'
import { getThemes, getVocab } from '../data/courses'
import { LESSON_PACKS, filterThemesByPack, getPackRoute } from '../data/lessonPacks'
import { getConjugationDueCount, getExerciseDueCountByTheme, getVocabDueCount } from '../utils/progress'

function getPackStats(pack, progress) {
  const themes = filterThemesByPack(getThemes(pack.targetLang), pack.id, pack.targetLang)
  const vocab = getVocab(pack.targetLang)
  const themeIds = new Set(themes.map((theme) => theme.id))
  const vocabIds = vocab
    .filter((word) => word.themeIds?.some((themeId) => themeIds.has(themeId)))
    .map((word) => word.id)

  const verbs = themes.flatMap((theme) => theme.verbList || [])
  const exercises = themes.reduce((total, theme) => {
    const exerciseSection = theme.sections?.find((section) => section.type === 'exercises')
    return total + (exerciseSection?.exercises?.length || 0)
  }, 0)
  const emailExercises = themes.reduce((total, theme) => {
    const emailSection = theme.sections?.find((section) => section.type === 'email_writing')
    return total + (emailSection?.exercises?.length || 0)
  }, 0)

  const exerciseDue = themes.reduce((total, theme) => {
    const exerciseSection = theme.sections?.find((section) => section.type === 'exercises')
    return total + getExerciseDueCountByTheme(progress.exerciseCards, theme.id, exerciseSection?.exercises?.length || 0)
  }, 0)

  return {
    themes: themes.length,
    vocab: vocabIds.length,
    exercises,
    emailExercises,
    due: getVocabDueCount(progress.cards, vocabIds) + getConjugationDueCount(progress.conjugationCards, verbs) + exerciseDue,
  }
}

export default function DashboardPage() {
  const progress = useProgress()
  const { settings, updateSettings } = useSettings()
  const navigate = useNavigate()

  const packStats = useMemo(() => {
    const stats = {}
    LESSON_PACKS.forEach((pack) => {
      stats[pack.id] = getPackStats(pack, progress)
    })
    return stats
  }, [progress])

  function openPack(pack) {
    updateSettings({ activePackId: pack.id, targetLang: pack.targetLang })
    navigate(getPackRoute(pack))
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-6">
      <div className="mb-6">
        <p className="text-sm font-semibold text-accent uppercase tracking-wider">LanguageMe</p>
        <h1 className="text-3xl font-extrabold text-white mt-1">Что будем учить?</h1>
        <p className="text-text-muted mt-2">Выберите направление. Переключиться можно в верхнем меню в любой момент.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {LESSON_PACKS.map((pack) => {
          const stats = packStats[pack.id]
          const active = settings.activePackId === pack.id

          return (
            <button
              key={pack.id}
              type="button"
              onClick={() => openPack(pack)}
              className={`text-left rounded-xl border p-5 bg-surface hover:bg-surface-hover transition-all ${
                active ? 'border-accent shadow-lg shadow-purple-900/20' : 'border-border hover:border-accent/40'
              }`}
            >
              <div className={`h-1.5 rounded-full bg-gradient-to-r ${pack.accentClass} mb-4`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-white">{pack.title}</h2>
                  <p className="text-sm text-text-muted mt-1">{pack.subtitle}</p>
                </div>
                {active && <span className="text-accent text-sm font-bold">Active</span>}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-2 py-1 rounded-lg bg-white/[0.06] text-xs font-semibold text-text-primary">{pack.badge}</span>
                <span className="px-2 py-1 rounded-lg bg-white/[0.06] text-xs font-semibold text-text-primary">{pack.level}</span>
                {stats?.due > 0 && <span className="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-200 text-xs font-semibold">{stats.due} due</span>}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5 text-center">
                <div className="rounded-lg bg-bg px-2 py-3">
                  <div className="text-lg font-bold text-white">{stats?.themes || 0}</div>
                  <div className="text-[11px] text-text-muted">themes</div>
                </div>
                <div className="rounded-lg bg-bg px-2 py-3">
                  <div className="text-lg font-bold text-white">{stats?.vocab || 0}</div>
                  <div className="text-[11px] text-text-muted">words</div>
                </div>
                <div className="rounded-lg bg-bg px-2 py-3">
                  <div className="text-lg font-bold text-white">{(stats?.exercises || 0) + (stats?.emailExercises || 0)}</div>
                  <div className="text-[11px] text-text-muted">tasks</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
