import { useRef, useEffect } from 'react'
import { useT } from '../../i18n'
import WordProposalCard from './WordProposalCard'

// Category color mapping
const CATEGORY_STYLES = {
  spelling: {
    bg: 'bg-red-500/15',
    border: 'border-red-500/40',
    text: 'text-red-400',
    dot: 'bg-red-500',
    labelKey: 'email_cat_spelling',
  },
  grammar: {
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/40',
    text: 'text-orange-400',
    dot: 'bg-orange-500',
    labelKey: 'email_cat_grammar',
  },
  style: {
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/40',
    text: 'text-blue-400',
    dot: 'bg-blue-500',
    labelKey: 'email_cat_style',
  },
  vocabulary: {
    bg: 'bg-yellow-500/15',
    border: 'border-yellow-500/40',
    text: 'text-yellow-400',
    dot: 'bg-yellow-500',
    labelKey: 'email_cat_vocabulary',
  },
}

function ScoreBadge({ score }) {
  let color
  if (score >= 80) color = 'text-green-400 bg-green-500/15 border-green-500/30'
  else if (score >= 60) color = 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30'
  else color = 'text-red-400 bg-red-500/15 border-red-500/30'

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${color}`}>
      <span className="text-2xl font-bold">{score}</span>
      <span className="text-sm">/100</span>
    </div>
  )
}

// Task Coverage sub-component
function TaskCoverageSection({ taskCoverage, taskPoints }) {
  const { t } = useT()
  if (!taskCoverage || Object.keys(taskCoverage).length === 0) return null

  const entries = Object.entries(taskCoverage)
  if (entries.length === 0) return null

  return (
    <div className="p-4 border-t border-border">
      <h4 className="text-sm text-text-muted uppercase tracking-wide mb-3">
        {t('email_task_coverage', 'Zakres treści')}
      </h4>
      <div className="space-y-2">
        {entries.map(([key, value]) => {
          const pointIdx = parseInt(key.replace('point', '')) - 1
          const pointLabel = taskPoints[pointIdx] || key
          const isCovered = value.covered

          return (
            <div
              key={key}
              className={`rounded-lg p-3 ${
                isCovered
                  ? 'bg-green-500/10 border border-green-500/25'
                  : 'bg-red-500/10 border border-red-500/25'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold ${isCovered ? 'text-green-400' : 'text-red-400'}`}>
                  {isCovered ? '✓' : '✗'}
                </span>
                <span className="text-xs text-text-muted font-medium">
                  {t('email_point_n', 'Punkt {n}').replace('{n}', pointIdx + 1)}
                </span>
              </div>
              <p className="text-xs text-white/80 leading-snug mb-1">{pointLabel}</p>
              {isCovered && value.snippet && (
                <p className="text-xs text-green-400/80 italic leading-snug">
                  «{value.snippet}»
                </p>
              )}
              {value.feedback && (
                <p className="text-xs text-text-muted leading-snug mt-1">
                  {value.feedback}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Etiquette Check sub-component
function EtiquetteSection({ etiquetteCheck }) {
  const { t } = useT()
  if (!etiquetteCheck || (!etiquetteCheck.greeting && !etiquetteCheck.closing)) return null

  return (
    <div className="p-4 border-t border-border">
      <h4 className="text-sm text-text-muted uppercase tracking-wide mb-3">
        {t('email_etiquette', 'Zwroty grzecznościowe')}
      </h4>
      <div className="space-y-2">
        <div className={`flex items-center gap-2 text-xs ${etiquetteCheck.greeting ? 'text-green-400' : 'text-red-400'}`}>
          <span className="font-bold">{etiquetteCheck.greeting ? '✓' : '✗'}</span>
          <span>
            {t('email_greeting', 'Pozdrowienie')}
            {etiquetteCheck.greetingText && (
              <span className="text-text-muted ml-1">— «{etiquetteCheck.greetingText}»</span>
            )}
          </span>
        </div>
        <div className={`flex items-center gap-2 text-xs ${etiquetteCheck.closing ? 'text-green-400' : 'text-red-400'}`}>
          <span className="font-bold">{etiquetteCheck.closing ? '✓' : '✗'}</span>
          <span>
            {t('email_closing', 'Pożegnanie')}
            {etiquetteCheck.closingText && (
              <span className="text-text-muted ml-1">— «{etiquetteCheck.closingText}»</span>
            )}
          </span>
        </div>
        {etiquetteCheck.feedback && (
          <p className="text-xs text-text-muted leading-snug mt-1">
            {etiquetteCheck.feedback}
          </p>
        )}
      </div>
    </div>
  )
}

// Register Match sub-component
function RegisterMatchSection({ registerMatch, register }) {
  const { t } = useT()
  if (!register) return null

  const label = registerMatch
    ? t('email_register_ok', 'Ton odpowiada stylowi ({register})').replace('{register}', register)
    : t('email_register_mismatch', 'Ton nie odpowiada stylowi ({register})').replace('{register}', register)

  return (
    <div className="p-4 border-t border-border">
      <h4 className="text-sm text-text-muted uppercase tracking-wide mb-2">
        {t('email_register', 'Styl')}
      </h4>
      <div className={`flex items-center gap-2 text-xs ${registerMatch ? 'text-green-400' : 'text-red-400'}`}>
        <span className="font-bold text-lg">{registerMatch ? '✓' : '✗'}</span>
        <span>{label}</span>
      </div>
    </div>
  )
}

export default function EmailSidePanel({
  evaluation,
  stage,
  selectedErrorIdx,
  onSelectError,
  onAddWord,
  addedWords,
  onNewExercise,
  taskPoints = [],
  register = '',
  themes = [],
}) {
  const { t } = useT()
  const errorRefs = useRef({})

  // Scroll to selected error
  useEffect(() => {
    if (selectedErrorIdx !== null && errorRefs.current[selectedErrorIdx]) {
      errorRefs.current[selectedErrorIdx].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [selectedErrorIdx])

  const errors = evaluation?.errors || []
  const score = evaluation?.score ?? 0
  const taskCoverage = evaluation?.taskCoverage || {}
  const etiquetteCheck = evaluation?.etiquetteCheck || {}
  const registerMatch = evaluation?.registerMatch

  return (
    <div className="bg-surface border border-border rounded-xl divide-y divide-border max-h-[calc(100vh-12rem)] flex flex-col">
      {/* Header: Score + Feedback */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm text-text-muted uppercase tracking-wide">
            {t('email_ai_eval', 'Ocena AI')}
          </h3>
          {evaluation && <ScoreBadge score={score} />}
        </div>

        {/* Waiting state */}
        {!evaluation && (
          <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
            <span className="text-2xl opacity-60">(◔_◔)</span>
            <p className="text-sm text-text-muted font-medium">
              {stage === 'loading'
                ? t('email_checking', 'Sprawdzamy Twój e-mail...')
                : t('email_waiting', 'Czeka na ocenę')}
            </p>
            {stage !== 'loading' && (
              <p className="text-xs text-text-muted/60">
                {t('email_waiting_hint', 'Napisz e-mail i kliknij «Oceń»')}
              </p>
            )}
            {stage === 'loading' && (
              <div className="mt-1 w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}

        {evaluation?.overallFeedback && (
          <p className="text-sm text-text-primary leading-relaxed">
            {evaluation.overallFeedback}
          </p>
        )}

        {/* Error count summary */}
        {errors.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.entries(CATEGORY_STYLES).map(([key, style]) => {
              const count = errors.filter(e => e.category === key).length
              if (count === 0) return null
              return (
                <span key={key} className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                  {t(style.labelKey)}: {count}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Task Coverage */}
      {evaluation && (
        <TaskCoverageSection taskCoverage={taskCoverage} taskPoints={taskPoints} />
      )}

      {/* Etiquette Check */}
      {evaluation && (
        <EtiquetteSection etiquetteCheck={etiquetteCheck} />
      )}

      {/* Register Match */}
      {evaluation && register && (
        <RegisterMatchSection registerMatch={registerMatch} register={register} />
      )}

      {/* Error list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {errors.length === 0 ? (
          evaluation ? (
            <div className="text-center py-6">
              <span className="text-3xl">🎉</span>
              <p className="text-text-muted text-sm mt-2">
                {t('email_no_errors', 'Nie znaleziono błędów! Świetna robota!')}
              </p>
            </div>
          ) : null
        ) : (
          errors.map((err, idx) => {
            const style = CATEGORY_STYLES[err.category] || CATEGORY_STYLES.grammar
            const isSelected = selectedErrorIdx === idx

            return (
              <div
                key={err.id || idx}
                ref={el => (errorRefs.current[idx] = el)}
                onClick={() => onSelectError(idx)}
                className={`rounded-lg border-2 p-3 cursor-pointer transition-all
                  ${style.bg} ${isSelected ? `${style.border} ring-2 ring-accent` : 'border-transparent hover:border-white/10'}`}
              >
                {/* Category + index */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  <span className={`text-xs font-bold uppercase ${style.text}`}>
                    {t(style.labelKey)}
                  </span>
                  <span className="text-xs text-text-muted">#{idx + 1}</span>
                </div>

                {/* Original → Correction */}
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="text-red-400 line-through">{err.originalText}</span>
                  </div>
                  {err.correction && (
                    <div className="text-sm">
                      <span className="text-green-400 font-semibold">{err.correction}</span>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                {err.explanation && (
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    {err.explanation}
                  </p>
                )}

                {/* Word proposals */}
                {err.proposedWords && err.proposedWords.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-text-muted font-medium">
                       {t('email_learn_words', 'Dodaj do nauki')}
                    </p>
                    {err.proposedWords.map((pw, pwi) => (
                      <WordProposalCard
                        key={pwi}
                        target={pw.target}
                        translation={pw.translation}
                        suggestedThemeId={pw.suggestedThemeId}
                        themes={themes}
                        isAdded={addedWords.has(pw.target)}
                        onAdd={(themeId) => onAddWord(pw.target, pw.translation, themeId, err.explanation)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* New exercise button */}
      <div className="p-4">
        <button
          onClick={onNewExercise}
          className="w-full py-3 rounded-xl font-bold text-white
                     bg-gradient-to-r from-accent to-purple-600
                     hover:opacity-90 transition-opacity shadow-lg shadow-purple-600/20"
        >
          {t('email_new_exercise', 'Nowe ćwiczenie')}
        </button>
      </div>
    </div>
  )
}
