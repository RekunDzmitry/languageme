// Stub theme generator for Polish course
// Creates placeholder themes when full content isn't available yet

export function stubTheme(id, order) {
  return {
    id,
    order,
    title: `Lekcja ${order}: ${id}`,
    titlePl: `Lekcja ${order}`,
    description: 'Treść w przygotowaniu...',
    descriptionPl: 'Treść w przygotowaniu...',
    unlockCondition: null,
    vocabIds: [],
    sections: [
      {
        type: 'grammar',
        notes: [
          {
            title: 'W przygotowaniu',
            text: 'Ta lekcja jest w trakcie opracowywania.',
            examples: []
          }
        ],
        tables: []
      }
    ]
  }
}
