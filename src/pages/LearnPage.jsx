import { useParams } from 'react-router-dom'
import { useSettings } from '../stores/SettingsContext'
import ConjugationSession from '../components/study/ConjugationSession'
import StudySession from '../components/study/StudySession'

// Theme IDs that use negative forms (French)
const NEGATIVE_THEMES = ['theme02']

export default function LearnPage() {
  const { themeId } = useParams()
  const { settings } = useSettings()

  // Polish: fast vocab flashcard session (all vocab, SM-2)
  if (settings.targetLang === 'pl') {
    return <StudySession />
  }

  const formType = themeId && NEGATIVE_THEMES.includes(themeId) ? 'neg' : 'aff'
  return <ConjugationSession themeId={themeId || null} formType={formType} />
}
