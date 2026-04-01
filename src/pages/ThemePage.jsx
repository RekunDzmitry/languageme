import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useT } from '../i18n'
import { useProgress } from '../stores/UserProgressContext'
import { themes as allThemes } from '../data/courses/fr/themes/theme01-pronouns-present'
import ThemeView from '../components/themes/ThemeView'

export default function ThemePage() {
  const { id } = useParams()
  const { t } = useT()
  const { updateThemeProgress } = useProgress()
  const navigate = useNavigate()

  const theme = allThemes.find(l => l.id === id)

  useEffect(() => {
    if (theme) {
      updateThemeProgress(theme.id, { started: true })
    }
  }, [theme, updateThemeProgress])

  if (!theme) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-10 text-center">
        <div className="text-5xl mb-4">🤷</div>
        <h2 className="text-xl font-bold text-white">Тема не найдена</h2>
        <button
          onClick={() => navigate('/themes')}
          className="mt-4 px-5 py-2 bg-accent-glow text-accent font-bold rounded-lg border-none cursor-pointer"
        >
          {t('nav_themes')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/themes')} className="text-text-muted hover:text-text-primary bg-transparent border-none cursor-pointer text-lg">←</button>
        <div>
          <h2 className="text-xl font-extrabold text-white">{theme.titleRu || theme.title}</h2>
          <p className="text-sm text-text-muted">{theme.descriptionRu || theme.description}</p>
        </div>
      </div>
      <ThemeView theme={theme} />
    </div>
  )
}
