import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useProgress } from '../stores/UserProgressContext'
import { useAuth } from '../stores/AuthContext'
import { useSettings } from '../stores/SettingsContext'
import { useCourseData, getThemeTitle } from '../lib/courseData'
import { filterThemesByPack } from '../data/lessonPacks'
import { isThemeUnlocked } from '../utils/progress'

export default function ThemesListPage() {
  const { t } = useT()
  const { settings } = useSettings()
  const course = useCourseData()
  const targetLang = settings.targetLang
  // Compute the displayed order from the position within the pack-filtered
  // list. The theme's own `order` field is a stable global sort key (the
  // same theme may belong to different packs in different orders), but the
  // user-visible number should be 1-based within the active pack so that
  // a theme in pl-a1-a2 displays as 1 or 2, not as its old global order
  // (11, 12) from the pre-pack layout.
  const allThemes = filterThemesByPack(course.themes, settings.activePackId, targetLang)
  // Per-pack 1-based display order: position in the active pack, not the
  // theme's own global `order` field which can collide across packs.
  const numberedThemes = allThemes.map((theme, idx) => ({ ...theme, displayOrder: idx + 1 }))
  const { isAuthenticated } = useAuth()
  const { themeProgress, themeUnlockStatus } = useProgress()
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto px-5 py-6">
      <h2 className="text-2xl font-extrabold mb-5">{t(`themes_title_${targetLang}`)}</h2>
      <div className="space-y-3">
        {numberedThemes.map((theme) => {
          // For authenticated users, use API unlock status if available, otherwise check locally
          const apiUnlockStatus = themeUnlockStatus?.[theme.id]?.unlocked
          const unlocked = isAuthenticated
            ? (apiUnlockStatus ?? isThemeUnlocked(theme, themeProgress))
            : isThemeUnlocked(theme, themeProgress)
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
                {completed ? '✓' : theme.displayOrder}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-white text-sm truncate">{getThemeTitle(theme, targetLang)}</span>
                </div>
                <div className="text-xs text-text-muted truncate">{theme.description_ru || theme.description}</div>
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
