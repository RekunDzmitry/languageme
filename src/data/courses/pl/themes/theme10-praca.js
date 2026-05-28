// Polish: Work and Career — theme 10
// Audio flashcards from vocabIds (no write_answer exercises)

const theme10Praca = {
  id: 'pl_theme10',
  order: 10,
  title: 'Praca i kariera',
  titleRu: 'Работа и карьера',
  description: 'Лексика для обсуждения работы, карьеры и поиска работы',
  descriptionRu: 'Лексика для обсуждения работы, карьеры и поиска работы',
  unlockCondition: null,
  vocabIds: [
    'pl_065',  // praca
    'pl_096',  // zawód
    'pl_097',  // specjalista
    'pl_098',  // kariera
    'pl_099',  // ścieżka kariery
    'pl_100',  // rynek pracy
    'pl_101',  // pracodawca
    'pl_102',  // pracownik
    'pl_103',  // kolega
    'pl_104',  // zespół
    'pl_105',  // szef
    'pl_106',  // przełożony
    'pl_107',  // kierownictwo
    'pl_108',  // rozmowa kwalifikacyjna
    'pl_109',  // CV
    'pl_110',  // poszukiwanie pracy
    'pl_111',  // znaleźć pracę
    'pl_112',  // stracić pracę
    'pl_113',  // zmienić pracę
    'pl_114',  // awans
    'pl_115',  // podwyżka
    'pl_116',  // pensja
    'pl_117',  // wynagrodzenie
    'pl_118',  // premia
    'pl_119',  // bonus
    'pl_120',  // dzień roboczy
    'pl_121',  // godziny pracy
    'pl_122',  // nadgodziny
    'pl_123',  // weekend
    'pl_124',  // urlop
    'pl_125',  // zwolnienie lekarskie
    'pl_126',  // praca zdalna
    'pl_127',  // praca w biurze
    'pl_128',  // praca hybrydowa
    'pl_129',  // freelancing
    'pl_130',  // samozatrudniony
    'pl_131',  // przedsiębiorca
    'pl_132',  // własna firma
    'pl_133',  // biznes
    'pl_134',  // obowiązki
    'pl_135',  // projekt
    'pl_136',  // zadanie
    'pl_137',  // termin
    'pl_138',  // satysfakcja z pracy
    'pl_139',  // bezrobocie
    'pl_140',  // bezrobotny
    'pl_141',  // automatyzacja
    'pl_142',  // sztuczna inteligencja
    'pl_143',  // przekwalifikowanie
    'pl_144',  // staż
    'pl_145',  // równowaga między pracą a życiem
    'pl_146',  // stres w pracy
    'pl_147',  // wypalenie zawodowe
    'pl_148',  // profesjonalizm
    'pl_149',  // produktywność
    'pl_150',  // uczciwość
  ],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Типы работы',
          text: 'В современном польском языке существует множество способов организации работы:',
          examples: [
            { pl: 'praca zdalna', ru: 'удалённая работа' },
            { pl: 'praca w biurze', ru: 'работа в офисе' },
            { pl: 'praca hybrydowa', ru: 'гибридная работа' },
            { pl: 'freelancing', ru: 'фриланс' },
            { pl: 'samozatrudniony', ru: 'самозанятый' },
          ],
        },
        {
          title: 'Рабочее время',
          text: 'Основные термины для описания рабочего времени:',
          examples: [
            { pl: 'dzień roboczy', ru: 'рабочий день' },
            { pl: 'godziny pracy', ru: 'рабочее время' },
            { pl: 'nadgodziny', ru: 'сверхурочные' },
            { pl: 'weekend', ru: 'выходные' },
            { pl: 'urlop', ru: 'отпуск' },
            { pl: 'zwolnienie lekarskie', ru: 'больничный' },
          ],
        },
        {
          title: 'Доход и вознаграждение',
          text: 'Слова для обсуждения зарплаты и бонусов:',
          examples: [
            { pl: 'pensja / wynagrodzenie', ru: 'зарплата / вознаграждение' },
            { pl: 'podwyżka', ru: 'повышение зарплаты' },
            { pl: 'premia / bonus', ru: 'премия / бонус' },
          ],
        },
        {
          title: 'Люди на работе',
          text: 'Ключевые роли в профессиональной среде:',
          examples: [
            { pl: 'pracodawca', ru: 'работодатель' },
            { pl: 'pracownik', ru: 'работник' },
            { pl: 'kolega / zespół', ru: 'коллега / команда' },
            { pl: 'szef / przełożony', ru: 'босс / начальник' },
            { pl: 'kierownictwo', ru: 'руководство' },
          ],
        },
        {
          title: 'Поиск работы',
          text: 'Как говорят о поиске работы на польском:',
          examples: [
            { pl: 'rozmowa kwalifikacyjna', ru: 'собеседование' },
            { pl: 'CV', ru: 'резюме' },
            { pl: 'poszukiwanie pracy', ru: 'поиск работы' },
            { pl: 'znaleźć pracę / stracić pracę', ru: 'найти работу / потерять работу' },
            { pl: 'zmienić pracę', ru: 'сменить работу' },
          ],
        },
      ],
      tables: [],
    },
  ],
  verbList: [],
}

export const themes = [theme10Praca]
export default theme10Praca
