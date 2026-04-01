import { useEffect } from 'react'
import { useT } from '../../i18n'
import { hints as ruHints } from '../../data/courses/fr/hints/ru'
import { EXAMPLES } from '../../data/courses/fr/examples'
import SpeakerButton from '../common/SpeakerButton'
import { speak } from '../../utils/audio'

function DictSection({ word, t }) {
  const enTranslation = word.translations?.en
  return (
    <div className="bg-white/5 rounded-xl p-3 px-4 w-full box-border mt-3">
      <div className="text-[11px] text-blue-400 font-bold uppercase tracking-wide mb-2">{t('dictionary')}</div>
      <div className="space-y-1.5">
        {word.ipa && (
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-xs font-mono">IPA</span>
            <span className="text-sm text-white/60 font-mono">{word.ipa}</span>
          </div>
        )}
        {enTranslation && (
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-xs">EN</span>
            <span className="text-sm text-white/60">{enTranslation}</span>
          </div>
        )}
        {word.gender && (
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-xs">⚥</span>
            <span className="text-sm text-accent">{word.gender === 'm' ? t('masculine') : t('feminine')}</span>
          </div>
        )}
        {word.freq && (
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-xs">#</span>
            <span className="text-sm text-white/40">{t('freq_top', { n: word.freq })}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function MnemonicSection({ hint, t }) {
  if (!hint) return null
  return (
    <div className="bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/20 rounded-xl p-3 px-4 w-full box-border mt-3">
      <div className="text-[11px] text-accent font-bold uppercase tracking-wide mb-1.5">{t('memory_hook')}</div>
      <div className="text-sm text-text-muted leading-relaxed">{hint}</div>
    </div>
  )
}

function ExampleSection({ examples, t }) {
  if (!examples || examples.length === 0) return null
  return (
    <div className="bg-white/5 rounded-xl p-3 px-4 w-full box-border mt-3">
      <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wide mb-2">{t('example_usage')}</div>
      <div className="space-y-2">
        {examples.map((ex, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex items-start gap-1.5">
              <span className="text-sm text-white/80 italic leading-relaxed">{ex.fr}</span>
              <SpeakerButton text={ex.fr} size="sm" />
            </div>
            <div className="text-xs text-white/40 leading-relaxed">{ex.ru}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Flashcard({ word, flipped, onFlip, userMnemonic, autoPlay }) {
  const { t } = useT()
  const hint = userMnemonic || ruHints[word.id] || ''
  const translation = word.translations?.ru || word.translations?.en || ''
  const examples = EXAMPLES[word.id] || []

  useEffect(() => {
    if (autoPlay) speak(word.target)
  }, [word, autoPlay])

  return (
    <div className="perspective cursor-pointer select-none" onClick={() => !flipped && onFlip()}>
      <div className={`relative min-h-[300px] preserve-3d transition-transform-500 ${flipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="backface-hidden absolute w-full min-h-[300px] bg-gradient-to-br from-surface to-[#1a1a2e] border border-purple-400/20 rounded-2xl px-7 py-7 flex flex-col items-center justify-center box-border">
          <div className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-4">{word.theme}</div>
          <div className="flex items-center gap-2">
            <div className="text-4xl md:text-5xl font-extrabold text-white text-center tracking-tight">{word.target}</div>
            <SpeakerButton text={word.target} size="md" />
          </div>
          {word.gender && (
            <div className="text-sm text-accent font-semibold mt-2">
              {word.gender === 'm' ? t('masculine') : t('feminine')}
            </div>
          )}
          <div className="text-sm text-text-muted mt-1.5 font-mono">{word.ipa}</div>
          <div className="text-xs text-white/25 mt-6 italic">{t('study_tap_reveal')}</div>
        </div>
        {/* Back */}
        <div className="backface-hidden absolute w-full min-h-[300px] bg-gradient-to-br from-[#0f1a2e] to-[#1a1a2e] border border-blue-400/25 rounded-2xl px-7 py-7 flex flex-col items-center justify-center rotate-y-180 box-border">
          <div className="text-3xl font-extrabold text-blue-400 text-center mb-1">{translation}</div>
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xl text-white/40 italic">{word.target}</div>
            <SpeakerButton text={word.target} size="sm" />
          </div>
          <DictSection word={word} t={t} />
          <ExampleSection examples={examples} t={t} />
          <MnemonicSection hint={hint} t={t} />
        </div>
      </div>
    </div>
  )
}
