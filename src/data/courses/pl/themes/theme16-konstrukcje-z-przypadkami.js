// Polish: Konstrukcje z przypadkami — theme 16
// Grammar constructions with case patterns

const theme16Konstrukcje = {
  id: 'pl_theme16',
  order: 16,
  title: 'Konstrukcje z przypadkami',
  titleRu: 'Конструкции с падежами',
  description: 'Ważne konstrukcje gramatyczne z odpowiednimi przypadkami',
  descriptionRu: 'Важные грамматические конструкции с соответствующими падежами',
  unlockCondition: null,
  vocabIds: [
    'pl_383', 'pl_384', 'pl_385', 'pl_386', 'pl_387', 'pl_388', 'pl_389',
    'pl_390', 'pl_391', 'pl_392', 'pl_393', 'pl_394', 'pl_395',
  ],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Дательный + Родительный (Celownik + Dopełniacz)',
          text: 'Конструкция «komuś potrzeba czegoś»:',
          examples: [
            { pl: 'coś jest komuś potrzebne do czegoś', ru: 'что-то кому-то нужно для чего-то' },
            { pl: 'Cyfrowym nomadom do pracy potrzebny jest tylko komputer', ru: 'Цифровым номадам для работы нужен только компьютер' },
          ],
        },
        {
          title: 'Винительный + Творительный (Biernik + Narzędnik)',
          text: 'Глагоł «łączyć» требует вин. + твор. падежей:',
          examples: [
            { pl: 'łączyć coś z czymś', ru: 'соединять что-то с чем-то' },
            { pl: 'łączyć pracę z życiem rodzinnym', ru: 'соединять работу с семейной жизнью' },
          ],
        },
        {
          title: 'Местный падеж (Miejscownik)',
          text: 'После предлога «w» используется местный падеж:',
          examples: [
            { pl: 'zatrzymać się w ciekawym miejscu', ru: 'остановиться в интересном месте' },
            { pl: 'w jakimś mieście', ru: 'в каком-то городе' },
          ],
        },
        {
          title: 'Родительный падеж (Dopełniacz)',
          text: 'Глагол «korzystać» требует родительного с предлогом «z»:',
          examples: [
            { pl: 'korzystać z atutów', ru: 'пользоваться преимуществами' },
            { pl: 'korzystać z udogodnień', ru: 'пользоваться удобствами' },
            { pl: 'korzystać z życia', ru: 'наслаждаться жизнью' },
          ],
        },
        {
          title: 'Творительный падеж (Narzędnik)',
          text: 'Глагол «zostać» (стать) требует творительного:',
          examples: [
            { pl: 'zostać cyfrowym nomadą', ru: 'стать цифровым номадом' },
            { pl: 'widywać się z rodziną, z przyjaciółmi', ru: 'видеться с семьёй, с друзьями' },
          ],
        },
        {
          title: 'Винительный падеж (Biernik)',
          text: 'Многие глаголы требуют винительного падежа:',
          examples: [
            { pl: 'nawiązywać kontakty, znajomości', ru: 'заводить контакты, знакомства' },
            { pl: 'uczęszczać do szkoły', ru: 'посещать школу' },
            { pl: 'wybierać kraj, zawód, studia', ru: 'выбирать страну, профессию, учёбу' },
            { pl: 'prowadzić sklep internetowy, firmę', ru: 'вести интернет-магазин, фирму' },
            { pl: 'martwić się o pieniądze, o pracę', ru: 'беспокоиться о деньгах, о работе' },
          ],
        },
      ],
      tables: [],
    },
  ],
  verbList: [],
}

export const themes = [theme16Konstrukcje]
export default theme16Konstrukcje
