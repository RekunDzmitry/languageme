import { useParams } from 'react-router-dom'
import ConjugationSession from '../components/study/ConjugationSession'

// Theme IDs that use negative forms
const NEGATIVE_THEMES = ['theme02']

export default function LearnPage() {
  const { themeId } = useParams()
  const formType = themeId && NEGATIVE_THEMES.includes(themeId) ? 'neg' : 'aff'
  return <ConjugationSession themeId={themeId || null} formType={formType} />
}
