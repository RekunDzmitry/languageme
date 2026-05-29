import { useT } from '../../i18n'

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

function TelcScoreBadge({ rubric }) {
  const total = rubric?.total ?? 0
  const band = rubric?.cefrBand === 'below_B1' ? '< B1' : rubric?.cefrBand
  let color
  if (total >= 15) color = 'text-green-400 bg-green-500/15 border-green-500/30'
  else if (total >= 7) color = 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30'
  else color = 'text-red-400 bg-red-500/15 border-red-500/30'

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${color}`}>
      <span className="text-2xl font-bold">{total}</span>
      <span className="text-sm">/20</span>
      {band && <span className="text-xs font-bold uppercase ml-1">{band}</span>}
    </div>
  )
}

const TELC_CRITERIA = [
  ['content', 'I Treść'],
  ['composition', 'II Kompozycja'],
  ['accuracy', 'III Poprawność'],
  ['vocabulary', 'IV Słownictwo'],
]

function TelcRubricSection({ rubric, taskPoints }) {
  if (!rubric?.criteria) return null

  const pointEntries = Object.entries(rubric.pointRatings || {})

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="text-sm text-text-muted uppercase tracking-wide">
          TELC
        </h4>
        <TelcScoreBadge rubric={rubric} />
      </div>

      {rubric.examinerSummary && (
        <p className="text-xs text-text-muted leading-relaxed mb-3">
          {rubric.examinerSummary}
        </p>
      )}

      <div className="space-y-2">
        {TELC_CRITERIA.map(([key, label]) => {
          const item = rubric.criteria[key]
          if (!item) return null
          return (
            <div key={key} className="rounded-lg bg-white/[0.03] border border-border p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-white">{label}</span>
                <span className="text-xs font-bold text-accent">{item.score}/5</span>
              </div>
              {item.comment && (
                <p className="text-xs text-text-muted leading-snug">{item.comment}</p>
              )}
            </div>
          )
        })}
      </div>

      {pointEntries.length > 0 && (
        <div className="mt-3 space-y-2">
          {pointEntries.map(([key, value]) => {
            const pointIdx = parseInt(key.replace('point', '')) - 1
            const pointLabel = taskPoints[pointIdx] || key
            const rating = value.rating || '0'
            const ratingColor = rating === '++'
              ? 'text-green-400 bg-green-500/15 border-green-500/30'
              : rating === '+'
                ? 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30'
                : 'text-red-400 bg-red-500/15 border-red-500/30'

            return (
              <div key={key} className="rounded-lg p-3 bg-bg/50 border border-border">
                <div className="flex items-start gap-2">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${ratingColor}`}>
                    {rating}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-white/80 leading-snug">{pointLabel}</p>
                    {value.snippet && (
                      <p className="text-xs text-text-muted italic leading-snug mt-1">"{value.snippet}"</p>
                    )}
                    {value.comment && (
                      <p className="text-xs text-text-muted leading-snug mt-1">{value.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
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

// ---------------------------------------------------------------------------
// Construction Replacements sub-component
// Shows level-appropriate alternatives for the user's phrasing
// ---------------------------------------------------------------------------

const LEVEL_STYLES = {
  A1: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  A2: { bg: 'bg-green-500/15', border: 'border-green-500/40', text: 'text-green-400', dot: 'bg-green-500' },
  B1: { bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  B2: { bg: 'bg-orange-500/15', border: 'border-orange-500/40', text: 'text-orange-400', dot: 'bg-orange-500' },
  C1: { bg: 'bg-red-500/15', border: 'border-red-500/40', text: 'text-red-400', dot: 'bg-red-500' },
  C2: { bg: 'bg-purple-500/15', border: 'border-purple-500/40', text: 'text-purple-400', dot: 'bg-purple-500' },
}

function LevelBadge({ level }) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.B1
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${style.bg} ${style.text} border ${style.border}`}>
      {level}
    </span>
  )
}

function ConstructionReplacementsSection({ constructionReplacements }) {
  const { t } = useT()
  if (!constructionReplacements || constructionReplacements.length === 0) return null

  return (
    <div className="p-4 border-t border-border">
      <h4 className="text-sm text-text-muted uppercase tracking-wide mb-3">
        {t('email_constructions', 'Konstrukcje')}
      </h4>
      <div className="space-y-3">
        {constructionReplacements.map((cr, i) => (
          <div key={i} className="bg-white/[0.03] border border-border rounded-lg p-3">
            {/* Original → Suggested */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <LevelBadge level={cr.originalLevel} />
              <span className="text-xs text-text-muted">→</span>
              <LevelBadge level={cr.suggestedLevel} />
            </div>

            <div className="space-y-1.5">
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wide">
                  {t('email_construction_original', 'Oryginał')}
                </span>
                <p className="text-sm text-white/70 italic">{cr.originalText}</p>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wide">
                  {t('email_construction_suggested', 'Sugestia')}
                </span>
                <p className="text-sm text-green-400 font-medium">{cr.suggestedText}</p>
              </div>
            </div>

            {cr.explanation && (
              <p className="text-xs text-text-muted mt-2 leading-relaxed">{cr.explanation}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function EmailSidePanel({
  evaluation,
  stage,
  onNewExercise,
  onRestartExercise,
  taskPoints = [],
  register = '',
}) {
  const { t } = useT()

  const errors = evaluation?.errors || []
  const score = evaluation?.score ?? 0
  const telcRubric = evaluation?.telcRubric
  const taskCoverage = evaluation?.taskCoverage || {}
  const etiquetteCheck = evaluation?.etiquetteCheck || {}
  const registerMatch = evaluation?.registerMatch
  const constructionReplacements = evaluation?.constructionReplacements || []

  return (
    <div className="bg-surface border border-border rounded-xl divide-y divide-border max-h-[calc(100vh-12rem)] overflow-y-auto flex flex-col">
      {/* Header: Score + Feedback */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm text-text-muted uppercase tracking-wide">
            {t('email_ai_eval', 'Ocena AI')}
          </h3>
          {evaluation && (telcRubric ? <TelcScoreBadge rubric={telcRubric} /> : <ScoreBadge score={score} />)}
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

      {/* TELC Rubric */}
      {evaluation && telcRubric && (
        <TelcRubricSection rubric={telcRubric} taskPoints={taskPoints} />
      )}

      {/* Task Coverage */}
      {evaluation && !telcRubric && (
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

      {/* Construction Replacements */}
      {evaluation && (
        <ConstructionReplacementsSection constructionReplacements={constructionReplacements} />
      )}

      {/* Errors themselves are shown inline on hover over the highlighted
          text (see EmailResultView), so no error list is rendered here. */}

      {/* Action buttons */}
      <div className="p-4 space-y-2">
        {/* Restart current exercise — only visible after evaluation */}
        {evaluation && onRestartExercise && (
          <button
            onClick={onRestartExercise}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-accent
                       border border-accent/40 hover:bg-accent/10
                       transition-colors"
          >
            ↻ {t('email_retry', 'Spróbuj ponownie')}
          </button>
        )}
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
