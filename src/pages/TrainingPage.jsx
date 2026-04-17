import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { useProgress } from '../stores/UserProgressContext'
import { useSettings } from '../stores/SettingsContext'
import { getThemes, getThemeTitle } from '../data/courses'
import { getThemeConjugationMastery, getConjugationDueCount } from '../utils/progress'
import { conjCardKey, PRONOUNS } from '../utils/conjugation'
import AIChatModal from '../components/ai/AIChatModal'
import FillBlank from '../components/themes/exercises/FillBlank'
import MultipleChoice from '../components/themes/exercises/MultipleChoice'
import Translation from '../components/themes/exercises/Translation'
import Matching from '../components/themes/exercises/Matching'
import WriteAnswer from '../components/themes/exercises/WriteAnswer'

// Polish pronouns for targetLang 'pl'
const PL_PRONOUNS = [
  { pl: 'ja', translation: 'я' },
  { pl: 'ty', translation: 'ты' },
  { pl: 'on/ona/ono', translation: 'он/она/оно' },
  { pl: 'my', translation: 'мы' },
  { pl: 'wy', translation: 'вы' },
  { pl: 'oni/one', translation: 'они' },
]

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

const EXERCISE_COMPONENTS = {
  fill_blank: FillBlank,
  multiple_choice: MultipleChoice,
  conjugation: Translation, // Reuse Translation for conjugation exercises
  translation: Translation,
  matching: Matching,
  write_answer: WriteAnswer,
}

function VerbGrid({ theme, conjugationCards, t, formType, onAiChat, pronounLabels }) {
  const verbs = theme.verbList || []

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
            {pronounLabels.map(p => (
              <th key={p} className="text-center text-text-muted font-medium py-1 px-1.5 min-w-[36px]">{p}</th>
            ))}
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {sortedVerbs.map((verb) => (
              <tr key={verb.infinitive} className="border-t border-white/[0.05]">
                <td className="py-1.5 px-2 text-white font-medium">{verb.infinitive}</td>
                {pronounLabels.map((_, pi) => {
                  const key = conjCardKey(verb, pi, formType)
                  const card = conjugationCards[key]
                  let color = 'bg-white/[0.06]'
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
                <td className="py-1.5 px-1.5">
                  <button
                    onClick={() => onAiChat(verb)}
                    className="w-6 h-6 flex items-center justify-center text-accent hover:bg-accent/20 rounded transition-colors"
                    title="Chat with AI about this verb"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </button>
                </td>
              </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap gap-3 mt-2 px-2 text-[10px] text-text-muted">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-white/[0.06]" /> {t('status_new')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500/60" /> {t('status_learning')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-500/60 ring-1 ring-orange-400" /> {t('cards_due_label')}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-500/60" /> {t('status_mastered')}</span>
      </div>
    </div>
  )
}

// Exercises Session Component
function ExerciseSession({ exercise, onNext, themeTitle }) {
  const { t } = useT()
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(0)

  const handleAnswer = useCallback((correct) => {
    setScore(s => s + (correct ? 1 : 0))
    setDone(d => d + 1)
    setTimeout(onNext, 1200)
  }, [onNext])

  const Component = EXERCISE_COMPONENTS[exercise.type] || WriteAnswer

  return (
    <div className="max-w-xl mx-auto px-5 py-5">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-text-muted">{themeTitle}</span>
        <span className="text-xs text-text-muted">{done + 1} / ?</span>
      </div>
      
      <Component exercise={exercise} onAnswer={handleAnswer} />
      
      {/* Score */}
      <div className="text-center mt-4 text-sm text-text-muted">
        {t('exercise_score')}: {score}/{done + 1}
      </div>
    </div>
  )
}

// Theme Exercise Card - clickable card to start exercise session
function ThemeExerciseCard({ theme, targetLang, t, onStart }) {
  const exerciseSection = theme.sections?.find(s => s.type === 'exercises')
  const exerciseCount = exerciseSection?.exercises?.length || 0

  if (exerciseCount === 0) return null

  return (
    <div
      onClick={() => onStart(theme)}
      className="w-full text-left bg-surface border border-border rounded-xl p-4 cursor-pointer hover:border-accent/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-text-muted text-sm font-mono">{theme.order}.</span>
          <span className="font-bold text-white text-sm">{getThemeTitle(theme, targetLang)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{exerciseCount} {t('exercises_count') || 'упражнений'}</span>
          <span className="text-accent">→</span>
        </div>
      </div>
    </div>
  )
}

export default function TrainingPage() {
  const { conjugationCards, updateThemeProgress } = useProgress()
  const { settings } = useSettings()
  const targetLang = settings.targetLang
  const themes = getThemes(targetLang)
  const { t } = useT()
  const navigate = useNavigate()
  const [expandedThemeId, setExpandedThemeId] = useState(null)
  const [aiChatVerb, setAiChatVerb] = useState(null)
  
  // Exercise session state
  const [exerciseSession, setExerciseSession] = useState(null) // { theme, exercises, currentIdx }

  const themesWithVerbs = useMemo(() => themes.filter(th => th.verbList?.length > 0), [])
  const themesWithExercises = useMemo(() => 
    themes.filter(th => th.sections?.some(s => s.type === 'exercises' && s.exercises?.length > 0)),
    [themes]
  )

  const pronounLabels = useMemo(() => {
    if (targetLang === 'pl') {
      return PL_PRONOUNS.map(p => p.pl)
    }
    return PRONOUNS.map(p => p.fr)
  }, [targetLang])

  const overallMastery = useMemo(() => {
    if (themesWithVerbs.length === 0) return 0
    const allVerbs = themesWithVerbs.flatMap(th => th.verbList)
    return getThemeConjugationMastery(conjugationCards, allVerbs).percent
  }, [conjugationCards, themesWithVerbs])

  // Start exercise session for a theme
  function startExerciseSession(theme) {
    const exerciseSection = theme.sections.find(s => s.type === 'exercises')
    if (exerciseSection?.exercises?.length > 0) {
      setExerciseSession({
        theme,
        exercises: [...exerciseSection.exercises],
        currentIdx: 0,
        score: 0,
        complete: false,
      })
    }
  }

  function handleExerciseNext(correct) {
    if (!exerciseSession) return
    
    const newScore = exerciseSession.score + (correct ? 1 : 0)
    const nextIdx = exerciseSession.currentIdx + 1
    
    if (nextIdx >= exerciseSession.exercises.length) {
      // Session complete
      const finalScore = newScore
      const pct = Math.round((finalScore / exerciseSession.exercises.length) * 100)
      
      // Update theme progress
      updateThemeProgress(exerciseSession.theme.id, {
        exercisesCompleted: exerciseSession.exercises.length,
        bestScore: pct,
        completedAt: pct >= 60 ? new Date().toISOString() : undefined,
      })
      
      setExerciseSession(prev => ({
        ...prev,
        currentIdx: nextIdx,
        score: newScore,
        complete: true,
      }))
    } else {
      setExerciseSession(prev => ({
        ...prev,
        currentIdx: nextIdx,
        score: newScore,
      }))
    }
  }

  function handleExerciseRetry() {
    if (!exerciseSession) return
    setExerciseSession({
      ...exerciseSession,
      currentIdx: 0,
      score: 0,
      complete: false,
    })
  }

  function closeExerciseSession() {
    setExerciseSession(null)
  }

  function handleAiChat(verb) {
    setAiChatVerb(verb)
  }

  // If in exercise session, show the exercise
  if (exerciseSession) {
    const { theme, exercises, currentIdx, score, complete } = exerciseSession
    
    if (complete) {
      const pct = Math.round((score / exercises.length) * 100)
      return (
        <div className="max-w-xl mx-auto px-5 py-10 text-center">
          <div className="text-5xl mb-4">{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'}</div>
          <h3 className="text-2xl font-extrabold text-white mb-2">
            {getThemeTitle(theme, targetLang)}
          </h3>
          <p className="text-xl text-text-muted mb-2">{t('exercise_score')}: {pct}%</p>
          <p className="text-text-muted">{score}/{exercises.length}</p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={handleExerciseRetry}
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              {t('rating_again')}
            </button>
            <button
              onClick={closeExerciseSession}
              className="px-6 py-3 rounded-xl font-bold text-white bg-surface border border-border"
            >
              {t('back_home')}
            </button>
          </div>
        </div>
      )
    }

    const exercise = exercises[currentIdx]
    return (
      <div className="max-w-xl mx-auto px-5 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={closeExerciseSession}
            className="text-text-muted hover:text-white bg-transparent border-none cursor-pointer text-lg"
          >
            ←
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{getThemeTitle(theme, targetLang)}</h2>
            <div className="text-xs text-text-muted">{currentIdx + 1} / {exercises.length}</div>
          </div>
          <div className="text-sm text-text-muted">{score} ✓</div>
        </div>

        {/* Progress */}
        <div className="bg-white/[0.08] rounded-md h-1.5 overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-md"
            style={{ width: `${((currentIdx) / exercises.length) * 100}%` }}
          />
        </div>

        {/* Exercise */}
        <ExerciseSession
          exercise={exercise}
          onNext={(correct) => handleExerciseNext(correct)}
          themeTitle={getThemeTitle(theme, targetLang)}
        />
      </div>
    )
  }

  // Main training page
  return (
    <div className="max-w-4xl mx-auto px-5 py-6">
      <h1 className="text-2xl font-extrabold text-white mb-2">{t('training_title')}</h1>

      {/* Conjugation Progress (French only) */}
      {targetLang === 'fr' && themesWithVerbs.length > 0 && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-text-muted mb-1.5">
              <span>{t('conjugation_mastery') || 'Спряжение'}</span>
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
              if (!hasVerbs) return null
              
              const formType = getFormType(theme.id)
              const themeMastery = getThemeConjugationMastery(conjugationCards, theme.verbList, formType)
              const percent = themeMastery.percent
              const dueCount = getConjugationDueCount(conjugationCards, theme.verbList, formType)
              const isExpanded = expandedThemeId === theme.id

              return (
                <div
                  key={theme.id}
                  className="w-full text-left bg-surface border border-border rounded-xl p-4"
                >
                  <div
                    onClick={() => setExpandedThemeId(isExpanded ? null : theme.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-text-muted text-sm font-mono">{theme.order}.</span>
                        <span className="font-bold text-white text-sm">{getThemeTitle(theme, targetLang)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted text-sm">{percent}%</span>
                        <span className="text-text-muted text-xs">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white/[0.08] rounded-md h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-md transition-width"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    {themeMastery && (
                      <div className="flex items-center gap-3 text-xs text-text-muted mt-1.5">
                        <span>{themeMastery.mastered} {t('mastered').toLowerCase()}</span>
                        {dueCount > 0 && (
                          <span className="text-orange-400 font-medium bg-orange-400/10 px-1.5 py-0.5 rounded">
                            {dueCount} {t('cards_due_label').toLowerCase()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-3 border-t border-white/[0.08] pt-3">
                      <VerbGrid theme={theme} conjugationCards={conjugationCards} t={t} formType={formType} onAiChat={handleAiChat} pronounLabels={pronounLabels} />
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
        </>
      )}

      {/* Exercises Section */}
      {themesWithExercises.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-white mt-8 mb-4">
            {t('exercises_title') || 'Упражнения'}
          </h2>
          
          <div className="flex flex-col gap-3">
            {themesWithExercises.map((theme) => (
              <ThemeExerciseCard
                key={theme.id}
                theme={theme}
                targetLang={targetLang}
                t={t}
                onStart={startExerciseSession}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty state for Polish (no verbs) */}
      {targetLang === 'pl' && themesWithExercises.length === 0 && (
        <div className="text-center py-10">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-text-muted">{t('no_exercises') || 'Упражнения скоро появятся'}</p>
        </div>
      )}

      {/* AI Chat Modal for verb notes */}
      {aiChatVerb && (
        <AIChatModal
          exerciseKey={`verb:${aiChatVerb.infinitive}`}
          exerciseType="verb"
          verb={aiChatVerb}
          prompt={aiChatVerb.infinitive}
          answer={null}
          onClose={() => setAiChatVerb(null)}
          onNoteSaved={null}
        />
      )}
    </div>
  )
}
