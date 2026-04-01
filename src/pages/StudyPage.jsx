import { useParams } from 'react-router-dom'
import StudySession from '../components/study/StudySession'
import { VOCAB } from '../data/courses/fr/vocab'

export default function StudyPage() {
  const { themeId } = useParams()

  const themeVocab = themeId
    ? VOCAB.filter(w => w.themeIds?.includes(themeId))
    : null

  return <StudySession themeVocab={themeVocab} />
}
