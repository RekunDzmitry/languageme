// Polish orthography: ż vs rz
// Based on section 1.7 of the PDF

const theme04RzZ = {
  id: 'theme04',
  order: 4,
  title: 'Ortografia: ż i rz',
  titleRu: 'Правописание: ż и rz',
  description: 'Буква ż и диграф rz обозначают один звук [ж] — когда писать что',
  descriptionRu: 'Буква ż и диграф rz обозначают один звук [ж] — когда писать что',
  unlockCondition: null,
  vocabIds: [],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Когда пишем ż?',
          text: 'Буква ż обозначает [ж] общеславянского происхождения (в русском соответствует ж: żona — жена, ważny — важный). Правила:',
          examples: [
            { rule: 'а) чередование ż // g, dz, z, s, ź, h', words: [
              { pl: 'trwożnie — trwoga', ru: '' },
              { pl: 'pieniążek — pieniądz', ru: '' },
              { pl: 'mrożenie — mróz', ru: '' },
              { pl: 'drużyna — druh', ru: '' },
            ]},
            { rule: 'б) окончания -aż, -eż', words: [
              { pl: 'sprzedaż', ru: '' },
              { pl: 'bandaż', ru: '' },
              { pl: 'witraż', ru: '' },
              { pl: 'młodzież', ru: '' },
              { pl: 'odzież', ru: '' },
              { pl: 'grabież', ru: '' },
            ]},
            { rule: 'в) частицы -że, -ż', words: [
              { pl: 'tenże', ru: '' },
              { pl: 'bądźże', ru: '' },
              { pl: 'stańże', ru: '' },
              { pl: 'cóż', ru: '' },
              { pl: 'czyż', ru: '' },
              { pl: 'gdyż', ru: '' },
            ]},
            { rule: 'г) после n в заимствованиях', words: [
              { pl: 'aranżować', ru: '' },
              { pl: 'branża', ru: '' },
              { pl: 'oranżada', ru: '' },
              { pl: 'rewanż', ru: '' },
            ]},
          ],
        },
        {
          title: 'Когда пишем rz?',
          text: 'Диграф rz — тот же звук, но другое историческое происхождение. Правила:',
          examples: [
            { rule: 'а) чередование ż // r', words: [
              { pl: 'reformatorzy — reformator', ru: '' },
              { pl: 'literatura — w literaturze', ru: '' },
              { pl: 'tworzyć — twórca', ru: '' },
              { pl: 'wzorzec — wzorca', ru: '' },
            ]},
            { rule: 'б) русскому р соответствует rz', words: [
              { pl: 'rzeka', ru: 'река' },
              { pl: 'rzadko', ru: 'редко' },
              { pl: 'orzech', ru: 'орех' },
              { pl: 'korzeń', ru: 'корень' },
              { pl: 'porządek', ru: 'порядок' },
              { pl: 'rząd', ru: 'ряд' },
              { pl: 'rzemień', ru: 'ремень' },
              { pl: 'rzemiosło', ru: 'ремесло' },
              { pl: 'Rzym', ru: 'Рим' },
            ]},
            { rule: 'в) после v, b, p, d, t, g, k, x', words: [
              { pl: 'wyprzedaż', ru: '' },
              { pl: 'potrzeba', ru: '' },
              { pl: 'chrześcijański', ru: '' },
              { pl: 'wrzątek', ru: '' },
              { pl: 'przekonanie', ru: '' },
              { pl: 'wytrzymać', ru: '' },
              { pl: 'skrzydło', ru: '' },
              { pl: 'brzmienie', ru: '' },
              { pl: 'wydrzeć', ru: '' },
              { pl: 'ugrzęznąć', ru: '' },
            ]},
          ],
        },
        {
          title: 'Исключения (пишем ż, не rz)',
          text: 'Запомните эти слова:',
          examples: [
            { rule: 'Базовые слова с sz', words: [
              { pl: 'pszenica', ru: 'пшеница' },
              { pl: 'pszczoła', ru: 'пчела' },
              { pl: 'kształt', ru: 'форма' },
              { pl: 'bukszpan', ru: 'самшит' },
            ]},
            { rule: 'Наречия', words: [
              { pl: 'wszystko', ru: 'всё' },
              { pl: 'wszędzie', ru: 'везде' },
              { pl: 'zawsze', ru: 'всегда' },
            ]},
            { rule: 'Формы сравнительной степени', words: [
              { pl: 'głupszy', ru: '' },
              { pl: 'krótszy', ru: '' },
              { pl: 'rzadszy', ru: '' },
            ]},
            { rule: 'С приставками ob-, od-, pod- + ż', words: [
              { pl: 'obżerać się', ru: '' },
              { pl: 'odżyć', ru: '' },
              { pl: 'nadżółkły', ru: '' },
            ]},
            { rule: 'Окончание -że', words: [
              { pl: 'dajże', ru: '' },
              { pl: 'zróbże', ru: '' },
              { pl: 'także', ru: '' },
              { pl: 'skądże', ru: '' },
            ]},
            { rule: 'Окончания -mierz, -mistrz', words: [
              { pl: 'Kazimierz', ru: '' },
              { pl: 'Włodzimierz', ru: '' },
              { pl: 'sztukmistrz', ru: '' },
              { pl: 'zegarmistrz', ru: '' },
            ]},
          ],
        },
      ],
      tables: [],
    },
    {
      type: 'exercises',
      exercises: [
        { type: 'write_answer', category: 'ż или rz?', prompt: '_eka', answer: 'rzeka', hint: 'Река — в русском р, значит rz.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: '_adko', answer: 'rzadko', hint: 'Редко — в русском р, значит rz.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'o_ech', answer: 'orzech', hint: 'Орех — в русском р, значит rz.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'ko_eń', answer: 'korzeń', hint: 'Корень — в русском р.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'po_ądek', answer: 'porządek', hint: 'Порядок — в русском р.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: '_emiosło', answer: 'rzemiosło', hint: 'Ремесло — в русском р.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'Rzym', answers: ['Rzym', 'Rzyn'], hint: 'Рим — в русском р, значит rz.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'w_ątek', answer: 'wrzątek', hint: 'Кипяток — rz после w.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'sk_ydło', answer: 'skrzydło', hint: 'Крыло — rz после k.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'p_ekonanie', answer: 'przekonanie', hint: 'Убеждение — rz после p.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'b_mienie', answer: 'brzmienie', hint: 'Звучание — rz после b.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'tw_ca', answer: 'twórca', hint: 'Творец — чередование tworzyć // twórca (rz // r).' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'w literatu_e', answer: 'w literaturze', hint: 'В литературе — чередование literatura // literaturze (r // rz).' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'sp_edaż', answer: 'sprzedaż', hint: 'Распродажа: rz после p, ż в окончании -aż.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'mło_ież', answer: 'młodzież', hint: 'Молодёжь — окончание -eż, пишем ż.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'banda_', answer: 'bandaż', hint: 'Бандаж — окончание -aż, пишем ż.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'odzie_', answer: 'odzież', hint: 'Одежда — окончание -eż, пишем ż.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'aran_ować', answer: 'aranżować', hint: 'Организовывать — ż после n в заимствованиях.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'bran_a', answer: 'branża', hint: 'Отрасль — ż после n в заимствованиях.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'dru_yna', answer: 'drużyna', hint: 'Команда — чередование drużyna // druh (ż // h).' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'mro_enie', answer: 'mrożenie', hint: 'Заморозка — чередование mrożenie // mróz (ż // z).' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'Kazimie_', answer: 'Kazimierz', hint: 'Имя собственное — окончание -mierz всегда с rz.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'pszenica', answers: ['pszenica', 'pszenicy'], hint: 'Пшеница — исключение! Пишем с sz, не rz.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'pszczoła', answers: ['pszczoła', 'pszczoly'], hint: 'Пчела — исключение!' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'wszystko', answers: ['wszystko'], hint: 'Всё — исключение, пишем wsz-.' },
        { type: 'write_answer', category: 'ż или rz?', prompt: 'krót_y', answer: 'krótszy', hint: 'Короче — сравнительная степень, исключение: пишем sz.' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme04RzZ]
export default theme04RzZ
