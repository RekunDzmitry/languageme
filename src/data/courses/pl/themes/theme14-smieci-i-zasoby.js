// Polish: Śmieci, odpady i oszczędzanie zasobów — theme 14
// Audio flashcards from vocabIds (no write_answer exercises)

const theme14SmieciIZasoby = {
  id: 'pl_theme14',
  order: 14,
  title: 'Śmieci, odpady i oszczędzanie zasobów',
  titleRu: 'Мусор, отходы и экономия ресурсов',
  description: 'Лексика для обсуждения мусора, переработки отходов и экономии ресурсов',
  descriptionRu: 'Лексика для обсуждения мусора, переработки отходов и экономии ресурсов',
  unlockCondition: null,
  vocabIds: [
    // 🗑️ Śmieci i odpady
    'pl_321',  // ścieki
    'pl_322',  // oczyszczanie
    'pl_323',  // oczyszczalnia ścieków
    'pl_324',  // śmiecić
    'pl_325',  // zaśmiecić
    'pl_326',  // śmieci
    'pl_327',  // śmietnik
    'pl_328',  // odpady
    'pl_329',  // odpadki
    'pl_330',  // resztki
    'pl_331',  // resztki jedzenia
    'pl_332',  // rozkładać się
    'pl_333',  // rozłożyć się
    'pl_334',  // rozkład
    'pl_335',  // wysypisko śmieci
    'pl_336',  // wysypisko komunalne
    'pl_337',  // wysypisko dzikie
    'pl_338',  // segregować
    'pl_339',  // posegregować
    'pl_340',  // segregacja
    'pl_341',  // recykling
    'pl_342',  // makulatura
    // 💡 Oszczędzanie zasobów
    'pl_343',  // marnować
    'pl_344',  // zmarnować
    'pl_345',  // cenny
    'pl_346',  // bezcenny
    'pl_347',  // zużywać
    'pl_348',  // zużyć
    'pl_349',  // odzyskiwać
    'pl_350',  // odzyskać
    'pl_351',  // tryb czuwania
  ],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Мусор и отходы',
          text: 'Основные термины для описания мусора:',
          examples: [
            { pl: 'śmieci / odpady', ru: 'мусор / отходы' },
            { pl: 'odpadki / resztki', ru: 'отбросы / остатки' },
            { pl: 'śmiecić', ru: 'мусорить' },
            { pl: 'śmietnik', ru: 'мусорный бак' },
          ],
        },
        {
          title: 'Свалки и утилизация',
          text: 'Как говорят о местах хранения мусора:',
          examples: [
            { pl: 'wysypisko śmieci', ru: 'свалка мусора' },
            { pl: 'wysypisko komunalne', ru: 'муниципальная свалка' },
            { pl: 'wysypisko dzikie', ru: 'стихийная свалка' },
            { pl: 'ścieki → oczyszczalnia ścieków', ru: 'сточные воды → очистные сооружения' },
            { pl: 'rozkładać się → rozkład', ru: 'разлагаться → разложение' },
          ],
        },
        {
          title: 'Сортировка и переработка',
          text: 'Экологичная утилизация:',
          examples: [
            { pl: 'segregować śmieci', ru: 'сортировать мусор' },
            { pl: 'segregacja szkła, plastiku, metalu, papieru', ru: 'сортировка стекла, пластика, металла, бумаги' },
            { pl: 'recykling', ru: 'переработка, рециклинг' },
            { pl: 'makulatura', ru: 'макулатура' },
          ],
        },
        {
          title: 'Экономия ресурсов',
          text: 'Как говорят о бережном отношении к ресурсам:',
          examples: [
            { pl: 'marnować wodę, czas, pieniądze', ru: 'тратить впустую воду, время, деньги' },
            { pl: 'cenny → bezcenny', ru: 'ценный → бесценный' },
            { pl: 'zużywać wodę, energię', ru: 'расходовать воду, энергию' },
            { pl: 'odzyskiwać metal, papier', ru: 'восстанавливать металл, бумагу' },
            { pl: 'tryb czuwania', ru: 'режим ожидания (электроприборов)' },
          ],
        },
      ],
      tables: [],
    },
  ],
  verbList: [],
}

export const themes = [theme14SmieciIZasoby]
export default theme14SmieciIZasoby
