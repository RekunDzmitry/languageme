// Polish orthography: nasal vowels ę, ą vs en/em/on/om
// Based on section 1.11 of the PDF

const theme08Nosowki = {
  id: 'pl_theme08',
  order: 8,
  title: 'Ortografia: ę, ą i en/em/on/om',
  titleRu: 'Правописание: носовые ę, ą и сочетания en/em/on/om',
  description: 'Носовые гласные в польских словах и en/om в заимствованиях',
  descriptionRu: 'В позиции перед взрывными согласными ę, ą произносятся как [em], [om], [en], [on] — не путать!',
  unlockCondition: null,
  vocabIds: [],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Когда пишем ę, ą?',
          text: 'Буквы ę, ą пишем:',
          examples: [
            { rule: 'а) в словах польского происхождения (в русском часто соответствуют [а], [у])', words: [
              { pl: 'dąb', ru: 'дуб' },
              { pl: 'dębowy', ru: '' },
              { pl: 'krąg', ru: 'круг' },
              { pl: 'kąt', ru: 'угол' },
              { pl: 'piąty', ru: 'пятый' },
              { pl: 'ciągnąć', ru: 'тянуть' },
              { pl: 'wąsy', ru: 'усы' },
              { pl: 'ząb', ru: 'зуб' },
              { pl: 'będzie', ru: 'будет' },
              { pl: 'gęsty', ru: 'густой' },
              { pl: 'ręka', ru: 'рука' },
              { pl: 'pragnąć', ru: 'желать' },
            ]},
            { rule: 'в) в полностью освоенных заимствованиях', words: [
              { pl: 'brąz', ru: 'бронза' },
              { pl: 'ląd', ru: 'суша' },
              { pl: 'flądra', ru: 'камбала' },
              { pl: 'pąsowy', ru: 'пунцовый' },
              { pl: 'cęgi', ru: 'щипцы' },
              { pl: 'kolęda', ru: 'колядка' },
              { pl: 'pędzel', ru: 'кисть' },
              { pl: 'wędrować', ru: 'путешествовать' },
            ]},
          ],
        },
        {
          title: 'ę, ą в окончаниях и суффиксах',
          text: 'Грамматические окончания:',
          examples: [
            { rule: '-ę (вин.пад., ж.р., ед.ч. сущ.)', words: [
              { pl: 'siostrę' }, { pl: 'studentkę' }, { pl: 'zimę' },
            ]},
            { rule: '-ą (тв.пад., ж.р., ед.ч. сущ.)', words: [
              { pl: 'siostrą' }, { pl: 'studentką' }, { pl: 'zimą' },
            ]},
            { rule: '-ę (им.пад., ср.р., ед.ч.)', words: [
              { pl: 'cielę' }, { pl: 'imię' }, { pl: 'prosię' }, { pl: 'plemię' },
            ]},
            { rule: '-ą (вин./тв. пад. прил./мест., ж.р., ед.ч.)', words: [
              { pl: 'moją siostrę' }, { pl: 'moją siostrą' },
            ]},
            { rule: '-ę (1-е лицо наст./буд.вр. глагола)', words: [
              { pl: 'idę' }, { pl: 'piszę' }, { pl: 'wezmę' },
            ]},
            { rule: '-ą (3-е лицо наст./буд.вр. глагола)', words: [
              { pl: 'idą' }, { pl: 'piszą' }, { pl: 'wezmą' },
            ]},
            { rule: '-ąc- (причастие, деепричастие)', words: [
              { pl: 'pragnący' }, { pl: 'piszący' }, { pl: 'idąc' },
            ]},
            { rule: '-ę (вин.пад. местоимения)', words: [
              { pl: 'cię' }, { pl: 'się' },
            ]},
          ],
        },
        {
          title: 'Когда пишем en, em, on, om?',
          text: 'Сочетания букв en, em, on, om пишутся в НЕ полностью освоенных заимствованиях, которым в русском соответствуют [эм], [ом], [эн], [он], [ан]:',
          examples: [
            { pl: 'kompas', ru: 'компас' },
            { pl: 'kompres', ru: 'компресс' },
            { pl: 'kompozycja', ru: 'композиция' },
            { pl: 'kompetencja', ru: 'компетенция' },
            { pl: 'kombinacja', ru: 'комбинация' },
            { pl: 'temperatura', ru: 'температура' },
            { pl: 'stempel', ru: 'штемпель' },
            { pl: 'embargo', ru: 'эмбарго' },
            { pl: 'emblemat', ru: 'эмблема' },
            { pl: 'kontrola', ru: 'контроль' },
            { pl: 'koncert', ru: 'концерт' },
            { pl: 'kalendarz', ru: 'календарь' },
            { pl: 'konkurencja', ru: 'конкуренция' },
            { pl: 'kongres', ru: 'конгресс' },
            { pl: 'konfiskacja', ru: 'конфискация' },
            { pl: 'konstrukcja', ru: 'конструкция' },
          ],
        },
      ],
      tables: [],
    },
    {
      type: 'exercises',
      exercises: [
        { type: 'write_answer', category: 'Перевод', prompt: 'дуб', answer: 'dąb', hint: 'Польское слово, пишем ą.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'дубовый', answer: 'dębowy', hint: 'Польское слово, пишем ę.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'круг', answer: 'krąg', hint: 'Польское слово, пишем ą.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'угол', answer: 'kąt', hint: 'Польское слово, пишем ą.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'пятый', answer: 'piąty', hint: 'Польское слово, пишем ą.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'усы', answer: 'wąsy', hint: 'Польское слово, пишем ą.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'зуб', answer: 'ząb', hint: 'Польское слово, пишем ą.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'будет', answer: 'będzie', hint: 'Польское слово, пишем ę.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'густой', answer: 'gęsty', hint: 'Польское слово, пишем ę.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'рука', answer: 'ręka', hint: 'Польское слово, пишем ę.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'желать', answer: 'pragnąć', hint: 'Польское слово, пишем ą.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'тянуть', answer: 'ciągnąć', hint: 'Польское слово, пишем ą.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'бронза', answer: 'brąz', hint: 'Освоенное заимствование, пишем ą.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'колядка', answer: 'kolęda', hint: 'Освоенное заимствование, пишем ę.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'кисть (для рисования)', answer: 'pędzel', hint: 'Освоенное заимствование, пишем ę.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'я иду', answer: 'idę', hint: '1-е лицо глагола — ę.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'я пишу', answer: 'piszę', hint: '1-е лицо глагола — ę.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'они идут', answer: 'idą', hint: '3-е лицо множественного числа — ą.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'сестру (вин.пад.)', answer: 'siostrę', hint: 'Винительный падеж ед.ч. ж.р. — ę.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'со студенткой (тв.пад.)', answer: 'studentką', hint: 'Творительный падеж ед.ч. ж.р. — ą.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'имя', answer: 'imię', hint: 'Существительное ср.р. им.пад. — ę.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'пятерых', answer: 'pięciu', hint: 'После мягкого p пишем ę.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'компас', answer: 'kompas', hint: 'Неосвоенное заимствование, пишем om, НЕ ą!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'концерт', answer: 'koncert', hint: 'Неосвоенное заимствование, пишем en, НЕ ę!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'конгресс', answer: 'kongres', hint: 'Неосвоенное заимствование, пишем on, НЕ ą!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'температура', answer: 'temperatura', hint: 'Неосвоенное заимствование, пишем em.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'календарь', answer: 'kalendarz', hint: 'Неосвоенное заимствование, пишем en.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'контроль', answer: 'kontrola', hint: 'Неосвоенное заимствование, пишем on.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'комбинация', answer: 'kombinacja', hint: 'Неосвоенное заимствование + j после c.' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme08Nosowki]
export default theme08Nosowki
