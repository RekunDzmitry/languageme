import { useT } from '../../i18n'

const RATINGS = [
  { quality: 0, color: 'border-red-500 text-red-500', sub: '< 1 мин' },
  { quality: 1, color: 'border-orange-500 text-orange-500', sub: '~10 мин' },
  { quality: 2, color: 'border-blue-500 text-blue-500', sub: '1 день' },
  { quality: 3, color: 'border-green-500 text-green-500', sub: '4 дня' },
]

export default function RatingButtons({ onRate }) {
  const { t } = useT()
  const labels = [t('rating_again'), t('rating_hard'), t('rating_good'), t('rating_easy')]

  return (
    <div className="mt-6">
      <div className="text-sm text-text-muted text-center mb-3">{t('study_how_well')}</div>
      <div className="grid grid-cols-4 gap-2">
        {RATINGS.map(({ quality, color, sub }, i) => (
          <button
            key={quality}
            onClick={() => onRate(quality)}
            className={`bg-surface border-2 ${color} rounded-xl py-2.5 px-1.5 cursor-pointer flex flex-col items-center gap-0.5 transition-all hover:scale-105`}
          >
            <span className="font-extrabold text-sm">{labels[i]}</span>
            <span className="text-[10px] opacity-70">{sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
