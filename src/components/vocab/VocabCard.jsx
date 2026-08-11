import { useState } from 'react'
import { useT } from '../../i18n'
import { useSettings } from '../../stores/SettingsContext'
import { useCourseData } from '../../lib/courseData'
import { resolveHint, resolveTranslation } from '../../lib/displayHint'
import SpeakerButton from '../common/SpeakerButton'

export default function VocabCard({ word, card, userMnemonic, onSaveMnemonic, onClearMnemonic, userTranslation, onSaveTranslation, onClearTranslation }) {
  const { t } = useT()
  const { settings } = useSettings()
  const course = useCourseData()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [transEditing, setTransEditing] = useState(false)
  const [transDraft, setTransDraft] = useState('')

  const startTranslationEdit = () => {
    setTransDraft(userTranslation || translation || '')
    setTransEditing(true)
  }
  const saveTranslationEdit = () => {
    onSaveTranslation?.(word.id, settings.nativeLang, transDraft.trim())
    setTransEditing(false)
  }

  const mastered = card?.reps >= 3
  const inProgress = card?.reps > 0 && card?.reps < 3
  const status = mastered ? '✅' : inProgress ? '🔄' : '🆕'
  const translation = resolveTranslation({
    translations: word.translations,
    nativeLang: settings.nativeLang,
    fallback: userTranslation,
  })
  const builtinHint = word.hint || course.hintsByVocab[word.id] || ''
  const hint = resolveHint({ userMnemonic, builtinHint })
  const examples = course.examplesByVocab[word.id] || []

  const startEdit = () => {
    setDraft(userMnemonic || '')
    setEditing(true)
  }

  const saveEdit = () => {
    const text = draft.trim()
    if (text) {
      onSaveMnemonic(word.id, text)
    } else {
      onClearMnemonic(word.id)
    }
    setEditing(false)
  }

  return (
    <div
      className="bg-surface border border-border rounded-xl p-3 transition-colors cursor-pointer"
      onClick={() => !editing && setExpanded(!expanded)}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wide">{word.theme}</span>
        <span className="text-sm">{status}</span>
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="text-base font-extrabold text-white">{word.target}</div>
        <SpeakerButton text={word.target} size="sm" />
      </div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-blue-400 font-medium">{translation}</div>
        {onSaveTranslation && (
          <button
            onClick={(e) => { e.stopPropagation(); startTranslationEdit() }}
            className="text-[10px] text-blue-300/50 hover:text-blue-300"
            title={t('edit_translation', 'Изменить перевод')}
          >
            {userTranslation ? '✎ custom' : '✎'}
          </button>
        )}
      </div>
      <div className="text-[11px] text-text-muted font-mono mb-1">{word.ipa}</div>

      {expanded && (
        <div className="mt-2 border-t border-border pt-2 space-y-2" onClick={e => e.stopPropagation()}>
          {/* Dictionary info */}
          {word.translations?.en && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-white/30">EN</span>
              <span className="text-xs text-white/50">{word.translations.en}</span>
            </div>
          )}
          {word.gender && (
            <div className="text-[11px] text-accent">
              {word.gender === 'm' ? t('masculine') : t('feminine')}
            </div>
          )}

          {/* Example usage */}
          {examples.length > 0 && (
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide mb-1">{t('example_usage')}</div>
              {examples.map((ex, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-start gap-1">
                    <span className="text-xs text-white/70 italic leading-relaxed">{ex.fr}</span>
                    <SpeakerButton text={ex.fr} size="sm" />
                  </div>
                  <div className="text-[11px] text-white/35 leading-relaxed">{ex.ru}</div>
                </div>
              ))}
            </div>
          )}

          {/* Mnemonic display */}
          {hint && !editing && (
            <div className="bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/20 rounded-lg p-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-accent font-bold uppercase tracking-wide">{t('memory_hook')}</span>
                {userMnemonic && <span className="text-[9px] text-accent/60">{t('custom')}</span>}
              </div>
              <div className="text-xs text-text-muted leading-relaxed">{hint}</div>
            </div>
          )}

          {/* Edit translation (in expanded view) */}
          {transEditing && (
            <div className="space-y-1.5">
              <div className="text-[10px] text-white/30">
                <span className="font-semibold">seed:</span> {translation}
              </div>
              <textarea
                value={transDraft}
                onChange={e => setTransDraft(e.target.value)}
                placeholder={t('translation_placeholder', 'Ваш перевод')}
                className="w-full bg-black/30 border border-blue-400/30 rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none focus:border-blue-400 resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-1.5">
                <button
                  onClick={saveTranslationEdit}
                  className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md hover:bg-blue-500/30"
                >{t('save', 'Сохранить')}</button>
                {userTranslation && onClearTranslation && (
                  <button
                    onClick={() => { onClearTranslation(word.id, settings.nativeLang); setTransEditing(false) }}
                    className="text-[10px] text-red-300 px-2 py-1 rounded-md hover:bg-red-500/10"
                  >{t('reset', 'Сбросить')}</button>
                )}
                <button
                  onClick={() => setTransEditing(false)}
                  className="text-[10px] text-white/40 px-2 py-1 rounded-md hover:text-white/60"
                >✕</button>
              </div>
            </div>
          )}

          {/* Edit mnemonic */}
          {editing ? (
            <div className="space-y-1.5">
              {builtinHint && (
                <div className="text-[10px] text-white/30">
                  <span className="font-semibold">{t('builtin_hook')}:</span> {builtinHint}
                </div>
              )}
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={t('mnemonic_placeholder')}
                className="w-full bg-black/30 border border-accent/30 rounded-lg px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-1.5">
                <button
                  onClick={saveEdit}
                  className="text-[10px] bg-accent/20 text-accent px-2 py-1 rounded-md hover:bg-accent/30"
                >
                  {t('save_mnemonic')}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-[10px] text-white/40 px-2 py-1 rounded-md hover:text-white/60"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startEdit}
              className="text-[10px] text-accent/60 hover:text-accent transition-colors"
            >
              {userMnemonic ? t('tab_edit') : `+ ${t('your_mnemonic')}`}
            </button>
          )}

          {card && (
            <div className="text-[10px] text-white/20 font-mono">
              Rep {card.reps} · EF {card.ease?.toFixed(1)}
            </div>
          )}
        </div>
      )}

      {!expanded && card && (
        <div className="text-[10px] text-white/20 font-mono">
          Rep {card.reps} · EF {card.ease?.toFixed(1)}
        </div>
      )}
    </div>
  )
}
