import { VOCAB } from '../../data/courses/fr/vocab'
import { useProgress } from '../../stores/UserProgressContext'
import VocabCard from '../vocab/VocabCard'

export default function VocabSection({ section }) {
  const { cards } = useProgress()
  const words = (section.vocabIds || []).map(id => VOCAB.find(w => w.id === id)).filter(Boolean)

  if (words.length === 0) {
    return <div className="text-text-muted text-sm py-4">Нет слов для этого раздела.</div>
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
      {words.map(word => (
        <VocabCard key={word.id} word={word} card={cards[word.id]} />
      ))}
    </div>
  )
}
