// Polish orthography: ó vs u
// Based on PDF: ORTOGRAFIA - INTERPUNKCJA - PODSTAWY - ZADANIA-1.pdf

const theme01Ortografia = {
  id: 'theme01',
  order: 1,
  title: 'Ortografia: ó i u',
  titleRu: 'Правописание: ó и u',
  description: 'Учим разницу между буквами ó и u в польском языке',
  descriptionRu: 'Учим разницу между буквами ó и u в польском языке',
  unlockCondition: null,
  vocabIds: [],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Когда пишем Ó?',
          text: 'Буква ó читается как "у" (звук [u]). Используется в трёх основных случаях:',
          examples: []
        },
        {
          title: '1. Замена в родственных словах',
          text: 'Если в родственных словах ó меняется на o или e — пишем ó. Например:',
          examples: [
            { pl: 'dróżka — droga', ru: 'тропинка — дорога (ó → o)' },
            { pl: 'góra — górski', ru: 'гора — горный (ó → o)' },
            { pl: 'mózg — mózgowy', ru: 'мозг — мозговой (ó → o)' },
            { pl: 'król — królewski', ru: 'король — королевский (ó → o)' },
            { pl: 'dźwięk — dźwięczny', ru: 'звук — звучный (ó → e)' },
          ]
        },
        {
          title: '2. В глаголах без замены',
          text: 'В глаголах, где НЕ происходит замены на o или e:',
          examples: [
            { pl: 'mówić — mówię, mówisz', ru: 'говорить — говорю, говоришь (нет замены)' },
            { pl: 'wstawać — wstaję, wstajesz', ru: 'вставать — встаю, встаёшь' },
            { pl: 'zdawać — zdaję, zdajesz', ru: 'сдавать — сдаю, сдаёшь' },
          ]
        },
        {
          title: '3. В окончаниях -ów, -ówna, -ówka',
          text: 'А также в словах с историческим написанием:',
          examples: [
            { pl: 'Kraków, panów, studentów', ru: 'Краков, господ, студентов' },
            { pl: 'Nowakówna, studentka', ru: '' },
            { pl: 'dachówka, babówka', ru: 'черепица' },
            { pl: 'stróż, źródło, móżdżek', ru: 'сторож, источник, мозжечок' },
          ]
        },
      ],
      tables: []
    },
    {
      type: 'grammar',
      notes: [
        {
          title: 'Когда пишем U?',
          text: 'Буква u всегда пишется в определённых суффиксах и окончаниях:',
          examples: []
        },
        {
          title: 'Суффиксы с u',
          text: 'Многие уменьшительные и ласкательные суффиксы содержат u:',
          examples: [
            { rule: '-uch', words: [{ pl: 'dzieciuch' }, { pl: 'kociuch' }] },
            { rule: '-uchna', words: [{ pl: 'córuchna' }, { pl: 'matuchna' }] },
            { rule: '-ula', words: [{ pl: 'babula' }, { pl: 'matula' }] },
            { rule: '-ulek', words: [{ pl: 'tatulek' }, { pl: 'dziadulek' }] },
            { rule: '-uleńka', words: [{ pl: 'damuleńka' }, { pl: 'siostrulenka' }] },
            { rule: '-ulka', words: [{ pl: 'brzydulka' }, { pl: 'sąsiadulka' }] },
            { rule: '-ulo', words: [{ pl: 'mężulo' }, { pl: 'starusio' }] },
            { rule: '-unek', words: [{ pl: 'pakunek' }, { pl: 'kaftanik' }] },
            { rule: '-uś', words: [{ pl: 'synuś' }, { pl: 'tatuś' }, { pl: 'dziadusio' }] },
          ]
        },
        {
          title: 'В формах глаголов на -uję',
          text: 'Глаголы в форме настоящего времени с окончанием -uję, -ujesz, -uje:',
          examples: [
            { pl: 'gotuję, gotujesz, gotuje', ru: 'готовлю, готовишь, готовит' },
            { pl: 'nauczyciel uczy', ru: 'учитель учит' },
            { pl: 'sprzedaję, kupuję', ru: 'продаю, покупаю' },
          ]
        },
        {
          title: 'Исключения!',
          text: 'Некоторые слова пишутся с u, хотя можно ожидать ó:',
          examples: [
            { pl: 'skuwka, zakuwka, podkuwać', ru: '(от kuć, а не от kóra!)' },
            { pl: 'suwak, suwać, przesuwać', ru: '(от sunać, а не от sów!)' },
            { pl: 'zasuwka, zasuwać', ru: '(от zasychać?)' },
          ]
        },
      ],
      tables: []
    },
    {
      type: 'exercises',
      exercises: [
        // Easy words - basic recognition
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'piór_',
          answer: 'pióro',
          hint: 'Пёро — драгоценное перо. Родственное слово: pierze (перья). Замена ó → ie/e!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: '_cho',
          answer: 'ucho',
          hint: 'Ухо — слышим ушами. Родственное: uszy (уши). Замена ó → e!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'mal__je',
          answer: 'maluje',
          hint: 'Малую (рисую) — глагол на -uje!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'podróż',
          answers: ['podróż', 'podroz'],
          hint: 'Путешествие — едем в путь! Родственное: podróżny.',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'rysunek',
          answers: ['rysunek', 'rysunek'],
          hint: 'Рисунок — рисуем. Родственное: rysować.',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'długi',
          answers: ['długi', 'dlugi'],
          hint: 'Длинный/долгий. Родственное: długość (длина).',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'c__reczka',
          answer: 'córeczka',
          hint: 'Доченька — ласкательное от córka. Суффикс -eczk-!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'sk__wka',
          answer: 'skuwka',
          hint: 'Сковка — от kuć (ковать), а не от kóra! Исключение.',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'dzban__szek',
          answer: 'dzbanuszek',
          hint: 'Кувшинчик — суффикс -uszek!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: '__wczesny',
          answer: 'ówczesny',
          hint: 'Тогдашний — от ów (тот). Окончание -ów!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'kot__w',
          answer: 'kotów',
          hint: 'Котов — множественное число от kot. Окончание -ów!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'chm__ra',
          answer: 'chmura',
          hint: 'Туча — родственное: chmury (облака). Замена ó → y!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'kr__l',
          answer: 'król',
          hint: 'Король — родственное: królewski (королевский). Замена ó → o!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'g__ra',
          answer: 'góra',
          hint: 'Гора — родственное: górski (горный). Замена ó → o!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'rys__jemy',
          answer: 'rysujemy',
          hint: 'Мы рисуем — глагол на -uje!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'g__ma',
          answer: 'guma',
          hint: 'Жвачка — от gumy (резина, каучук).',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'p__sty',
          answer: 'pusty',
          hint: 'Пустой — родственное: pustkowie (пустошь). Замена ó → e!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'ps__w',
          answer: 'psów',
          hint: 'Псов — множественное число от pies (собака). Окончание -ów!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'k__lka',
          answer: 'kulka',
          hint: 'Шарик — суффикс -ulk-!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'rach__nek',
          answer: 'rachunek',
          hint: 'Счёт (в магазине) — суффикс -unek!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: '__l',
          answer: 'ul',
          hint: 'Улей — домик для пчёл.',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: '__ważaj',
          answer: 'uważaj',
          hint: 'Обращай внимание — глагол! uwaga (внимание).',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'k__ć',
          answer: 'kuć',
          hint: 'Ковать — иску smith!',
        },
        {
          type: 'write_answer',
          category: 'Ó или U?',
          prompt: 'przyjaci__łka',
          answer: 'przyjaciółka',
          hint: 'Подруга — przyjaciel (друг) + суффикс -ółka!',
        },
      ],
    },
  ],
  verbList: []
}

export const themes = [theme01Ortografia]
export default theme01Ortografia
