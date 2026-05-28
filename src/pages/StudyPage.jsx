import { useParams } from 'react-router-dom'
import StudySession from '../components/study/StudySession'
import { useSettings } from '../stores/SettingsContext'
import { getVocab, getThemes } from '../data/courses'

export default function StudyPage() {
  const { themeId } = useParams()
  const { settings } = useSettings()
  const targetLang = settings.targetLang
  const VOCAB = getVocab(targetLang)

  let themeVocab = null
  if (themeId) {
    const theme = getThemes(targetLang).find(th => th.id === themeId)
    const ids = theme?.vocabIds
    themeVocab = ids?.length
      ? ids.map(id => VOCAB.find(w => w.id === id)).filter(Boolean)
      : VOCAB.filter(w => w.themeIds?.includes(themeId))
  }

  return <StudySession themeVocab={themeVocab} />
}
