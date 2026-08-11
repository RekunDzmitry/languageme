import { useEffect, useState } from 'react'
import { useT } from '../../i18n'
import { useSettings } from '../../stores/SettingsContext'
import { useCourseData } from '../../lib/courseData'
import { resolveHint, resolveTranslation } from '../../lib/displayHint'
import { useSpeechLang } from '../../hooks/useSpeechLang'
import SpeakerButton from '../common/SpeakerButton'
import { speak } from '../../utils/audio'

export default function Flashcard({ word, flipped, onFlip, userMnemonic, vocabNote, onNoteClick, onRate, userTranslation, onSaveTranslation, onClearTranslation }) {
  const { t } = useT()
  const { settings } = useSettings()
  const course = useCourseData()
  const speechLang = useSpeechLang()
  const nativeLang = settings.nativeLang
  const targetLang = settings.targetLang
  const builtinHint = word.hint || course.hintsByVocab[word.id] || ''
  const hint = resolveHint({ userMnemonic, builtinHint })
  const translation = resolveTranslation({
    translations: word.translations,
    nativeLang,
    fallback: userTranslation,
  })

  useEffect(() => {
    if (flipped) speak(word.target, speechLang)
  }, [word, flipped, speechLang])

  function handleReveal() {
    if (!flipped) onFlip()
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Badge */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="bg-surface border border-border rounded-lg px-3 py-1 text-xs font-semibold text-accent">
          {nativeLang.toUpperCase()} → {targetLang.toUpperCase()}
        </div>
      </div>

      {/* Prompt — native language */}
      <div className="text-center">
        <div className="text-3xl font-extrabold text-white mb-2">{translation}</div>
      </div>

      {/* Translation override control — let the user pin a custom
          translation for this vocab so the seed value can be wrong
          in their language and still be corrected without editing
          000_bootstrap.sql. */}
      <TranslationEditor
        wordId={word.id}
        nativeLang={nativeLang}
        userTranslation={userTranslation}
        currentTranslation={translation}
        onSave={onSaveTranslation}
        onClear={onClearTranslation}
      />

      {!flipped ? (
        <button
          onClick={handleReveal}
          className="w-full max-w-sm py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 transition-opacity"
        >
          {t('study_tap_reveal')}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="text-text-muted text-sm">{t('correct_answer')}:</div>
          <div className="flex items-center gap-2">
            <span className="text-white text-2xl font-bold">{word.target}</span>
            <SpeakerButton text={word.target} size="sm" />
          </div>

          {hint && (
            <div className="w-full max-w-sm mt-1 bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/20 rounded-xl p-3 px-4">
              <div className="text-[11px] text-accent font-bold uppercase tracking-wide mb-1">
                {t('memory_hook')}
              </div>
              <div className="text-sm text-text-muted leading-relaxed">{hint}</div>
            </div>
          )}

          {/* Vocab note */}
          <div className="flex items-start gap-2 w-full max-w-sm">
            <button
              onClick={onNoteClick}
              className={`mt-1 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors
                ${vocabNote
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-white/10 text-text-muted hover:bg-white/15 hover:text-white'
                }`}
              title={t('vocab_note', 'Заметка к слову')}
            >
              📝
            </button>
            {vocabNote && (
              <div className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 px-4">
                <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wide mb-1">
                  {t('vocab_note', 'Заметка')}
                </div>
                <div className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">{vocabNote.content}</div>
              </div>
            )}
          </div>

          <div className="text-sm text-text-muted mt-2">{t('study_how_well')}</div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
            <button
              onClick={() => onRate(3)}
              className="px-2 sm:px-8 py-3 rounded-xl font-bold text-green-400 border border-green-400/40 hover:bg-green-400/10 transition-colors"
            >
              {t('rating_easy')}
            </button>
            <button
              onClick={() => onRate(2)}
              className="px-2 sm:px-8 py-3 rounded-xl font-bold text-blue-400 border border-blue-400/40 hover:bg-blue-400/10 transition-colors"
            >
              {t('rating_good')}
            </button>
            <button
              onClick={() => onRate(1)}
              className="px-2 sm:px-8 py-3 rounded-xl font-bold text-orange-400 border border-orange-400/40 hover:bg-orange-400/10 transition-colors"
            >
              {t('rating_hard')}
            </button>
            <button
              onClick={() => onRate(0)}
              className="px-2 sm:px-8 py-3 rounded-xl font-bold text-red-400 border border-red-400/40 hover:bg-red-400/10 transition-colors"
            >
              {t('rating_again')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TranslationEditor({ wordId, nativeLang, userTranslation, currentTranslation, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const { t } = useT()

  if (!onSave) return null

  const start = () => { setDraft(userTranslation || currentTranslation || ''); setEditing(true) }
  const save = () => { onSave(wordId, nativeLang, draft.trim()); setEditing(false) }

  if (editing) {
    return (
      <div className="w-full max-w-sm flex flex-col gap-2 bg-black/30 border border-blue-400/30 rounded-lg p-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wide">{t('edit_translation', 'Изменить перевод')}</span>
          <span className="text-[10px] text-white/40 font-mono">{wordId}</span>
        </div>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          autoFocus
          rows={2}
          className="w-full bg-black/40 border border-white/20 rounded px-2 py-1 text-sm text-white outline-none focus:border-blue-400 resize-none"
        />
        <div className="flex gap-1.5">
          <button
            onClick={save}
            className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded hover:bg-blue-500/30"
          >{t('save', 'Сохранить')}</button>
          <button
            onClick={() => setEditing(false)}
            className="text-[10px] text-white/40 px-2 py-1 rounded hover:text-white/60"
          >✕</button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={start}
      className="text-[10px] text-blue-300/60 hover:text-blue-300 transition-colors flex items-center gap-1"
      title={t('edit_translation', 'Изменить перевод')}
    >
      {userTranslation ? '✎ custom' : `+ ${t('edit_translation', 'Изменить перевод')}`}
    </button>
  )
}
