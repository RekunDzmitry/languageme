// Polish: verbs ending in -m and polite address — theme 20

const theme20VerbsMPoliteAddress = {
  id: 'pl_theme20',
  order: 11,
  title: 'Czasowniki na -m i formy grzecznościowe',
  titleRu: 'Глаголы на -m и вежливое обращение',
  description: 'Польские вопросы, спряжение rozumieć/szukać и обращения Pan/Pani',
  descriptionRu: 'Польские вопросы, спряжение rozumieć/szukać и обращения Pan/Pani',
  unlockCondition: null,
  vocabIds: [
    'pl_492', 'pl_493', 'pl_494', 'pl_495', 'pl_496', 'pl_497',
    'pl_498', 'pl_499', 'pl_500', 'pl_501', 'pl_502', 'pl_503',
    'pl_504', 'pl_505', 'pl_506', 'pl_507', 'pl_508', 'pl_509',
    'pl_510', 'pl_511', 'pl_512', 'pl_513', 'pl_514', 'pl_515',
    'pl_516', 'pl_517', 'pl_518', 'pl_519', 'pl_520', 'pl_521',
    'pl_522', 'pl_523', 'pl_524', 'pl_525',
  ],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Глаголы с -m в форме ja',
          text: 'У многих частотных польских глаголов в 1-м лице единственного числа окончание -m. Часто достаточно убрать -ć у инфинитива и добавить личное окончание: -m, -sz, нулевое, -my, -cie, -ją.',
          examples: [
            { pl: 'rozumieć → rozumiem, rozumiesz, rozumie', ru: 'понимать → я понимаю, ты понимаешь, он/она понимает' },
            { pl: 'szukać → szukam, szukasz, szuka', ru: 'искать → я ищу, ты ищешь, он/она ищет' },
            { pl: 'mieszkać → mieszkam w Polsce', ru: 'жить → я живу в Польше' },
            { pl: 'czytać → czytam książkę', ru: 'читать → я читаю книгу' },
            { pl: 'kochać → kocham cię', ru: 'любить → я тебя люблю' },
            { pl: 'pamiętać → Pamiętam to.', ru: 'помнить → Я это помню.' },
            { pl: 'trzymać → Trzymam książkę.', ru: 'держать → Я держу книгу.' },
            { pl: 'grać → Gram w piłkę.', ru: 'играть → Я играю в футбол.' },
            { pl: 'śpiewać → Śpiewam piosenkę.', ru: 'петь → Я пою песню.' },
          ],
        },
        {
          title: 'Глаголы с się',
          text: 'Возвратная частица się обычно стоит после глагола или рядом с ним. В форме ja окончание глагола остаётся тем же: spotykam się.',
          examples: [
            { pl: 'spotykać się → Spotykam się z Anną.', ru: 'встречаться → Я встречаюсь с Анной.' },
            { pl: 'Spotykasz się z Markiem?', ru: 'Ты встречаешься с Мареком?' },
          ],
        },
        {
          title: 'Управление частотных глаголов',
          text: 'У некоторых глаголов важно запоминать не только форму ja, но и падеж или предлог после глагола.',
          examples: [
            { pl: 'pomagać komuś → Pomagam mamie.', ru: 'помогать кому-то → Я помогаю маме.' },
            { pl: 'odpowiadać na coś → Odpowiadam na pytanie.', ru: 'отвечать на что-то → Я отвечаю на вопрос.' },
            { pl: 'używać czegoś → Używam słownika.', ru: 'пользоваться чем-то → Я пользуюсь словарём.' },
            { pl: 'sprawdzać coś → Sprawdzam słowo.', ru: 'проверять что-то → Я проверяю слово.' },
            { pl: 'zbierać coś → Zbieram znaczki.', ru: 'собирать что-то → Я собираю марки.' },
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
