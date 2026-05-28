import { useState, useEffect, useRef, useCallback } from 'react'
import { useT } from '../../../i18n'

const SAVE_DEBOUNCE_MS = 500

export default function ExerciseNotePanel({
  existingNote,
  exerciseKey,
  themeId,
  onSave,
  onDelete,
  onClose,
}) {
  const { t } = useT()
  const [value, setValue] = useState(existingNote?.content || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveConfirmed, setSaveConfirmed] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const textareaRef = useRef(null)
  const debounceTimer = useRef(null)

  // Sync if existingNote changes (e.g. navigating between exercises)
  useEffect(() => {
    setValue(existingNote?.content || '')
    setSaveConfirmed(false)
    setShowDeleteConfirm(false)
  }, [exerciseKey, existingNote?.content])

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Debounced auto-save on input
  const scheduleAutoSave = useCallback((text) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      const trimmed = text.trim()
      if (trimmed && trimmed !== (existingNote?.content || '').trim()) {
        handleSave(trimmed)
      }
    }, SAVE_DEBOUNCE_MS)
  }, [exerciseKey, themeId, onSave, existingNote?.content])

  const handleSave = async (text = value.trim()) => {
    if (!text || isSaving) return
    setIsSaving(true)
    setSaveConfirmed(false)
    await onSave(exerciseKey, themeId, text)
    setIsSaving(false)
    setSaveConfirmed(true)
    setTimeout(() => setSaveConfirmed(false), 2000)
  }

  const handleDelete = async () => {
    await onDelete(exerciseKey)
    setValue('')
    setShowDeleteConfirm(false)
  }

  const handleChange = (e) => {
    const newVal = e.target.value
    setValue(newVal)
    scheduleAutoSave(newVal)
  }

  return (
    <div className="mt-4 bg-surface border border-border rounded-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/5">
        <span className="text-sm font-semibold text-white flex items-center gap-1.5">
          📝 {t('exercise_note', 'Заметка')}
        </span>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-white transition-colors p-1"
          title={t('close', 'Закрыть')}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder={t('exercise_note_placeholder', 'Запишите подсказку, правило или ассоциацию для этого упражнения...')}
          rows={3}
          className="w-full min-h-[72px] px-3 py-2.5 bg-bg border border-border rounded-lg text-white text-sm
                     placeholder-text-muted/50 focus:border-accent focus:outline-none
                     resize-y"
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
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

          {existingNote && !showDeleteConfirm && (
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
  )
}
