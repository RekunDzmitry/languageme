import { useParams } from 'react-router-dom'
import StudySession from '../components/study/StudySession'
import { useSettings } from '../stores/SettingsContext'
import { getVocab, getThemes } from '../data/courses'
import { filterThemesByPack, getPackForThemeId } from '../data/lessonPacks'

export default function StudyPage() {
  const { themeId } = useParams()
  const { settings } = useSettings()
  const inferredPack = themeId ? getPackForThemeId(themeId) : null
  const targetLang = inferredPack?.langPrefix || settings.targetLang
  const VOCAB = getVocab(targetLang)

  let themeVocab = null
  if (themeId) {
    const theme = getThemes(targetLang).find(th => th.id === themeId)
    const ids = theme?.vocabIds
    themeVocab = ids?.length
      ? ids.map(id => VOCAB.find(w => w.id === id)).filter(Boolean)
      : VOCAB.filter(w => w.themeIds?.includes(themeId))
  } else {
    const themeIds = new Set(filterThemesByPack(getThemes(targetLang), settings.activePackId, targetLang).map(th => th.id))
    themeVocab = VOCAB.filter(w => w.themeIds?.some(id => themeIds.has(id)))
  }

  return <StudySession themeVocab={themeVocab} />
}
