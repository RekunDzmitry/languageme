import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { storage } from '../utils/storage'
import { sm2, createCard } from '../utils/sm2'
import { useAuth } from './AuthContext'
import { useSettings } from './SettingsContext'
import { api, exerciseApi, exerciseNoteApi, vocabNoteApi } from '../api/client'

const UserProgressContext = createContext()

function initCards(vocab) {
  if (!vocab || !Array.isArray(vocab)) return {}
  return vocab.reduce((acc, w) => {
    acc[w.id] = createCard()
    return acc
  }, {})
}

const defaultProgress = {
  srsCards: null,
  conjugationCards: {},  // Fetched from PostgreSQL via API when authenticated
  exerciseCards: {},      // SRS cards for Polish spelling exercises
  exerciseNotes: {},      // user-authored notes keyed by exerciseKey
  vocabNotes: {},         // user-authored notes keyed by vocabId
  themeProgress: {},
  userMnemonics: {},
  stats: { streak: 0, totalReviewed: 0, lastStudyDate: null, reviewHistory: [] },
  themeUnlockStatus: {}, // { themeId: { unlocked: bool, reason?: string } }
}

export function UserProgressProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const { settings } = useSettings()
  const targetLang = settings.targetLang
  
  const [progress, setProgress] = useState(() => {
    // For unauthenticated users, fall back to localStorage
    const saved = storage.getProgress()
    return {
      ...defaultProgress,
      // Initialize empty - will be populated by API or based on targetLang
      srsCards: {},
      // conjugationCards and exerciseCards from localStorage for unauthenticated users
      conjugationCards: saved?.conjugationCards || {},
      exerciseCards: saved?.exerciseCards || {},
      exerciseNotes: {},
      vocabNotes: {},
      themeProgress: saved?.themeProgress || {},
      userMnemonics: saved?.userMnemonics || {},
      stats: saved?.stats || defaultProgress.stats,
    }
  })

  const [isProgressLoading, setIsProgressLoading] = useState(isAuthenticated)
  const [notification, setNotification] = useState(null)
  const saveTimer = useRef(null)

  // Debounced save to localStorage (only for unauthenticated users — DB is source of truth)
  useEffect(() => {
    if (!isAuthenticated) {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        const { srsCards, ...rest } = progress
        storage.saveProgress(rest)
      }, 500)
      return () => clearTimeout(saveTimer.current)
    }
  }, [progress, isAuthenticated])

  const fetchProgress = useCallback((targetLang = 'fr') => {
    setIsProgressLoading(true)

    return Promise.all([
      api.get('/api/stats').catch(() => null),
      api.get('/api/progress/themes').catch(() => null),
      api.get('/api/mnemonics').catch(() => null),
      api.get(`/api/study/cards?target=${targetLang}`).catch(() => null),
      api.get('/api/study/conjugation').catch(() => null),  // Fetch from PostgreSQL
      api.get('/api/progress/themes/unlock-status').catch(() => null),
      api.get('/api/study/exercises').catch(() => null),  // Exercise cards for Polish
      api.get('/api/exercise-notes').catch(() => null),  // Exercise notes
      api.get('/api/vocab-notes').catch(() => null),  // Vocabulary notes
    ]).then(([statsData, themesData, mnemonicsData, cardsData, conjCardsData, unlockData, exCardsData, exNotesData, vocabNotesData]) => {
      setProgress(prev => {
        const next = { ...prev }

        if (statsData) {
          next.stats = {
            streak: statsData.streak ?? prev.stats.streak,
            totalReviewed: statsData.totalReviewed ?? prev.stats.totalReviewed,
            lastStudyDate: statsData.lastStudyDate ?? prev.stats.lastStudyDate,
            reviewHistory: prev.stats.reviewHistory,
          }
        }

        if (Array.isArray(themesData)) {
          next.themeProgress = {}
          themesData.forEach(tp => {
            next.themeProgress[tp.theme_id || tp.themeId] = {
              bestScore: tp.best_score ?? tp.bestScore ?? 0,
              completed: tp.completed ?? false,
              lastAttempt: tp.last_attempt ?? tp.lastAttempt ?? null,
            }
          })
        }

        if (Array.isArray(mnemonicsData)) {
          next.userMnemonics = {}
          mnemonicsData.forEach(m => {
            next.userMnemonics[m.vocab_id || m.vocabId] = m.text || m.mnemonic
          })
        }

        if (Array.isArray(cardsData)) {
          const cards = initCards()
          cardsData.forEach(c => {
            const id = c.vocab_id || c.vocabId
            cards[id] = {
              ease: c.ease,
              interval: c.interval_days ?? c.interval,
              reps: c.reps,
              due: new Date(c.due).getTime(),
              lastReviewed: c.last_reviewed ? new Date(c.last_reviewed).getTime() : null,
            }
          })
          next.srsCards = cards
        }

        if (unlockData && typeof unlockData === 'object') {
          next.themeUnlockStatus = unlockData
        }

        // conjugationCards from PostgreSQL (source of truth for authenticated users)
        if (conjCardsData && typeof conjCardsData === 'object') {
          next.conjugationCards = conjCardsData
        }

        // exerciseCards from PostgreSQL (source of truth for authenticated users)
        if (exCardsData && typeof exCardsData === 'object') {
          next.exerciseCards = exCardsData
        }

        // exerciseNotes from PostgreSQL
        if (Array.isArray(exNotesData)) {
          next.exerciseNotes = {}
          exNotesData.forEach(n => {
            next.exerciseNotes[n.exercise_key] = {
              content: n.content,
              themeId: n.theme_id,
              createdAt: n.created_at,
              updatedAt: n.updated_at,
            }
          })
        }

        // vocabNotes from PostgreSQL
        if (Array.isArray(vocabNotesData)) {
          next.vocabNotes = {}
          vocabNotesData.forEach(n => {
            next.vocabNotes[n.vocab_id] = {
              content: n.content,
              createdAt: n.created_at,
              updatedAt: n.updated_at,
            }
          })
        }

        return next
      })
    }).finally(() => {
      setIsProgressLoading(false)
    })
  }, [])

  // Fetch from API when authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    fetchProgress(targetLang)
  }, [isAuthenticated, fetchProgress, targetLang])

  // Initialize cards for current target language when target changes
  useEffect(() => {
    if (isAuthenticated) return // API will provide cards
    // For unauthenticated users, we could load from localStorage based on target
    const saved = storage.getProgress()
    const existingCards = saved?.srsCards || {}
    // Cards are keyed by vocab ID which includes the target prefix (fr_xxx, pl_xxx)
    // So they should automatically work when switching targets
  }, [targetLang])

  const showNotification = useCallback((msg, type = 'info') => {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const rateCard = useCallback((wordId, quality) => {
    if (isAuthenticated) {
      // Optimistic local update
      setProgress(prev => {
        const card = prev.srsCards[wordId] || createCard()
        const updated = sm2(card, quality)
        return {
          ...prev,
          srsCards: { ...prev.srsCards, [wordId]: updated },
          stats: {
            ...prev.stats,
            totalReviewed: prev.stats.totalReviewed + 1,
            lastStudyDate: new Date().toISOString().slice(0, 10),
          },
        }
      })
      api.post('/api/study/review', { vocabId: wordId, quality }).catch(err => {
        console.error('Review sync failed:', err)
      })
      return
    }

    setProgress(prev => {
      const card = prev.srsCards[wordId] || createCard()
      const updated = sm2(card, quality)
      return {
        ...prev,
        srsCards: { ...prev.srsCards, [wordId]: updated },
        stats: {
          ...prev.stats,
          totalReviewed: prev.stats.totalReviewed + 1,
          lastStudyDate: new Date().toISOString().slice(0, 10),
          reviewHistory: [
            ...prev.stats.reviewHistory.slice(-99),
            { wordId, quality, time: Date.now() }
          ],
        },
      }
    })
  }, [isAuthenticated])

  const rateExercise = useCallback((exerciseKey, themeId, quality) => {
    setProgress(prev => {
      const card = prev.exerciseCards[exerciseKey] || createCard()
      const updated = sm2(card, quality)
      return {
        ...prev,
        exerciseCards: { ...prev.exerciseCards, [exerciseKey]: updated },
        stats: {
          ...prev.stats,
          totalReviewed: prev.stats.totalReviewed + 1,
          lastStudyDate: new Date().toISOString().slice(0, 10),
        },
      }
    })

    if (isAuthenticated) {
      exerciseApi.review(exerciseKey, themeId, quality).catch(err => {
        console.error('Exercise review sync failed:', err)
      })
    }
  }, [isAuthenticated])

  const rateConjugation = useCallback((cardKey, quality) => {
    setProgress(prev => {
      const card = prev.conjugationCards[cardKey] || createCard()
      const updated = sm2(card, quality)
      return {
        ...prev,
        conjugationCards: { ...prev.conjugationCards, [cardKey]: updated },
        stats: {
          ...prev.stats,
          totalReviewed: prev.stats.totalReviewed + 1,
          lastStudyDate: new Date().toISOString().slice(0, 10),
        },
      }
    })

    if (isAuthenticated) {
      api.post('/api/study/conjugation/review', { cardKey, quality }).catch(err => {
        console.error('Conjugation review sync failed:', err)
      })
    }
  }, [isAuthenticated])

  const updateThemeProgress = useCallback((themeId, data) => {
    setProgress(prev => ({
      ...prev,
      themeProgress: {
        ...prev.themeProgress,
        [themeId]: { ...prev.themeProgress[themeId], ...data },
      },
    }))

    if (isAuthenticated && data.bestScore !== undefined) {
      api.post(`/api/progress/themes/${themeId}`, { score: data.bestScore }).catch(err => {
        console.error('Theme progress sync failed:', err)
      })
    }
  }, [isAuthenticated])

  const saveMnemonic = useCallback((wordId, text) => {
    setProgress(prev => ({
      ...prev,
      userMnemonics: { ...prev.userMnemonics, [wordId]: text },
    }))

    if (isAuthenticated) {
      api.put(`/api/mnemonics/${wordId}`, { text }).catch(err => {
        console.error('Mnemonic save failed:', err)
      })
    }
  }, [isAuthenticated])

  const clearMnemonic = useCallback((wordId) => {
    setProgress(prev => {
      const next = { ...prev.userMnemonics }
      delete next[wordId]
      return { ...prev, userMnemonics: next }
    })

    if (isAuthenticated) {
      api.delete(`/api/mnemonics/${wordId}`).catch(err => {
        console.error('Mnemonic delete failed:', err)
      })
    }
  }, [isAuthenticated])

  const resetCard = useCallback((wordId) => {
    setProgress(prev => ({
      ...prev,
      srsCards: {
        ...prev.srsCards,
        [wordId]: { ease: 2.5, interval: 1, reps: 0, due: Date.now(), lastReviewed: null },
      },
    }))
  }, [])

  const updateCard = useCallback((wordId, changes) => {
    setProgress(prev => ({
      ...prev,
      srsCards: {
        ...prev.srsCards,
        [wordId]: { ...prev.srsCards[wordId], ...changes },
      },
    }))
  }, [])

  const saveExerciseNote = useCallback((exerciseKey, themeId, content) => {
    setProgress(prev => ({
      ...prev,
      exerciseNotes: {
        ...prev.exerciseNotes,
        [exerciseKey]: { content, themeId, createdAt: prev.exerciseNotes[exerciseKey]?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() },
      },
    }))

    if (isAuthenticated) {
      exerciseNoteApi.save(exerciseKey, themeId, content).catch(err => {
        console.error('Exercise note save failed:', err)
      })
    }
  }, [isAuthenticated])

  const clearExerciseNote = useCallback((exerciseKey) => {
    setProgress(prev => {
      const next = { ...prev.exerciseNotes }
      delete next[exerciseKey]
      return { ...prev, exerciseNotes: next }
    })

    if (isAuthenticated) {
      exerciseNoteApi.delete(exerciseKey).catch(err => {
        console.error('Exercise note delete failed:', err)
      })
    }
  }, [isAuthenticated])

  const saveVocabNote = useCallback((vocabId, content) => {
    setProgress(prev => ({
      ...prev,
      vocabNotes: {
        ...prev.vocabNotes,
        [vocabId]: { content, createdAt: prev.vocabNotes[vocabId]?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() },
      },
    }))

    if (isAuthenticated) {
      vocabNoteApi.save(vocabId, content).catch(err => {
        console.error('Vocab note save failed:', err)
      })
    }
  }, [isAuthenticated])

  const clearVocabNote = useCallback((vocabId) => {
    setProgress(prev => {
      const next = { ...prev.vocabNotes }
      delete next[vocabId]
      return { ...prev, vocabNotes: next }
    })

    if (isAuthenticated) {
      vocabNoteApi.delete(vocabId).catch(err => {
        console.error('Vocab note delete failed:', err)
      })
    }
  }, [isAuthenticated])

  const incrementStreak = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      stats: { ...prev.stats, streak: prev.stats.streak + 1 },
    }))
  }, [])

  const importConjugationCards = useCallback((cards) => {
    setProgress(prev => ({
      ...prev,
      conjugationCards: { ...prev.conjugationCards, ...cards },
    }))
  }, [])

  return (
    <UserProgressContext.Provider value={{
      cards: progress.srsCards,
      conjugationCards: progress.conjugationCards,
      exerciseCards: progress.exerciseCards,
      exerciseNotes: progress.exerciseNotes,
      vocabNotes: progress.vocabNotes,
      themeProgress: progress.themeProgress,
      userMnemonics: progress.userMnemonics,
      stats: progress.stats,
      themeUnlockStatus: progress.themeUnlockStatus,
      isProgressLoading,
      notification,
      showNotification,
      rateCard,
      rateConjugation,
      rateExercise,
      updateThemeProgress,
      saveMnemonic,
      clearMnemonic,
      saveExerciseNote,
      clearExerciseNote,
      saveVocabNote,
      clearVocabNote,
      resetCard,
      updateCard,
      incrementStreak,
      importConjugationCards,
      refreshProgress: fetchProgress,
    }}>
      {children}
    </UserProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(UserProgressContext)
  if (!ctx) throw new Error('useProgress must be used within UserProgressProvider')
  return ctx
}
