import GrammarSection from './GrammarSection'
import VerbListSection from './VerbListSection'

export default function ThemeView({ theme }) {
  const grammarSection = theme.sections.find(s => s.type === 'grammar')

  return (
    <div className="space-y-6">
      {grammarSection && <GrammarSection section={grammarSection} />}
      {theme.verbList && theme.verbList.length > 0 && <VerbListSection verbs={theme.verbList} />}
    </div>
  )
}
