// Polish: Verbs of 2nd conjugation and masculine nouns 1st declension — theme 21
// Based on lesson #5: Czasowniki II koniugacji i rzeczowniki I deklinacji

const theme21Verbs2ndConj = {
  id: 'pl_theme21',
  order: 21,
  title: 'Czasowniki II koniugacji i rzeczowniki męskie',
  titleRu: 'Глаголы 2-го спряжения и существительные мужского рода',
  description: 'Спряжение глаголов на -isz/-ysz, склонение существительных мужского рода, liczba mnoga',
  descriptionRu: 'Спряжение глаголов на -isz/-ysz, склонение существительных мужского рода, liczba mnoga',
  unlockCondition: null,
  vocabIds: [
    // Existing vocab references
    'pl_070',  // mówić
    'pl_067',  // robić
    'pl_057',  // dom
    'pl_034',  // ojciec
    'pl_036',  // brat
    'pl_030',  // chłopiec
    'pl_062',  // sklep
    'pl_136',  // zadanie
    // New vocabulary for theme 21
    'pl_526', 'pl_527', 'pl_528', 'pl_529', 'pl_530', 'pl_531',
    'pl_532', 'pl_533', 'pl_534', 'pl_535', 'pl_536', 'pl_537',
    'pl_538', 'pl_539', 'pl_540', 'pl_541', 'pl_542', 'pl_543',
    'pl_544', 'pl_545', 'pl_546', 'pl_547', 'pl_548', 'pl_549',
    'pl_550', 'pl_551', 'pl_552', 'pl_553', 'pl_554', 'pl_555',
    'pl_556', 'pl_557', 'pl_558', 'pl_559', 'pl_560', 'pl_561',
    'pl_562', 'pl_563', 'pl_564', 'pl_565', 'pl_566', 'pl_567',
    'pl_568', 'pl_569', 'pl_570', 'pl_571', 'pl_572', 'pl_573',
  ],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Глаголы 2-го спряжения (Koniugacja II)',
          text: 'Большинство польских глаголов 2-го спряжения соответствуют русским глаголам 2-го спряжения. В форме 2-го лица единственного числа (ты) они имеют окончание -isz или -ysz — аналог русского -ишь.',
          examples: [
            { pl: 'mówić → mówisz (ты говоришь)', ru: 'говорить → говоришь' },
            { pl: 'myśleć → myślisz (ты думаешь)', ru: 'думать → думаешь' },
            { pl: 'robić → robisz (ты делаешь)', ru: 'делать → делаешь' },
            { pl: 'wierzyć → wierzysz (ты веришь)', ru: 'верить → веришь' },
          ],
        },
        {
          title: 'Окончания глаголов 2-го спряжения',
          text: 'Таблица окончаний для всех лиц. Основа берётся от инфинитива без -ć/-eć/-ić/-yć:',
          examples: [
            { pl: 'ja: -ę', ru: 'я: -ę' },
            { pl: 'ty: -isz / -ysz', ru: 'ты: -isz / -ysz' },
            { pl: 'on/ona/ono: -i / -y', ru: 'он/она/оно: -i / -y' },
            { pl: 'my: -imy / -ymy', ru: 'мы: -imy / -ymy' },
            { pl: 'wy: -icie / -ycie', ru: 'вы: -icie / -ycie' },
            { pl: 'oni/one: -ą', ru: 'они: -ą' },
          ],
        },
        {
          title: 'Важное замечание',
          text: 'Не путайте это спряжение с типом на -m (например, rozumieć → rozumiem). Глаголы на -m — это другая группа, изученная в уроке 3.',
          examples: [],
        },
        {
          title: 'Существительные мужского рода — падежи в единственном числе',
          text: 'В польском языке склонение существительных мужского рода зависит от основы (твёрдая или мягкая) и от того, является ли предмет одушевлённым. Ниже представлены основные окончания падежей единственного числа.',
          examples: [
            { pl: 'Mianownik (кто? что?): kot, student, dom, nóż', ru: 'Именительный: кот, студент, дом, нож' },
            { pl: 'Dopełniacz (кого? чего?): kota, studenta, domu, noża', ru: 'Родительный: кота, студента, дома, ножа' },
            { pl: 'Celownik (кому? чему?): kotu, studentowi, domowi, nożowi', ru: 'Дательный: коту, студенту, дому, ножу' },
            { pl: 'Biernik (кого? что?): kota/dom, studenta/nóż', ru: 'Винительный: кота (одуш.) / дом (неодуш.)' },
            { pl: 'Narzędnik (кем? чем?): kotem, studentem, domem, nożem', ru: 'Творительный: котом, студентом, домом, ножом' },
            { pl: 'Miejscownik (о ком? о чём?): o kocie, o studencie, o domu, o nożu', ru: 'Предложный: о коте, о студенте, о доме, о ноже' },
            { pl: 'Wołacz (обращение!): kocie!, studencie!, domu!, nożu!', ru: 'Звательный: кот!, студент!, дом!, нож!' },
          ],
        },
        {
          title: 'Ключевые правила падежей мужского рода',
          text: 'Родительный падеж (Dopełniacz): -a для одушевлённых и некоторых неодушевлённых, -u для многих неодушевлённых. Дательный (Celownik): основное окончание -owi, иногда -u (bogu, panu, ojcu). Винительный (Biernik): для одушевлённых совпадает с родительным, для неодушевлённых — с именительным. Творительный (Narzędnik): -em, после k/g — -iem.',
          examples: [
            { pl: 'dopełniacz: studenta, kota, domu, języka', ru: 'род.: студента, кота, дома, языка' },
            { pl: 'celownik: studentowi, bogu, panu, ojcu', ru: 'дат.: студенту, богу, господину, отцу' },
            { pl: 'narzędnik: kotem, studentem, językiem, bogiem', ru: 'твор.: котом, студентом, языком, богом' },
            { pl: 'miejscownik: o studencie, o kocie, o domu, o języku', ru: 'предл.: о студенте, о коте, о доме, о языке' },
            { pl: 'wołacz: Studencie! Kocie! Domu!', ru: 'зват.: Студент! Кот! Дом!' },
          ],
        },
        {
          title: 'Чередования согласных в местном и звательном падежах',
          text: 'При образовании форм на -ie происходят чередования: t→cie (student→studencie), k→ce (kot→kocie), ch→sze, g→dze, r→rze.',
          examples: [
            { pl: 'student → o studencie', ru: 'студент → о студенте' },
            { pl: 'kot → o kocie', ru: 'кот → о коте' },
            { pl: 'brat → o bracie', ru: 'брат → о брате' },
          ],
        },
        {
          title: 'Множественное число мужского рода — две категории',
          text: 'В польском языке во множественном числе принципиально различаются две категории: męskoosobowy (лично-мужской) — только мужчины или группы с хотя бы одним мужчиной; и niemęskoosobowy (женско-вещный) — женщины, дети, животные, неодушевлённые предметы.',
          examples: [
            { pl: 'Лично-мужской: studenci, Polacy, aktorzy, sąsiedzi', ru: 'студенты, поляки, актёры, соседи' },
            { pl: 'Женско-вещный: kobiety, koty, domy, noże', ru: 'женщины, коты, дома, ножи' },
          ],
        },
        {
          title: 'Животные во множественном числе',
          text: 'Категория одушевлённости во множественном числе работает иначе. Животные (psy, koty, ptaki) во множественном числе грамматически относятся к женско-вещной категории, то есть к «неодушевлённой».',
          examples: [
            { pl: 'To są koty. (niemęskoosobowy)', ru: 'Это коты. (женско-вещная форма)' },
            { pl: 'Widzę psy. (biernik = mianownik)', ru: 'Я вижу собак. (вин. = имен.)' },
          ],
        },
        {
          title: 'Предлог «od» — временное значение',
          text: 'Когда мы говорим, как долго что-то длится (и продолжается сейчас), используется настоящее время и предлог od с родительным падежом.',
          examples: [
            { pl: 'Znam go od pięciu lat.', ru: 'Я знаю его пять лет (и сейчас знаю).' },
            { pl: 'Mieszkam tu od urodzenia.', ru: 'Я живу здесь с рождения.' },
          ],
        },
        {
          title: 'Глаголы «работать»: pracować, robić, działać',
          text: 'В польском языке есть три разных слова, которые можно перевести как «работать», но с разными оттенками.',
          examples: [
            { pl: 'pracować — трудиться где-то: Mój ojciec pracuje w szkole.', ru: 'Мой отец работает в школе.' },
            { pl: 'robić — делать; в разговорной речи «работать»: On robi w japońskiej korporacji.', ru: 'Он работает в японской корпорации.' },
            { pl: 'działać — действовать, функционировать: Mikrofon nie działa.', ru: 'Микрофон не работает.' },
          ],
        },
        {
          title: 'Открыто / Закрыто (о магазинах и учреждениях)',
          text: 'О магазинах и учреждениях не говорят «работает/не работает». Используют прилагательные otwarte / zamknięte.',
          examples: [
            { pl: 'Sklepy są zamknięte w niedzielę.', ru: 'Магазины закрыты по воскресеньям.' },
            { pl: 'Czy bank jest otwarty?', ru: 'Банк открыт?' },
          ],
        },
        {
          title: 'Беглые гласные (e ruchome)',
          text: 'Как и в русском языке, гласная -e- часто выпадает при склонении существительных мужского рода.',
          examples: [
            { pl: 'ojciec → ojca (отец → отца)', ru: 'отец → отца' },
            { pl: 'chłopiec → chłopca (мальчик → мальчика)', ru: 'мальчик → мальчика' },
            { pl: 'sweter → swetra (свитер → свитера)', ru: 'свитер → свитера' },
            { pl: 'pies → psa (пёс → пса)', ru: 'пёс → пса' },
          ],
        },
      ],
      tables: [
        {
          verb: 'mówić',
          translation: 'говорить',
          rows: [
            { pronoun: 'ja', form: 'mówię', ipa: '/ˈmuvʲɛ/' },
            { pronoun: 'ty', form: 'mówisz', ipa: '/ˈmuviʂ/' },
            { pronoun: 'on/ona/ono', form: 'mówi', ipa: '/ˈmuvi/' },
            { pronoun: 'my', form: 'mówimy', ipa: '/muˈvimɨ/' },
            { pronoun: 'wy', form: 'mówicie', ipa: '/muˈvit͡ɕɛ/' },
            { pronoun: 'oni/one', form: 'mówią', ipa: '/ˈmuvʲɔ̃/' },
          ],
        },
        {
          verb: 'myśleć',
          translation: 'думать',
          rows: [
            { pronoun: 'ja', form: 'myślę', ipa: '/ˈmɨɕlɛ/' },
            { pronoun: 'ty', form: 'myślisz', ipa: '/ˈmɨɕliʂ/' },
            { pronoun: 'on/ona/ono', form: 'myśli', ipa: '/ˈmɨɕli/' },
            { pronoun: 'my', form: 'myślimy', ipa: '/mɨˈɕlimɨ/' },
            { pronoun: 'wy', form: 'myślicie', ipa: '/mɨˈɕlit͡ɕɛ/' },
            { pronoun: 'oni/one', form: 'myślą', ipa: '/ˈmɨɕlɔ̃/' },
          ],
        },
      ],
    },
    {
      type: 'exercises',
      exercises: [
        // --- Глаголы 2-го спряжения ---
        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Я говорю по-польски.', answer: 'Mówię po polsku.', hint: 'mówić → mówię' },
        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Ты говоришь по-английски?', answer: 'Mówisz po angielsku?', hint: 'mówić → mówisz' },
        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Он говорит по-русски.', answer: 'On mówi po rosyjsku.', hint: 'mówić → on mówi' },
        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Мы говорим по-польски.', answer: 'Mówimy po polsku.', hint: 'mówić → mówimy' },
        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Вы говорите по-немецки?', answer: 'Mówicie po niemiecku?', hint: 'mówić → mówicie' },
        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Они говорят по-французски.', answer: 'Oni mówią po francusku.', hint: 'mówić → oni mówią' },

        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Я думаю, что это хорошая идея.', answer: 'Myślę, że to dobry pomysł.', hint: 'myśleć → myślę; dobry pomysł = хорошая идея' },
        { type: 'write_answer', category: 'Koniugacja II', prompt: 'О чём ты думаешь?', answer: 'O czym myślisz?', hint: 'myśleć → myślisz; o czym = о чём' },
        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Она думает о работе.', answer: 'Ona myśli o pracy.', hint: 'myśleć → myśli; o pracy = о работе' },
        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Мы думаем о каникулах.', answer: 'Myślimy o wakacjach.', hint: 'myśleć → myślimy; wakacje = каникулы' },

        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Что ты делаешь?', answer: 'Co robisz?', hint: 'robić → robisz' },
        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Я делаю домашнее задание.', answer: 'Robię zadanie domowe.', hint: 'robić → robię; zadanie domowe = домашнее задание' },
        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Я верю тебе.', answer: 'Wierzę ci.', hint: 'wierzyć → wierzę; ci = тебе' },
        { type: 'write_answer', category: 'Koniugacja II', prompt: 'Ты веришь в Бога?', answer: 'Wierzysz w Boga?', hint: 'wierzyć → wierzysz; w Boga = в Бога' },

        // --- Падежи мужского рода ---
        { type: 'write_answer', category: 'Przypadki — mianownik', prompt: 'Это кот.', answer: 'To jest kot.', hint: 'mianownik: kot; to jest = это' },
        { type: 'write_answer', category: 'Przypadki — dopełniacz', prompt: 'У меня нет кота.', answer: 'Nie mam kota.', hint: 'dopełniacz: kota; nie mam = у меня нет' },
        { type: 'write_answer', category: 'Przypadki — biernik', prompt: 'Я вижу кота.', answer: 'Widzę kota.', hint: 'biernik одуш. = dopełniacz: kota' },
        { type: 'write_answer', category: 'Przypadki — narzędnik', prompt: 'Я иду с котом.', answer: 'Idę z kotem.', hint: 'narzędnik: kotem; z = с' },
        { type: 'write_answer', category: 'Przypadki — miejscownik', prompt: 'Я говорю о коте.', answer: 'Mówię o kocie.', hint: 'miejscownik: o kocie; чередование t→cie' },

        { type: 'write_answer', category: 'Przypadki — dopełniacz', prompt: 'У меня нет дома.', answer: 'Nie mam domu.', hint: 'dopełniacz неодуш.: domu (окончание -u)' },
        { type: 'write_answer', category: 'Przypadki — biernik', prompt: 'Я вижу дом.', answer: 'Widzę dom.', hint: 'biernik неодуш. = mianownik: dom' },
        { type: 'write_answer', category: 'Przypadki — miejscownik', prompt: 'Я говорю о доме.', answer: 'Mówię o domu.', hint: 'miejscownik от dom: o domu (окончание -u)' },

        { type: 'write_answer', category: 'Przypadki — celownik', prompt: 'Я помогаю студенту.', answer: 'Pomagam studentowi.', hint: 'celownik: studentowi' },
        { type: 'write_answer', category: 'Przypadki — wołacz', prompt: 'Студент! Иди сюда!', answer: 'Studencie! Chodź tutaj!', hint: 'wołacz: studencie! (чередование t→cie)' },

        // --- Множественное число ---
        { type: 'write_answer', category: 'Liczba mnoga', prompt: 'Это студенты. (лично-мужская форма)', answer: 'To są studenci.', hint: 'męskoosobowy: studenci' },
        { type: 'write_answer', category: 'Liczba mnoga', prompt: 'Это коты. (женско-вещная форма)', answer: 'To są koty.', hint: 'niemęskoosobowy: koty (животные!)' },
        { type: 'write_answer', category: 'Liczba mnoga', prompt: 'Это дома.', answer: 'To są domy.', hint: 'niemęskoosobowy: domy' },

        // --- Предлог od ---
        { type: 'write_answer', category: 'Przyimek od', prompt: 'Я знаю его пять лет.', answer: 'Znam go od pięciu lat.', hint: 'od + dopełniacz: od pięciu lat' },
        { type: 'write_answer', category: 'Przyimek od', prompt: 'Я живу здесь с рождения.', answer: 'Mieszkam tu od urodzenia.', hint: 'od + dopełniacz: od urodzenia' },

        // --- Глаголы «работать» ---
        { type: 'write_answer', category: '"Pracować" vs "działać"', prompt: 'Мой отец работает в школе.', answer: 'Mój ojciec pracuje w szkole.', hint: 'pracować (трудиться где-то) → pracuje; w szkole = в школе' },
        { type: 'write_answer', category: '"Pracować" vs "działać"', prompt: 'Микрофон не работает.', answer: 'Mikrofon nie działa.', hint: 'działać (функционировать) → działa' },

        // --- Открыто / Закрыто ---
        { type: 'write_answer', category: 'Otwarte / Zamknięte', prompt: 'Магазины закрыты по воскресеньям.', answer: 'Sklepy są zamknięte w niedzielę.', hint: 'zamknięte = закрыты; w niedzielę = по воскресеньям' },
        { type: 'write_answer', category: 'Otwarte / Zamknięte', prompt: 'Банк открыт?', answer: 'Czy bank jest otwarty?', hint: 'otwarty (м.р.) = открыт; bank м.р. → otwarty' },

        // --- Беглые гласные ---
        { type: 'write_answer', category: 'e ruchome', prompt: 'Я вижу отца.', answer: 'Widzę ojca.', hint: 'ojciec → ojca (biernik = dopełniacz); e выпадает' },
        { type: 'write_answer', category: 'e ruchome', prompt: 'У меня нет свитера.', answer: 'Nie mam swetra.', hint: 'sweter → swetra; e выпадает' },
        { type: 'write_answer', category: 'e ruchome', prompt: 'Я иду с псом.', answer: 'Idę z psem.', hint: 'pies → psa (dopełniacz), psem (narzędnik); e выпадает' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme21Verbs2ndConj]
export default theme21Verbs2ndConj
