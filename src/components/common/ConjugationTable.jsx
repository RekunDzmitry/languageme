import SpeakerButton from './SpeakerButton'

export default function ConjugationTable({ verb, infinitive, rows }) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {infinitive && (
        <div className="px-4 py-2.5 bg-accent-glow border-b border-border flex items-center gap-1.5">
          <span className="text-accent font-bold">{infinitive}</span>
          <SpeakerButton text={infinitive} size="sm" />
          {verb && <span className="text-text-muted text-sm ml-2">— {verb}</span>}
        </div>
      )}
      <table className="w-full">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}>
              <td className="px-4 py-2 text-text-muted text-sm font-medium w-1/3">{row.pronoun}</td>
              <td className="px-4 py-2 text-text-primary font-semibold">
                <span className="inline-flex items-center gap-1">
                  {row.form}
                  <SpeakerButton text={`${row.pronoun} ${row.form}`} size="sm" />
                </span>
              </td>
              <td className="px-4 py-2 text-text-muted text-xs font-mono">{row.ipa || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
