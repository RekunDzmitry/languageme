// Polish orthography: digraphs (cz, dz, dź, dż, ch, rz, sz)
// Based on section 1.2 of the PDF

const theme02Digrafy = {
  id: 'theme02',
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
          title: 'Обратите внимание!',
          text: 'В некоторых случаях буквосочетания dz, dż обозначают не один, а два звука (на стыке приставки и корня):',
          examples: [
            { pl: 'nadzwyczajny', ru: 'чрезвычайный [nad-zwyczajny]' },
            { pl: 'odzyskać', ru: 'отыскать [od-zyskać]' },
            { pl: 'podżartować', ru: 'пошутить [pod-żartować]' },
            { pl: 'podżywić', ru: 'подкормить [pod-żywić]' },
          ],
        },
        {
          title: 'Диграф rz после глухих согласных',
          text: 'После глухих согласных rz читается как глухой звук [ш]:',
          examples: [
            { pl: 'przestrzeń', ru: 'пространство [пшестшень]' },
            { pl: 'trzeba', ru: 'надо [тшеба]' },
            { pl: 'krzyk', ru: 'крик [кшык]' },
            { pl: 'chrzan', ru: 'хрен [хшан]' },
          ],
        },
      ],
      tables: [],
    },
    {
      type: 'exercises',
      exercises: [
        { type: 'write_answer', category: 'Диграфы', prompt: '_ysty', answer: 'czysty', hint: 'Чистый — диграф cz = [ч].' },
        { type: 'write_answer', category: 'Диграфы', prompt: '_łowiek', answer: 'człowiek', hint: 'Человек — диграф cz.' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'le_', answer: 'lecz', hint: 'Но/однако — cz в конце слова.' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'wła_a', answer: 'władza', hint: 'Власть — диграф dz = [дз].' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'wi_ę', answer: 'widzę', hint: 'Вижу — диграф dz.' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'sa_a', answer: 'sadza', hint: 'Сажа — диграф dz.' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'nie_wiedź', answer: 'niedźwiedź', hint: 'Медведь — диграф dź (мягкий).' },
        { type: 'write_answer', category: 'Диграфы', prompt: '_więk', answer: 'dźwięk', hint: 'Звук — диграф dź в начале слова.' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'cho_my', answer: 'chodźmy', hint: 'Давай пойдём — диграф dź.' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'jeż_ę', answer: 'jeżdżę', hint: 'Езжу — диграф dż.' },
        { type: 'write_answer', category: 'Диграфы', prompt: '_uma', answer: 'dżuma', hint: 'Чума — диграф dż в начале слова.' },
        { type: 'write_answer', category: 'Диграфы', prompt: '_ory', answer: 'chory', hint: 'Больной — диграф ch = [х].' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'pe_', answer: 'pech', hint: 'Неудача — диграф ch в конце слова.' },
        { type: 'write_answer', category: 'Диграфы', prompt: '_łopski', answer: 'chłopski', hint: 'Крестьянский — диграф ch.' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'mo_e', answer: 'morze', hint: 'Море — диграф rz = [ж].' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'k_esło', answer: 'krzesło', hint: 'Стул — диграф rz после k читается как [ш].' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'd_ewo', answer: 'drzewo', hint: 'Дерево — диграф rz после d.' },
        { type: 'write_answer', category: 'Диграфы', prompt: '_ósty', answer: 'szósty', hint: 'Шестой — диграф sz = [ш].' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'War_awa', answer: 'Warszawa', hint: 'Варшава — диграф sz.' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'cza_ka', answer: 'czaszka', hint: 'Череп — диграф sz.' },
        { type: 'write_answer', category: 'Диграфы', prompt: 't_eba', answer: 'trzeba', hint: 'Надо — после глухой t диграф rz звучит как [ш].' },
        { type: 'write_answer', category: 'Диграфы', prompt: 'k_yk', answer: 'krzyk', hint: 'Крик — после k диграф rz читается как [ш].' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme02Digrafy]
export default theme02Digrafy
