import { useParams } from 'react-router-dom'
import ConjugationSession from '../components/study/ConjugationSession'

export default function LearnPage() {
  const { themeId } = useParams()
  return <ConjugationSession themeId={themeId || null} />
}
