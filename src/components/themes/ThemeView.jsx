import GrammarSection from './GrammarSection'
import VerbListSection from './VerbListSection'
import ExerciseSection from './ExerciseSection'

export default function ThemeView({ theme }) {
  const grammarSection = theme.sections.find(s => s.type === 'grammar')
  const exerciseSection = theme.sections.find(s => s.type === 'exercises')

  return (
    <div className="space-y-6">
      {grammarSection && <GrammarSection section={grammarSection} />}
      {theme.verbList && <VerbListSection verbs={theme.verbList} />}
      {exerciseSection && exerciseSection.exercises?.length > 0 && (
        <ExerciseSection section={exerciseSection} themeId={theme.id} />
      )}
    </div>
  )
}
