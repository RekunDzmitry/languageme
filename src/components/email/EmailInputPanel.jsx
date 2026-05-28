import { useRef, useEffect } from 'react'
import { useT } from '../../i18n'

export default function EmailInputPanel({ userText, onTextChange, onEvaluate, isLoading, error, placeholder }) {
  const { t } = useT()
  const textareaRef = useRef(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const wordCount = userText.trim() ? userText.trim().split(/\s+/).length : 0
  const charCount = userText.length

  const handleSubmit = (e) => {
    e.preventDefault()
    if (userText.trim() && !isLoading) {
      onEvaluate()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm text-text-muted uppercase tracking-wide">
          {t('email_your_text', 'Twój tekst')}
        </label>
        <span className="text-xs text-text-muted">
          {wordCount} {t('email_words', 'słów')} · {charCount} {t('email_chars', 'znaków')}
        </span>
      </div>

      <textarea
        ref={textareaRef}
        value={userText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder}
        rows={14}
        className="w-full px-4 py-3 bg-bg border-2 border-border rounded-xl text-white text-base
                   placeholder-text-muted/50 focus:border-accent focus:outline-none
                   transition-colors resize-y font-mono leading-relaxed"
        autoComplete="off"
        spellCheck="false"
        lang="pl"
      />

      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={!userText.trim() || isLoading}
          className="flex-1 py-3 rounded-xl font-bold text-white
                     bg-gradient-to-r from-purple-600 to-accent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:opacity-90 transition-opacity shadow-lg shadow-purple-600/20"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('email_evaluating', 'Sprawdzanie...')}
            </span>
          ) : (
            t('email_evaluate', 'Oceń')
          )}
        </button>

        <button
          type="button"
          onClick={() => onTextChange('')}
          disabled={!userText.trim() || isLoading}
          className="px-6 py-3 rounded-xl font-medium text-text-muted
                     border border-border hover:border-text-muted
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('email_clear', 'Wyczyść')}
        </button>
      </div>
    </form>
  )
}
