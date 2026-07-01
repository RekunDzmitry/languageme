import { useParams } from 'react-router-dom'
import { useSettings } from '../stores/SettingsContext'
import ConjugationSession from '../components/study/ConjugationSession'
import StudySession from '../components/study/StudySession'
import { getThemes, getVocab } from '../data/courses'
import { filterThemesByPack, getPackForThemeId } from '../data/lessonPacks'

// Theme IDs that use negative forms (French)
const NEGATIVE_THEMES = ['fr_theme02']

export default function LearnPage() {
  const { themeId } = useParams()
  const { settings } = useSettings()
  const inferredPack = themeId ? getPackForThemeId(themeId) : null
  const targetLang = inferredPack?.langPrefix || settings.targetLang

  // Polish: fast vocab flashcard session (all vocab, SM-2)
  if (targetLang === 'pl') {
    const VOCAB = getVocab(targetLang)
    const themeIds = themeId
      ? new Set([themeId])
      : new Set(filterThemesByPack(getThemes(targetLang), settings.activePackId, targetLang).map(th => th.id))
    const themeVocab = VOCAB.filter(w => w.themeIds?.some(id => themeIds.has(id)))
    return <StudySession themeVocab={themeVocab} />
  }

  const formType = themeId && NEGATIVE_THEMES.includes(themeId) ? 'neg' : 'aff'
  return <ConjugationSession themeId={themeId || null} formType={formType} />
}
