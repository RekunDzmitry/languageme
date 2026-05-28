// Polish orthography: gie vs ge
// Based on section 1.10 of the PDF

const theme07GieGe = {
  id: 'pl_theme07',
  order: 7,
  title: 'Ortografia: gie i ge',
  titleRu: 'Правописание: gie и ge',
  description: 'Когда пишем gie, а когда ge — в польских словах и заимствованиях',
  descriptionRu: 'Сочетания букв gie и ge произносятся одинаково [г\'е]. Когда какое писать?',
  unlockCondition: null,
  vocabIds: [],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Когда пишем gie?',
          text: 'Сочетание gie пишем:',
          examples: [
            { rule: 'а) в словах польского происхождения', words: [
              { pl: 'ogień', ru: 'огонь' },
              { pl: 'drugie', ru: 'другое' },
              { pl: 'długie', ru: 'долгое' },
            ]},
            { rule: 'б) в именах литовского происхождения', words: [
              { pl: 'Jagiełło', ru: '' },
              { pl: 'Giedymin', ru: '' },
              { pl: 'Olgierd', ru: '' },
            ]},
            { rule: 'в) в существительных на -giel, -gier, -gierz', words: [
              { pl: 'cyngiel', ru: 'курок' },
              { pl: 'żagiel', ru: 'парус' },
              { pl: 'ogier', ru: 'жеребец' },
              { pl: 'szwagier', ru: 'шурин' },
            ]},
            { rule: 'г) в словах, связанных с Алжиром и Англией', words: [
              { pl: 'Algieria', ru: '' },
              { pl: 'Algierczyk', ru: '' },
              { pl: 'Algierka', ru: '' },
              { pl: 'algierski', ru: '' },
              { pl: 'Angielka', ru: '' },
              { pl: 'angielski', ru: '' },
              { pl: 'angielszczyzna', ru: '' },
              { pl: 'Archangielsk', ru: '' },
              { pl: 'giełda', ru: 'биржа' },
              { pl: 'megiera', ru: '' },
            ]},
          ],
        },
        {
          title: 'Когда пишем ge?',
          text: 'Сочетание ge пишется в заимствованных словах:',
          examples: [
            { rule: "с мягким произношением [г'е]", words: [
              { pl: 'germanista', ru: '' },
              { pl: 'generał', ru: 'генерал' },
              { pl: 'geometria', ru: 'геометрия' },
              { pl: 'algebra', ru: 'алгебра' },
              { pl: 'geografia', ru: 'география' },
              { pl: 'georgina', ru: 'георгин' },
              { pl: 'geranium', ru: 'герань' },
            ]},
            { rule: 'с твёрдым произношением [гэ]', words: [
              { pl: 'gehenna', ru: 'геенна' },
              { pl: 'getto', ru: 'гетто' },
              { pl: 'gejsza', ru: 'гейша' },
              { pl: 'generacja', ru: 'поколение' },
              { pl: 'gest', ru: 'жест' },
              { pl: 'gestapo', ru: '' },
              { pl: 'gestykulacja', ru: 'жестикуляция' },
              { pl: 'tragedia', ru: 'трагедия' },
              { pl: 'geneza', ru: 'генезис' },
              { pl: 'genealogia', ru: 'генеалогия' },
            ]},
          ],
        },
      ],
      tables: [],
    },
    {
      type: 'exercises',
      exercises: [
        { type: 'write_answer', category: 'Перевод', prompt: 'огонь', answer: 'ogień', hint: 'Польское слово, пишем gie.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'другое', answer: 'drugie', hint: 'Польское слово, пишем gie.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'долгое', answer: 'długie', hint: 'Польское слово, пишем gie.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'Ягайло', answer: 'Jagiełło', hint: 'Имя литовского происхождения, gie.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'Гедимин', answer: 'Giedymin', hint: 'Имя литовского происхождения, gie.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'Ольгерд', answer: 'Olgierd', hint: 'Имя литовского происхождения, gie.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'курок', answer: 'cyngiel', hint: 'Окончание -giel.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'парус', answer: 'żagiel', hint: 'Окончание -giel.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'жеребец', answer: 'ogier', hint: 'Окончание -gier.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'шурин / свояк', answer: 'szwagier', hint: 'Окончание -gier.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'Алжир', answer: 'Algieria', hint: 'Пишем gie.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'английский', answer: 'angielski', hint: 'Пишем gie.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'биржа', answer: 'giełda', hint: 'Пишем gie.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'мегера', answer: 'megiera', hint: 'Пишем gie.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'генерал', answer: 'generał', hint: 'Заимствование, пишем ge.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'геометрия', answer: 'geometria', hint: 'Заимствование, пишем ge.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'география', answer: 'geografia', hint: 'Заимствование, пишем ge.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'алгебра', answer: 'algebra', hint: 'Заимствование, пишем ge.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'германист', answer: 'germanista', hint: 'Заимствование, пишем ge.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'геенна', answer: 'gehenna', hint: 'Заимствование, пишем ge (твёрдое [гэ]).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'гетто', answer: 'getto', hint: 'Заимствование, пишем ge.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'гейша', answer: 'gejsza', hint: 'Заимствование, пишем ge.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'жест', answer: 'gest', hint: 'Заимствование, пишем ge.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'трагедия', answer: 'tragedia', hint: 'Заимствование, пишем ge.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'генезис', answer: 'geneza', hint: 'Заимствование, пишем ge.' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme07GieGe]
export default theme07GieGe
