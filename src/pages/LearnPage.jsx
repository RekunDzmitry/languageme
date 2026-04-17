import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { useSettings } from '../stores/SettingsContext'
import ConjugationSession from '../components/study/ConjugationSession'

// Theme IDs that use negative forms (French)
const NEGATIVE_THEMES = ['theme02']

export default function LearnPage() {
  const { themeId } = useParams()
  const { settings } = useSettings()
  const navigate = useNavigate()
  
  // For Polish, redirect to training since there are no verb conjugations
  useEffect(() => {
    if (settings.targetLang === 'pl') {
      navigate('/training')
    }
  }, [settings.targetLang, navigate])
  
  if (settings.targetLang === 'pl') {
    return (
      <div className="max-w-xl mx-auto px-5 py-10 text-center">
        <div className="text-4xl mb-4">🇵🇱</div>
        <p className="text-text-muted">Перенаправление...</p>
      </div>
    )
  }
  
  const formType = themeId && NEGATIVE_THEMES.includes(themeId) ? 'neg' : 'aff'
  return <ConjugationSession themeId={themeId || null} formType={formType} />
}
