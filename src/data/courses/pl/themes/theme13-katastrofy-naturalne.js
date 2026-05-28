// Polish: Katastrofy naturalne — theme 13
// Audio flashcards from vocabIds (no write_answer exercises)

const theme13KatastrofyNaturalne = {
  id: 'pl_theme13',
  order: 13,
  title: 'Katastrofy naturalne',
  titleRu: 'Стихийные катастрофы',
  description: 'Лексика для обсуждения пожаров, наводнений, ураганов, землетрясений и других стихийных катастроф',
  descriptionRu: 'Лексика для обсуждения пожаров, наводнений, ураганов, землетрясений и других стихийных катастроф',
  unlockCondition: null,
  vocabIds: [
    // 🔥 Pożar
    'pl_250',  // palić się
    'pl_251',  // spalić się
    'pl_252',  // płonąć
    'pl_253',  // spłonąć
    'pl_254',  // ogień
    'pl_255',  // pożar
    'pl_256',  // gasić
    'pl_257',  // ugasić
    'pl_258',  // wybuchać
    'pl_259',  // wybuchnąć
    'pl_260',  // trawić
    'pl_261',  // strawić
    // 🌊 Powódź
    'pl_262',  // powódź
    'pl_263',  // fala powodziowa
    'pl_264',  // fala kulminacyjna
    'pl_265',  // zalewać
    'pl_266',  // zalać
    'pl_267',  // porywać
    'pl_268',  // porwać
    'pl_269',  // zrywać
    'pl_270',  // zerwać
    'pl_271',  // występować z brzegów
    'pl_272',  // wystąpić z brzegów
    'pl_273',  // podmywać
    'pl_274',  // podmyć
    // 🌀 Huragan / Tajfun / Tornado
    'pl_275',  // huragan
    'pl_276',  // tajfun
    'pl_277',  // tornado
    'pl_278',  // wiatr porywisty
    'pl_279',  // wiatr gwałtowny
    'pl_280',  // wichura
    'pl_281',  // szaleć
    'pl_282',  // rozszaleć się
    'pl_283',  // cichnąć
    'pl_284',  // ucichnąć
    // ☀️ Susza
    'pl_285',  // susza
    'pl_286',  // słońce pali
    'pl_287',  // wysuszyć ziemię
    'pl_288',  // ziemia pęka
    'pl_289',  // ziemia pęknie
    'pl_290',  // ziemia wysycha
    'pl_291',  // ziemia wyschnie
    // 🌍 Trzęsienie ziemi
    'pl_292',  // trzęsienie ziemi
    'pl_293',  // ziemia trzęsie się
    'pl_294',  // ziemia zatrzęsie się
    'pl_295',  // ziemia zapada się
    'pl_296',  // ziemia zapadnie się
    'pl_297',  // budynek wali się
    'pl_298',  // budynek zawali się
    'pl_299',  // ulegać zniszczeniu
    'pl_300',  // ulec zniszczeniu
    'pl_301',  // runąć
    'pl_302',  // ruiny budynku
    // 🚨 Katastrofy
    'pl_303',  // katastrofa
    'pl_304',  // dochodzić do katastrofy
    'pl_305',  // dojść do katastrofy
    'pl_306',  // unikać katastrofy
    'pl_307',  // uniknąć katastrofy
    'pl_308',  // katastrofa może mieć miejsce
    'pl_309',  // katastrofalny
    'pl_310',  // katastroficzny
    'pl_311',  // ewakuować
    'pl_312',  // ewakuacja
    'pl_313',  // ocalać
    'pl_314',  // ocalić
    'pl_315',  // szkodzić
    'pl_316',  // zaszkodzić
    'pl_317',  // szkoda
    'pl_318',  // szkodliwy
    'pl_319',  // ofiara
    'pl_320',  // lawa
  ],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Пожар (Pożar)',
          text: 'Как описывают огонь и пожар на польском:',
          examples: [
            { pl: 'ogień → pożar', ru: 'огонь → пожар' },
            { pl: 'palić się / płonąć', ru: 'гореть / пылать' },
            { pl: 'gasić pożar', ru: 'тушить пожар' },
            { pl: 'ogień trawi budynek', ru: 'огонь пожирает здание' },
            { pl: 'wybuchać', ru: 'вспыхнуть / взорваться' },
          ],
        },
        {
          title: 'Наводнение (Powódź)',
          text: 'Термины, связанные с наводнениями:',
          examples: [
            { pl: 'powódź → fala powodziowa', ru: 'наводнение → паводковая волна' },
            { pl: 'fala kulminacyjna', ru: 'кульминационная волна' },
            { pl: 'występować z brzegów', ru: 'выходить из берегов' },
            { pl: 'zalewać miasto', ru: 'затапливать город' },
            { pl: 'porywać samochody', ru: 'уносить машины' },
            { pl: 'podmywać brzegi', ru: 'подмывать берега' },
          ],
        },
        {
          title: 'Ураган, тайфун, торнадо',
          text: 'Ветер и шторм на польском:',
          examples: [
            { pl: 'huragan / tajfun / tornado', ru: 'ураган / тайфун / торнадо' },
            { pl: 'wichura', ru: 'шторм, буря' },
            { pl: 'wiatr porywisty / gwałtowny', ru: 'порывистый / резкий ветер' },
            { pl: 'szaleć → cichnąć', ru: 'бушевать → стихать' },
          ],
        },
        {
          title: 'Засуха (Susza)',
          text: 'Как говорят о засухе:',
          examples: [
            { pl: 'susza', ru: 'засуха' },
            { pl: 'słońce pali ziemię', ru: 'солнце жжёт землю' },
            { pl: 'ziemia pęka / wysycha', ru: 'земля трескается / пересыхает' },
          ],
        },
        {
          title: 'Землетрясение (Trzęsienie ziemi)',
          text: 'Описания последствий землетрясений:',
          examples: [
            { pl: 'trzęsienie ziemi', ru: 'землетрясение' },
            { pl: 'ziemia trzęsie się', ru: 'земля трясётся' },
            { pl: 'budynek wali się / zawali się', ru: 'здание рушится / обрушится' },
            { pl: 'ulegać zniszczeniu', ru: 'подвергаться разрушению' },
            { pl: 'runąć → ruiny budynku', ru: 'рухнуть → руины здания' },
          ],
        },
        {
          title: 'Катастрофа: помощь и последствия',
          text: 'Слова для обсуждения катастроф и спасения:',
          examples: [
            { pl: 'dochodzić do katastrofy', ru: 'доходить до катастрофы' },
            { pl: 'unikać katastrofy', ru: 'избегать катастрофы' },
            { pl: 'katastrofa może mieć miejsce', ru: 'катастрофа может произойти' },
            { pl: 'ewakuować ludzi i zwierzęta', ru: 'эвакуировать людей и животных' },
            { pl: 'ocalać ludzi', ru: 'спасать людей' },
            { pl: 'ofiara → szkoda', ru: 'жертва → ущерб' },
          ],
        },
      ],
      tables: [],
    },
  ],
  verbList: [],
}

export const themes = [theme13KatastrofyNaturalne]
export default theme13KatastrofyNaturalne
