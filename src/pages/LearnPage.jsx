import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useSettings } from '../stores/SettingsContext'
import { useProgress } from '../stores/UserProgressContext'
import ConjugationSession from '../components/study/ConjugationSession'
import StudySession from '../components/study/StudySession'
import { getThemes, getVocab } from '../data/courses'
import { filterThemesByPack, getPackForThemeId } from '../data/lessonPacks'

// Theme IDs that use negative forms (French)
const NEGATIVE_THEMES = ['fr_theme02']

export default function LearnPage() {
  const { themeId } = useParams()
  const { settings } = useSettings()
  const { userVocab } = useProgress()
  const inferredPack = themeId ? getPackForThemeId(themeId) : null
  const targetLang = inferredPack?.langPrefix || settings.targetLang
  const VOCAB = getVocab(targetLang)
  // Polish: fast vocab flashcard session (all vocab, SM-2). The
  // pool is the active pack's static vocab PLUS any user-authored
  // cards whose themeIds match the scope. Without the user-vocab
  // half, a card filed in the pack-scoped catch-all
  // (`<pack>_other`) would never appear in the un-scoped /learn
  // route — the user reported this when they created a card in
  // pl-a1-a2 and saw only the first seed card on /learn. The
  // scope logic mirrors `StudyPage` (/study/:themeId) so both
  // routes agree on what "in the active pack" means.
  //
  // useMemo MUST run unconditionally on every render — Rules of
  // Hooks. Earlier this lived inside `if (targetLang === 'pl')`,
  // which means the hook count changed when the user switched
  // between a Polish pack and a non-Polish pack while the page
  // stayed mounted, and React would throw. The result is still
  // only used inside the Polish branch; the wasted work for
  // French is one array filter, which is negligible.
  const themeVocab = useMemo(() => {
    let scopeThemeIds
    if (themeId) {
      scopeThemeIds = new Set([themeId])
    } else {
      const activeThemes = filterThemesByPack(
        getThemes(targetLang),
        settings.activePackId,
        targetLang
      )
      scopeThemeIds = new Set(activeThemes.map((th) => th.id))
      // Include the pack-scoped catch-all so a user card filed
      // under "Мои карточки" while studying this pack shows up
      // in the un-scoped /learn session.
      if (settings.activePackId) {
        scopeThemeIds.add(`${settings.activePackId}_other`)
      }
    }
    const staticVocab = VOCAB.filter((w) =>
      w.themeIds?.some((id) => scopeThemeIds.has(id))
    )
    const userForScope = Object.values(userVocab).filter(
      (v) => Array.isArray(v.themeIds) && v.themeIds.some((id) => scopeThemeIds.has(id))
    )
    return [...staticVocab, ...userForScope]
  }, [themeId, targetLang, VOCAB, userVocab, settings.activePackId])
  if (targetLang === 'pl') {
    return <StudySession themeVocab={themeVocab} route="learn" themeId={settings.activePackId} />
  }

  const formType = themeId && NEGATIVE_THEMES.includes(themeId) ? 'neg' : 'aff'
  return <ConjugationSession themeId={themeId || null} formType={formType} />
}
