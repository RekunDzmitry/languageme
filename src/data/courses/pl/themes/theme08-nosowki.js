// Polish orthography: nasal vowels ę, ą vs en/em/on/om
// Based on section 1.11 of the PDF

const theme08Nosowki = {
  id: 'theme08',
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
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'd_b', answer: 'dąb', hint: 'Дуб — польское слово, пишем ą.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'd_bowy', answer: 'dębowy', hint: 'Дубовый — польское слово, пишем ę.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'kr_g', answer: 'krąg', hint: 'Круг — польское слово, пишем ą.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'k_t', answer: 'kąt', hint: 'Угол — польское слово, пишем ą.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'pi_ty', answer: 'piąty', hint: 'Пятый — польское слово, пишем ą.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'w_sy', answer: 'wąsy', hint: 'Усы — польское слово, пишем ą.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'z_b', answer: 'ząb', hint: 'Зуб — польское слово, пишем ą.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'b_dzie', answer: 'będzie', hint: 'Будет — польское слово, пишем ę.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'g_sty', answer: 'gęsty', hint: 'Густой — польское слово, пишем ę.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'r_ka', answer: 'ręka', hint: 'Рука — польское слово, пишем ę.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'prag_ć', answer: 'pragnąć', hint: 'Желать — польское слово, пишем ą.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'ci_gnąć', answer: 'ciągnąć', hint: 'Тянуть — польское слово, пишем ą.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'br_z', answer: 'brąz', hint: 'Бронза — освоенное заимствование, пишем ą.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'kol_da', answer: 'kolęda', hint: 'Колядка — освоенное заимствование, пишем ę.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'p_dzel', answer: 'pędzel', hint: 'Кисть — освоенное заимствование, пишем ę.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'id_ (я иду)', answer: 'idę', hint: '1-е лицо глагола — ę.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'pisz_ (я пишу)', answer: 'piszę', hint: '1-е лицо глагола — ę.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'id_ (они идут)', answer: 'idą', hint: '3-е лицо множественного числа — ą.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'siostr_ (вин.пад.)', answer: 'siostrę', hint: 'Винительный падеж ед.ч. ж.р. — ę.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'studentk_ (тв.пад.)', answer: 'studentką', hint: 'Творительный падеж ед.ч. ж.р. — ą.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'im_ (имя)', answer: 'imię', hint: 'Существительное ср.р. им.пад. — ę.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'pi_ciu (после p+i)', answer: 'pięciu', hint: 'Пятерых — после мягкого p пишем ę.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'komp_s', answer: 'kompas', hint: 'Компас — неосвоенное заимствование, пишем om, НЕ ą!' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'konc_rt', answer: 'koncert', hint: 'Концерт — неосвоенное заимствование, пишем en, НЕ ę!' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'kongr_s', answer: 'kongres', hint: 'Конгресс — неосвоенное заимствование, пишем on, НЕ ą!' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'temp_ratura', answer: 'temperatura', hint: 'Температура — неосвоенное заимствование, пишем em.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'kal_darz', answer: 'kalendarz', hint: 'Календарь — неосвоенное заимствование, пишем en.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'k_trola', answer: 'kontrola', hint: 'Контроль — неосвоенное заимствование, пишем on.' },
        { type: 'write_answer', category: 'ę/ą или en/om?', prompt: 'kombinac_a', answer: 'kombinacja', hint: 'Комбинация — неосвоенное заимствование + j после c.' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme08Nosowki]
export default theme08Nosowki
