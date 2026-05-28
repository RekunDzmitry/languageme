// Polish: Education and Learning — theme 11
// Audio flashcards from vocabIds (no write_answer exercises)

const theme11Edukacja = {
  id: 'pl_theme11',
  order: 11,
  title: 'Edukacja i nauka',
  titleRu: 'Образование и обучение',
  description: 'Лексика для обсуждения образования, школы и обучения',
  descriptionRu: 'Лексика для обсуждения образования, школы и обучения',
  unlockCondition: null,
  vocabIds: [
    'pl_064',  // szkoła
    'pl_075',  // uczyć się
    'pl_151',  // wykształcenie
    'pl_152',  // system edukacji
    'pl_153',  // nauczyciel
    'pl_154',  // nauczycielka
    'pl_155',  // uczeń
    'pl_156',  // uczennica
    'pl_157',  // lekcja
    'pl_158',  // zajęcia
    'pl_159',  // zajęcia dodatkowe
    'pl_160',  // przedmiot
    'pl_161',  // ulubiony przedmiot
    'pl_162',  // ocena
    'pl_163',  // praca domowa
    'pl_164',  // egzamin
    'pl_165',  // egzamin ustny
    'pl_166',  // zdający
    'pl_167',  // egzaminator
    'pl_168',  // zdać egzamin
    'pl_169',  // podręcznik
    'pl_170',  // zeszyt
    'pl_171',  // tablica
    'pl_172',  // ławka
    'pl_173',  // program nauczania
    'pl_174',  // metody nauczania
    'pl_175',  // nauka zdalna
    'pl_176',  // nauka stacjonarna
    'pl_177',  // model hybrydowy
    'pl_178',  // zajęcia online
    'pl_179',  // platforma
    'pl_180',  // wideokonferencja
    'pl_181',  // szkoła językowa
    'pl_182',  // absolwent
    'pl_183',  // absolwentka
    'pl_184',  // dyplom
    'pl_185',  // certyfikat
    'pl_186',  // uniwersytet
    'pl_187',  // uczelnia
    'pl_188',  // wyższe wykształcenie
    'pl_189',  // wydział
    'pl_190',  // studia
    'pl_191',  // darmowa edukacja
    'pl_192',  // płatna edukacja
    'pl_193',  // zdolny
    'pl_194',  // talent
    'pl_195',  // utalentowany
    'pl_196',  // umiejętność
    'pl_197',  // wiedza
    'pl_198',  // krytyczne myślenie
    'pl_199',  // komunikacja
    'pl_200',  // praca zespołowa
    'pl_201',  // fiszki
    'pl_202',  // powtórki interwałowe
    'pl_203',  // uczyć się samodzielnie
    'pl_204',  // uczyć się w grupie
    'pl_205',  // klasa
    'pl_206',  // laptop
    'pl_207',  // komputer
    'pl_208',  // słuchawki
    'pl_209',  // wykładowca
    'pl_210',  // rówieśnicy
  ],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Уровни образования',
          text: 'Основные термины для обозначения уровней образования в Польше:',
          examples: [
            { pl: 'szkoła', ru: 'школа' },
            { pl: 'uczelnia / uniwersytet', ru: 'вуз / университет' },
            { pl: 'wyższe wykształcenie', ru: 'высшее образование' },
            { pl: 'studia', ru: 'учёба в вузе' },
            { pl: 'wydział', ru: 'факультет' },
          ],
        },
        {
          title: 'Люди в школе',
          text: 'Ключевые участники учебного процесса:',
          examples: [
            { pl: 'nauczyciel — nauczycielka', ru: 'учитель — учительница' },
            { pl: 'uczeń — uczennica', ru: 'ученик — ученица' },
            { pl: 'wykładowca', ru: 'преподаватель (вуз)' },
            { pl: 'absolwent — absolwentka', ru: 'выпускник — выпускница' },
            { pl: 'rówieśnicy', ru: 'сверстники' },
          ],
        },
        {
          title: 'В школе: предметы и принадлежности',
          text: 'Что используется на уроках:',
          examples: [
            { pl: 'przedmiot / ulubiony przedmiot', ru: 'предмет / любимый предмет' },
            { pl: 'lekcja — zajęcia', ru: 'урок — занятия' },
            { pl: 'praca domowa', ru: 'домашнее задание' },
            { pl: 'podręcznik / zeszyt', ru: 'учебник / тетрадь' },
            { pl: 'klasa / ławka / tablica', ru: 'класс / парта / доска' },
            { pl: 'laptop / komputer / słuchawki', ru: 'ноутбук / компьютер / наушники' },
          ],
        },
        {
          title: 'Оценки и экзамены',
          text: 'Система оценивания и контроля:',
          examples: [
            { pl: 'ocena', ru: 'оценка' },
            { pl: 'egzamin / egzamin ustny', ru: 'экзамен / устный экзамен' },
            { pl: 'zdać egzamin', ru: 'сдать экзамен' },
            { pl: 'zdający / egzaminator', ru: 'сдающий / экзаменатор' },
          ],
        },
        {
          title: 'Способы обучения',
          text: 'Различные форматы и методы обучения:',
          examples: [
            { pl: 'nauka zdalna', ru: 'дистанционное обучение' },
            { pl: 'nauka stacjonarna', ru: 'очное обучение' },
            { pl: 'model hybrydowy', ru: 'гибридная модель' },
            { pl: 'zajęcia online', ru: 'онлайн-занятия' },
            { pl: 'uczyć się samodzielnie', ru: 'учиться самостоятельно' },
            { pl: 'uczyć się w grupie', ru: 'учиться в группе' },
          ],
        },
        {
          title: 'Методы запоминания',
          text: 'Как эффективно учить слова:',
          examples: [
            { pl: 'fiszki', ru: 'карточки для запоминания' },
            { pl: 'powtórki interwałowe', ru: 'интервальное повторение' },
          ],
        },
      ],
      tables: [],
    },
  ],
  verbList: [],
}

export const themes = [theme11Edukacja]
export default theme11Edukacja
