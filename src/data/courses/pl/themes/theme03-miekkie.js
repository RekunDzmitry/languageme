// Polish orthography: softness of consonants
// Based on section 1.4 of the PDF

const theme03Miekkie = {
  id: 'theme03',
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
        { type: 'write_answer', category: 'Мягкость', prompt: '_wiczyć', answer: 'ćwiczyć', hint: 'Упражняться — ć перед согласной.' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'dzi_', answer: 'dziś', hint: 'Сегодня — ś в конце слова.' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'iś_', answer: 'iść', hint: 'Идти — ć в конце слова.' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'czę_ć', answer: 'część', hint: 'Часть — ś перед согласной ć.' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'd_gać', answer: 'dźgać', hint: 'Пороть — dź в начале перед согласной.' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'gro_ba', answer: 'groźba', hint: 'Угроза — ź перед согласной b.' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'rze_ba', answer: 'rzeźba', hint: 'Скульптура — ź перед согласной.' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'babule_ka', answer: 'babuleńka', hint: 'Старушка — ń перед согласной.' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'pończo_a', answer: 'pończocha', hint: 'Чулок.' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'b_elizna', answer: 'bielizna', hint: 'Бельё — перед гласной e пишем i (мягкость b).' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'lak_er', answer: 'lakier', hint: 'Лак — перед e пишем i (мягкость k).' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'm_ęso', answer: 'mięso', hint: 'Мясо — перед ę пишем i (мягкость m).' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'z_emia', answer: 'ziemia', hint: 'Земля — перед e пишем i (мягкость z).' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'w_osna', answer: 'wiosna', hint: 'Весна — перед o пишем i (мягкость w).' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'c_ągle', answer: 'ciągle', hint: 'Постоянно — перед ą пишем i (мягкость c).' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'b_uro', answer: 'biuro', hint: 'Бюро — перед u пишем i (мягкость b).' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'dz_ecko', answer: 'dziecko', hint: 'Ребёнок — перед e пишем i (мягкость dz → dź).' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'p_ęć', answer: 'pięć', hint: 'Пять — перед ę пишем i (мягкость p).' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'w_ele', answer: 'wiele', hint: 'Много — перед e пишем i (мягкость w).' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'nauczyc_el', answer: 'nauczyciel', hint: 'Учитель — перед e пишем i (мягкость c → ć).' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'inży_er', answer: 'inżynier', hint: 'Инженер — перед e пишем i (мягкость n → ń).' },
        { type: 'write_answer', category: 'Мягкость', prompt: 'tań_y', answer: 'tańszy', hint: 'Более дешёвый — ń перед согласной sz.' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme03Miekkie]
export default theme03Miekkie
