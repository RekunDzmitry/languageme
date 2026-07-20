import { useEffect, useRef, useState } from 'react'
import { useT } from '../../i18n'
import { getThemeTitle } from '../../data/courses'
import { filterThemesByPack } from '../../data/lessonPacks'

// Per-language catch-all ids from migration 025. Kept for backward
// compat with rows created before migration 026; the modal itself
// now prefers the pack-scoped catch-all (e.g. pl-a1-a2_other) so a
// card filed while studying a specific pack stays in that pack.
const LEGACY_OTHER_THEME_IDS = {
  fr: 'fr_other',
  pl: 'pl_other',
}

// One-at-a-time modal for creating or editing a user-authored flashcard.
// The form is intentionally minimal — a target word/phrase, a native
// translation, a theme picker (the active pack's theme list plus a
// hard-coded "Other" option that maps to `<pack-id>_other`), and an
// optional hint. The id returned by the server is `usr_<uuid>`; we
// never round-trip a fr_/pl_ id here, so the id namespace can't
// collide with seed cards.
export default function UserCardModal({
  open,
  mode = 'new',     // 'new' | 'edit'
  initial = null,   // { id, target, translation, hint, themeIds, … } when editing
  themes = [],      // full theme list for the active lang
  targetLang,       // 'fr' | 'pl'
  activePackId,     // current pack id; used to scope the catch-all
  onSubmit,         // async (data) => createdOrUpdated
  onClose,
}) {
  const { t } = useT()
  const [target, setTarget] = useState('')
  const [translation, setTranslation] = useState('')
  const [themeId, setThemeId] = useState('')
  const [hint, setHint] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const targetInputRef = useRef(null)

  // Pack-scoped catch-all (preferred). Falls back to the per-language
  // legacy id if the active pack doesn't have one (e.g. a brand-new
  // pack whose `_other` row hasn't been seeded yet).
  const packCatchAll = activePackId ? `${activePackId}_other` : null
  const otherThemeId = packCatchAll
    || LEGACY_OTHER_THEME_IDS[targetLang]
    || null

  // Restrict the theme dropdown to the active pack so a card filed
  // here can only be themed within the user's current scope. The
  // catch-all option below lets them opt out of a specific theme.
  const scopedThemes = activePackId
    ? filterThemesByPack(themes, activePackId, targetLang)
    : themes

  // Reset the form whenever the modal opens for a different card (or
  // closes). Without this, editing one card and then opening "New" would
  // leave the previous card's fields in place — a common modal footgun.
  useEffect(() => {
    if (!open) return
    setTarget(initial?.target || '')
    setTranslation(initial?.translation || '')
    setThemeId(initial?.themeIds?.[0] || otherThemeId || '')
    setHint(initial?.hint || '')
    setError(null)
    // Focus the first field once the panel is in the DOM.
    setTimeout(() => targetInputRef.current?.focus(), 0)
  }, [open, initial, otherThemeId])

  // Close on Escape, but only when not actively saving so the user
  // doesn't accidentally abort a request mid-flight.
  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape' && !isSaving) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, isSaving, onClose])

  if (!open) return null

  async function handleSave(e) {
    e?.preventDefault()
    if (isSaving) return
    const trimmedTarget = target.trim()
    const trimmedTranslation = translation.trim()
    if (!trimmedTarget || !trimmedTranslation || !themeId) {
      setError(t('user_card_required'))
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      await onSubmit({
        target: trimmedTarget,
        translation: trimmedTranslation,
        themeId,
        hint: hint.trim() || null,
      })
      onClose()
    } catch (err) {
      setError(err?.message || t('user_card_save_error'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={() => { if (!isSaving) onClose() }}
    >
      <div
        className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <form onSubmit={handleSave} className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-text-primary">
              {mode === 'edit' ? t('user_card_edit_title') : t('user_card_new_title')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text-text-muted hover:text-text-primary text-xl leading-none"
              aria-label={t('cancel')}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            <label className="block">
              <span className="block text-xs font-medium text-text-muted mb-1">
                {t('user_card_target')}
              </span>
              <input
                ref={targetInputRef}
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={t('user_card_target_placeholder')}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent"
                disabled={isSaving}
                required
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-text-muted mb-1">
                {t('user_card_translation')}
              </span>
              <input
                type="text"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                placeholder={t('user_card_translation_placeholder')}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent"
                disabled={isSaving}
                required
              />
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-text-muted mb-1">
                {t('user_card_theme')}
              </span>
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
                disabled={isSaving}
                required
              >
                <option value="">{t('user_card_theme_placeholder')}</option>
                {scopedThemes.map((th) => (
                  <option key={th.id} value={th.id}>
                    {getThemeTitle(th, targetLang)}
                  </option>
                ))}
                {otherThemeId && (
                  <option value={otherThemeId}>{t('theme_other')}</option>
                )}
              </select>
            </label>

            <label className="block">
              <span className="block text-xs font-medium text-text-muted mb-1">
                {t('user_card_hint')} <span className="text-text-muted/70">({t('optional')})</span>
              </span>
              <textarea
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder={t('user_card_hint_placeholder')}
                rows={3}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent resize-none"
                disabled={isSaving}
              />
            </label>

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-border bg-bg/30">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3 py-1.5 bg-bg text-text-muted border border-border rounded-lg text-sm font-medium hover:text-text-primary disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 disabled:opacity-50"
            >
              {isSaving ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
