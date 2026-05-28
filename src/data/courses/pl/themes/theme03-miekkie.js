// Polish orthography: softness of consonants
// Based on section 1.4 of the PDF

const theme03Miekkie = {
  id: 'pl_theme03',
  order: 3,
  title: 'Ortografia: miękkie spółgłoski (ć/ci, ń/ni, ś/si, ź/zi)',
  titleRu: 'Правописание: мягкость согласных (kreska vs i)',
  description: 'Два способа обозначить мягкость: надстрочная чёрточка и буква i',
  descriptionRu: 'Два способа обозначить мягкость: надстрочная чёрточка (kreska) и буква i',
  unlockCondition: null,
  vocabIds: [],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Когда пишем ć, ń, ś, ź, dź (с чёрточкой)?',
          text: 'Надстрочный знак kreska ставится над согласной в двух позициях: в конце слова и перед другой согласной.',
          examples: [
            { pl: 'ćwiczyć', ru: 'упражняться' },
            { pl: 'dziś', ru: 'сегодня' },
            { pl: 'pończocha', ru: 'чулок' },
            { pl: 'iść', ru: 'идти' },
            { pl: 'część', ru: 'часть' },
            { pl: 'ćmić', ru: 'темнить' },
            { pl: 'dźgać', ru: 'пороть' },
            { pl: 'tańczyć', ru: 'танцевать' },
            { pl: 'babuleńka', ru: 'старушка' },
            { pl: 'tańszy', ru: 'более дешёвый' },
            { pl: 'groźba', ru: 'угроза' },
            { pl: 'rzeźba', ru: 'скульптура' },
          ],
        },
        {
          title: 'Когда пишем i (между согласной и гласной)?',
          text: 'Перед гласными a, ą, e, ę, o, ó, u мягкость обозначается с помощью буквы i, которая пишется между согласной и гласной:',
          examples: [
            { pl: 'bielizna', ru: 'бельё (b + i + e)' },
            { pl: 'lakier', ru: 'лак (k + i + e)' },
            { pl: 'mięso', ru: 'мясо (m + i + ę)' },
            { pl: 'ziemia', ru: 'земля (z + i + e, m + i + a)' },
            { pl: 'wiosna', ru: 'весна (w + i + o)' },
            { pl: 'ciągle', ru: 'постоянно (c + i + ą)' },
            { pl: 'biuro', ru: 'бюро (b + i + u)' },
            { pl: 'dziecko', ru: 'ребёнок (dz + i + e)' },
            { pl: 'pięć', ru: 'пять (p + i + ę)' },
            { pl: 'wiele', ru: 'много (w + i + e)' },
            { pl: 'nauczyciel', ru: 'учитель (c + i + e)' },
            { pl: 'inżynier', ru: 'инженер (n + i + e)' },
          ],
        },
      ],
      tables: [],
    },
    {
      type: 'exercises',
      exercises: [
        { type: 'write_answer', category: 'Перевод', prompt: 'упражняться', answer: 'ćwiczyć', hint: 'ć перед согласной.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'сегодня', answer: 'dziś', hint: 'ś в конце слова.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'идти', answer: 'iść', hint: 'ć в конце слова.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'часть', answer: 'część', hint: 'ś перед согласной ć.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'тыкать / пороть', answer: 'dźgać', hint: 'dź в начале перед согласной.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'угроза', answer: 'groźba', hint: 'ź перед согласной b.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'скульптура', answer: 'rzeźba', hint: 'ź перед согласной.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'старушка / бабушка', answer: 'babuleńka', hint: 'ń перед согласной.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'чулок', answer: 'pończocha', hint: 'Носится на ноге.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'бельё', answer: 'bielizna', hint: 'Перед гласной e пишем i (мягкость b).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'лак', answer: 'lakier', hint: 'Перед e пишем i (мягкость k).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'мясо', answer: 'mięso', hint: 'Перед ę пишем i (мягкость m).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'земля', answer: 'ziemia', hint: 'Перед e пишем i (мягкость z).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'весна', answer: 'wiosna', hint: 'Перед o пишем i (мягкость w).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'постоянно', answer: 'ciągle', hint: 'Перед ą пишем i (мягкость c).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'бюро', answer: 'biuro', hint: 'Перед u пишем i (мягкость b).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'ребёнок', answer: 'dziecko', hint: 'Перед e пишем i (мягкость dz → dź).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'пять', answer: 'pięć', hint: 'Перед ę пишем i (мягкость p).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'много', answer: 'wiele', hint: 'Перед e пишем i (мягкость w).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'учитель', answer: 'nauczyciel', hint: 'Перед e пишем i (мягкость c → ć).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'инженер', answer: 'inżynier', hint: 'Перед e пишем i (мягкость n → ń).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'более дешёвый / дешевле', answer: 'tańszy', hint: 'ń перед согласной sz.' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme03Miekkie]
export default theme03Miekkie
