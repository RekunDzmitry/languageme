/**
 * Lexicon data: synonyms, usage context, and semantic distinctions.
 * Keyed by vocab ID. Merged into VOCAB at export time.
 *
 * Fields:
 *   synonyms  — array of related French words (from within or outside the vocab list)
 *   usage     — when/how to use this word (Russian, for the learner)
 *   semantics — meaning nuances vs. synonyms (Russian)
 */
export const LEXICON = {

  // ─── abaisser / baisser / diminuer ─────────────────────────────────
  "fr_088": { // abaisser
    synonyms: ["baisser", "diminuer", "réduire"],
    usage: "Абстрактное понижение: уровень, температура, цена, планка.",
    semantics: "В отличие от baisser (физическое опускание вниз), abaisser — переносное: abaisser le prix (снизить цену), abaisser le seuil (понизить порог). Baisser la tête — опустить голову, но abaisser la température — понизить температуру."
  },
  "fr_113": { // baisser
    synonyms: ["abaisser", "diminuer", "réduire"],
    usage: "Физическое опускание или снижение. Часто с частями тела или конкретными предметами.",
    semantics: "Baisser — опускать вниз физически: baisser la tête (опустить голову), baisser le volume (убавить звук). Abaisser — абстрактное понижение. Diminuer — уменьшение количества."
  },
  "fr_158": { // diminuer
    synonyms: ["baisser", "réduire", "abaisser"],
    usage: "Уменьшение количества, размера, интенсивности.",
    semantics: "Diminuer — уменьшать в количестве или степени: diminuer les dépenses (сократить расходы). Baisser — опускать. Réduire — сокращать (более формально)."
  },

  // ─── savoir / connaître ────────────────────────────────────────────
  "fr_027": { // savoir
    synonyms: ["connaître"],
    usage: "Знать факты, информацию, уметь что-то делать. После savoir часто идёт инфинитив или que.",
    semantics: "Savoir = знать факт / уметь: Je sais nager (умею плавать), Je sais qu'il est parti (знаю, что он ушёл). Connaître = быть знакомым с: Je connais Paris (знаю Париж). Нельзя сказать *Je connais que..."
  },
  "fr_028": { // connaître
    synonyms: ["savoir"],
    usage: "Быть знакомым с человеком, местом, произведением. Всегда с прямым дополнением (существительным).",
    semantics: "Connaître = быть знакомым: Je connais cette chanson (я знаю эту песню). Savoir = владеть информацией / уметь. Connaître никогда не используется с que или инфинитивом."
  },

  // ─── rentrer / retourner ───────────────────────────────────────────
  "fr_256": { // rentrer
    synonyms: ["retourner", "revenir"],
    usage: "Возвращаться домой или внутрь привычного места.",
    semantics: "Rentrer = вернуться домой / в привычное место: Je rentre à la maison. Retourner = вернуться куда-то, где уже был раньше (не обязательно домой): Je retourne à Paris. Revenir = вернуться сюда (к говорящему)."
  },
  "fr_263": { // retourner
    synonyms: ["rentrer", "revenir"],
    usage: "Вернуться в место, где уже был. Также: перевернуть (предмет).",
    semantics: "Retourner = вернуться ТУДА (от говорящего): Il retourne en France. Rentrer = вернуться домой. Revenir = вернуться СЮДА (к говорящему): Il revient demain."
  },

  // ─── désirer / souhaiter ───────────────────────────────────────────
  "fr_152": { // désirer
    synonyms: ["souhaiter", "vouloir"],
    usage: "Желать с сильным личным влечением. Более интенсивно, чем souhaiter.",
    semantics: "Désirer — сильное, часто страстное желание: désirer le succès. Souhaiter — вежливое пожелание: Je vous souhaite bonne chance. Vouloir — нейтральное «хотеть»."
  },
  "fr_282": { // souhaiter
    synonyms: ["désirer", "vouloir", "espérer"],
    usage: "Вежливое пожелание или надежда. Формальнее, чем vouloir.",
    semantics: "Souhaiter = желать (вежливо): Je souhaite vous aider. Désirer = желать (сильно, лично). Espérer = надеяться (с оттенком ожидания)."
  },

  // ─── rester / demeurer ─────────────────────────────────────────────
  "fr_262": { // rester
    synonyms: ["demeurer"],
    usage: "Оставаться на месте или в состоянии. Повседневное слово.",
    semantics: "Rester — обычное «оставаться»: Je reste ici (я остаюсь здесь). Demeurer — литературное / формальное: Il demeure silencieux (он пребывает в молчании). Demeurer также = проживать (формально)."
  },
  "fr_148": { // demeurer
    synonyms: ["rester", "habiter"],
    usage: "Литературное «оставаться» или формальное «проживать».",
    semantics: "Demeurer = пребывать (книжн.): La question demeure (вопрос остаётся). Также = проживать: Il demeure à Lyon. Habiter — обычное слово для «жить где-то». Rester — повседневное «оставаться»."
  },

  // ─── habiter / demeurer / séjourner ────────────────────────────────
  "fr_199": { // habiter
    synonyms: ["demeurer", "vivre", "séjourner"],
    usage: "Жить, проживать постоянно. Самое обычное слово.",
    semantics: "Habiter = жить где-то постоянно: J'habite à Moscou. Demeurer = то же, но формальнее. Séjourner = временное пребывание (гостить)."
  },
  "fr_272": { // séjourner
    synonyms: ["habiter", "demeurer", "rester"],
    usage: "Временно пребывать, гостить.",
    semantics: "Séjourner = быть где-то временно: séjourner à l'hôtel (остановиться в отеле). Habiter = жить постоянно. Rester = оставаться (не уезжать)."
  },

  // ─── présenter / représenter ───────────────────────────────────────
  "fr_242": { // présenter
    synonyms: ["représenter", "montrer"],
    usage: "Представлять (кого-то кому-то), предъявлять, излагать.",
    semantics: "Présenter = познакомить, показать, изложить: présenter un ami (представить друга), présenter un projet. Représenter = быть представителем или символом: Il représente la France (он представляет Францию)."
  },
  "fr_260": { // représenter
    synonyms: ["présenter", "symboliser"],
    usage: "Быть представителем, символизировать, изображать.",
    semantics: "Représenter = представлять (от чьего-то имени) или символизировать: Ce tableau représente la liberté. Présenter = лично представить / изложить."
  },

  // ─── aventurer / risquer ───────────────────────────────────────────
  "fr_112": { // aventurer
    synonyms: ["risquer", "oser"],
    usage: "Рисковать, отваживаться на что-то новое. Чаще возвратный: s'aventurer.",
    semantics: "S'aventurer = отважиться, пуститься в приключение: s'aventurer dans la forêt. Risquer = подвергаться риску: risquer sa vie (рисковать жизнью). Aventurer — про действие, risquer — про опасность."
  },
  "fr_267": { // risquer
    synonyms: ["aventurer", "oser"],
    usage: "Подвергаться опасности, ставить на кон.",
    semantics: "Risquer = рисковать (есть опасность): risquer un accident. S'aventurer = смело идти в неизведанное. Risquer de + inf = есть вероятность: Il risque de pleuvoir (может пойти дождь)."
  },

  // ─── blaguer / plaisanter ──────────────────────────────────────────
  "fr_115": { // blaguer
    synonyms: ["plaisanter"],
    usage: "Шутить (разговорное). Чаще в неформальной речи.",
    semantics: "Blaguer — разговорное «шутить, прикалываться»: Tu blagues? (Ты шутишь?). Plaisanter — нейтральное, можно в формальной речи: Je plaisantais (я пошутил)."
  },
  "fr_234": { // plaisanter
    synonyms: ["blaguer"],
    usage: "Шутить (нейтральное). Подходит для любого контекста.",
    semantics: "Plaisanter — универсальное «шутить»: Vous plaisantez? (Вы шутите?). Blaguer — более фамильярное, разговорное."
  },

  // ─── accuser / blâmer ──────────────────────────────────────────────
  "fr_093": { // accuser
    synonyms: ["blâmer", "inculper"],
    usage: "Обвинять (официально или неформально). Часто с de + inf.",
    semantics: "Accuser = обвинить (конкретно): accuser quelqu'un de vol (обвинить в краже). Blâmer = порицать, осуждать (моральная оценка): blâmer son comportement."
  },
  "fr_116": { // blâmer
    synonyms: ["accuser", "critiquer", "reprocher"],
    usage: "Порицать, осуждать поведение. Моральная оценка.",
    semantics: "Blâmer = моральное осуждение: On le blâme pour sa paresse. Accuser = формальное обвинение. Reprocher = упрекнуть (мягче)."
  },

  // ─── trouver / retrouver ───────────────────────────────────────────
  "fr_037": { // trouver
    synonyms: ["retrouver", "découvrir"],
    usage: "Находить (что-то новое или в результате поиска). Также: считать, полагать.",
    semantics: "Trouver = найти: J'ai trouvé mes clés. Также = считать: Je trouve ça bizarre. Retrouver = найти СНОВА (то, что было потеряно) или встретиться с кем-то: Je retrouve mes amis au café."
  },
  "fr_264": { // retrouver
    synonyms: ["trouver"],
    usage: "Находить снова (утерянное). Встречаться (с друзьями).",
    semantics: "Retrouver = re + trouver: найти повторно / воссоединиться: retrouver la santé (восстановить здоровье), retrouver un ami (встретиться с другом). Trouver = найти впервые."
  },

  // ─── parler / raconter / causer / discuter ─────────────────────────
  "fr_016": { // parler
    synonyms: ["causer", "discuter", "bavarder"],
    usage: "Говорить, разговаривать. Самый общий глагол речи.",
    semantics: "Parler = говорить (общее): parler français, parler à quelqu'un. Discuter = обсуждать (тему). Raconter = рассказывать (историю). Causer = беседовать (разг.) / вызывать."
  },
  "fr_249": { // raconter
    synonyms: ["dire", "narrer"],
    usage: "Рассказывать историю, описывать события.",
    semantics: "Raconter = рассказать историю: raconter une aventure. Dire = сказать (конкретные слова). Parler = говорить (в общем)."
  },
  "fr_123": { // causer
    synonyms: ["parler", "bavarder", "provoquer"],
    usage: "1) Беседовать (разг.) 2) Вызывать, быть причиной.",
    semantics: "Causer имеет ДВА значения: 1) causer avec qqn = болтать (разг.); 2) causer un problème = вызвать проблему. Parler — нейтральное «говорить». Bavarder — болтать без дела."
  },
  "fr_114": { // bavarder
    synonyms: ["causer", "parler", "papoter"],
    usage: "Болтать, трепаться. Лёгкий непринуждённый разговор.",
    semantics: "Bavarder = болтать (ни о чём серьёзном): bavarder entre amis. Discuter = обсуждать серьёзную тему. Parler — нейтральное."
  },
  "fr_160": { // discuter
    synonyms: ["parler", "débattre"],
    usage: "Обсуждать тему, дискутировать.",
    semantics: "Discuter = обсуждать (конкретную тему): discuter du projet. Parler = говорить (общее). Débattre = спорить (формально, с аргументами)."
  },

  // ─── dépenser / gaspiller ──────────────────────────────────────────
  "fr_151": { // dépenser
    synonyms: ["gaspiller", "consommer"],
    usage: "Тратить (деньги, энергию). Нейтральное слово.",
    semantics: "Dépenser = тратить (нейтрально): dépenser de l'argent. Gaspiller = тратить ВПУСТУЮ, расточать: gaspiller l'eau."
  },
  "fr_194": { // gaspiller
    synonyms: ["dépenser", "dilapider"],
    usage: "Тратить впустую, расточать. Всегда негативная коннотация.",
    semantics: "Gaspiller = бесполезная трата: gaspiller son talent (растрачивать талант). Dépenser — нейтрально: можно dépenser wisely."
  },

  // ─── résoudre / décider ────────────────────────────────────────────
  "fr_058": { // résoudre
    synonyms: ["décider", "régler"],
    usage: "Решать проблему, находить решение.",
    semantics: "Résoudre = решить ПРОБЛЕМУ: résoudre une équation, résoudre un conflit. Décider = принять РЕШЕНИЕ (выбор): décider de partir. Régler = урегулировать."
  },
  "fr_146": { // décider
    synonyms: ["résoudre", "trancher", "choisir"],
    usage: "Принимать решение, делать выбор.",
    semantics: "Décider = сделать выбор: J'ai décidé de rester. Résoudre = найти решение проблемы. Choisir = выбирать из вариантов. Trancher = решить категорично."
  },

  // ─── porter / apporter / supporter ─────────────────────────────────
  "fr_238": { // porter
    synonyms: ["apporter", "emporter", "transporter"],
    usage: "Нести, носить (на себе). Также: носить одежду.",
    semantics: "Porter = нести/носить (на себе): porter un sac, porter une robe. Apporter = принести (сюда). Emporter = унести (отсюда). Transporter = перевозить."
  },
  "fr_100": { // apporter
    synonyms: ["porter", "amener", "emporter"],
    usage: "Приносить (предмет сюда, к говорящему).",
    semantics: "Apporter = принести ВЕЩЬ сюда: Apporte-moi le livre. Amener = привести ЧЕЛОВЕКА сюда. Emporter = унести вещь отсюда. Emmener = увести человека отсюда."
  },
  "fr_283": { // supporter
    synonyms: ["endurer", "tolérer", "soutenir"],
    usage: "Выдерживать, терпеть. Внимание: НЕ значит «поддерживать» (= soutenir).",
    semantics: "Faux ami! Supporter ≠ англ. support. Supporter = терпеть: Je ne supporte pas le bruit. Для «поддерживать» используйте soutenir."
  },

  // ─── montrer / indiquer ────────────────────────────────────────────
  "fr_220": { // montrer
    synonyms: ["indiquer", "démontrer", "présenter"],
    usage: "Показывать (жестом, действием, наглядно).",
    semantics: "Montrer = показать (наглядно): Montre-moi ta photo. Indiquer = указать (направление, информацию): indiquer le chemin. Démontrer = доказать/продемонстрировать."
  },
  "fr_203": { // indiquer
    synonyms: ["montrer", "signaler", "désigner"],
    usage: "Указывать, обозначать. Часто о направлении или информации.",
    semantics: "Indiquer = указать/подсказать: Pouvez-vous m'indiquer la gare? Montrer = показать наглядно. Signaler = обратить внимание, сообщить."
  },

  // ─── chercher ──────────────────────────────────────────────────────
  "fr_128": { // chercher
    synonyms: ["rechercher", "fouiller"],
    usage: "Искать. Chercher à + inf = пытаться.",
    semantics: "Chercher = искать (процесс): Je cherche mes clés. Trouver = найти (результат). Fouiller = обыскивать (тщательно, в вещах). Rechercher = разыскивать (целенаправленно)."
  },

  // ─── arrêter / cesser ──────────────────────────────────────────────
  "fr_105": { // arrêter
    synonyms: ["cesser", "stopper"],
    usage: "Останавливать, прекращать. Также: арестовывать.",
    semantics: "Arrêter = остановить (действие или человека): arrêter la voiture, arrêter un criminel. Cesser = прекратить (формальнее, абстрактнее): cesser les hostilités. Arrêter de + inf = перестать делать."
  },
  "fr_125": { // cesser
    synonyms: ["arrêter", "interrompre"],
    usage: "Прекращать (формальное, книжное).",
    semantics: "Cesser = прекратить (формально): cesser de fumer, sans cesse (не переставая). Arrêter — более разговорное: Arrête de parler! (Перестань говорить!)."
  },

  // ─── garder / conserver ────────────────────────────────────────────
  "fr_193": { // garder
    synonyms: ["conserver", "préserver", "retenir"],
    usage: "Хранить, сохранять, оберегать. Также: сторожить.",
    semantics: "Garder = хранить / оберегать: garder un secret, garder les enfants. Conserver = сохранять (в хорошем состоянии): conserver les aliments. Préserver = защитить от разрушения."
  },

  // ─── augmenter ─────────────────────────────────────────────────────
  "fr_111": { // augmenter
    synonyms: ["accroître", "élever", "hausser"],
    usage: "Увеличивать (цену, количество, зарплату).",
    semantics: "Augmenter = увеличить (нейтрально, повседневно): augmenter le prix. Accroître = наращивать (формально, книжно): accroître la productivité."
  },

  // ─── demander / prier ──────────────────────────────────────────────
  "fr_085": { // demander
    synonyms: ["prier", "interroger", "questionner"],
    usage: "Просить или спрашивать. Самый общий глагол.",
    semantics: "Demander = просить / спрашивать: demander de l'aide, demander le chemin. Prier = просить (вежливо/умоляюще): Je vous prie de m'excuser. Interroger = допрашивать / задавать вопросы."
  },
  "fr_244": { // prier
    synonyms: ["demander", "supplier", "implorer"],
    usage: "Молиться. Также: вежливо просить (Je vous prie).",
    semantics: "Prier = молиться: prier Dieu. Также вежливая просьба: Je vous en prie (пожалуйста). Demander — обычная просьба. Supplier = умолять."
  },

  // ─── entrer ────────────────────────────────────────────────────────
  "fr_174": { // entrer
    synonyms: ["pénétrer"],
    usage: "Входить. Самое обычное слово.",
    semantics: "Entrer = войти (нейтрально): entrer dans la maison. Pénétrer = проникнуть (с усилием или глубоко): pénétrer dans la forêt. Pénétrer — более драматичное."
  },

  // ─── quitter ───────────────────────────────────────────────────────
  "fr_248": { // quitter
    synonyms: ["sortir", "partir", "abandonner"],
    usage: "Покидать (место, человека). Оттенок окончательности.",
    semantics: "Quitter = покинуть (с оттенком «насовсем»): quitter son emploi, quitter quelqu'un. Sortir = просто выйти. Partir = отправиться в путь."
  },

  // ─── marcher ───────────────────────────────────────────────────────
  "fr_216": { // marcher
    synonyms: ["promener", "fonctionner"],
    usage: "1) Ходить пешком. 2) Работать, функционировать (разг.).",
    semantics: "Marcher = идти пешком: marcher vite. Также = работать: Ça marche! (Работает! / Договорились!). Se promener = гулять (для удовольствия). Fonctionner = функционировать (формально)."
  },

  // ─── penser / croire ───────────────────────────────────────────────
  "fr_044": { // penser
    synonyms: ["croire", "réfléchir", "songer"],
    usage: "Думать, полагать. Penser à = думать о. Penser de = считать (мнение).",
    semantics: "Penser = думать/полагать: Je pense que oui. Croire = верить / считать (менее уверенно): Je crois qu'il viendra. Réfléchir = размышлять (глубоко, обдумывать): Laissez-moi réfléchir."
  },
  "fr_039": { // croire
    synonyms: ["penser", "estimer"],
    usage: "Верить, полагать. Croire en = верить в. Croire à = верить (во что-то).",
    semantics: "Croire = верить: croire en Dieu. Также = полагать (с меньшей уверенностью, чем penser): Je crois que c'est vrai. Penser — более взвешенное мнение."
  },

  // ─── attendre / espérer ────────────────────────────────────────────
  "fr_038": { // attendre
    synonyms: ["espérer", "patienter"],
    usage: "Ждать (кого-то/чего-то). Физическое ожидание.",
    semantics: "Attendre = ждать (конкретно): attendre le bus, attendre quelqu'un. Espérer = надеяться: J'espère qu'il viendra. Patienter = терпеливо ждать (вежливое): Veuillez patienter."
  },

  // ─── sentir / ressentir ────────────────────────────────────────────
  "fr_045": { // sentir
    synonyms: ["ressentir"],
    usage: "1) Чувствовать. 2) Пахнуть. Многозначный глагол.",
    semantics: "Sentir = чувствовать (физически) + пахнуть: sentir le parfum (чувствовать аромат), ça sent bon (хорошо пахнет). Ressentir = испытывать (эмоции, глубокие чувства): ressentir de la joie."
  },

  // ─── utiliser / employer ───────────────────────────────────────────
  "fr_298": { // utiliser
    synonyms: ["employer", "user", "se servir de"],
    usage: "Использовать. Самый общий и нейтральный глагол.",
    semantics: "Utiliser = использовать (универсальное). Employer = применять (формальнее) / нанимать (людей). Se servir de = пользоваться (инструментом). User = изнашивать."
  },

  // ─── préparer ──────────────────────────────────────────────────────
  "fr_241": { // préparer
    synonyms: ["apprêter", "organiser"],
    usage: "Готовить, подготавливать. Универсальное слово.",
    semantics: "Préparer = готовить (общее): préparer le dîner, préparer un examen. S'apprêter = собираться (что-то сделать): Je m'apprête à partir."
  },

  // ─── grand / gros ──────────────────────────────────────────────────
  "fr_012": { // grand
    synonyms: ["gros", "vaste", "large"],
    usage: "Большой (по размеру, высоте, значимости). Также: высокий (о росте).",
    semantics: "Grand = большой по размеру/высоте/значимости: un grand homme (великий человек), une grande maison. Gros = большой по объёму/толщине: un gros chat (толстый кот), un gros problème (большая проблема)."
  },

  // ─── difficile / dur ───────────────────────────────────────────────
  "fr_032": { // difficile
    synonyms: ["dur", "compliqué", "ardu"],
    usage: "Трудный, сложный. Нейтральное слово.",
    semantics: "Difficile = трудный (нейтрально): un exercice difficile. Dur = 1) твёрдый физически: un lit dur; 2) тяжёлый (разг.): C'est dur! Compliqué = запутанный."
  },

  // ─── accepter / accorder ───────────────────────────────────────────
  "fr_089": { // accepter
    synonyms: ["accorder", "admettre", "consentir"],
    usage: "Принимать (предложение, ситуацию). Accepter de + inf.",
    semantics: "Accepter = принять (то, что предложено): accepter une invitation. Accorder = предоставить (одобрение, разрешение): accorder un prêt. Admettre = признать (факт)."
  },
  "fr_091": { // accorder
    synonyms: ["accepter", "donner", "attribuer"],
    usage: "Предоставлять, согласовывать. Также: настраивать (инструмент).",
    semantics: "Accorder = предоставить (формально): accorder une faveur. Accepter = принять (от другого). Accorder может также = согласовывать (грамматически): accorder l'adjectif."
  },

  // ─── laisser ───────────────────────────────────────────────────────
  "fr_212": { // laisser
    synonyms: ["quitter", "abandonner", "permettre"],
    usage: "Оставлять, позволять. Laisser + inf = позволить делать.",
    semantics: "Laisser = оставить / позволить: Laisse-moi tranquille (оставь меня), laisser entrer (позволить войти). Quitter = покинуть (уйти). Abandonner = бросить (насовсем)."
  },

  // ─── manquer ───────────────────────────────────────────────────────
  "fr_215": { // manquer
    synonyms: ["rater"],
    usage: "ВНИМАНИЕ: конструкция обратная русскому! Tu me manques = Я скучаю по тебе (ты мне недостаёшь).",
    semantics: "Manquer = 1) скучать (обратная конструкция!): Tu me manques (= я скучаю по тебе); 2) не хватать: Il manque du sel; 3) пропустить: manquer le train. Rater = провалить / пропустить (разг.)."
  },

  // ─── compter ───────────────────────────────────────────────────────
  "fr_133": { // compter
    synonyms: ["calculer", "envisager"],
    usage: "Считать (числа). Также: намереваться (compter + inf).",
    semantics: "Compter = считать числа: compter jusqu'à dix. Также = рассчитывать: Je compte sur toi (рассчитываю на тебя). Compter + inf = намереваться: Je compte partir demain."
  },

  // ─── occuper / emprunter / prêter ──────────────────────────────────
  "fr_226": { // occuper
    synonyms: ["remplir"],
    usage: "Занимать (пространство, время, должность). S'occuper de = заниматься чем-то.",
    semantics: "Occuper = занимать: occuper un poste. S'occuper de = заботиться / заниматься: Je m'occupe des enfants. Emprunter = занимать ДЕНЬГИ (брать в долг)."
  },
  "fr_169": { // emprunter
    synonyms: ["prêter"],
    usage: "Занимать (брать в долг). Противоположность prêter.",
    semantics: "Emprunter = БРАТЬ в долг: emprunter de l'argent (занять денег). Prêter = ДАВАТЬ в долг: prêter un livre. Не путайте! Emprunter — берёшь, prêter — даёшь."
  },
  "fr_243": { // prêter
    synonyms: ["emprunter"],
    usage: "Давать в долг, одалживать. Противоположность emprunter.",
    semantics: "Prêter = ДАВАТЬ в долг: prêter de l'argent à un ami. Emprunter = БРАТЬ в долг. Мнемоника: prêter — «пре-доставлять»."
  },

  // ─── propre (polysemy) ─────────────────────────────────────────────
  "fr_049": { // propre
    synonyms: [],
    usage: "ДВА значения в зависимости от позиции!",
    semantics: "ПЕРЕД существительным: собственный — mon propre avis (моё собственное мнение). ПОСЛЕ существительного: чистый — une chambre propre (чистая комната). Позиция меняет смысл!"
  },

  // ─── voler (polysemy) ──────────────────────────────────────────────
  "fr_304": { // voler
    synonyms: [],
    usage: "ДВА значения: 1) красть 2) летать.",
    semantics: "Voler = 1) летать: L'oiseau vole; 2) красть: voler de l'argent. Контекст решает. Un vol = 1) полёт; 2) кража."
  },

  // ─── louer (polysemy) ──────────────────────────────────────────────
  "fr_214": { // louer
    synonyms: [],
    usage: "ДВА значения: 1) арендовать 2) хвалить.",
    semantics: "Louer = 1) арендовать/сдавать: louer un appartement; 2) хвалить (книжн.): louer ses qualités. В повседневной речи обычно = арендовать."
  },

  // ─── assister (faux ami) ───────────────────────────────────────────
  "fr_106": { // assister
    synonyms: ["aider", "participer"],
    usage: "Faux ami! Assister à = присутствовать при. НЕ «помогать»!",
    semantics: "Assister à = присутствовать: assister à un concert (побывать на концерте). Для «помогать» используйте aider. Assister quelqu'un = помогать (только с прямым дополнением, формально)."
  },

  // ─── fier / se méfier ──────────────────────────────────────────────
  "fr_186": { // fier (se fier)
    synonyms: ["se méfier"],
    usage: "Se fier à = доверять. Антоним: se méfier de.",
    semantics: "Se fier à = доверять: Je me fie à toi. Se méfier de = не доверять, остерегаться: Méfiez-vous de lui. Также: fier (прил.) = гордый."
  },
  "fr_057": { // se méfier
    synonyms: ["fier", "douter"],
    usage: "Не доверять, остерегаться. Антоним se fier.",
    semantics: "Se méfier de = остерегаться: Méfie-toi de cette offre. Se fier à = доверять (антоним). Douter = сомневаться (менее категорично)."
  },

  // ─── sonner / téléphoner ───────────────────────────────────────────
  "fr_280": { // sonner
    synonyms: ["téléphoner", "klaxonner"],
    usage: "Звонить, звенеть (о звуке). Не «звонить по телефону»!",
    semantics: "Sonner = издавать звук: Le téléphone sonne (телефон звонит). Téléphoner = звонить по телефону (действие человека). Klaxonner = сигналить (в машине)."
  },

  // ─── nouveau / neuf ────────────────────────────────────────────────
  "fr_048": { // nouveau
    synonyms: ["neuf"],
    usage: "Новый (для владельца). Не обязательно с завода.",
    semantics: "Nouveau = новый для тебя: une nouvelle voiture (новая для тебя машина, может быть б/у). Neuf = совсем новый, с завода: une voiture neuve (новёхонькая машина)."
  },

  // ─── libre ─────────────────────────────────────────────────────────
  "fr_050": { // libre
    synonyms: ["gratuit"],
    usage: "Свободный. НЕ путать с gratuit (бесплатный).",
    semantics: "Libre = свободный: un homme libre, une place libre. Gratuit = бесплатный: l'entrée est gratuite. «Свободный вход» = entrée libre (НЕ gratuite, если имеется в виду «можно войти»)."
  },

  // ─── aimer / adorer ───────────────────────────────────────────────
  "fr_081": { // aimer
    synonyms: ["adorer", "apprécier"],
    usage: "Любить, нравиться. Aimer bien = нравиться (слабее, чем aimer!).",
    semantics: "Aimer = любить: J'aime mes parents. Aimer bien = нравиться (СЛАБЕЕ!): Je l'aime bien (он мне нравится, но не любовь). Adorer = обожать (сильнее aimer для вещей)."
  },
  "fr_095": { // adorer
    synonyms: ["aimer", "idolâtrer"],
    usage: "Обожать. Сильнее aimer для хобби/вещей, но слабее для людей.",
    semantics: "Adorer = обожать (вещи/действия): J'adore le chocolat! Для людей aimer сильнее: J'aime mon mari (люблю) vs J'adore mon prof (обожаю, но не романтично)."
  },

  // ─── rencontrer ────────────────────────────────────────────────────
  "fr_255": { // rencontrer
    synonyms: ["retrouver", "croiser"],
    usage: "Встретить (впервые или случайно).",
    semantics: "Rencontrer = встретить (впервые/случайно): J'ai rencontré un ami. Retrouver = встретиться (по договорённости): On se retrouve au café. Croiser = столкнуться мельком."
  },

  // ─── arriver / aboutir ─────────────────────────────────────────────
  "fr_084": { // arriver
    synonyms: ["parvenir", "aboutir", "venir"],
    usage: "1) Приезжать, прибывать. 2) Случаться: Il arrive que...",
    semantics: "Arriver = прибыть: Le train arrive. Также = случаться: Qu'est-ce qui est arrivé? Parvenir = достичь (с трудом): parvenir au sommet. Aboutir = привести к результату."
  },
  "fr_067": { // aboutir
    synonyms: ["arriver", "parvenir", "mener"],
    usage: "Приводить к результату, завершаться чем-то.",
    semantics: "Aboutir = привести к результату: Les négociations ont abouti (переговоры увенчались успехом). Aboutir à = закончиться чем-то. Parvenir = достичь (лично, с усилием)."
  },

  // ─── continuer ─────────────────────────────────────────────────────
  "fr_137": { // continuer
    synonyms: ["poursuivre", "persévérer"],
    usage: "Продолжать. Самый обычный глагол.",
    semantics: "Continuer = продолжать (нейтрально): continuer à travailler. Poursuivre = продолжать (формальнее) + преследовать: poursuivre un objectif (преследовать цель)."
  },

  // ─── terminer ──────────────────────────────────────────────────────
  "fr_287": { // terminer
    synonyms: ["finir", "achever", "accomplir"],
    usage: "Заканчивать, завершать.",
    semantics: "Terminer = завершить (нейтрально): terminer un projet. Finir = закончить (разговорнее): J'ai fini! Achever = довести до конца (книжн.) / добить."
  },

  // ─── signaler / signifier ──────────────────────────────────────────
  "fr_276": { // signaler
    synonyms: ["signifier", "indiquer"],
    usage: "Сигнализировать, сообщить о чём-то.",
    semantics: "Signaler = обратить внимание / сообщить: signaler un problème. Signifier = означать: Que signifie ce mot? Indiquer = указать."
  },
  "fr_278": { // signifier
    synonyms: ["signaler", "vouloir dire"],
    usage: "Означать, значить.",
    semantics: "Signifier = означать (формально): Que signifie ce mot? Vouloir dire = значить (разг.): Qu'est-ce que ça veut dire? Signaler = сообщить о чём-то."
  },

  // ─── s'avérer ──────────────────────────────────────────────────────
  "fr_071": { // s'avérer
    synonyms: ["se révéler", "sembler"],
    usage: "Оказаться, выясниться.",
    semantics: "S'avérer = оказаться (при проверке): Il s'est avéré que... (оказалось, что...). Sembler = казаться (впечатление). Se révéler = обнаружиться."
  },

  // ─── tromper ───────────────────────────────────────────────────────
  "fr_295": { // tromper
    synonyms: ["duper", "mentir"],
    usage: "Обманывать. Se tromper = ошибаться!",
    semantics: "Tromper = обмануть: Il m'a trompé. Se tromper = ОШИБИТЬСЯ: Je me suis trompé de porte (я ошибся дверью). Mentir = лгать (словами)."
  },

  // ─── noter / remarquer ─────────────────────────────────────────────
  "fr_225": { // noter
    synonyms: ["remarquer", "enregistrer"],
    usage: "Отмечать, записывать. Также: ставить оценку.",
    semantics: "Noter = записать: noter une adresse. Также = заметить (формально): Il faut noter que... Remarquer = заметить (обратить внимание): J'ai remarqué son absence."
  },
  "fr_253": { // remarquer
    synonyms: ["noter", "observer"],
    usage: "Замечать, обращать внимание.",
    semantics: "Remarquer = заметить (визуально/ментально): As-tu remarqué? Noter = записать / отметить (формально). Observer = наблюдать (длительно)."
  },

  // ─── passer ────────────────────────────────────────────────────────
  "fr_230": { // passer
    synonyms: ["traverser", "dépasser"],
    usage: "Очень многозначный! Проходить, проводить (время), передавать, сдавать (экзамен).",
    semantics: "Passer = 1) проходить мимо: passer devant; 2) проводить время: passer la journée; 3) передать: passe-moi le sel; 4) сдавать: passer un examen (НЕ «сдать успешно» = réussir!). Se passer = происходить."
  },

  // ─── tomber ────────────────────────────────────────────────────────
  "fr_289": { // tomber
    synonyms: [],
    usage: "Падать. Также в устойчивых выражениях.",
    semantics: "Tomber = падать. Идиомы: tomber amoureux (влюбиться), tomber malade (заболеть), tomber bien/mal (быть к месту / не к месту), laisser tomber (бросить, забить)."
  },
}
