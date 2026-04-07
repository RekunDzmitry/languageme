import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { storage } from '../utils/storage'
import { sm2, createCard } from '../utils/sm2'
import { VOCAB } from '../data/courses/fr/vocab'
import { useAuth } from './AuthContext'
import { api } from '../api/client'

const UserProgressContext = createContext()

function initCards() {
  return VOCAB.reduce((acc, w) => {
    acc[w.id] = createCard()
    return acc
  }, {})
}

const defaultProgress = {
  srsCards: null,
  conjugationCards: {},
  themeProgress: {},
  userMnemonics: {},
  stats: { streak: 0, totalReviewed: 0, lastStudyDate: null, reviewHistory: [] },
}

export function UserProgressProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [progress, setProgress] = useState(() => {
    const saved = storage.getProgress()
    return {
      ...defaultProgress,
      srsCards: initCards(),
      conjugationCards: saved?.conjugationCards || {},
      themeProgress: saved?.themeProgress || {},
      userMnemonics: saved?.userMnemonics || {},
      stats: saved?.stats || defaultProgress.stats,
    }
  })

  const [isProgressLoading, setIsProgressLoading] = useState(isAuthenticated)
  const [notification, setNotification] = useState(null)
  const saveTimer = useRef(null)

  // Debounced save to localStorage (never save srsCards — DB is source of truth)
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const { srsCards, ...rest } = progress
      storage.saveProgress(rest)
    }, 500)
    return () => clearTimeout(saveTimer.current)
  }, [progress])

  const fetchProgress = useCallback(() => {
    setIsProgressLoading(true)

    return Promise.all([
      api.get('/api/stats').catch(() => null),
      api.get('/api/progress/themes').catch(() => null),
      api.get('/api/mnemonics').catch(() => null),
      api.get('/api/study/cards').catch(() => null),
    ]).then(([statsData, themesData, mnemonicsData, cardsData]) => {
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

        return next
      })
    }).finally(() => {
      setIsProgressLoading(false)
    })
  }, [])

  // Fetch from API when authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    fetchProgress()
  }, [isAuthenticated, fetchProgress])

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
  }, [])

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
      themeProgress: progress.themeProgress,
      userMnemonics: progress.userMnemonics,
      stats: progress.stats,
      isProgressLoading,
      notification,
      showNotification,
      rateCard,
      rateConjugation,
      updateThemeProgress,
      saveMnemonic,
      clearMnemonic,
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
