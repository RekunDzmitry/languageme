// Theme data for French course
// Themes 1-7 have full content; 8-31 are stubs to be expanded

const theme01 = {
  id: 'theme01',
  order: 1,
  title: 'Pronouns & 1st Group Verbs (-er)',
  titleRu: 'Местоимения и глаголы 1-й группы (-er)',
  description: 'Learn personal pronouns and regular 1st group (-er) verbs in present tense',
  descriptionRu: 'Личные местоимения и правильные глаголы 1-й группы на -er в настоящем времени',
  unlockCondition: null,
  vocabIds: ['fr_008', 'fr_016', 'fr_037', 'fr_044', 'fr_001', 'fr_003', 'fr_081', 'fr_082', 'fr_083', 'fr_084', 'fr_085', 'fr_086', 'fr_087', 'fr_088', 'fr_089', 'fr_090', 'fr_091', 'fr_092', 'fr_093', 'fr_094', 'fr_095', 'fr_096', 'fr_097', 'fr_098', 'fr_099', 'fr_100', 'fr_101', 'fr_102', 'fr_103', 'fr_104', 'fr_105', 'fr_106', 'fr_107', 'fr_108', 'fr_109', 'fr_110', 'fr_111', 'fr_112', 'fr_113', 'fr_114', 'fr_115', 'fr_116', 'fr_117', 'fr_118', 'fr_119', 'fr_120', 'fr_121', 'fr_122', 'fr_123', 'fr_124', 'fr_125', 'fr_126', 'fr_127', 'fr_128', 'fr_129', 'fr_130', 'fr_131', 'fr_132', 'fr_133', 'fr_134', 'fr_135', 'fr_136', 'fr_137', 'fr_138', 'fr_139', 'fr_140', 'fr_141', 'fr_142', 'fr_143', 'fr_144', 'fr_145', 'fr_146', 'fr_147', 'fr_148', 'fr_149', 'fr_150', 'fr_151', 'fr_152', 'fr_153', 'fr_154', 'fr_155', 'fr_156', 'fr_157', 'fr_158', 'fr_159', 'fr_160', 'fr_161', 'fr_162', 'fr_163', 'fr_164', 'fr_165', 'fr_166', 'fr_167', 'fr_168', 'fr_169', 'fr_170', 'fr_171', 'fr_172', 'fr_173', 'fr_174', 'fr_175', 'fr_176', 'fr_177', 'fr_178', 'fr_179', 'fr_180', 'fr_181', 'fr_182', 'fr_183', 'fr_184', 'fr_185', 'fr_186', 'fr_187', 'fr_188', 'fr_189', 'fr_190', 'fr_191', 'fr_192', 'fr_193', 'fr_194', 'fr_195', 'fr_196', 'fr_197', 'fr_198', 'fr_199', 'fr_200', 'fr_201', 'fr_202', 'fr_203', 'fr_204', 'fr_205', 'fr_206', 'fr_207', 'fr_208', 'fr_209', 'fr_210', 'fr_211', 'fr_212', 'fr_213', 'fr_214', 'fr_215', 'fr_216', 'fr_217', 'fr_218', 'fr_219', 'fr_220', 'fr_221', 'fr_222', 'fr_223', 'fr_224', 'fr_225', 'fr_226', 'fr_227', 'fr_228', 'fr_229', 'fr_230', 'fr_231', 'fr_232', 'fr_233', 'fr_234', 'fr_235', 'fr_236', 'fr_237', 'fr_238', 'fr_239', 'fr_240', 'fr_241', 'fr_242', 'fr_243', 'fr_244', 'fr_245', 'fr_246', 'fr_247', 'fr_248', 'fr_249', 'fr_250', 'fr_251', 'fr_252', 'fr_253', 'fr_254', 'fr_255', 'fr_256', 'fr_257', 'fr_258', 'fr_259', 'fr_260', 'fr_261', 'fr_262', 'fr_263', 'fr_264', 'fr_265', 'fr_266', 'fr_267', 'fr_268', 'fr_269', 'fr_270', 'fr_271', 'fr_272', 'fr_273', 'fr_274', 'fr_275', 'fr_276', 'fr_277', 'fr_278', 'fr_279', 'fr_280', 'fr_281', 'fr_282', 'fr_283', 'fr_284', 'fr_285', 'fr_286', 'fr_287', 'fr_288', 'fr_289', 'fr_290', 'fr_291', 'fr_292', 'fr_293', 'fr_294', 'fr_295', 'fr_296', 'fr_297', 'fr_298', 'fr_299', 'fr_300', 'fr_301', 'fr_302', 'fr_303', 'fr_304', 'fr_305'],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Личные местоимения',
          text: 'Во французском языке 8 личных местоимений. В отличие от русского, местоимение обязательно используется с глаголом.',
          examples: [
            { fr: 'Je', ru: 'Я' },
            { fr: 'Tu', ru: 'Ты' },
            { fr: 'Il / Elle', ru: 'Он / Она' },
            { fr: 'Nous', ru: 'Мы' },
            { fr: 'Vous', ru: 'Вы' },
            { fr: 'Ils / Elles', ru: 'Они (м.) / Они (ж.)' },
          ]
        },
        {
          title: 'Три группы французских глаголов',
          text: 'Все французские глаголы делятся на три группы:\n\n• 1-я группа (-er): самая большая и регулярная. Около 90% всех глаголов! Например: parler, manger, aimer, travailler.\n\n• 2-я группа (-ir с -issons): правильные глаголы на -ir. Например: finir → nous finissons, choisir → nous choisissons.\n\n• 3-я группа: все остальные — неправильные глаголы. Например: être, avoir, aller, faire, prendre.\n\nВ этом уроке мы изучаем глаголы 1-й группы — самые простые и частотные.',
          examples: [
            { fr: 'parler, manger, aimer, donner', ru: '1-я группа (-er)' },
            { fr: 'finir, choisir, agir', ru: '2-я группа (-ir)' },
            { fr: 'être, avoir, aller, faire', ru: '3-я группа (неправильные)' },
          ]
        },
        {
          title: 'Спряжение глаголов 1-й группы (-er)',
          text: 'Чтобы спрягать глаголы 1-й группы, убираем окончание -er от инфинитива — получаем основу (le radical). Затем добавляем окончания: -e, -es, -e, -ons, -ez, -ent. Основа не меняется!',
          examples: [
            { fr: 'Je mange', ru: 'Я ем' },
            { fr: 'Tu manges', ru: 'Ты ешь' },
            { fr: 'Il mange', ru: 'Он ест' },
            { fr: 'Nous mangeons', ru: 'Мы едим' },
            { fr: 'Vous mangez', ru: 'Вы едите' },
            { fr: 'Ils mangent', ru: 'Они едят' },
          ]
        }
      ],
      tables: []
    },
  ],
  verbList: [
    // Общение и речь
    { infinitive: 'parler', ru: 'говорить', group: 'Общение и речь' },
    { infinitive: 'demander', ru: 'спрашивать', group: 'Общение и речь' },
    { infinitive: 'raconter', ru: 'рассказывать', group: 'Общение и речь' },
    { infinitive: 'expliquer', ru: 'объяснять', group: 'Общение и речь' },
    { infinitive: 'crier', ru: 'кричать', group: 'Общение и речь' },
    { infinitive: 'chanter', ru: 'петь', group: 'Общение и речь' },
    // Чувства и эмоции
    { infinitive: 'aimer', ru: 'любить', group: 'Чувства и эмоции' },
    { infinitive: 'adorer', ru: 'обожать', group: 'Чувства и эмоции' },
    { infinitive: 'détester', ru: 'ненавидеть', group: 'Чувства и эмоции' },
    { infinitive: 'pleurer', ru: 'плакать', group: 'Чувства и эмоции' },
    { infinitive: 'penser', ru: 'думать', group: 'Чувства и эмоции' },
    // Еда и быт
    { infinitive: 'manger', ru: 'есть, кушать', group: 'Еда и быт' },
    { infinitive: 'cuisiner', ru: 'готовить', group: 'Еда и быт' },
    { infinitive: 'préparer', ru: 'готовить', group: 'Еда и быт' },
    { infinitive: 'couper', ru: 'резать', group: 'Еда и быт' },
    { infinitive: 'laver', ru: 'мыть', group: 'Еда и быт' },
    { infinitive: 'acheter', ru: 'покупать', group: 'Еда и быт' },
    // Движение
    { infinitive: 'marcher', ru: 'ходить', group: 'Движение' },
    { infinitive: 'arriver', ru: 'приходить', group: 'Движение' },
    { infinitive: 'entrer', ru: 'входить', group: 'Движение' },
    { infinitive: 'monter', ru: 'подниматься', group: 'Движение' },
    { infinitive: 'tomber', ru: 'падать', group: 'Движение' },
    { infinitive: 'passer', ru: 'проходить', group: 'Движение' },
    { infinitive: 'nager', ru: 'плавать', group: 'Движение' },
    { infinitive: 'voler', ru: 'летать', group: 'Движение' },
    { infinitive: 'danser', ru: 'танцевать', group: 'Движение' },
    { infinitive: 'voyager', ru: 'путешествовать', group: 'Движение' },
    // Работа и учёба
    { infinitive: 'travailler', ru: 'работать', group: 'Работа и учёба' },
    { infinitive: 'étudier', ru: 'изучать', group: 'Работа и учёба' },
    { infinitive: 'chercher', ru: 'искать', group: 'Работа и учёба' },
    { infinitive: 'trouver', ru: 'находить', group: 'Работа и учёба' },
    { infinitive: 'compter', ru: 'считать', group: 'Работа и учёба' },
    { infinitive: 'gagner', ru: 'выигрывать', group: 'Работа и учёба' },
    { infinitive: 'essayer', ru: 'пробовать', group: 'Работа и учёба' },
    // Восприятие
    { infinitive: 'regarder', ru: 'смотреть', group: 'Восприятие' },
    { infinitive: 'écouter', ru: 'слушать', group: 'Восприятие' },
    { infinitive: 'montrer', ru: 'показывать', group: 'Восприятие' },
    { infinitive: 'dessiner', ru: 'рисовать', group: 'Восприятие' },
    // Действия и взаимодействие
    { infinitive: 'donner', ru: 'давать', group: 'Действия' },
    { infinitive: 'porter', ru: 'носить', group: 'Действия' },
    { infinitive: 'jouer', ru: 'играть', group: 'Действия' },
    { infinitive: 'fermer', ru: 'закрывать', group: 'Действия' },
    { infinitive: 'commencer', ru: 'начинать', group: 'Действия' },
    { infinitive: 'terminer', ru: 'заканчивать', group: 'Действия' },
    { infinitive: 'rester', ru: 'оставаться', group: 'Действия' },
    // Социальные
    { infinitive: 'inviter', ru: 'приглашать', group: 'Социальные' },
    { infinitive: 'présenter', ru: 'представлять', group: 'Социальные' },
    { infinitive: 'accepter', ru: 'принимать', group: 'Социальные' },
    { infinitive: 'refuser', ru: 'отказывать', group: 'Социальные' },
    { infinitive: 'habiter', ru: 'жить, проживать', group: 'Социальные' },
  ]
}

const theme02 = {
  id: 'theme02',
  order: 2,
  title: 'Negative Form',
  titleRu: 'Отрицательная форма',
  description: 'Learn to negate sentences with ne...pas',
  descriptionRu: 'Отрицание с ne...pas',
  unlockCondition: { type: 'theme_complete', themeId: 'theme01', minScore: 60 },
  vocabIds: ['fr_004', 'fr_008', 'fr_016'],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Отрицание ne...pas',
          text: 'Чтобы сделать предложение отрицательным, нужно поставить «ne» перед глаголом и «pas» после него. В разговорной речи «ne» часто опускается.',
          examples: [
            { fr: 'Je ne mange pas', ru: 'Я не ем' },
            { fr: 'Tu ne parles pas', ru: 'Ты не говоришь' },
            { fr: 'Il ne mange pas', ru: 'Он не ест' },
            { fr: 'Nous ne parlons pas', ru: 'Мы не говорим' },
            { fr: 'Je ne comprends pas', ru: 'Я не понимаю' },
          ]
        },
        {
          title: 'Перед гласной: n\'',
          text: 'Когда глагол начинается с гласной, «ne» сокращается до «n\'».',
          examples: [
            { fr: "Il n'aime pas", ru: 'Он не любит' },
            { fr: "Je n'écoute pas", ru: 'Я не слушаю' },
          ]
        }
      ],
      tables: []
    },
  ]
}

const theme03 = {
  id: 'theme03',
  order: 3,
  title: 'Questions',
  titleRu: 'Вопросительная форма',
  description: 'Learn to ask questions in French',
  descriptionRu: 'Учимся задавать вопросы по-французски',
  unlockCondition: { type: 'theme_complete', themeId: 'theme02', minScore: 60 },
  vocabIds: ['fr_042', 'fr_043'],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Вопрос интонацией',
          text: 'Самый простой способ задать вопрос — повысить интонацию в конце предложения. Структура остаётся такой же, как в утверждении.',
          examples: [
            { fr: 'Tu parles français?', ru: 'Ты говоришь по-французски?' },
            { fr: 'Il mange?', ru: 'Он ест?' },
            { fr: 'Vous comprenez?', ru: 'Вы понимаете?' },
          ]
        },
        {
          title: 'Est-ce que',
          text: 'Более формальный способ — добавить «est-ce que» в начало предложения.',
          examples: [
            { fr: 'Est-ce que tu parles français?', ru: 'Ты говоришь по-французски?' },
            { fr: 'Est-ce que vous mangez?', ru: 'Вы едите?' },
          ]
        }
      ],
      tables: []
    },
  ]
}

const theme04 = {
  id: 'theme04',
  order: 4,
  title: 'Etiquette Phrases',
  titleRu: 'Фразы этикета',
  description: 'Essential polite expressions for everyday French',
  descriptionRu: 'Основные вежливые выражения на каждый день',
  unlockCondition: { type: 'theme_complete', themeId: 'theme03', minScore: 60 },
  vocabIds: ['fr_001', 'fr_002'],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Приветствия и прощания',
          text: 'Французы придают большое значение вежливости. Всегда здоровайтесь и прощайтесь!',
          examples: [
            { fr: 'Bonjour', ru: 'Здравствуйте / Добрый день' },
            { fr: 'Bonsoir', ru: 'Добрый вечер' },
            { fr: 'Au revoir', ru: 'До свидания' },
            { fr: 'Salut', ru: 'Привет / Пока (неформ.)' },
            { fr: 'Bonne nuit', ru: 'Спокойной ночи' },
          ]
        },
        {
          title: 'Вежливые выражения',
          text: 'Эти фразы используются постоянно в повседневном общении.',
          examples: [
            { fr: 'Merci / Merci beaucoup', ru: 'Спасибо / Большое спасибо' },
            { fr: "S'il vous plaît", ru: 'Пожалуйста (просьба, формальн.)' },
            { fr: "S'il te plaît", ru: 'Пожалуйста (просьба, неформальн.)' },
            { fr: 'De rien', ru: 'Не за что' },
            { fr: 'Excusez-moi', ru: 'Извините' },
            { fr: 'Pardon', ru: 'Простите' },
          ]
        },
        {
          title: 'Как дела?',
          text: 'Стандартные фразы для начала разговора.',
          examples: [
            { fr: 'Comment allez-vous?', ru: 'Как вы поживаете? (формальн.)' },
            { fr: 'Ça va?', ru: 'Как дела? (неформальн.)' },
            { fr: 'Ça va bien, merci', ru: 'Хорошо, спасибо' },
            { fr: 'Et vous?', ru: 'А вы?' },
          ]
        }
      ],
      tables: []
    },
  ]
}

const theme05 = {
  id: 'theme05',
  order: 5,
  title: 'Verb "avoir"',
  titleRu: 'Глагол «avoir» (иметь)',
  description: 'Master the essential irregular verb "avoir"',
  descriptionRu: 'Неправильный глагол «avoir» — один из самых важных',
  unlockCondition: { type: 'theme_complete', themeId: 'theme04', minScore: 60 },
  vocabIds: ['fr_001', 'fr_008'],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Глагол avoir — иметь',
          text: 'Avoir — один из двух самых важных глаголов французского языка. Он неправильный и используется как вспомогательный для образования прошедшего времени.',
          examples: [
            { fr: "J'ai", ru: 'Я имею' },
            { fr: 'Tu as', ru: 'Ты имеешь' },
            { fr: 'Il/Elle a', ru: 'Он/Она имеет' },
            { fr: 'Nous avons', ru: 'Мы имеем' },
            { fr: 'Vous avez', ru: 'Вы имеете' },
            { fr: 'Ils/Elles ont', ru: 'Они имеют' },
          ]
        },
        {
          title: 'Выражения с avoir',
          text: 'Многие выражения, которые в русском используют «быть», во французском используют «avoir».',
          examples: [
            { fr: "J'ai faim", ru: 'Я голоден (букв. «Я имею голод»)' },
            { fr: "J'ai soif", ru: 'Я хочу пить' },
            { fr: "J'ai froid", ru: 'Мне холодно' },
            { fr: "J'ai chaud", ru: 'Мне жарко' },
            { fr: "J'ai peur", ru: 'Мне страшно' },
            { fr: "J'ai 20 ans", ru: 'Мне 20 лет' },
          ]
        }
      ],
      tables: [
        {
          verb: 'avoir',
          translation: 'иметь',
          rows: [
            { pronoun: "j'", form: 'ai', ipa: '/ɛ/' },
            { pronoun: 'tu', form: 'as', ipa: '/a/' },
            { pronoun: 'il/elle', form: 'a', ipa: '/a/' },
            { pronoun: 'nous', form: 'avons', ipa: '/a.vɔ̃/' },
            { pronoun: 'vous', form: 'avez', ipa: '/a.ve/' },
            { pronoun: 'ils/elles', form: 'ont', ipa: '/ɔ̃/' },
          ]
        }
      ]
    },
  ]
}

const themeEtre = {
  id: 'theme06',
  order: 6,
  title: 'Verb "être"',
  titleRu: 'Глагол «être» (быть)',
  description: 'Master the essential irregular verb "être"',
  descriptionRu: 'Неправильный глагол «être» — один из самых важных',
  unlockCondition: { type: 'theme_complete', themeId: 'theme05', minScore: 60 },
  vocabIds: ['fr_001', 'fr_008'],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Глагол être — быть',
          text: 'Être — самый важный глагол французского языка наряду с avoir. Он неправильный и используется:\n\n• Как смысловой глагол (быть, являться)\n• Как вспомогательный глагол для passé composé с глаголами движения\n• В конструкциях с прилагательными (описание состояний)\n• Для указания профессии, национальности, местоположения\n\nВ русском языке глагол «быть» в настоящем времени обычно опускается («Я студент»), но во французском он обязателен («Je suis étudiant»).',
          examples: [
            { fr: 'Je suis', ru: 'Я есть / Я являюсь' },
            { fr: 'Tu es', ru: 'Ты есть / Ты являешься' },
            { fr: 'Il/Elle est', ru: 'Он/Она есть / является' },
            { fr: 'Nous sommes', ru: 'Мы есть / являемся' },
            { fr: 'Vous êtes', ru: 'Вы есть / являетесь' },
            { fr: 'Ils/Elles sont', ru: 'Они есть / являются' },
          ]
        },
        {
          title: 'Être + профессия и национальность',
          text: 'Для указания профессии и национальности используется être БЕЗ артикля (в отличие от многих других языков). Прилагательное согласуется в роде с подлежащим.',
          examples: [
            { fr: 'Je suis étudiant / étudiante', ru: 'Я студент / студентка' },
            { fr: 'Il est professeur', ru: 'Он преподаватель' },
            { fr: 'Elle est médecin', ru: 'Она врач' },
            { fr: 'Je suis russe', ru: 'Я русский / русская' },
            { fr: 'Il est français', ru: 'Он француз' },
            { fr: 'Elle est française', ru: 'Она француженка' },
          ]
        },
        {
          title: 'Être + прилагательное (описание состояний)',
          text: 'Для описания состояний и качеств используется être + прилагательное. Прилагательное согласуется с подлежащим в роде и числе.',
          examples: [
            { fr: 'Je suis fatigué(e)', ru: 'Я уставший / уставшая' },
            { fr: 'Tu es content(e)', ru: 'Ты довольный / довольная' },
            { fr: 'Il est grand', ru: 'Он высокий' },
            { fr: 'Elle est petite', ru: 'Она маленькая' },
            { fr: 'Nous sommes prêts', ru: 'Мы готовы' },
            { fr: 'Ils sont malades', ru: 'Они больны' },
          ]
        },
        {
          title: 'Être + местоположение',
          text: 'Для указания местоположения используются конструкции être + à / en / dans.',
          examples: [
            { fr: 'Je suis à Paris', ru: 'Я в Париже' },
            { fr: 'Tu es à la maison', ru: 'Ты дома' },
            { fr: 'Il est en France', ru: 'Он во Франции' },
            { fr: 'Nous sommes dans la classe', ru: 'Мы в классе' },
            { fr: 'Vous êtes au bureau', ru: 'Вы в офисе' },
            { fr: 'Elles sont en vacances', ru: 'Они в отпуске' },
          ]
        },
        {
          title: 'Конструкция c\'est / ce sont',
          text: 'C\'est (ед. число) и ce sont (мн. число) — очень частые конструкции для представления и указания на предметы/людей.',
          examples: [
            { fr: "C'est un livre", ru: 'Это книга' },
            { fr: "C'est mon ami", ru: 'Это мой друг' },
            { fr: "C'est intéressant", ru: 'Это интересно' },
            { fr: 'Ce sont mes parents', ru: 'Это мои родители' },
            { fr: "C'est la vie !", ru: 'Такова жизнь!' },
            { fr: "Qu'est-ce que c'est ?", ru: 'Что это?' },
          ]
        },
        {
          title: 'Отрицание с être',
          text: 'Отрицание строится по общему правилу: ne + être + pas. В разговорной речи ne часто опускается.',
          examples: [
            { fr: 'Je ne suis pas français', ru: 'Я не француз' },
            { fr: "Tu n'es pas fatigué ?", ru: 'Ты не устал?' },
            { fr: "Il n'est pas là", ru: 'Его здесь нет' },
            { fr: "Ce n'est pas vrai", ru: 'Это неправда' },
            { fr: 'Nous ne sommes pas prêts', ru: 'Мы не готовы' },
            { fr: "Elles ne sont pas d'accord", ru: 'Они не согласны' },
          ]
        },
      ],
      tables: [
        {
          verb: 'être',
          translation: 'быть',
          rows: [
            { pronoun: 'je', form: 'suis', ipa: '/sɥi/' },
            { pronoun: 'tu', form: 'es', ipa: '/ɛ/' },
            { pronoun: 'il/elle', form: 'est', ipa: '/ɛ/' },
            { pronoun: 'nous', form: 'sommes', ipa: '/sɔm/' },
            { pronoun: 'vous', form: 'êtes', ipa: '/ɛt/' },
            { pronoun: 'ils/elles', form: 'sont', ipa: '/sɔ̃/' },
          ]
        }
      ]
    },
  ],
  verbList: []
}

const theme06 = {
  id: 'theme07',
  order: 7,
  title: 'Past Tense (passé composé)',
  titleRu: 'Прошедшее время (passé composé)',
  description: 'Learn the most common past tense',
  descriptionRu: 'Самое употребительное прошедшее время',
  unlockCondition: { type: 'theme_complete', themeId: 'theme06', minScore: 60 },
  vocabIds: [],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Что такое passé composé?',
          text: 'Passé composé — самое употребительное прошедшее время во французском языке. Оно используется для завершённых действий в прошлом. Аналог русского прошедшего времени совершенного вида.\n\nОно называется «составным» (composé), потому что состоит из двух частей:\n\n• Вспомогательный глагол (avoir или être) в настоящем времени\n• Причастие прошедшего времени (participe passé) основного глагола',
          examples: [
            { fr: "J'ai mangé", ru: 'Я поел / Я ел' },
            { fr: 'Tu as parlé', ru: 'Ты поговорил' },
            { fr: 'Il a travaillé', ru: 'Он поработал' },
            { fr: 'Nous avons chanté', ru: 'Мы пели / Мы спели' },
          ]
        },
        {
          title: 'Образование participe passé глаголов 1-й группы (-er)',
          text: 'Для глаголов 1-й группы всё просто: убираем -er и добавляем -é.\n\nparler → parlé\nmanger → mangé\naimer → aimé\ntravailler → travaillé\nchanter → chanté\n\nЭто самая большая и регулярная группа. Запомните формулу: основа + é.',
          examples: [
            { fr: 'parler → parlé', ru: 'говорить → говорённый' },
            { fr: 'manger → mangé', ru: 'есть → съеденный' },
            { fr: 'aimer → aimé', ru: 'любить → любимый' },
            { fr: 'travailler → travaillé', ru: 'работать → отработанный' },
            { fr: 'danser → dansé', ru: 'танцевать → танцевавший' },
            { fr: 'chercher → cherché', ru: 'искать → искавший' },
          ]
        },
        {
          title: 'Спряжение с avoir',
          text: 'Большинство глаголов (около 90%) образуют passé composé с вспомогательным глаголом avoir. Вы уже знаете его спряжение из урока 5!\n\nФормула: avoir в настоящем времени + participe passé',
          examples: [
            { fr: "J'ai parlé", ru: 'Я говорил / поговорил' },
            { fr: 'Tu as mangé', ru: 'Ты ел / поел' },
            { fr: 'Il a chanté', ru: 'Он пел / спел' },
            { fr: 'Elle a dansé', ru: 'Она танцевала' },
            { fr: 'Nous avons travaillé', ru: 'Мы работали / поработали' },
            { fr: 'Vous avez écouté', ru: 'Вы слушали / послушали' },
            { fr: 'Ils ont joué', ru: 'Они играли / поиграли' },
            { fr: 'Elles ont regardé', ru: 'Они смотрели / посмотрели' },
          ]
        },
        {
          title: 'Глаголы движения с être',
          text: 'Около 15 глаголов (в основном глаголы движения и изменения состояния) образуют passé composé с être вместо avoir. Запомните их с помощью «дома DR & MRS VANDERTRAMP»:\n\nDevenir, Revenir, Monter, Rester, Sortir, Venir, Aller, Naître, Descendre, Entrer, Retourner, Tomber, Rentrer, Arriver, Mourir, Partir\n\nВажно: при использовании être причастие согласуется с подлежащим в роде и числе!',
          examples: [
            { fr: 'Je suis allé(e)', ru: 'Я пошёл / пошла' },
            { fr: 'Tu es arrivé(e)', ru: 'Ты пришёл / пришла' },
            { fr: 'Il est tombé', ru: 'Он упал' },
            { fr: 'Elle est tombée', ru: 'Она упала (добавляем -e!)' },
            { fr: 'Nous sommes partis', ru: 'Мы ушли (добавляем -s!)' },
            { fr: 'Elles sont arrivées', ru: 'Они (ж.) пришли (добавляем -es!)' },
          ]
        },
        {
          title: 'Согласование с être',
          text: 'Когда вспомогательный глагол — être, причастие ведёт себя как прилагательное и согласуется с подлежащим:\n\n• Мужской род, ед. число: без изменений (allé)\n• Женский род, ед. число: +e (allée)\n• Мужской род, мн. число: +s (allés)\n• Женский род, мн. число: +es (allées)',
          examples: [
            { fr: 'Il est parti', ru: 'Он ушёл' },
            { fr: 'Elle est partie', ru: 'Она ушла' },
            { fr: 'Ils sont partis', ru: 'Они (м.) ушли' },
            { fr: 'Elles sont parties', ru: 'Они (ж.) ушли' },
          ]
        },
        {
          title: 'Participe passé неправильных глаголов',
          text: 'Некоторые частые глаголы имеют неправильное причастие. Их нужно запоминать:',
          examples: [
            { fr: 'avoir → eu', ru: 'иметь → имевший' },
            { fr: 'être → été', ru: 'быть → бывший' },
            { fr: 'faire → fait', ru: 'делать → сделанный' },
            { fr: 'prendre → pris', ru: 'брать → взятый' },
            { fr: 'mettre → mis', ru: 'класть → положенный' },
            { fr: 'voir → vu', ru: 'видеть → увиденный' },
            { fr: 'dire → dit', ru: 'говорить → сказанный' },
            { fr: 'écrire → écrit', ru: 'писать → написанный' },
            { fr: 'lire → lu', ru: 'читать → прочитанный' },
            { fr: 'boire → bu', ru: 'пить → выпитый' },
            { fr: 'pouvoir → pu', ru: 'мочь → смогший' },
            { fr: 'vouloir → voulu', ru: 'хотеть → хотевший' },
            { fr: 'savoir → su', ru: 'знать → узнавший' },
            { fr: 'venir → venu', ru: 'приходить → пришедший' },
          ]
        },
        {
          title: 'Маркеры времени для passé composé',
          text: 'Эти слова-подсказки часто указывают на passé composé:',
          examples: [
            { fr: 'hier', ru: 'вчера' },
            { fr: 'la semaine dernière', ru: 'на прошлой неделе' },
            { fr: "l'année dernière", ru: 'в прошлом году' },
            { fr: 'il y a deux jours', ru: 'два дня назад' },
            { fr: 'ce matin', ru: 'сегодня утром' },
            { fr: 'déjà', ru: 'уже' },
          ]
        },
      ],
      tables: [
        {
          verb: 'avoir (вспомогательный)',
          translation: 'иметь',
          rows: [
            { pronoun: "j'", form: 'ai', ipa: '/ɛ/' },
            { pronoun: 'tu', form: 'as', ipa: '/a/' },
            { pronoun: 'il/elle', form: 'a', ipa: '/a/' },
            { pronoun: 'nous', form: 'avons', ipa: '/a.vɔ̃/' },
            { pronoun: 'vous', form: 'avez', ipa: '/a.ve/' },
            { pronoun: 'ils/elles', form: 'ont', ipa: '/ɔ̃/' },
          ]
        },
        {
          verb: 'être (вспомогательный)',
          translation: 'быть',
          rows: [
            { pronoun: 'je', form: 'suis', ipa: '/sɥi/' },
            { pronoun: 'tu', form: 'es', ipa: '/ɛ/' },
            { pronoun: 'il/elle', form: 'est', ipa: '/ɛ/' },
            { pronoun: 'nous', form: 'sommes', ipa: '/sɔm/' },
            { pronoun: 'vous', form: 'êtes', ipa: '/ɛt/' },
            { pronoun: 'ils/elles', form: 'sont', ipa: '/sɔ̃/' },
          ]
        }
      ]
    },
  ],
  verbList: [
    // Глаголы с avoir (1-я группа — правильные)
    { infinitive: 'parler', ru: 'говорить', participePasse: 'parlé', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'manger', ru: 'есть', participePasse: 'mangé', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'travailler', ru: 'работать', participePasse: 'travaillé', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'aimer', ru: 'любить', participePasse: 'aimé', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'chanter', ru: 'петь', participePasse: 'chanté', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'danser', ru: 'танцевать', participePasse: 'dansé', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'regarder', ru: 'смотреть', participePasse: 'regardé', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'écouter', ru: 'слушать', participePasse: 'écouté', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'jouer', ru: 'играть', participePasse: 'joué', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'chercher', ru: 'искать', participePasse: 'cherché', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    // Неправильные глаголы с avoir
    { infinitive: 'avoir', ru: 'иметь', participePasse: 'eu', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'faire', ru: 'делать', participePasse: 'fait', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'prendre', ru: 'брать', participePasse: 'pris', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'voir', ru: 'видеть', participePasse: 'vu', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'dire', ru: 'говорить', participePasse: 'dit', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'lire', ru: 'читать', participePasse: 'lu', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'écrire', ru: 'писать', participePasse: 'écrit', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'boire', ru: 'пить', participePasse: 'bu', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'pouvoir', ru: 'мочь', participePasse: 'pu', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'vouloir', ru: 'хотеть', participePasse: 'voulu', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    // Глаголы с être (движение)
    { infinitive: 'aller', ru: 'идти', participePasse: 'allé', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'venir', ru: 'приходить', participePasse: 'venu', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'arriver', ru: 'приезжать', participePasse: 'arrivé', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'partir', ru: 'уезжать', participePasse: 'parti', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'entrer', ru: 'входить', participePasse: 'entré', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'sortir', ru: 'выходить', participePasse: 'sorti', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'monter', ru: 'подниматься', participePasse: 'monté', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'descendre', ru: 'спускаться', participePasse: 'descendu', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'tomber', ru: 'падать', participePasse: 'tombé', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'rester', ru: 'оставаться', participePasse: 'resté', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'naître', ru: 'родиться', participePasse: 'né', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'mourir', ru: 'умереть', participePasse: 'mort', auxiliaire: 'être', group: 'С être (движение)' },
  ]
}

const theme08 = {
  id: 'theme08',
  order: 8,
  title: 'Past Tense: Negative & Questions',
  titleRu: 'Прошедшее время: отрицание и вопросы',
  description: 'Negative and question forms in past tense',
  descriptionRu: 'Отрицательная и вопросительная формы прошедшего времени',
  unlockCondition: { type: 'theme_complete', themeId: 'theme07', minScore: 60 },
  vocabIds: [],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Отрицание в passé composé',
          text: 'В passé composé частицы отрицания ne...pas окружают вспомогательный глагол (avoir или être), а НЕ причастие. Причастие всегда стоит после pas.\n\nФормула: Подлежащее + ne + avoir/être + pas + participe passé\n\nВажно: «ne» сокращается до «n\'» перед гласной (n\'ai, n\'est, n\'ont).',
          examples: [
            { fr: "Je n'ai pas mangé", ru: 'Я не ел / Я не поел' },
            { fr: "Tu n'as pas parlé", ru: 'Ты не говорил' },
            { fr: "Il n'a pas travaillé", ru: 'Он не работал' },
            { fr: "Nous n'avons pas chanté", ru: 'Мы не пели' },
            { fr: "Vous n'avez pas écouté", ru: 'Вы не слушали' },
            { fr: "Ils n'ont pas joué", ru: 'Они не играли' },
          ]
        },
        {
          title: 'Отрицание с глаголами на être',
          text: 'Для глаголов, спрягающихся с être, правило то же самое: ne...pas окружают être. Причастие стоит после pas и по-прежнему согласуется с подлежащим.',
          examples: [
            { fr: "Je ne suis pas allé(e)", ru: 'Я не пошёл / не пошла' },
            { fr: "Elle n'est pas arrivée", ru: 'Она не приехала' },
            { fr: 'Il n\'est pas parti', ru: 'Он не ушёл' },
            { fr: 'Nous ne sommes pas sortis', ru: 'Мы не вышли' },
            { fr: 'Elles ne sont pas tombées', ru: 'Они (ж.) не упали' },
          ]
        },
        {
          title: 'Другие формы отрицания',
          text: 'Кроме ne...pas, во французском есть и другие отрицательные конструкции. Они работают по тому же принципу — окружают вспомогательный глагол:\n\n• ne...jamais — никогда\n• ne...rien — ничего\n• ne...plus — больше не\n• ne...personne — никого (но personne стоит ПОСЛЕ причастия!)\n• ne...pas encore — ещё не',
          examples: [
            { fr: "Je n'ai jamais visité Paris", ru: 'Я никогда не посещал Париж' },
            { fr: "Il n'a rien mangé", ru: 'Он ничего не ел' },
            { fr: "Elle n'a plus travaillé", ru: 'Она больше не работала' },
            { fr: "Je n'ai vu personne", ru: 'Я никого не видел (personne после причастия!)' },
            { fr: "Tu n'as pas encore fini", ru: 'Ты ещё не закончил' },
          ]
        },
        {
          title: 'Три способа задать вопрос в passé composé',
          text: 'Во французском языке есть три способа образования вопроса. Все три работают и в passé composé:\n\n1. Интонация (разговорный) — просто поднимите голос в конце. Самый простой способ.\n\n2. Est-ce que (нейтральный) — добавьте «est-ce que» в начало. Универсальный вариант.\n\n3. Инверсия (формальный) — поменяйте местами подлежащее и вспомогательный глагол. Используется в письменной речи и формальном общении.',
          examples: [
            { fr: 'Tu as mangé ?', ru: 'Ты ел? (интонация)' },
            { fr: 'Est-ce que tu as mangé ?', ru: 'Ты ел? (est-ce que)' },
            { fr: 'As-tu mangé ?', ru: 'Ты ел? (инверсия)' },
          ]
        },
        {
          title: 'Вопросы с инверсией: подробности',
          text: 'При инверсии вспомогательный глагол и местоимение соединяются дефисом. В 3-м лице добавляется -t- между гласными для благозвучия.\n\nС être — тот же принцип: Est-il parti? Est-elle arrivée?\n\nС именным подлежащим используется «двойная» конструкция: Marie est-elle partie?',
          examples: [
            { fr: 'Ai-je bien compris ?', ru: 'Правильно ли я понял?' },
            { fr: 'As-tu fini ?', ru: 'Ты закончил?' },
            { fr: 'A-t-il mangé ?', ru: 'Он ел? (-t- для благозвучия)' },
            { fr: 'A-t-elle parlé ?', ru: 'Она говорила?' },
            { fr: 'Avons-nous choisi ?', ru: 'Мы выбрали?' },
            { fr: 'Avez-vous compris ?', ru: 'Вы поняли?' },
            { fr: 'Ont-ils travaillé ?', ru: 'Они работали?' },
            { fr: 'Est-il parti ?', ru: 'Он ушёл?' },
            { fr: 'Est-elle arrivée ?', ru: 'Она приехала?' },
            { fr: 'Marie a-t-elle téléphoné ?', ru: 'Мари звонила?' },
          ]
        },
        {
          title: 'Вопросительные слова + passé composé',
          text: 'Вопросительные слова ставятся в начало предложения. После них можно использовать est-ce que или инверсию:\n\n• Où — где / куда\n• Quand — когда\n• Pourquoi — почему\n• Comment — как\n• Combien — сколько\n• Que / Qu\' — что',
          examples: [
            { fr: 'Où est-ce que tu as mangé ?', ru: 'Где ты ел?' },
            { fr: 'Où as-tu mangé ?', ru: 'Где ты ел? (инверсия)' },
            { fr: 'Quand est-il arrivé ?', ru: 'Когда он приехал?' },
            { fr: "Pourquoi n'as-tu pas téléphoné ?", ru: 'Почему ты не позвонил?' },
            { fr: "Comment a-t-elle fait ?", ru: 'Как она это сделала?' },
            { fr: "Qu'est-ce que vous avez mangé ?", ru: 'Что вы ели?' },
            { fr: "Qu'avez-vous fait ?", ru: 'Что вы сделали?' },
          ]
        },
        {
          title: 'Отрицательные вопросы',
          text: 'Отрицательный вопрос = вопрос + отрицание. Используется, когда вы удивлены или ожидаете определённый ответ.\n\nС est-ce que: Est-ce que tu n\'as pas...?\nС инверсией: N\'as-tu pas...?\nРазговорный: Tu n\'as pas...?',
          examples: [
            { fr: "Tu n'as pas mangé ?", ru: 'Ты не ел? (разговорный)' },
            { fr: "Est-ce que tu n'as pas compris ?", ru: 'Ты не понял?' },
            { fr: "N'avez-vous pas reçu mon message ?", ru: 'Вы не получили моё сообщение?' },
            { fr: "N'est-elle pas venue ?", ru: 'Разве она не пришла?' },
          ]
        },
      ],
      tables: []
    },
    {
      type: 'exercises',
      exercises: [
        {
          type: 'multiple_choice',
          prompt: 'Выберите правильную отрицательную форму: "Я не ел"',
          options: ["Je n'ai pas mangé", "Je ne pas ai mangé", "Je n'ai mangé pas", "Je pas n'ai mangé"],
          correctIndex: 0,
        },
        {
          type: 'fill_blank',
          sentence: "Elle ___ arrivée hier",
          answer: "n'est pas",
        },
        {
          type: 'fill_blank',
          sentence: "Nous ___ regardé ce film",
          answer: "n'avons pas",
        },
        {
          type: 'multiple_choice',
          prompt: 'Как сказать "Он никогда не работал" ?',
          options: ["Il n'a jamais travaillé", "Il n'a pas jamais travaillé", "Il ne jamais a travaillé", "Il a jamais ne travaillé"],
          correctIndex: 0,
        },
        {
          type: 'translation',
          prompt: 'Переведите: Ты ел? (инверсия)',
          answer: 'As-tu mangé',
        },
        {
          type: 'multiple_choice',
          prompt: 'Выберите правильный вопрос с инверсией: "Она приехала?"',
          options: ['Est-elle arrivée ?', 'A-elle arrivée ?', 'Est arrivée-elle ?', 'Elle est arrivée ?'],
          correctIndex: 0,
        },
        {
          type: 'fill_blank',
          sentence: "___-vous compris la leçon ?",
          answer: "Avez",
        },
        {
          type: 'multiple_choice',
          prompt: 'Где стоит «personne» в отрицании passé composé?',
          options: ['После причастия (participe passé)', 'Между ne и вспомогательным глаголом', 'После ne, перед вспомогательным глаголом', 'В начале предложения'],
          correctIndex: 0,
        },
        {
          type: 'translation',
          prompt: 'Переведите: Где вы работали?',
          answer: 'Où avez-vous travaillé',
        },
        {
          type: 'fill_blank',
          sentence: "Pourquoi ___-tu ___ téléphoné ?",
          answer: "n'as pas",
        },
        {
          type: 'matching',
          pairs: [
            { left: "Je n'ai pas mangé", right: 'Я не ел' },
            { left: "Il n'a jamais parlé", right: 'Он никогда не говорил' },
            { left: "Elle n'a rien vu", right: 'Она ничего не видела' },
            { left: "Nous n'avons plus joué", right: 'Мы больше не играли' },
            { left: "Tu n'as pas encore fini", right: 'Ты ещё не закончил' },
          ],
        },
        {
          type: 'multiple_choice',
          prompt: 'A-t-il mangé ? — Зачем здесь «-t-» ?',
          options: ['Для благозвучия между двумя гласными', 'Это часть спряжения avoir', 'Это местоимение tu', 'Это показатель вопроса'],
          correctIndex: 0,
        },
      ],
    },
  ],
  verbList: [
    { infinitive: 'parler', ru: 'говорить', participePasse: 'parlé', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'manger', ru: 'есть', participePasse: 'mangé', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'travailler', ru: 'работать', participePasse: 'travaillé', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'écouter', ru: 'слушать', participePasse: 'écouté', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'regarder', ru: 'смотреть', participePasse: 'regardé', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'jouer', ru: 'играть', participePasse: 'joué', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'téléphoner', ru: 'звонить', participePasse: 'téléphoné', auxiliaire: 'avoir', group: 'Правильные (-er)' },
    { infinitive: 'finir', ru: 'заканчивать', participePasse: 'fini', auxiliaire: 'avoir', group: 'Правильные (-ir)' },
    { infinitive: 'choisir', ru: 'выбирать', participePasse: 'choisi', auxiliaire: 'avoir', group: 'Правильные (-ir)' },
    { infinitive: 'comprendre', ru: 'понимать', participePasse: 'compris', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'faire', ru: 'делать', participePasse: 'fait', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'voir', ru: 'видеть', participePasse: 'vu', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'recevoir', ru: 'получать', participePasse: 'reçu', auxiliaire: 'avoir', group: 'Неправильные (avoir)' },
    { infinitive: 'aller', ru: 'идти', participePasse: 'allé', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'arriver', ru: 'приезжать', participePasse: 'arrivé', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'partir', ru: 'уезжать', participePasse: 'parti', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'venir', ru: 'приходить', participePasse: 'venu', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'sortir', ru: 'выходить', participePasse: 'sorti', auxiliaire: 'être', group: 'С être (движение)' },
    { infinitive: 'tomber', ru: 'падать', participePasse: 'tombé', auxiliaire: 'être', group: 'С être (движение)' },
  ]
}

// Stub themes 9-31 with titles from program.md
function stubTheme(id, order, title, titleRu, description, descriptionRu, prevId) {
  return {
    id, order, title, titleRu, description, descriptionRu,
    unlockCondition: { type: 'theme_complete', themeId: prevId, minScore: 60 },
    vocabIds: [],
    sections: [
      { type: 'grammar', notes: [{ title: titleRu, text: 'Содержание урока будет добавлено в ближайшее время.' }], tables: [] },
    ]
  }
}

export const themes = [
  theme01,
  theme02,
  theme03,
  theme04,
  theme05,
  themeEtre,
  theme06,
  theme08,
  stubTheme('theme09', 9, 'Irregular Verbs I', 'Неправильные глаголы I', 'Aller, faire, pouvoir, vouloir', 'Aller, faire, pouvoir, vouloir', 'theme08'),
  stubTheme('theme10', 10, 'Future Tense', 'Будущее время', 'Express future actions', 'Выражение будущего времени', 'theme09'),
  stubTheme('theme11', 11, 'Question Words', 'Вопросительные слова', 'Qui, que, où, quand, comment, pourquoi', 'Кто, что, где, когда, как, почему', 'theme10'),
  stubTheme('theme12', 12, 'Talking About Yourself', 'Рассказ о себе', 'Hobbies, profession, interests', 'Хобби, профессия, интересы', 'theme11'),
  stubTheme('theme13', 13, 'Masculine Nouns & Articles', 'Существительные м.р. и артикли', 'Masculine nouns, singular and plural', 'Существительные мужского рода, ед. и мн. число', 'theme12'),
  stubTheme('theme14', 14, 'Adverbs', 'Наречия', 'Tout, rien, quelqu\'un, toujours, jamais...', 'Всё, ничего, кто-то, всегда, никогда...', 'theme13'),
  stubTheme('theme15', 15, 'Feminine Gender', 'Женский род', 'Feminine forms of nouns and adjectives', 'Женский род существительных и прилагательных', 'theme14'),
  stubTheme('theme16', 16, 'Time Expressions', 'Выражения времени', 'Talking about time, dates, duration', 'Время, даты, длительность', 'theme15'),
  stubTheme('theme17', 17, 'Pronoun Declension', 'Склонение местоимений', 'Object pronouns: me, te, le, la, lui...', 'Объектные местоимения', 'theme16'),
  stubTheme('theme18', 18, 'Conjunctions', 'Союзы', 'Mais, ou, et, donc, car, pourtant...', 'Но, или, и, значит, так как, однако...', 'theme17'),
  stubTheme('theme19', 19, 'Prepositions', 'Предлоги', 'À, de, en, dans, sur, sous, avec...', 'Основные предлоги места и направления', 'theme18'),
  stubTheme('theme20', 20, 'Possessive Pronouns', 'Притяжательные местоимения', 'Mon, ton, son, notre, votre, leur', 'Мой, твой, его, наш, ваш, их', 'theme19'),
  stubTheme('theme21', 21, 'Days, Months, Directions', 'Дни недели, месяцы, стороны света', 'Calendar vocabulary and cardinal directions', 'Календарь и стороны света', 'theme20'),
  stubTheme('theme22', 22, 'Cardinal Numbers', 'Количественные числительные', 'Numbers from 0 to 1000+', 'Числа от 0 до 1000+', 'theme21'),
  stubTheme('theme23', 23, 'Family & Home', 'Семья и дом', 'Family members and household vocabulary', 'Члены семьи и домашний быт', 'theme22'),
  stubTheme('theme24', 24, 'Partitive Article', 'Частичный артикль', 'Du, de la, des — expressing quantities', 'Выражение количества', 'theme23'),
  stubTheme('theme25', 25, 'At Restaurant & Shop', 'В ресторане и магазине', 'Ordering food, shopping phrases', 'Заказ еды, фразы для покупок', 'theme24'),
  stubTheme('theme26', 26, 'Free Conversation', 'Свободная беседа', 'Practice speaking on chosen topics', 'Практика разговора на выбранные темы', 'theme25'),
  stubTheme('theme27', 27, 'Ordinal Numbers', 'Порядковые числительные', 'Premier, deuxième, troisième...', 'Первый, второй, третий...', 'theme26'),
  stubTheme('theme28', 28, 'Adjectives', 'Прилагательные', 'Agreement, position, common adjectives', 'Согласование, позиция, частые прилагательные', 'theme27'),
  stubTheme('theme29', 29, 'Imperative Mood', 'Повелительное наклонение', 'Giving commands and instructions', 'Приказы и инструкции', 'theme28'),
  stubTheme('theme30', 30, 'Comparatives & Superlatives', 'Степени сравнения', 'Plus...que, moins...que, le plus...', 'Больше чем, меньше чем, самый...', 'theme29'),
  stubTheme('theme31', 31, 'Reflexive Verbs', 'Возвратные глаголы', 'Se lever, se coucher, s\'appeler...', 'Подниматься, ложиться, зваться...', 'theme30'),
]
