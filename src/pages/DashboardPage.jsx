import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useProgress } from '../stores/UserProgressContext'
import { themes } from '../data/courses/fr/themes/theme01-pronouns-present'
import { getConjugationDueCount } from '../utils/progress'

export default function DashboardPage() {
  const { conjugationCards } = useProgress()
  const { t } = useT()
  const navigate = useNavigate()

  const allVerbs = useMemo(() => {
    const verbs = []
    for (const theme of themes) {
      if (theme.verbList?.length > 0) {
        verbs.push(...theme.verbList)
      }
    }
    return verbs
  }, [])

  const dueCount = useMemo(
    () => getConjugationDueCount(conjugationCards, allVerbs),
    [conjugationCards, allVerbs]
  )

  return (
    <div className="max-w-4xl mx-auto px-5 py-6">
      {/* GO Circle */}
      <div className="flex flex-col items-center py-10 mb-8">
        <button
          onClick={() => navigate('/learn')}
          className="group relative w-40 h-40 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 border-none cursor-pointer flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-shadow"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 animate-pulse opacity-30" />
          <span className="text-white text-5xl font-extrabold tracking-wider relative z-10 group-hover:scale-110 transition-transform">GO</span>
        </button>
        <div className="mt-4 text-lg font-bold text-white">{t('start_learning')}</div>
        {dueCount > 0 && (
          <div className="text-accent text-sm mt-1">{dueCount} {t('due_for_review')}</div>
        )}
      </div>

      {/* Quick link to Training */}
      <button
        onClick={() => navigate('/training')}
        className="w-full bg-surface border border-border rounded-xl p-4 hover:bg-surface-hover transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💪</span>
            <div>
              <div className="font-bold text-white">{t('nav_training')}</div>
              <div className="text-xs text-text-muted">{t('theme_progress')}</div>
            </div>
          </div>
          <span className="text-text-muted text-lg">→</span>
        </div>
      </button>
    </div>
  )
}
