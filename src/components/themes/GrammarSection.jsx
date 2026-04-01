import ConjugationTable from '../common/ConjugationTable'
import SpeakerButton from '../common/SpeakerButton'

export default function GrammarSection({ section }) {
  return (
    <div className="space-y-6">
      {section.notes?.map((note, i) => (
        <div key={i} className="bg-surface border border-border rounded-xl p-4">
          {note.title && <h3 className="text-lg font-bold text-white mb-2">{note.title}</h3>}
          <p className="text-text-muted leading-relaxed text-sm">{note.text}</p>
          {note.examples && (
            <div className="mt-3 space-y-1">
              {note.examples.map((ex, j) => (
                <div key={j} className="flex items-center gap-2 text-sm">
                  <span className="text-accent font-semibold">{ex.fr}</span>
                  <SpeakerButton text={ex.fr} size="sm" />
                  <span className="text-text-muted">— {ex.ru}</span>
                </div>
              ))}
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
