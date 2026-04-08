import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useProgress } from '../stores/UserProgressContext'
import { themes } from '../data/courses/fr/themes/theme01-pronouns-present'
import { getThemeConjugationMastery, getConjugationDueCount } from '../utils/progress'
import { conjCardKey, PRONOUNS } from '../utils/conjugation'

const PRONOUN_LABELS = PRONOUNS.map(p => p.fr)

// Themes using negative forms (ne...pas)
const NEGATIVE_THEMES = ['theme02']

function getFormType(themeId) {
  return NEGATIVE_THEMES.includes(themeId) ? 'neg' : 'aff'
}

function formatDueShort(ts) {
  const diff = ts - Date.now()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(1, mins)}м`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}ч`
  const days = Math.floor(hours / 24)
  return `${days}д`
}

function VerbGrid({ theme, conjugationCards, t, formType }) {
  const verbs = theme.verbList || []

  // Group verbs by their group field
  const sortedVerbs = useMemo(() =>
    [...verbs].sort((a, b) => a.infinitive.localeCompare(b.infinitive, 'fr')),
    [verbs]
  )

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-text-muted font-medium py-1 px-2">{t('learn_verbs')}</th>
            {PRONOUN_LABELS.map(p => (
              <th key={p} className="text-center text-text-muted font-medium py-1 px-1.5 min-w-[36px]">{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedVerbs.map((verb) => (
              <tr key={verb.infinitive} className="border-t border-white/[0.05]">
                <td className="py-1.5 px-2 text-white font-medium">{verb.infinitive}</td>
                {PRONOUN_LABELS.map((_, pi) => {
                  const key = conjCardKey(verb, pi, formType)
                  const card = conjugationCards[key]
                  let color = 'bg-white/[0.06]' // gray — not started
                  let title = t('status_new')
                  let dueLabel = null
                  let isDue = false
                  if (card && card.reps > 0) {
                    if (card.reps >= 3) {
                      color = 'bg-green-500/60'
                      title = t('status_mastered')
                    } else {
                      color = 'bg-amber-500/60'
                      title = t('status_learning')
                    }
                    // Show due info for any started card
                    if (card.due <= Date.now()) {
                      isDue = true
                      dueLabel = t('cards_now')
                    } else {
                      dueLabel = formatDueShort(card.due)
                    }
                  }
                  return (
                    <td key={pi} className="py-1.5 px-1.5 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <div
                          className={`w-5 h-5 rounded ${color} ${isDue ? 'ring-1 ring-orange-400 animate-pulse' : ''}`}
                          title={title}
                        />
                        {dueLabel && (
                          <span className={`text-[8px] leading-tight ${isDue ? 'text-orange-400 font-medium' : 'text-text-muted'}`}>
                            {dueLabel}
                          </span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 px-2 text-[10px] text-text-muted">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-white/[0.06]" /> {t('status_new')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500/60" /> {t('status_learning')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500/60 ring-1 ring-orange-400" /> {t('cards_due_label')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-500/60" /> {t('status_mastered')}</span>
      </div>
    </div>
  )
}

export default function TrainingPage() {
  const { conjugationCards } = useProgress()
  const { t } = useT()
  const navigate = useNavigate()
  const [expandedThemeId, setExpandedThemeId] = useState(null)

  const themesWithVerbs = useMemo(() => themes.filter(th => th.verbList?.length > 0), [])

  const overallMastery = useMemo(() => {
    if (themesWithVerbs.length === 0) return 0
    const allVerbs = []
    for (const theme of themesWithVerbs) {
      allVerbs.push(...theme.verbList)
    }
    return getThemeConjugationMastery(conjugationCards, allVerbs).percent
  }, [conjugationCards, themesWithVerbs])

  return (
    <div className="max-w-4xl mx-auto px-5 py-6">
      <h1 className="text-2xl font-extrabold text-white mb-2">{t('training_title')}</h1>

      {/* Overall progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-text-muted mb-1.5">
          <span>{t('theme_progress')}</span>
          <span>{overallMastery}%</span>
        </div>
        <div className="bg-white/[0.08] rounded-md h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-md transition-width"
            style={{ width: `${overallMastery}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {themes.map((theme) => {
          const hasVerbs = theme.verbList?.length > 0
          const formType = getFormType(theme.id)
          const themeMastery = hasVerbs
            ? getThemeConjugationMastery(conjugationCards, theme.verbList, formType)
            : null
          const percent = themeMastery ? themeMastery.percent : 0
          const dueCount = hasVerbs ? getConjugationDueCount(conjugationCards, theme.verbList, formType) : 0
          const isExpanded = expandedThemeId === theme.id

          return (
            <div
              key={theme.id}
              className={`w-full text-left bg-surface border border-border rounded-xl p-4 transition-colors ${
                hasVerbs ? '' : 'opacity-50'
              }`}
            >
              <div
                onClick={() => {
                  if (hasVerbs) setExpandedThemeId(isExpanded ? null : theme.id)
                }}
                className={hasVerbs ? 'cursor-pointer' : 'cursor-default'}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted text-sm font-mono">{theme.order}.</span>
                    <span className="font-bold text-white text-sm">{theme.titleRu}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!hasVerbs && <span className="text-text-muted text-sm">{t('locked')}</span>}
                    {hasVerbs && <span className="text-text-muted text-sm">{percent}%</span>}
                    {hasVerbs && (
                      <span className="text-text-muted text-xs">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="bg-white/[0.08] rounded-md h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-md transition-width"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                {hasVerbs && themeMastery && (
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-1.5">
                    <span>{themeMastery.mastered} {t('mastered').toLowerCase()}</span>
                    {themeMastery.learned - themeMastery.mastered > 0 && (
                      <span className="text-amber-400">{themeMastery.learned - themeMastery.mastered} {t('in_progress').toLowerCase()}</span>
                    )}
                    <span className="text-text-muted/60">{t('training_out_of')} {themeMastery.total}</span>
                    {dueCount > 0 && (
                      <span className="text-orange-400 font-medium bg-orange-400/10 px-1.5 py-0.5 rounded">
                        {dueCount} {t('cards_due_label').toLowerCase()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {isExpanded && hasVerbs && (
                <div className="mt-3 border-t border-white/[0.08] pt-3">
                  <VerbGrid theme={theme} conjugationCards={conjugationCards} t={t} formType={formType} />
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => navigate(`/learn/${theme.id}`)}
                      className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-colors text-sm"
                    >
                      {t('train_start')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
