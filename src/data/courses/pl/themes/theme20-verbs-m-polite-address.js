// Polish: verbs ending in -m and polite address — theme 20

const theme20VerbsMPoliteAddress = {
  id: 'pl_theme20',
  order: 20,
  title: 'Czasowniki na -m i formy grzecznościowe',
  titleRu: 'Глаголы на -m и вежливое обращение',
  description: 'Дополнительные ресурсы, польские вопросы, спряжение rozumieć/szukać и обращения Pan/Pani',
  descriptionRu: 'Дополнительные ресурсы, польские вопросы, спряжение rozumieć/szukać и обращения Pan/Pani',
  unlockCondition: null,
  vocabIds: [
    'pl_492', 'pl_493', 'pl_494', 'pl_495', 'pl_496', 'pl_497',
    'pl_498', 'pl_499', 'pl_500', 'pl_501', 'pl_502', 'pl_503',
    'pl_504', 'pl_505', 'pl_506', 'pl_507', 'pl_508', 'pl_509',
    'pl_510', 'pl_511', 'pl_512', 'pl_513', 'pl_514', 'pl_515',
  ],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Ресурсы для самостоятельной проверки',
          text: 'Для примеров в контексте полезны Glosbe, Bab.la и Reverso Context; для произношения — Forvo; для форм слова — Wiktionary. Фразу можно проверить поиском в кавычках, например "w języku polskim".',
          examples: [
            { pl: 'Glosbe / Bab.la / Reverso Context', ru: 'контекстные словари и примеры употребления' },
            { pl: 'Forvo', ru: 'произношение от носителей' },
            { pl: 'Wiktionary', ru: 'спряжения и склонения' },
            { pl: '"w języku polskim"', ru: 'проверка устойчивости фразы через точный поиск' },
          ],
        },
        {
          title: 'Глаголы с -m в форме ja',
          text: 'У многих частотных польских глаголов в 1-м лице единственного числа окончание -m. Часто достаточно убрать -ć у инфинитива и добавить личное окончание: -m, -sz, нулевое, -my, -cie, -ją.',
          examples: [
            { pl: 'rozumieć → rozumiem, rozumiesz, rozumie', ru: 'понимать → я понимаю, ты понимаешь, он/она понимает' },
            { pl: 'szukać → szukam, szukasz, szuka', ru: 'искать → я ищу, ты ищешь, он/она ищет' },
            { pl: 'mieszkać → mieszkam w Polsce', ru: 'жить → я живу в Польше' },
            { pl: 'czytać → czytam książkę', ru: 'читать → я читаю книгу' },
            { pl: 'kochać → kocham cię', ru: 'любить → я тебя люблю' },
          ],
        },
        {
          title: 'Czekać na + biernik',
          text: 'Глагол czekać требует предлога na и винительного падежа.',
          examples: [
            { pl: 'Czekam na Annę.', ru: 'Я жду Анну.' },
            { pl: 'Czekasz na tramwaj?', ru: 'Ты ждёшь трамвай?' },
          ],
        },
        {
          title: 'Как задавать вопросы',
          text: 'Вопрос можно сделать интонацией или частицей czy. Частица czy ставится в начало предложения и делает вопрос более явным.',
          examples: [
            { pl: 'Przyjdziesz na moje urodziny?', ru: 'Ты придёшь ко мне на день рождения?' },
            { pl: 'Czy przyjdziesz na moje urodziny?', ru: 'Придёшь ли ты ко мне на день рождения?' },
            { pl: 'Słyszysz?', ru: 'Ты слышишь?' },
          ],
        },
        {
          title: 'Вежливое обращение Pan/Pani',
          text: 'В польском вежливое обращение строится не через wy, а через Pan/Pani с глаголом в 3-м лице единственного числа.',
          examples: [
            { pl: 'Czy Pan mówi po polsku?', ru: 'Вы говорите по-польски? (к мужчине)' },
            { pl: 'Czy Pani mieszka tutaj?', ru: 'Вы живёте здесь? (к женщине)' },
            { pl: 'Panowie / Panie / Państwo', ru: 'господа / дамы / дамы и господа, смешанная группа' },
          ],
        },
        {
          title: 'Звательный падеж',
          text: 'При прямом обращении Pan меняется на Panie, а Pani остаётся Pani.',
          examples: [
            { pl: 'Panie Profesorze!', ru: 'Господин профессор!' },
            { pl: 'Pani Anno!', ru: 'Госпожа Анна!' },
          ],
        },
        {
          title: 'Глагол как целое предложение',
          text: 'Личное окончание часто уже показывает подлежащее, поэтому местоимение можно опустить.',
          examples: [
            { pl: 'Widzę.', ru: 'Я вижу.' },
            { pl: 'Słyszysz?', ru: 'Ты слышишь?' },
            { pl: 'Idę.', ru: 'Я иду.' },
          ],
        },
      ],
      tables: [
        {
          verb: 'rozumieć',
          translation: 'понимать',
          rows: [
            { pronoun: 'ja', form: 'rozumiem', ipa: '/rɔˈzumjɛm/' },
            { pronoun: 'ty', form: 'rozumiesz', ipa: '/rɔˈzumjɛʂ/' },
            { pronoun: 'on/ona/ono', form: 'rozumie', ipa: '/rɔˈzumjɛ/' },
            { pronoun: 'my', form: 'rozumiemy', ipa: '/rɔzuˈmjɛmɨ/' },
            { pronoun: 'wy', form: 'rozumiecie', ipa: '/rɔzuˈmjɛt͡ɕɛ/' },
            { pronoun: 'oni/one', form: 'rozumieją', ipa: '/rɔzuˈmjɛjɔ̃/' },
          ],
        },
        {
          verb: 'szukać',
          translation: 'искать',
          rows: [
            { pronoun: 'ja', form: 'szukam', ipa: '/ˈʂukam/' },
            { pronoun: 'ty', form: 'szukasz', ipa: '/ˈʂukaʂ/' },
            { pronoun: 'on/ona/ono', form: 'szuka', ipa: '/ˈʂuka/' },
            { pronoun: 'my', form: 'szukamy', ipa: '/ʂuˈkamɨ/' },
            { pronoun: 'wy', form: 'szukacie', ipa: '/ʂuˈkat͡ɕɛ/' },
            { pronoun: 'oni/one', form: 'szukają', ipa: '/ʂuˈkajɔ̃/' },
          ],
        },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme20VerbsMPoliteAddress]
export default theme20VerbsMPoliteAddress
