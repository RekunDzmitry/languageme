import { useState, useEffect, useRef, useCallback } from 'react'
import { useT } from '../../../i18n'

const SAVE_DEBOUNCE_MS = 500

export default function VocabNoteModal({
  vocabId,
  vocabNote,
  wordPrompt,
  onSave,
  onDelete,
  onClose,
}) {
  const { t } = useT()
  const [value, setValue] = useState(vocabNote?.content || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveConfirmed, setSaveConfirmed] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const textareaRef = useRef(null)
  const debounceTimer = useRef(null)

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Debounced auto-save on input
  const scheduleAutoSave = useCallback((text) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      const trimmed = text.trim()
      if (trimmed && trimmed !== (vocabNote?.content || '').trim()) {
        handleSave(trimmed)
      }
    }, SAVE_DEBOUNCE_MS)
  }, [vocabId, onSave, vocabNote?.content])

  const handleSave = async (text = value.trim()) => {
    if (!text || isSaving) return
    setIsSaving(true)
    setSaveConfirmed(false)
    await onSave(vocabId, text)
    setIsSaving(false)
    setSaveConfirmed(true)
    setTimeout(() => setSaveConfirmed(false), 2000)
  }

  const handleDelete = async () => {
    await onDelete(vocabId)
    onClose()
  }

  const handleChange = (e) => {
    const newVal = e.target.value
    setValue(newVal)
    scheduleAutoSave(newVal)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white/5 border-b border-white/[0.06]">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white flex items-center gap-1.5">
              📝 {t('vocab_note', 'Заметка к слову')}
            </span>
            {wordPrompt && (
              <span className="text-xs text-text-muted mt-0.5 truncate" title={wordPrompt}>
                {wordPrompt}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 ml-2"
            title={t('close', 'Закрыть')}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            placeholder={t('vocab_note_placeholder', 'Запишите подсказку, правило или ассоциацию для этого слова...')}
            rows={4}
            className="w-full min-h-[96px] px-3 py-2.5 bg-bg border border-border rounded-lg text-white text-sm
                       placeholder-text-muted/50 focus:border-accent focus:outline-none
                       resize-y"
          />

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleSave()}
              disabled={isSaving || !value.trim()}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                ${saveConfirmed
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:opacity-90 disabled:opacity-50'
                }`}
            >
              {saveConfirmed
                ? t('exercise_note_saved', '✓ Сохранено')
                : isSaving
                  ? t('exercise_note_saving', 'Сохранение...')
                  : t('save', 'Сохранить')}
            </button>

            {vocabNote && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 rounded-lg text-sm text-text-muted hover:text-red-400
                           hover:bg-red-500/10 transition-colors"
              >
                🗑 {t('delete', 'Удалить')}
              </button>
            )}

            {showDeleteConfirm && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-red-400">{t('exercise_note_delete_confirm', 'Удалить заметку?')}</span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white
                             bg-red-600 hover:bg-red-500 transition-colors"
                >
                  {t('confirm', 'Да')}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-text-muted
                             hover:text-white transition-colors"
                >
                  {t('cancel', 'Отмена')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}