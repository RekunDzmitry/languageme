// Polish orthography: uppercase and lowercase
// Based on section 1.12 of the PDF

const theme09WielkaLitera = {
  id: 'pl_theme09',
  order: 9,
  title: 'Ortografia: wielka i mała litera',
  titleRu: 'Правописание: прописные и строчные буквы',
  description: 'Главное отличие от русского: национальности пишутся с большой буквы',
  descriptionRu: 'Польские и русские правила в целом совпадают, но есть важное отличие',
  unlockCondition: null,
  vocabIds: [],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Главное отличие от русского',
          text: 'Польские и русские правила написания прописной и строчной букв в основном совпадают. ОДНАКО названия национальностей в польском языке ВСЕГДА начинаются с заглавной буквы:',
          examples: [
            { pl: 'Amerykanin — Amerykanka', ru: 'американец — американка (в русском строчная!)' },
            { pl: 'Anglik — Angielka', ru: 'англичанин — англичанка' },
            { pl: 'Arab — Arabka', ru: 'араб — арабка' },
            { pl: 'Austriak — Austriaczka', ru: 'австриец — австрийка' },
            { pl: 'Polak — Polka', ru: 'поляк — полька' },
            { pl: 'Rosjanin — Rosjanka', ru: 'русский — русская' },
            { pl: 'Niemiec — Niemka', ru: 'немец — немка' },
            { pl: 'Francuz — Francuzka', ru: 'француз — француженка' },
          ],
        },
        {
          title: 'Но: названия языков и прилагательные — со строчной',
          text: 'Язык, к которому относится национальность, и прилагательные от названий стран пишутся со строчной:',
          examples: [
            { pl: 'język polski — польский язык', ru: 'Polak, но polski' },
            { pl: 'język angielski — английский язык', ru: 'Anglik, но angielski' },
            { pl: 'kultura rosyjska — русская культура', ru: 'Rosjanin, но rosyjski' },
            { pl: 'Uczę się języka polskiego', ru: '(с маленькой буквы!)' },
          ],
        },
        {
          title: 'Географические названия',
          text: 'Как и в русском, пишутся с заглавной буквы:',
          examples: [
            { pl: 'Polska, Warszawa, Kraków', ru: 'Польша, Варшава, Краков' },
            { pl: 'Wisła, Bałtyk', ru: 'Висла, Балтика' },
            { pl: 'nad Wisłą', ru: 'над Вислой (сохраняется заглавная)' },
          ],
        },
      ],
      tables: [],
    },
    {
      type: 'exercises',
      exercises: [
        { type: 'write_answer', category: 'Перевод', prompt: 'поляк', answer: 'Polak', hint: 'Национальность — в польском ВСЕГДА с заглавной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'полька (ж.р., национальность)', answer: 'Polka', hint: 'Национальность (ж.р.). С заглавной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'англичанин', answer: 'Anglik', hint: 'Национальность. С заглавной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'англичанка', answer: 'Angielka', hint: 'Национальность. С заглавной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'араб', answer: 'Arab', hint: 'Национальность. С заглавной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'австриец', answer: 'Austriak', hint: 'Национальность. С заглавной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'американец', answer: 'Amerykanin', hint: 'Национальность. С заглавной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'немец', answer: 'Niemiec', hint: 'Национальность. С заглавной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'француз', answer: 'Francuz', hint: 'Национальность. С заглавной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'русский (человек)', answer: 'Rosjanin', hint: 'Национальность. С заглавной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'Мои соседи — поляки', answer: 'Moi sąsiedzi to Polacy', hint: 'Поляки — национальность. Всегда с заглавной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'польский язык', answer: 'język polski', hint: 'Название языка — со строчной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'Я изучаю польский язык', answer: 'Uczę się języka polskiego', hint: 'Прилагательное polski — со строчной!' },
        { type: 'write_answer', category: 'Перевод', prompt: 'английский язык', answer: 'język angielski', hint: 'Со строчной (прилагательное).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'Польша', answer: 'Polska', hint: 'Страна. С заглавной.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'Варшава', answer: 'Warszawa', hint: 'Город. С заглавной.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'Краков', answer: 'Kraków', hint: 'Город. С заглавной.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'Я люблю гулять над Вислой', answer: 'Lubię spacerować nad Wisłą', hint: 'Висла — название реки. С заглавной, даже в падежной форме!' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme09WielkaLitera]
export default theme09WielkaLitera
