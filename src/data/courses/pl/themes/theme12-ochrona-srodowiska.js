// Polish: Ochrona środowiska i efekt cieplarniany — theme 12
// Audio flashcards from vocabIds (no write_answer exercises)

const theme12OchronaSrodowiska = {
  id: 'pl_theme12',
  order: 3,
  title: 'Ochrona środowiska i efekt cieplarniany',
  titleRu: 'Охрана окружающей среды и парниковый эффект',
  description: 'Лексика для обсуждения охраны окружающей среды, парникового эффекта и вымирания видов',
  descriptionRu: 'Лексика для обсуждения охраны окружающей среды, парникового эффекта и вымирания видов',
  unlockCondition: null,
  vocabIds: [
    // 🌿 Ochrona środowiska
    'pl_211',  // środowisko naturalne
    'pl_212',  // zanieczyszczać
    'pl_213',  // zanieczyścić
    'pl_214',  // dewastować
    'pl_215',  // zdewastować
    'pl_216',  // niszczyć
    'pl_217',  // zniszczyć
    'pl_218',  // troszczyć się
    'pl_219',  // zatroszczyć się
    'pl_220',  // dbać
    'pl_221',  // zadbać
    'pl_222',  // chronić
    'pl_223',  // ochronić
    'pl_224',  // ochrona
    'pl_225',  // zapobiegać
    'pl_226',  // zapobiec
    'pl_227',  // zatruwać
    'pl_228',  // zatruć
    'pl_229',  // zatrucie
    'pl_230',  // trucizna
    'pl_231',  // trujący
    // 🦕 Wymieranie gatunków
    'pl_232',  // zagłada
    'pl_233',  // wymierać
    'pl_234',  // wymrzeć
    'pl_235',  // wymierający gatunek
    'pl_236',  // ginący gatunek
    'pl_237',  // wymarły gatunek
    'pl_238',  // już nieistniejący gatunek
    // 🌡️ Efekt cieplarniany
    'pl_239',  // efekt cieplarniany
    'pl_240',  // efekt szklarniowy
    'pl_241',  // ocieplenie klimatu Ziemi
    'pl_242',  // atmosfera
    'pl_243',  // powietrze
    'pl_244',  // dwutlenek węgla
    'pl_245',  // temperatura powierzchni Ziemi
    'pl_246',  // szklarnia
    'pl_247',  // zjawisko
    'pl_248',  // konsekwencja
    'pl_249',  // efekt
  ],
  sections: [
    {
      type: 'grammar',
      notes: [
        {
          title: 'Охрана окружающей среды',
          text: 'Ключевые глаголы для описания воздействия на природу:',
          examples: [
            { pl: 'chronić / ochronić przyrodę', ru: 'охранять / охранить природу' },
            { pl: 'dbać / zadbać o środowisko', ru: 'следить за окружающей средой' },
            { pl: 'troszczyć się o planetę', ru: 'заботиться о планете' },
            { pl: 'zanieczyszczać wodę', ru: 'загрязнять воду' },
            { pl: 'zatruwać powietrze', ru: 'отравлять воздух' },
            { pl: 'zapobiegać zanieczyszczeniu', ru: 'предотвращать загрязнение' },
          ],
        },
        {
          title: 'Парниковый эффект',
          text: 'Как говорят о глобальном потеплении на польском:',
          examples: [
            { pl: 'efekt cieplarniany (= szklarniowy)', ru: 'парниковый эффект (= тепличный)' },
            { pl: 'ocieplenie klimatu Ziemi', ru: 'потепление климата' },
            { pl: 'dwutlenek węgla (CO₂)', ru: 'диоксид углерода' },
            { pl: 'temperatura powierzchni Ziemi', ru: 'температура поверхности Земли' },
          ],
        },
        {
          title: 'Вымирание видов',
          text: 'Термины, связанные с исчезновением видов:',
          examples: [
            { pl: 'wymierać → wymarły gatunek', ru: 'вымирать → вымерший вид' },
            { pl: 'wymierający gatunek (= ginący gatunek)', ru: 'вымирающий (= исчезающий) вид' },
            { pl: 'zagłada gatunku', ru: 'гибель вида' },
          ],
        },
      ],
      tables: [],
    },
  ],
  verbList: [],
}

export const themes = [theme12OchronaSrodowiska]
export default theme12OchronaSrodowiska
