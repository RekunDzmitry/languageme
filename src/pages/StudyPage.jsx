import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import StudySession from '../components/study/StudySession'
import { useSettings } from '../stores/SettingsContext'
import { useProgress } from '../stores/UserProgressContext'
import { useCourseData } from '../lib/courseData'
import { filterThemesByPack, getPackForThemeId } from '../data/lessonPacks'

export default function StudyPage() {
  const { themeId } = useParams()
  const { settings } = useSettings()
  const { userVocab } = useProgress()
  const course = useCourseData()
  const inferredPack = themeId ? getPackForThemeId(themeId) : null
  const targetLang = inferredPack?.langPrefix || settings.targetLang
  const VOCAB = course.vocab

  // Build the static half first (unchanged from before), then append
  // any user-authored cards whose themeIds match the active study scope.
  // For an explicit themeId (e.g. /study/fr_theme03) the scope is that
  // single theme; without a themeId the scope is the active pack's themes.
  // User cards file under a single themeId at create time, so a single
  // .some() check is enough.
  const themeVocab = useMemo(() => {
    let staticVocab
    let scopeThemeIds
      const theme = course.themes.find(th => th.id === themeId)
      const ids = theme?.vocabIds
      staticVocab = ids?.length
        ? ids.map(id => VOCAB.find(w => w.id === id)).filter(Boolean)
        : VOCAB.filter(w => w.themeIds?.includes(themeId))
      scopeThemeIds = new Set([themeId])
    } else {
      const activeThemes = filterThemesByPack(getThemes(targetLang), settings.activePackId, targetLang)
      scopeThemeIds = new Set(activeThemes.map(th => th.id))
      // Also include the pack-scoped catch-all so a user card filed
      // under "Мои карточки" while studying this pack shows up in the
      // un-scoped /study route for the active pack. Without this the
      // pack's catch-all sits outside the themeRange filter.
      if (settings.activePackId) {
        scopeThemeIds.add(`${settings.activePackId}_other`)
      }
      staticVocab = VOCAB.filter(w => w.themeIds?.some(id => scopeThemeIds.has(id)))
    }

    const userForScope = Object.values(userVocab).filter(v =>
      Array.isArray(v.themeIds) && v.themeIds.some(id => scopeThemeIds.has(id))
    )
    return [...staticVocab, ...userForScope]
  }, [themeId, targetLang, VOCAB, userVocab, settings.activePackId])

  return <StudySession themeVocab={themeVocab} route="study" themeId={themeId} />
}
