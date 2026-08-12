import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useProgress } from '../stores/UserProgressContext'
import { useCourseData } from '../lib/courseData'
import { themeFormType } from '../utils/conjugation'
import ConjugationSession from '../components/study/ConjugationSession'
import StudySession from '../components/study/StudySession'

// Theme-scoped training session. Dispatch:
// - theme with verbs -> ConjugationSession (verb drill), route tag "training"
// - theme without verbs (vocab-only) -> StudySession scoped to that theme
//
// This route is the destination of the "Start training" button on
// TrainingPage. It used to redirect to /learn/:themeId or
// /study/:themeId, which conflated training (theme-specific drill)
// with /learn (random across active pack) and /study (random SRS).
// Keeping training on its own endpoint makes the navigation
// predictable and lets analytics distinguish the entry point.
export default function TrainingSessionPage() {
  const { themeId } = useParams()
  const { userVocab } = useProgress()
  const course = useCourseData()
  const VOCAB = course.vocab

  const theme = useMemo(
    () => (themeId ? course.themes.find((th) => th.id === themeId) : null),
    [themeId, course.themes]
  )

  // Build the vocab pool the same way StudyPage does so user-authored
  // cards filed under this themeId surface in the session.
  const themeVocab = useMemo(() => {
    if (!themeId) return null
    let staticVocab
    if (theme) {
      const ids = theme.vocabIds
      staticVocab = ids?.length
        ? ids.map((id) => VOCAB.find((w) => w.id === id)).filter(Boolean)
        : VOCAB.filter((w) => w.themeIds?.includes(themeId))
    } else {
      staticVocab = VOCAB.filter((w) => w.themeIds?.includes(themeId))
    }
    const userForScope = Object.values(userVocab).filter(
      (v) => Array.isArray(v.themeIds) && v.themeIds.some((id) => id === themeId)
    )
    return [...staticVocab, ...userForScope]
  }, [themeId, theme, VOCAB, userVocab])

  if (!themeId) {
    return null
  }

  // Verb themes -> conjugation drill. formType mirrors LearnPage so
  // the negative-form themes (e.g. theme02) get the right cards.
  if (theme?.verbList?.length > 0) {
    return <ConjugationSession themeId={themeId} formType={themeFormType(themeId)} />
  }

  // Vocab-only themes -> flashcard study session scoped to this theme.
  return <StudySession themeVocab={themeVocab} route="training" themeId={themeId} />
}
