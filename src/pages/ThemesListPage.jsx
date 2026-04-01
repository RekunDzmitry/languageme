import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useProgress } from '../stores/UserProgressContext'
import { themes as allThemes } from '../data/courses/fr/themes/theme01-pronouns-present'
import { isThemeUnlocked } from '../utils/progress'

export default function ThemesListPage() {
  const { t } = useT()
  const { themeProgress } = useProgress()
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto px-5 py-6">
      <h2 className="text-2xl font-extrabold mb-5">{t('themes_title')}</h2>
      <div className="space-y-3">
        {allThemes.map((theme, i) => {
          const unlocked = isThemeUnlocked(theme, themeProgress)
          const progress = themeProgress[theme.id]
          const completed = !!progress?.completedAt
          const started = !!progress?.started

          return (
            <div
              key={theme.id}
              onClick={() => unlocked && navigate(`/themes/${theme.id}`)}
              className={`bg-surface border rounded-xl p-4 flex items-center gap-4 transition-colors
                ${unlocked ? 'border-border cursor-pointer hover:bg-surface-hover' : 'border-white/5 opacity-50 cursor-not-allowed'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0
                ${completed ? 'bg-green-500/20 text-green-400' : unlocked ? 'bg-accent-glow text-accent' : 'bg-white/5 text-text-muted'}`}>
                {completed ? '✓' : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-white text-sm truncate">{theme.titleRu || theme.title}</span>
                </div>
                <div className="text-xs text-text-muted truncate">{theme.descriptionRu || theme.description}</div>
              </div>
              <div className="text-sm font-semibold shrink-0">
                {!unlocked && <span className="text-text-muted">🔒 {t('theme_locked')}</span>}
                {unlocked && completed && <span className="text-green-400">{t('theme_completed')}</span>}
                {unlocked && started && !completed && <span className="text-accent">{t('theme_continue')}</span>}
                {unlocked && !started && <span className="text-blue-400">{t('theme_start')}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
