import { useMemo } from 'react'
import { useProgress } from '../../stores/UserProgressContext'
import { useCourseData } from '../../lib/courseData'
import VocabCard from '../vocab/VocabCard'

export default function VocabSection({ section }) {
  const { cards } = useProgress()
  const course = useCourseData()
  const vocabById = useMemo(
    () => Object.fromEntries(course.vocab.map(w => [w.id, w])),
    [course.vocab]
  )
  const words = (section.vocabIds || []).map(id => vocabById[id]).filter(Boolean)

  if (words.length === 0) {
    return <div className="text-text-muted text-sm py-4">Нет слов для этого раздела.</div>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
      {words.map(word => (
        <VocabCard key={word.id} word={word} card={cards[word.id]} />
      ))}
    </div>
  )
}
