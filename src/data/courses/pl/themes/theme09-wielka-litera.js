// Polish orthography: uppercase and lowercase
// Based on section 1.12 of the PDF

const theme09WielkaLitera = {
  id: 'theme09',
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
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_olak', answer: 'Polak', hint: 'Поляк — национальность. В польском ВСЕГДА с заглавной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_olka', answer: 'Polka', hint: 'Полька — национальность (ж.р.). С заглавной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_nglik', answer: 'Anglik', hint: 'Англичанин — национальность. С заглавной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_ngielka', answer: 'Angielka', hint: 'Англичанка — национальность. С заглавной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_rab', answer: 'Arab', hint: 'Араб — национальность. С заглавной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_ustriak', answer: 'Austriak', hint: 'Австриец — национальность. С заглавной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_merykanin', answer: 'Amerykanin', hint: 'Американец — национальность. С заглавной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_iemiec', answer: 'Niemiec', hint: 'Немец — национальность. С заглавной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_rancuz', answer: 'Francuz', hint: 'Француз — национальность. С заглавной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_osjanin', answer: 'Rosjanin', hint: 'Русский — национальность. С заглавной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: 'Moi sąsiedzi to _olacy', answer: 'Moi sąsiedzi to Polacy', hint: 'Поляки — национальность. Всегда с заглавной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: 'język _olski', answer: 'język polski', hint: 'Польский язык — название языка, со строчной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: 'Uczę się języka _olskiego', answer: 'Uczę się języka polskiego', hint: 'Изучаю польский язык — прилагательное, со строчной!' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: 'język _ngielski', answer: 'język angielski', hint: 'Английский язык — со строчной (прилагательное).' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_olska', answer: 'Polska', hint: 'Польша — страна. С заглавной.' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_arszawa', answer: 'Warszawa', hint: 'Варшава — город. С заглавной.' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: '_raków', answer: 'Kraków', hint: 'Краков — город. С заглавной.' },
        { type: 'write_answer', category: 'Заглавная или строчная?', prompt: 'Lubię spacerować nad _isłą', answer: 'Lubię spacerować nad Wisłą', hint: 'Висла — название реки. С заглавной, даже в падежной форме!' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme09WielkaLitera]
export default theme09WielkaLitera
