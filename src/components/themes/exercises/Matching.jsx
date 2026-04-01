import { useState, useMemo } from 'react'
import { useT } from '../../../i18n'
import { speak } from '../../../utils/audio'

export default function Matching({ exercise, onAnswer }) {
  const { t } = useT()
  const pairs = exercise.pairs || []

  const [selectedLeft, setSelectedLeft] = useState(null)
  const [matched, setMatched] = useState([])
  const [wrong, setWrong] = useState(null)

  const shuffledRight = useMemo(() => {
    return [...pairs].sort(() => Math.random() - 0.5)
  }, [pairs])

  const handleLeftClick = (idx) => {
    if (matched.includes(idx)) return
    setSelectedLeft(idx)
    setWrong(null)
    speak(pairs[idx].left)
  }

  const handleRightClick = (rightItem) => {
    if (selectedLeft === null) return
    const leftItem = pairs[selectedLeft]
    if (leftItem.right === rightItem.right) {
      const newMatched = [...matched, selectedLeft]
      setMatched(newMatched)
      setSelectedLeft(null)
      if (newMatched.length === pairs.length) {
        onAnswer(true)
      }
    } else {
      setWrong(rightItem.right)
      setTimeout(() => setWrong(null), 800)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="text-sm text-text-muted mb-3 uppercase tracking-wide">Соединить пары</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {pairs.map((pair, i) => (
            <button
              key={i}
              onClick={() => handleLeftClick(i)}
              disabled={matched.includes(i)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors border cursor-pointer
                ${matched.includes(i)
                  ? 'bg-green-500/10 border-green-500 text-green-400 opacity-60'
                  : selectedLeft === i
                    ? 'bg-accent-glow border-accent text-accent'
                    : 'bg-bg border-border text-text-primary hover:border-accent/50'
                }`}
            >
              {pair.left}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {shuffledRight.map((pair, i) => {
            const isMatched = matched.some(idx => pairs[idx].right === pair.right)
            const isWrong = wrong === pair.right
            return (
              <button
                key={i}
                onClick={() => handleRightClick(pair)}
                disabled={isMatched}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors border cursor-pointer
                  ${isMatched
                    ? 'bg-green-500/10 border-green-500 text-green-400 opacity-60'
                    : isWrong
                      ? 'bg-red-500/10 border-red-500 text-red-400'
                      : 'bg-bg border-border text-text-primary hover:border-accent/50'
                  }`}
              >
                {pair.right}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
