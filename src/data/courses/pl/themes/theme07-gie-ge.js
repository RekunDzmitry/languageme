// Polish orthography: gie vs ge
// Based on section 1.10 of the PDF

const theme07GieGe = {
  id: 'theme07',
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
        { type: 'write_answer', category: 'gie или ge?', prompt: 'o_ń', answer: 'ogień', hint: 'Огонь — польское слово, пишем gie.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'dru_e', answer: 'drugie', hint: 'Другое — польское слово, пишем gie.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'dłu_e', answer: 'długie', hint: 'Долгое — польское слово, пишем gie.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'Ja_łło', answer: 'Jagiełło', hint: 'Ягайло — имя литовского происхождения, gie.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: '_dymin', answer: 'Giedymin', hint: 'Гедимин — имя литовского происхождения, gie.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'Ol_rd', answer: 'Olgierd', hint: 'Ольгерд — имя литовского происхождения, gie.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'cyn_l', answer: 'cyngiel', hint: 'Курок — окончание -giel.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'ża_l', answer: 'żagiel', hint: 'Парус — окончание -giel.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'o_r', answer: 'ogier', hint: 'Жеребец — окончание -gier.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'szwa_r', answer: 'szwagier', hint: 'Шурин — окончание -gier.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'Al_ria', answer: 'Algieria', hint: 'Алжир — пишем gie.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'an_lski', answer: 'angielski', hint: 'Английский — пишем gie.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: '_łda', answer: 'giełda', hint: 'Биржа — пишем gie.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'me_ra', answer: 'megiera', hint: 'Мегера — пишем gie.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: '_nerał', answer: 'generał', hint: 'Генерал — заимствование, пишем ge.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: '_ometria', answer: 'geometria', hint: 'Геометрия — заимствование, пишем ge.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: '_ografia', answer: 'geografia', hint: 'География — заимствование, пишем ge.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'al_bra', answer: 'algebra', hint: 'Алгебра — заимствование, пишем ge.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: '_rmanista', answer: 'germanista', hint: 'Германист — заимствование, пишем ge.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: '_henna', answer: 'gehenna', hint: 'Геенна — заимствование, пишем ge (твёрдое [гэ]).' },
        { type: 'write_answer', category: 'gie или ge?', prompt: '_tto', answer: 'getto', hint: 'Гетто — заимствование, пишем ge.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: '_jsza', answer: 'gejsza', hint: 'Гейша — заимствование, пишем ge.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: '_st', answer: 'gest', hint: 'Жест — заимствование, пишем ge.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: 'tra_dia', answer: 'tragedia', hint: 'Трагедия — заимствование, пишем ge.' },
        { type: 'write_answer', category: 'gie или ge?', prompt: '_neza', answer: 'geneza', hint: 'Генезис — заимствование, пишем ge.' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme07GieGe]
export default theme07GieGe
