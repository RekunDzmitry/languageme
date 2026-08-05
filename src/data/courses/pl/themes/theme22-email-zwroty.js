// Polish: e-mail structure and ready-made phrases — theme 22
// Grammar notes on how a Polish e-mail is built (registers, openings, body,
// closings, punctuation) plus write_answer drills of the key formulas.
// The full AI-graded composition tasks live in theme19 (email_writing).

const theme22EmailZwroty = {
  id: 'pl_theme22',
  order: 20,
  title: 'Mail — struktura i zwroty',
  titleRu: 'E-mail: структура и фразы',
  description: 'Struktura listu, formuły oficjalne i nieoficjalne: początek, główna treść i zakończenie maila',
  descriptionRu: 'Структура письма, официальные и неофициальные формулы, начало, основная часть и завершение maila',
  unlockCondition: null,
  vocabIds: [],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Структура maila',
          text: 'Польский e-mail удобно строить из трех частей: początek maila, główna treść maila и zakończenie maila. Сначала выбираем регистр: oficjalny для учреждения, незнакомого адресата или просьбы; nieoficjalny для друзей и семьи.',
          examples: [
            { pl: 'Początek maila: Szanowni Państwo / Drogi Tomku', ru: 'начало письма: официальное / неофициальное обращение' },
            { pl: 'Główna treść maila: Kontaktuję się w sprawie kursu.', ru: 'основная часть: зачем пишем' },
            { pl: 'Zakończenie maila: Z poważaniem / Pozdrawiam serdecznie', ru: 'завершение: формула прощания' },
          ],
        },
        {
          title: 'Официальное начало',
          text: 'В официальном письме используем Szanowni Państwo, Szanowna Pani... или Szanowny Panie... При прямом обращении к мужчине форма Pan переходит в Panie.',
          examples: [
            { pl: 'Szanowni Państwo', ru: 'Уважаемые господа / уважаемые дамы и господа' },
            { pl: 'Szanowna Pani Dyrektor', ru: 'Уважаемая госпожа директор' },
            { pl: 'Szanowny Panie Dyrektorze', ru: 'Уважаемый господин директор' },
          ],
        },
        {
          title: 'Неофициальное начало',
          text: 'В письме знакомым можно начать с Drogi..., Droga..., Kochana... или Drodzy... Часто после обращения добавляют короткое вступление: благодарность за письмо, радость от новости или извинение за долгую паузу.',
          examples: [
            { pl: 'Drogi Tomku', ru: 'Дорогой Томек' },
            { pl: 'Kochana Aniu', ru: 'Дорогая Аня' },
            { pl: 'Dziękuję za Twój mail.', ru: 'Спасибо за твое письмо.' },
          ],
        },
        {
          title: 'Основная часть: официальный стиль',
          text: 'Официальная основная часть обычно начинается с цели письма: на что ссылаемся, по какому вопросу пишем, какую информацию просим предоставить.',
          examples: [
            { pl: 'W nawiązaniu do naszej korespondencji zwracam się z uprzejmą prośbą o udzielenie informacji.', ru: 'Ссылаясь на нашу переписку, вежливо прошу предоставить информацию.' },
            { pl: 'Kontaktuję się w sprawie kursu językowego.', ru: 'Пишу по поводу языкового курса.' },
            { pl: 'Zapoznałam się z informacjami na stronie Państwa szkoły językowej.', ru: 'Я ознакомилась с информацией на сайте вашей языковой школы.' },
          ],
        },
        {
          title: 'Основная часть: неофициальный стиль',
          text: 'В неофициальном письме естественно звучат личные вступления: радость от письма, благодарность, извинение за молчание, переход к новостям.',
          examples: [
            { pl: 'Dostałem od Ciebie maila i bardzo się ucieszyłem.', ru: 'Я получил от тебя письмо и очень обрадовался.' },
            { pl: 'Dawno do siebie nie pisaliśmy.', ru: 'Мы давно друг другу не писали.' },
            { pl: 'Przepraszam za dłuższe milczenie.', ru: 'Извини за долгое молчание.' },
          ],
        },
        {
          title: 'Время, место и порядок',
          text: 'Для связного письма нужны опоры времени, места и последовательности. Обращайте внимание на падеж после na: gdzie? na koncercie, dokąd? na koncert.',
          examples: [
            { pl: 'w ubiegłym tygodniu / za tydzień', ru: 'на прошлой неделе / через неделю' },
            { pl: 'być na konferencji / pojechać na konferencję', ru: 'быть на конференции / поехать на конференцию' },
            { pl: 'po pierwsze, potem, następnie, na zakończenie', ru: 'во-первых, потом, затем, в завершение' },
          ],
        },
        {
          title: 'Завершение maila',
          text: 'Официально можно поблагодарить заранее, попросить о подтверждении или выразить надежду на положительное рассмотрение. Неофициально можно спросить о делах, написать, что ждете ответа, и попрощаться тепло.',
          examples: [
            { pl: 'Z góry dziękuję uprzejmie za odpowiedź.', ru: 'Заранее вежливо благодарю за ответ.' },
            { pl: 'Będę wdzięczna za szybką odpowiedź.', ru: 'Буду благодарна за быстрый ответ.' },
            { pl: 'Pozdrawiam serdecznie', ru: 'Сердечно приветствую / с теплыми пожеланиями' },
          ],
        },
        {
          title: 'Жалоба и рекламация',
          text: 'В письме-жалобе (reklamacja, skarga) сначала называем причину обращения и выражаем недовольство, затем описываем проблему — что не так и чем реальность отличается от обещанного, — и в конце формулируем требование: возврат, замену или компенсацию. Тон остается официальным и вежливым, но твердым.',
          examples: [
            { pl: 'Piszę do Państwa, aby wyrazić swoje niezadowolenie.', ru: 'Пишу Вам, чтобы выразить своё неудовлетворение.' },
            { pl: 'Niestety rzeczywistość nie pokrywa się z opisem.', ru: 'К сожалению, реальность не совпадает с описанием.' },
            { pl: 'Żądam natychmiastowej reakcji.', ru: 'Требую немедленной реакции.' },
          ],
        },
        {
          title: 'Пунктуация и заглавные буквы',
          text: 'После финальной формулы прощания в польском письме не ставим запятую перед именем. Местоимения и формы обращения к адресату пишем с заглавной: Ty, Tobie, Was, Pan, Pani, Państwo.',
          examples: [
            { pl: 'Pozdrawiam\nTadek', ru: 'правильно: без запятой после Pozdrawiam' },
            { pl: 'Czekam na Twoją odpowiedź.', ru: 'Twoją с заглавной, потому что обращаемся к адресату' },
            { pl: 'Będę wdzięczny za odpowiedź od Państwa.', ru: 'Państwa с заглавной в вежливом обращении' },
          ],
        },
      ],
      tables: [],
    },
    {
      type: 'exercises',
      exercises: [
        { type: 'write_answer', category: 'Официальное начало', prompt: 'Уважаемые дамы и господа', answer: 'Szanowni Państwo', hint: 'Официальное обращение к учреждению или группе адресатов.' },
        { type: 'write_answer', category: 'Официальное начало', prompt: 'Уважаемая госпожа директор', answer: 'Szanowna Pani Dyrektor', hint: 'Pani + должность; официальная форма.' },
        { type: 'write_answer', category: 'Официальное начало', prompt: 'Уважаемый господин директор', answer: 'Szanowny Panie Dyrektorze', hint: 'При обращении Pan меняется на Panie, а должность часто в звательном падеже.' },
        { type: 'write_answer', category: 'Неофициальное начало', prompt: 'Дорогой Томек', answers: ['Drogi Tomku', 'Kochany Tomku'], hint: 'В обращении к Tomku используем звательный падеж.' },
        { type: 'write_answer', category: 'Неофициальное начало', prompt: 'Дорогая Аня', answers: ['Droga Aniu', 'Kochana Aniu'], hint: 'В обращении к Ania: Aniu.' },
        { type: 'write_answer', category: 'Неофициальное начало', prompt: 'Дорогие друзья', answer: 'Drodzy Przyjaciele', hint: 'Форма множественного числа: Drodzy...' },

        { type: 'write_answer', category: 'Вступление', prompt: 'Спасибо за твой mail.', answer: 'Dziękuję za Twój mail.', hint: 'Twój пишем с заглавной, потому что это обращение к адресату.' },
        { type: 'write_answer', category: 'Вступление', prompt: 'Мы (мужчины или смешанная группа) давно друг другу не писали.', answer: 'Dawno do siebie nie pisaliśmy.', hint: 'Мужская/смешанная форма: pisaliśmy.' },
        { type: 'write_answer', category: 'Вступление', prompt: 'Мы (женщины) давно друг другу не писали.', answer: 'Dawno do siebie nie pisałyśmy.', hint: 'Женская форма: pisałyśmy.' },
        { type: 'write_answer', category: 'Вступление', prompt: 'Извини за долгое молчание.', answer: 'Przepraszam za dłuższe milczenie.', hint: 'Неофициальное объяснение паузы в переписке.' },
        { type: 'write_answer', category: 'Вступление', prompt: 'Пишу по поводу языкового курса.', answers: ['Kontaktuję się w sprawie kursu językowego.', 'Piszę z powodu kursu językowego.'], hint: 'Официальная формула: Kontaktuję się w sprawie... (допускается также Piszę z powodu kursu językowego).' },
        { type: 'write_answer', category: 'Вступление', prompt: 'Я ознакомился с информацией на сайте вашей школы.', answer: 'Zapoznałem się z informacjami na stronie Państwa szkoły.', hint: 'Мужская форма: Zapoznałem się; Państwa с заглавной.' },
        { type: 'write_answer', category: 'Вступление', prompt: 'Я ознакомилась с информацией на сайте вашей школы.', answer: 'Zapoznałam się z informacjami na stronie Państwa szkoły.', hint: 'Женская форма: Zapoznałam się.' },

        { type: 'write_answer', category: 'Просьба', prompt: 'Вежливо прошу предоставить информацию.', answer: 'Zwracam się z uprzejmą prośbą o udzielenie informacji.', hint: 'Официальная просьба: zwracam się z uprzejmą prośbą o...' },
        { type: 'write_answer', category: 'Просьба', prompt: 'Прошу сообщить мне о цене курса.', answer: 'Proszę o poinformowanie mnie o cenie kursu.', hint: 'Официально: proszę o poinformowanie mnie o...' },
        { type: 'write_answer', category: 'Просьба', prompt: 'Буду благодарен за быстрый ответ.', answer: 'Będę wdzięczny za szybką odpowiedź.', hint: 'Мужская форма: wdzięczny.' },
        { type: 'write_answer', category: 'Просьба', prompt: 'Буду благодарна за быстрый ответ.', answer: 'Będę wdzięczna za szybką odpowiedź.', hint: 'Женская форма: wdzięczna.' },
        { type: 'write_answer', category: 'Благодарность', prompt: 'Заранее вежливо благодарю за ответ.', answer: 'Z góry dziękuję uprzejmie za odpowiedź.', hint: 'Официальное завершение: Z góry dziękuję...' },
        { type: 'write_answer', category: 'Ожидание ответа', prompt: 'Я жду твоего ответа.', answer: 'Czekam na Twoją odpowiedź.', hint: 'Czekać na + biernik; Twoją с заглавной.' },

        { type: 'write_answer', category: 'Время', prompt: 'на прошлой неделе', answer: 'w ubiegłym tygodniu', hint: 'Прошлое время: w ubiegłym / zeszłym tygodniu.' },
        { type: 'write_answer', category: 'Время', prompt: 'через неделю', answer: 'za tydzień', hint: 'Будущее время: za + период.' },
        { type: 'write_answer', category: 'Время', prompt: 'два месяца назад', answer: 'dwa miesiące temu', hint: 'Прошлое: liczba + okres + temu.' },
        { type: 'write_answer', category: 'Время', prompt: 'через три года', answer: 'za trzy lata', hint: 'Будущее: za + biernik czasu.' },
        { type: 'write_answer', category: 'Частотность', prompt: 'почти всегда', answer: 'prawie zawsze', hint: 'Противоположность: prawie nigdy.' },
        { type: 'write_answer', category: 'Частотность', prompt: 'время от времени', answer: 'od czasu do czasu', hint: 'Готовое выражение частотности.' },

        { type: 'write_answer', category: 'Место', prompt: 'быть на конференции', answer: 'być na konferencji', hint: 'Gdzie? na + miejscownik: na konferencji.' },
        { type: 'write_answer', category: 'Место', prompt: 'ехать на конференцию', answers: ['pojechać na konferencję', 'jechać na konferencję'], hint: 'Dokąd? na + biernik: na konferencję.' },
        { type: 'write_answer', category: 'Место', prompt: 'быть в отпуске', answer: 'być na urlopie', hint: 'Gdzie? na urlopie.' },
        { type: 'write_answer', category: 'Место', prompt: 'ехать в отпуск', answer: 'jechać na urlop', hint: 'Dokąd? na urlop.' },

        { type: 'write_answer', category: 'Порядок', prompt: 'во-первых', answer: 'po pierwsze', hint: 'Фраза для перечисления аргументов.' },
        { type: 'write_answer', category: 'Порядок', prompt: 'затем / потом', answers: ['potem', 'następnie'], hint: 'Фразы для порядка событий.' },
        { type: 'write_answer', category: 'Порядок', prompt: 'в завершение', answers: ['na zakończenie', 'na koniec'], hint: 'Фраза для последнего пункта письма; na zakończenie / na koniec.' },
        { type: 'write_answer', category: 'Порядок', prompt: 'прежде всего', answer: 'przede wszystkim', hint: 'Полезно для выделения главного аргумента.' },

        { type: 'write_answer', category: 'Полезные слова', prompt: 'особенно сейчас', answer: 'zwłaszcza teraz', hint: 'Zwłaszcza = особенно.' },
        { type: 'write_answer', category: 'Полезные слова', prompt: 'конечно, я хотел бы поблагодарить', answer: 'oczywiście chciałbym podziękować', hint: 'Мужская форма: chciałbym.' },
        { type: 'write_answer', category: 'Полезные слова', prompt: 'мы обязательно должны встретиться', answer: 'koniecznie musimy się spotkać', hint: 'Koniecznie усиливает необходимость.' },
        { type: 'write_answer', category: 'Полезные слова', prompt: 'мне важно увидеть город', answer: 'zależy mi na tym, żeby zobaczyć miasto', hint: 'Конструкция: zależy mi na tym, żeby + bezokolicznik.' },
        { type: 'write_answer', category: 'Полезные слова', prompt: 'без сомнения', answers: ['nie wątpię', 'bez wątpienia'], hint: 'Обе формы подходят для уверенного утверждения.' },
        { type: 'write_answer', category: 'Полезные слова', prompt: 'рано или поздно мы увидимся', answer: 'prędzej czy później się zobaczymy', hint: 'Готовая фраза: prędzej czy później.' },

        { type: 'write_answer', category: 'Завершение', prompt: 'С уважением', answers: ['Z poważaniem', 'Z wyrazami szacunku'], hint: 'Официальная финальная формула.' },
        { type: 'write_answer', category: 'Завершение', prompt: 'С теплыми пожеланиями', answers: ['Pozdrawiam ciepło', 'Pozdrawiam serdecznie'], hint: 'Неофициальное или теплое завершение.' },
        { type: 'write_answer', category: 'Завершение', prompt: 'Жду ваших новостей.', answer: 'Czekam na Wasze wiadomości.', hint: 'Wasze с заглавной как обращение к адресатам.' },
        { type: 'write_answer', category: 'Завершение', prompt: 'Ждем с нетерпением твоего приезда.', answer: 'Czekamy z niecierpliwością na Twój przyjazd.', hint: 'Twój с заглавной; czekać na + biernik.' },
        { type: 'write_answer', category: 'Пунктуация', prompt: 'Напиши правильно: Pozdrawiam + Tadek', answer: 'Pozdrawiam Tadek', hint: 'После финального Pozdrawiam запятую не ставим; в упражнении ответ вводится в одну строку.' },
        { type: 'write_answer', category: 'Заглавная буква', prompt: 'твою (в письме к адресату)', answer: 'Twoją', hint: 'Местоимения адресата в письме пишем с заглавной.' },
        { type: 'write_answer', category: 'Заглавная буква', prompt: 'господин / вы, вежливо', answer: 'Pan', hint: 'Pan, Pani, Państwo в обращении пишем с заглавной.' },
        { type: 'write_answer', category: 'Заглавная буква', prompt: 'господа / вы, вежливо', answer: 'Państwo', hint: 'Официальная форма обращения к группе.' },

        // ── Жалоба / рекламация: причина обращения, проблема, требование ──
        { type: 'write_answer', category: 'Рекламация: начало', prompt: 'Пишу Вам, чтобы выразить своё неудовлетворение.', answers: ['Piszę do Państwa, aby wyrazić swoje niezadowolenie.', 'Piszę do Państwa, żeby wyrazić swoje niezadowolenie.'], hint: 'Официальное начало жалобы; do Państwa — вежливое обращение.' },
        { type: 'write_answer', category: 'Рекламация: начало', prompt: 'Обращаюсь к вам с рекламацией.', answer: 'Zwracam się do Państwa z reklamacją.', hint: 'Zwracać się z + narzędnik: z reklamacją.' },
        { type: 'write_answer', category: 'Рекламация: начало', prompt: 'Я (мужчина) хотел бы подать рекламацию.', answer: 'Chciałbym złożyć reklamację.', hint: 'Złożyć reklamację = подать рекламацию; мужская форма chciałbym.' },
        { type: 'write_answer', category: 'Рекламация: начало', prompt: 'Я (женщина) хотела бы подать рекламацию.', answer: 'Chciałabym złożyć reklamację.', hint: 'Женская форма: chciałabym.' },

        { type: 'write_answer', category: 'Рекламация: проблема', prompt: 'К сожалению, реальность не совпадает с описанием.', answers: ['Niestety rzeczywistość nie pokrywa się z opisem.', 'Niestety rzeczywistość nie zgadza się z opisem.'], hint: 'Pokrywać się / zgadzać się z + narzędnik: z opisem.' },
        { type: 'write_answer', category: 'Рекламация: проблема', prompt: 'Я (мужчина) не доволен сложившейся ситуацией.', answer: 'Nie jestem zadowolony z zaistniałej sytuacji.', hint: 'Zadowolony z + dopełniacz; zaistniała sytuacja = сложившаяся ситуация.' },
        { type: 'write_answer', category: 'Рекламация: проблема', prompt: 'Я (женщина) не довольна сложившейся ситуацией.', answer: 'Nie jestem zadowolona z zaistniałej sytuacji.', hint: 'Женская форма: zadowolona.' },
        { type: 'write_answer', category: 'Рекламация: проблема', prompt: 'Товар оказался бракованным.', answer: 'Towar okazał się wadliwy.', hint: 'Okazać się + przymiotnik: okazał się wadliwy.' },
        { type: 'write_answer', category: 'Рекламация: проблема', prompt: 'Услуга не оправдала моих ожиданий.', answer: 'Usługa nie spełniła moich oczekiwań.', hint: 'Spełnić oczekiwania = оправдать ожидания.' },

        { type: 'write_answer', category: 'Рекламация: требования', prompt: 'Требую немедленной реакции.', answer: 'Żądam natychmiastowej reakcji.', hint: 'Żądać + dopełniacz: żądam reakcji.' },
        { type: 'write_answer', category: 'Рекламация: требования', prompt: 'Ожидаю возврата денег.', answer: 'Oczekuję zwrotu pieniędzy.', hint: 'Oczekiwać + dopełniacz: oczekuję zwrotu.' },
        { type: 'write_answer', category: 'Рекламация: требования', prompt: 'Прошу обменять товар на новый.', answer: 'Proszę o wymianę towaru na nowy.', hint: 'Prosić o + biernik: o wymianę towaru.' },
        { type: 'write_answer', category: 'Рекламация: требования', prompt: 'Требую компенсации.', answers: ['Domagam się rekompensaty.', 'Żądam rekompensaty.'], hint: 'Domagać się / żądać + dopełniacz: rekompensaty.' },

        { type: 'write_answer', category: 'Рекламация: завершение', prompt: 'Рассчитываю на быстрое решение вопроса.', answer: 'Liczę na szybkie rozwiązanie sprawy.', hint: 'Liczyć na + biernik: na rozwiązanie sprawy.' },
        { type: 'write_answer', category: 'Рекламация: завершение', prompt: 'Я (мужчина) буду вынужден предпринять дальнейшие шаги.', answer: 'Będę zmuszony podjąć dalsze kroki.', hint: 'Podjąć kroki = предпринять шаги; мужская форма zmuszony.' },
        { type: 'write_answer', category: 'Рекламация: завершение', prompt: 'Я (женщина) буду вынуждена предпринять дальнейшие шаги.', answer: 'Będę zmuszona podjąć dalsze kroki.', hint: 'Женская форма: zmuszona.' },
      ],
    },
  ],
  verbList: [],
}

export const themes = [theme22EmailZwroty]
export default theme22EmailZwroty
