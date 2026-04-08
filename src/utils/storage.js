// localStorage utilities — used as fallback for unauthenticated users.
// For authenticated users, PostgreSQL is the source of truth (see UserProgressContext).

const PREFIX = 'lm_'
const CURRENT_VERSION = 5

export const storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.warn('Storage write failed:', e)
    }
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key)
  },

  getProgress() {
    const data = this.get('progress')
    if (!data) return null
    if (data.version < CURRENT_VERSION) {
      return this.migrateProgress(data)
    }
    return data
  },

  saveProgress(progress) {
    this.set('progress', { ...progress, version: CURRENT_VERSION })
  },

  migrateProgress(data) {
    // v1 -> v2: add reviewHistory
    if (!data.version || data.version < 2) {
      data.reviewHistory = data.reviewHistory || []
      data.version = 2
    }
    // v2 -> v3: rename lessonProgress to themeProgress
    if (data.version < 3) {
      if (data.lessonProgress) {
        data.themeProgress = data.lessonProgress
        delete data.lessonProgress
      }
      data.version = 3
    }
    // v3 -> v4: tense-aware conjugation keys (conj:X:N -> conj:X:pr:N)
    if (data.version < 4) {
      if (data.conjugationCards) {
        const migrated = {}
        for (const [key, card] of Object.entries(data.conjugationCards)) {
          const match = key.match(/^conj:(.+):(\d)$/)
          if (match) {
            migrated[`conj:${match[1]}:pr:${match[2]}`] = card
          } else {
            migrated[key] = card
          }
        }
        data.conjugationCards = migrated
      }
      data.version = 4
    }
    // v4 -> v5: add formType to conjugation keys (conj:X:pr:N -> conj:X:pr:aff:N)
    if (data.version < 5) {
      if (data.conjugationCards) {
        const migrated = {}
        for (const [key, card] of Object.entries(data.conjugationCards)) {
          const match = key.match(/^conj:(.+):pr:(\d+)$/)
          if (match) {
            migrated[`conj:${match[1]}:pr:aff:${match[2]}`] = card
          } else {
            migrated[key] = card
          }
        }
        data.conjugationCards = migrated
      }
      data.version = 5
    }
    this.saveProgress(data)
    return data
  },

  exportData() {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(PREFIX)) {
        data[key] = localStorage.getItem(key)
      }
    }
    return JSON.stringify(data, null, 2)
  },

  importData(json) {
    const data = JSON.parse(json)
    Object.entries(data).forEach(([key, value]) => {
      if (key.startsWith(PREFIX)) {
        localStorage.setItem(key, value)
      }
    })
  }
}
