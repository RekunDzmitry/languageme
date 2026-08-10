import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useProgress } from '../stores/UserProgressContext'
import { useSettings } from '../stores/SettingsContext'
import { useCourseData } from '../lib/courseData'
import { LESSON_PACKS, filterThemesByPack, openPack } from '../data/lessonPacks'
import { getConjugationDueCount, getExerciseDueCountByTheme, getVocabDueCount } from '../utils/progress'

// Pack ids use hyphens; i18n keys use underscores. Centralise the mapping.
const packKey = (packId, slot) => `pack_${packId.replace(/-/g, '_')}_${slot}`

function getPackStats(pack, progress, course) {
  const langBundle = course.allByLang[pack.langPrefix] || { vocab: [], themes: [] }
  const themes = filterThemesByPack(langBundle.themes, pack.id, pack.langPrefix)
  const vocab = langBundle.vocab
  // Build the pack's theme set once so the vocab filter below can test
  // membership without re-iterating the themes array per word.
  const themeIds = new Set(themes.map((t) => t.id))
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
  const course = useCourseData()
  const navigate = useNavigate()
  const { t } = useT()

  // Depend on the concrete slices getPackStats actually reads. Depending on
  // the whole context value used to invalidate this memo on every parent
  // render because the provider rebuilt the value object each time.
  const { exerciseCards, cards, conjugationCards } = progress
  const progressSlice = useMemo(
    () => ({ exerciseCards, cards, conjugationCards }),
    [exerciseCards, cards, conjugationCards]
  )

  const packStats = useMemo(() => {
    const stats = {}
    for (const pack of LESSON_PACKS) {
      stats[pack.id] = getPackStats(pack, progressSlice, course)
    }
    return stats
  }, [progressSlice, course])

  function handleOpenPack(pack) {
    openPack(pack, { navigate, updateSettings })
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-6">
      <div className="mb-6">
        <p className="text-sm font-semibold text-accent uppercase tracking-wider">{t('app_name')}</p>
        <h1 className="text-3xl font-extrabold text-white mt-1">{t('dashboard_choose_title')}</h1>
        <p className="text-text-muted mt-2">{t('dashboard_choose_subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {LESSON_PACKS.map((pack) => {
          const stats = packStats[pack.id]
          const active = settings.activePackId === pack.id

          return (
            <button
              key={pack.id}
              type="button"
              onClick={() => handleOpenPack(pack)}
              className={`text-left rounded-xl border p-5 bg-surface hover:bg-surface-hover transition-all ${
                active ? 'border-accent shadow-lg shadow-purple-900/20' : 'border-border hover:border-accent/40'
              }`}
            >
              <div className={`h-1.5 rounded-full bg-gradient-to-r ${pack.accentClass} mb-4`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-white">{t(packKey(pack.id, 'title'))}</h2>
                  <p className="text-sm text-text-muted mt-1">{t(packKey(pack.id, 'subtitle'))}</p>
                </div>
                {active && <span className="text-accent text-sm font-bold">{t('pack_active')}</span>}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-2 py-1 rounded-lg bg-white/[0.06] text-xs font-semibold text-text-primary">{t(packKey(pack.id, 'badge'))}</span>
                <span className="px-2 py-1 rounded-lg bg-white/[0.06] text-xs font-semibold text-text-primary">{t(packKey(pack.id, 'level'))}</span>
                {stats?.due > 0 && <span className="px-2 py-1 rounded-lg bg-orange-500/20 text-orange-200 text-xs font-semibold">{stats.due} {t('pack_stat_due')}</span>}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-5 text-center">
                <div className="rounded-lg bg-bg px-2 py-3">
                  <div className="text-lg font-bold text-white">{stats?.themes || 0}</div>
                  <div className="text-[11px] text-text-muted">{t('pack_stat_themes')}</div>
                </div>
                <div className="rounded-lg bg-bg px-2 py-3">
                  <div className="text-lg font-bold text-white">{stats?.vocab || 0}</div>
                  <div className="text-[11px] text-text-muted">{t('pack_stat_words')}</div>
                </div>
                <div className="rounded-lg bg-bg px-2 py-3">
                  <div className="text-lg font-bold text-white">{(stats?.exercises || 0) + (stats?.emailExercises || 0)}</div>
                  <div className="text-[11px] text-text-muted">{t('pack_stat_tasks')}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
