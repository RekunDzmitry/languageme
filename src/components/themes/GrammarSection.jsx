import ConjugationTable from '../common/ConjugationTable'
import SpeakerButton from '../common/SpeakerButton'
import { useSettings } from '../../stores/SettingsContext'

export default function GrammarSection({ section }) {
  const { settings } = useSettings()
  const targetLang = settings.targetLang || 'fr'

  const pickTarget = (ex) => ex?.[targetLang] ?? ex?.fr ?? ex?.pl ?? ''

  return (
    <div className="space-y-6">
      {section.notes?.map((note, i) => (
        <div key={i} className="bg-surface border border-border rounded-xl p-4">
          {note.title && <h3 className="text-lg font-bold text-white mb-2">{note.title}</h3>}
          <p className="text-text-muted leading-relaxed text-sm">{note.text}</p>
          {note.examples && (
            <div className="mt-3 space-y-2">
              {note.examples.map((ex, j) => {
                if (Array.isArray(ex.words)) {
                  return (
                    <div key={j} className="text-sm">
                      {ex.rule && (
                        <div className="text-white font-semibold mb-1">{ex.rule}</div>
                      )}
                      <ul className="ml-3 space-y-0.5">
                        {ex.words.map((w, k) => {
                          const word = pickTarget(w)
                          return (
                            <li key={k} className="flex items-center gap-2">
                              <span className="text-accent font-semibold">{word}</span>
                              {word && <SpeakerButton text={word} size="sm" />}
                              {w.ru && <span className="text-text-muted">— {w.ru}</span>}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )
                }
                const targetText = pickTarget(ex)
                return (
                  <div key={j} className="flex items-center gap-2 text-sm">
                    <span className="text-accent font-semibold">{targetText}</span>
                    {targetText && <SpeakerButton text={targetText} size="sm" />}
                    <span className="text-text-muted">— {ex.ru}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
      {section.tables?.map((table, i) => (
        <ConjugationTable
          key={i}
          verb={table.translation}
          infinitive={table.verb}
          rows={table.rows}
        />
      ))}
    </div>
  )
}
