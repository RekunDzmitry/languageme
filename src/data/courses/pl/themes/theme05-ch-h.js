// Polish orthography: ch vs h
// Based on section 1.8 of the PDF

const theme05ChH = {
  id: 'theme05',
  order: 5,
  title: 'Ortografia: ch i h',
  titleRu: 'Правописание: ch и h',
  description: 'Заднеязычный звук [х] — когда пишем ch, а когда h',
  descriptionRu: 'Заднеязычный звук [х] — когда пишем диграф ch, а когда букву h',
  unlockCondition: null,
  vocabIds: [],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Когда пишем ch?',
          text: 'Диграф ch пишется:',
          examples: [
            { rule: 'а) при чередовании [х // ш]', words: [
              { pl: 'mucha — muszka', ru: '' },
              { pl: 'suchy — suszyć', ru: '' },
              { pl: 'duch — dusza', ru: '' },
              { pl: 'piechota — pieszo', ru: '' },
            ]},
            { rule: 'б) в конце слова (исключения: Boh, druh)', words: [
              { pl: 'mech', ru: 'мох' },
              { pl: 'ruch', ru: 'движение' },
              { pl: 'w oczach', ru: '' },
              { pl: 'strach', ru: 'страх' },
              { pl: 'gmach', ru: 'здание' },
            ]},
            { rule: 'в) после буквы s', words: [
              { pl: 'pascha', ru: 'пасха' },
              { pl: 'schemat', ru: '' },
              { pl: 'scholastyka', ru: '' },
              { pl: 'schudnąć', ru: 'похудеть' },
            ]},
            { rule: 'г) в заимствованиях, если в исходном языке писалось ch', words: [
              { pl: 'charakter', ru: '' },
              { pl: 'chaotyczny', ru: '' },
              { pl: 'charytatywny', ru: '' },
              { pl: 'chemia', ru: '' },
            ]},
          ],
        },
        {
          title: 'Когда пишем h?',
          text: 'Буква h пишется:',
          examples: [
            { rule: 'а) при чередованиях [х // г / з / ж / дз]', words: [
              { pl: 'wahać się — waga, ważyć', ru: '' },
              { pl: 'druh — drużyna', ru: '' },
              { pl: 'błahy — błazen', ru: '' },
              { pl: 'wataha — watadze', ru: '' },
            ]},
            { rule: 'б) существуют варианты без начального h', words: [
              { pl: 'harfa или arfa', ru: '' },
              { pl: 'Hanusia или Anusia', ru: '' },
              { pl: 'Hanna или Anna', ru: '' },
              { pl: 'Hindus или Indus', ru: '' },
            ]},
            { rule: 'в) в словах с hiper-, hipo-', words: [
              { pl: 'hiperbola', ru: '' },
              { pl: 'hipochondria', ru: '' },
              { pl: 'hipoteka', ru: '' },
            ]},
            { rule: 'г) русскому [г] (или его отсутствию) соответствует польское [х]', words: [
              { pl: 'historia', ru: 'история' },
              { pl: 'honor', ru: 'гонор' },
              { pl: 'hamak', ru: 'гамак' },
              { pl: 'higiena', ru: 'гигиена' },
              { pl: 'Mahomet', ru: 'Магомет' },
              { pl: 'Himalaje', ru: 'Гималаи' },
              { pl: 'Bohdan', ru: 'Богдан' },
            ]},
          ],
        },
        {
          title: 'Слова, которые нужно запомнить (пишем h)',
          text: 'Часто употребляемые слова с h:',
          examples: [
            { pl: 'hamować', ru: 'тормозить' },
            { pl: 'harmonia', ru: 'гармония' },
            { pl: 'hart', ru: 'закалка' },
            { pl: 'hasło', ru: 'лозунг' },
            { pl: 'hazard', ru: 'азарт' },
            { pl: 'herbata', ru: 'чай' },
            { pl: 'hermetyczny', ru: 'герметичный' },
            { pl: 'hierarchia', ru: 'иерархия' },
            { pl: 'honorarium', ru: 'гонорар' },
            { pl: 'horyzont', ru: 'горизонт' },
            { pl: 'hotel', ru: 'гостиница' },
            { pl: 'humanizm', ru: 'гуманизм' },
            { pl: 'nihilizm', ru: 'нигилизм' },
            { pl: 'rehabilitacja', ru: 'реабилитация' },
            { pl: 'hokej', ru: 'хоккей — ИСКЛЮЧЕНИЕ: пишется с h, хотя по правилу должно быть ch' },
          ],
        },
      ],
      tables: [],
    },
    {
      type: 'exercises',
      exercises: [
        { type: 'write_answer', category: 'ch или h?', prompt: 'mu_a', answer: 'mucha', hint: 'Муха — чередование mucha // muszka (ch // sz), значит ch.' },
        { type: 'write_answer', category: 'ch или h?', prompt: 'su_y', answer: 'suchy', hint: 'Сухой — чередование suchy // suszyć, значит ch.' },
        { type: 'write_answer', category: 'ch или h?', prompt: 'du_', answer: 'duch', hint: 'Дух — ch в конце слова + чередование duch // dusza.' },
        { type: 'write_answer', category: 'ch или h?', prompt: 'stra_', answer: 'strach', hint: 'Страх — ch в конце слова.' },
        { type: 'write_answer', category: 'ch или h?', prompt: 'me_', answer: 'mech', hint: 'Мох — ch в конце слова.' },
        { type: 'write_answer', category: 'ch или h?', prompt: 'ru_', answer: 'ruch', hint: 'Движение — ch в конце слова.' },
        { type: 'write_answer', category: 'ch или h?', prompt: 'pas_a', answer: 'pascha', hint: 'Пасха — ch после s.' },
        { type: 'write_answer', category: 'ch или h?', prompt: 's_emat', answer: 'schemat', hint: 'Схема — ch после s.' },
        { type: 'write_answer', category: 'ch или h?', prompt: 's_udnąć', answer: 'schudnąć', hint: 'Похудеть — ch после s.' },
        { type: 'write_answer', category: 'ch или h?', prompt: '_arakter', answer: 'charakter', hint: 'Характер — заимствование, в оригинале ch.' },
        { type: 'write_answer', category: 'ch или h?', prompt: '_emia', answer: 'chemia', hint: 'Химия — заимствование, пишем ch.' },
        { type: 'write_answer', category: 'ch или h?', prompt: '_istoria', answer: 'historia', hint: 'История — русскому г соответствует польское h.' },
        { type: 'write_answer', category: 'ch или h?', prompt: '_onor', answer: 'honor', hint: 'Гонор — русскому г соответствует h.' },
        { type: 'write_answer', category: 'ch или h?', prompt: '_amak', answer: 'hamak', hint: 'Гамак — русскому г соответствует h.' },
        { type: 'write_answer', category: 'ch или h?', prompt: '_igiena', answer: 'higiena', hint: 'Гигиена — русскому г соответствует h.' },
        { type: 'write_answer', category: 'ch или h?', prompt: '_iperbola', answer: 'hiperbola', hint: 'Гипербола — приставка hiper-.' },
        { type: 'write_answer', category: 'ch или h?', prompt: '_ipoteka', answer: 'hipoteka', hint: 'Ипотека — приставка hipo-.' },
        { type: 'write_answer', category: 'ch или h?', prompt: '_erbata', answer: 'herbata', hint: 'Чай — запоминаем: пишется с h.' },
        { type: 'write_answer', category: 'ch или h?', prompt: '_otel', answer: 'hotel', hint: 'Отель — запоминаем: пишется с h.' },
        { type: 'write_answer', category: 'ch или h?', prompt: '_umanizm', answer: 'humanizm', hint: 'Гуманизм — запоминаем: пишется с h.' },
        { type: 'write_answer', category: 'ch или h?', prompt: 'wa_ać się', answer: 'wahać się', hint: 'Колебаться — чередование wahać // waga (h // g).' },
        { type: 'write_answer', category: 'ch или h?', prompt: 'dru_', answer: 'druh', hint: 'Друг — чередование druh // drużyna (h // ż). Исключение из правила о ch в конце слова!' },
        { type: 'write_answer', category: 'ch или h?', prompt: '_okej', answer: 'hokej', hint: 'Хоккей — ИСКЛЮЧЕНИЕ! Пишется с h, хотя по правилу ожидалось бы ch.' },
        { type: 'write_answer', category: 'ch или h?', prompt: 'Bo_dan', answer: 'Bohdan', hint: 'Богдан — русскому г соответствует h.' },
        { type: 'write_answer', category: 'ch или h?', prompt: 'Ma_omet', answer: 'Mahomet', hint: 'Магомет — русскому г соответствует h.' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme05ChH]
export default theme05ChH
