// Polish orthography: digraphs (cz, dz, dź, dż, ch, rz, sz)
// Based on section 1.2 of the PDF

const theme02Digrafy = {
  id: 'pl_theme02',
  order: 2,
  title: 'Ortografia: dwuznaki (cz, dz, dź, dż, ch, rz, sz)',
  titleRu: 'Правописание: диграфы (cz, dz, dź, dż, ch, rz, sz)',
  description: 'В польском языке 7 диграфов — буквосочетаний, обозначающих один звук',
  descriptionRu: 'В польском языке 7 диграфов — буквосочетаний, обозначающих один звук',
  unlockCondition: null,
  vocabIds: [],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Семь диграфов польского языка',
          text: 'В польской графике семь буквосочетаний, обозначающих один звук:',
          examples: [
            { rule: 'cz = [ч]', words: [
              { pl: 'czysty', ru: 'чистый' },
              { pl: 'człowiek', ru: 'человек' },
              { pl: 'lecz', ru: 'но' },
            ]},
            { rule: 'dz = [дз]', words: [
              { pl: 'władza', ru: 'власть' },
              { pl: 'widzę', ru: 'вижу' },
              { pl: 'sadza', ru: 'сажа' },
            ]},
            { rule: "dź = [дз']", words: [
              { pl: 'niedźwiedź', ru: 'медведь' },
              { pl: 'dźwięk', ru: 'звук' },
              { pl: 'chodźmy', ru: 'давай пойдём' },
            ]},
            { rule: 'dż = [дж]', words: [
              { pl: 'jeżdżę', ru: 'езжу' },
              { pl: 'dżdżysty', ru: 'дождливый' },
              { pl: 'dżuma', ru: 'чума' },
            ]},
            { rule: 'ch = [х]', words: [
              { pl: 'chory', ru: 'больной' },
              { pl: 'pech', ru: 'неудача' },
              { pl: 'chłopski', ru: 'крестьянский' },
            ]},
            { rule: 'rz = [ж] / [ш]', words: [
              { pl: 'morze', ru: 'море' },
              { pl: 'krzesło', ru: 'стул' },
              { pl: 'drzewo', ru: 'дерево' },
            ]},
            { rule: 'sz = [ш]', words: [
              { pl: 'szósty', ru: 'шестой' },
              { pl: 'Warszawa', ru: 'Варшава' },
              { pl: 'czaszka', ru: 'череп' },
            ]},
          ],
        },
        {
          title: 'Обратите внимание: dz, dż как два звука',
          text: 'В некоторых случаях буквосочетания dz, dż обозначают не один, а два звука (на стыке приставки и корня):',
          examples: [
            { pl: 'odznaka', ru: 'награда, отличие [od-znaka]' },
            { pl: 'odzwierciedlić', ru: 'отразить [od-zwierciedlić]' },
            { pl: 'podżegać', ru: 'подталкивать [pod-żegać]' },
            { pl: 'nadzwyczajny', ru: 'чрезвычайный [nad-zwyczajny]' },
            { pl: 'odzyskać', ru: 'отыскать [od-zyskać]' },
            { pl: 'podżartować', ru: 'пошутить [pod-żartować]' },
          ],
        },
        {
          title: 'Диграф rz чаще всего читается как [ж]',
          text: 'Диграф rz чаще всего обозначает согласный звук [ж], например:',
          examples: [
            { pl: 'rzadko', ru: 'редко' },
            { pl: 'rzecz', ru: 'вещь, дело' },
            { pl: 'porządek', ru: 'порядок' },
            { pl: 'marzec', ru: 'март' },
            { pl: 'rzucać', ru: 'бросать' },
          ],
        },
        {
          title: 'Диграф rz после глухих согласных',
          text: 'После глухих согласных rz всегда произносится как глухой звук [ш]:',
          examples: [
            { pl: 'powietrze', ru: 'воздух [poveczse]' },
            { pl: 'przestrzeń', ru: 'пространство [пшестшень]' },
            { pl: 'trzeba', ru: 'надо [тшеба]' },
            { pl: 'krzyk', ru: 'крик [кшык]' },
            { pl: 'chrzan', ru: 'хрен [хшан]' },
          ],
        },
        {
          title: 'Исключения: rz после глухих как [рз]',
          text: 'Но в некоторых случаях rz после глухих согласных надо произносить иначе — как [рз] (два звука):',
          examples: [
            { pl: 'marznąć', ru: 'мёрзнуть' },
            { pl: 'zmarzły', ru: 'замёрзший' },
            { pl: 'erzac', ru: 'эрзац' },
            { pl: 'zmierznąć', ru: 'опротиветь' },
            { pl: 'zmierzły', ru: 'противный' },
          ],
        },
      ],
      tables: [],
    },
    {
      type: 'exercises',
      exercises: [
        { type: 'write_answer', category: 'Перевод', prompt: 'чистый', answer: 'czysty', hint: 'Диграф cz = [ч].' },
        { type: 'write_answer', category: 'Перевод', prompt: 'человек', answer: 'człowiek', hint: 'Диграф cz.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'но / однако', answer: 'lecz', hint: 'cz в конце слова.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'власть', answer: 'władza', hint: 'Диграф dz = [дз].' },
        { type: 'write_answer', category: 'Перевод', prompt: 'вижу', answer: 'widzę', hint: 'Диграф dz.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'сажа', answer: 'sadza', hint: 'Диграф dz.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'медведь', answer: 'niedźwiedź', hint: 'Диграф dź (мягкий).' },
        { type: 'write_answer', category: 'Перевод', prompt: 'звук', answer: 'dźwięk', hint: 'Диграф dź в начале слова.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'давай пойдём', answer: 'chodźmy', hint: 'Диграф dź.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'езжу', answer: 'jeżdżę', hint: 'Диграф dż.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'чума', answer: 'dżuma', hint: 'Диграф dż в начале слова.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'больной', answer: 'chory', hint: 'Диграф ch = [х].' },
        { type: 'write_answer', category: 'Перевод', prompt: 'неудача', answer: 'pech', hint: 'Диграф ch в конце слова.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'крестьянский', answer: 'chłopski', hint: 'Диграф ch.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'море', answer: 'morze', hint: 'Диграф rz = [ж].' },
        { type: 'write_answer', category: 'Перевод', prompt: 'стул', answer: 'krzesło', hint: 'Диграф rz после k читается как [ш].' },
        { type: 'write_answer', category: 'Перевод', prompt: 'дерево', answer: 'drzewo', hint: 'Диграф rz после d.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'шестой', answer: 'szósty', hint: 'Диграф sz = [ш].' },
        { type: 'write_answer', category: 'Перевод', prompt: 'Варшава', answer: 'Warszawa', hint: 'Диграф sz.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'череп', answer: 'czaszka', hint: 'Диграф sz.' },
        { type: 'write_answer', category: 'Перевод', prompt: 'надо / нужно', answer: 'trzeba', hint: 'После глухой t диграф rz звучит как [ш].' },
        { type: 'write_answer', category: 'Перевод', prompt: 'крик', answer: 'krzyk', hint: 'После k диграф rz читается как [ш].' },

        { type: 'write_answer', category: 'dz/dż = два звука', prompt: 'награда, отличие', answer: 'odznaka', hint: 'Приставка od- + znaka: dz здесь два звука [d-z].' },
        { type: 'write_answer', category: 'dz/dż = два звука', prompt: 'отразить', answer: 'odzwierciedlić', hint: 'Приставка od- + корень zwierciedl-: dz читается как [d-z].' },
        { type: 'write_answer', category: 'dz/dż = два звука', prompt: 'подталкивать', answer: 'podżegać', hint: 'Приставка pod- + żegać: dż читается как [d-ż].' },

        { type: 'write_answer', category: 'rz = [ж]', prompt: 'редко', answer: 'rzadko', hint: 'Диграф rz чаще всего читается как [ж].' },
        { type: 'write_answer', category: 'rz = [ж]', prompt: 'вещь, дело', answer: 'rzecz', hint: 'rz в начале слова = [ж].' },
        { type: 'write_answer', category: 'rz = [ж]', prompt: 'порядок', answer: 'porządek', hint: 'rz внутри слова звучит как [ж].' },
        { type: 'write_answer', category: 'rz = [ж]', prompt: 'март', answer: 'marzec', hint: 'Название месяца; rz = [ж].' },
        { type: 'write_answer', category: 'rz = [ж]', prompt: 'бросать', answer: 'rzucać', hint: 'Глагол с rz в начале = [ж].' },

        { type: 'write_answer', category: 'rz после глухих = [ш]', prompt: 'воздух', answer: 'powietrze', hint: 'После глухой t диграф rz читается как [ш].' },

        { type: 'write_answer', category: 'Исключения: rz = [рз]', prompt: 'мёрзнуть', answer: 'marznąć', hint: 'Исключение: rz после глухой здесь произносится как два звука [рз].' },
        { type: 'write_answer', category: 'Исключения: rz = [рз]', prompt: 'замёрзший', answer: 'zmarzły', hint: 'Исключение: rz = [рз].' },
        { type: 'write_answer', category: 'Исключения: rz = [рз]', prompt: 'эрзац', answer: 'erzac', hint: 'Заимствование; rz = [рз], два звука.' },
        { type: 'write_answer', category: 'Исключения: rz = [рз]', prompt: 'опротиветь', answer: 'zmierznąć', hint: 'Исключение: rz после глухой = [рз].' },
        { type: 'write_answer', category: 'Исключения: rz = [рз]', prompt: 'противный', answer: 'zmierzły', hint: 'Исключение: rz = [рз].' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme02Digrafy]
export default theme02Digrafy
