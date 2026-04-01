import { useState, useEffect, useCallback } from "react";

// ─── SM-2 Spaced Repetition Algorithm ────────────────────────────────────────
function sm2(card, quality) {
  // quality: 0=Again, 1=Hard, 2=Good, 3=Easy
  let { ease, interval, reps } = card;
  const q = [0, 2, 4, 5][quality]; // map to SM-2 scale

  if (q < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ease);
    reps += 1;
  }

  ease = Math.max(1.3, ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  const due = Date.now() + interval * 86400000;
  return { ease, interval, reps, due, lastReviewed: Date.now() };
}

// ─── Seed Vocabulary Database ─────────────────────────────────────────────────
const VOCAB = [
  // A1 - Foundation (frequency top 50)
  { id:1,  fr:"bonjour",      en:"hello",          ipa:"/bɔ̃.ʒuʁ/",    gender:null,  level:"A1", freq:1,  theme:"Greetings",  hint:"BON = good + JOUR = day → 'good day!'" },
  { id:2,  fr:"merci",        en:"thank you",       ipa:"/mɛʁ.si/",    gender:null,  level:"A1", freq:2,  theme:"Greetings",  hint:"Sounds like 'mercy' — begging for grace" },
  { id:3,  fr:"oui",          en:"yes",             ipa:"/wi/",         gender:null,  level:"A1", freq:3,  theme:"Basics",     hint:"Sounds like English 'we' — we agree!" },
  { id:4,  fr:"non",          en:"no",              ipa:"/nɔ̃/",        gender:null,  level:"A1", freq:4,  theme:"Basics",     hint:"Same as English 'non-' prefix" },
  { id:5,  fr:"le chat",      en:"the cat",         ipa:"/lə ʃa/",      gender:"m",   level:"A1", freq:8,  theme:"Animals",    hint:"Chat sounds like 'sha' — a cat shushing you" },
  { id:6,  fr:"la maison",    en:"the house",       ipa:"/la mɛ.zɔ̃/",  gender:"f",   level:"A1", freq:10, theme:"Home",       hint:"MAI = May + SON = sound → May the house be full of sound" },
  { id:7,  fr:"l'eau",        en:"water",           ipa:"/lo/",         gender:"f",   level:"A1", freq:12, theme:"Food",       hint:"Sounds like 'O' — draw an O, it's a water drop" },
  { id:8,  fr:"manger",       en:"to eat",          ipa:"/mɑ̃.ʒe/",     gender:null,  level:"A1", freq:15, theme:"Actions",    hint:"MAN-GER → a man germinates energy by eating" },
  { id:9,  fr:"dormir",       en:"to sleep",        ipa:"/dɔʁ.miʁ/",   gender:null,  level:"A1", freq:16, theme:"Actions",    hint:"DOR = dormant → dormant = sleeping" },
  { id:10, fr:"la femme",     en:"the woman",       ipa:"/la fam/",     gender:"f",   level:"A1", freq:7,  theme:"People",     hint:"FAM sounds like 'fame' — a famous woman" },
  { id:11, fr:"l'homme",      en:"the man",         ipa:"/lɔm/",        gender:"m",   level:"A1", freq:6,  theme:"People",     hint:"HOM → 'homo sapiens' = human" },
  { id:12, fr:"grand",        en:"big / tall",      ipa:"/ɡʁɑ̃/",       gender:null,  level:"A1", freq:20, theme:"Adjectives", hint:"Grand piano is BIG" },
  { id:13, fr:"petit",        en:"small",           ipa:"/pə.ti/",      gender:null,  level:"A1", freq:21, theme:"Adjectives", hint:"Petite → English borrowed this word!" },
  { id:14, fr:"rouge",        en:"red",             ipa:"/ʁuʒ/",        gender:null,  level:"A1", freq:30, theme:"Colors",     hint:"Rouge = red makeup. Moulin Rouge!" },
  { id:15, fr:"bleu",         en:"blue",            ipa:"/blø/",        gender:null,  level:"A1", freq:31, theme:"Colors",     hint:"Bleu cheese has blue veins!" },
  { id:16, fr:"parler",       en:"to speak",        ipa:"/paʁ.le/",     gender:null,  level:"A1", freq:18, theme:"Actions",    hint:"PAR → parliamentary speech = speaking" },
  { id:17, fr:"aller",        en:"to go",           ipa:"/a.le/",       gender:null,  level:"A1", freq:5,  theme:"Actions",    hint:"Allez! = Let's go! (heard in sports)" },
  { id:18, fr:"venir",        en:"to come",         ipa:"/və.niʁ/",     gender:null,  level:"A1", freq:9,  theme:"Actions",    hint:"VENI → 'Veni, vidi, vici' = I came..." },
  { id:19, fr:"le pain",      en:"bread",           ipa:"/lə pɛ̃/",      gender:"m",   level:"A1", freq:25, theme:"Food",       hint:"Sounds like 'pan' in Spanish → bread pan!" },
  { id:20, fr:"le vin",       en:"wine",            ipa:"/lə vɛ̃/",      gender:"m",   level:"A1", freq:28, theme:"Food",       hint:"VIN → 'vintage' comes from French wine!" },
  { id:21, fr:"beau",         en:"beautiful",       ipa:"/bo/",         gender:null,  level:"A1", freq:35, theme:"Adjectives", hint:"Beau is an English word for a handsome man!" },
  { id:22, fr:"maintenant",   en:"now",             ipa:"/mɛ̃t.nɑ̃/",   gender:null,  level:"A1", freq:22, theme:"Time",       hint:"MAIN = hand + TENANT = holding → holding time NOW" },
  { id:23, fr:"toujours",     en:"always",          ipa:"/tu.ʒuʁ/",     gender:null,  level:"A1", freq:23, theme:"Time",       hint:"TOUS = all + JOURS = days → every day, always" },
  { id:24, fr:"jamais",       en:"never",           ipa:"/ʒa.mɛ/",      gender:null,  level:"A1", freq:24, theme:"Time",       hint:"JAM = jammed shut → the door never opens" },
  { id:25, fr:"peut-être",    en:"maybe",           ipa:"/pø.tɛtʁ/",    gender:null,  level:"A1", freq:26, theme:"Basics",     hint:"PEUT = can + ÊTRE = be → 'can be' = maybe" },

  // A2 - Building blocks
  { id:26, fr:"comprendre",   en:"to understand",   ipa:"/kɔ̃.pʁɑ̃dʁ/",  gender:null,  level:"A2", freq:40, theme:"Actions",    hint:"COM + PRENDRE → to 'apprehend' mentally" },
  { id:27, fr:"savoir",       en:"to know (facts)", ipa:"/sa.vwaʁ/",    gender:null,  level:"A2", freq:41, theme:"Actions",    hint:"SAVOIR-FAIRE = know-how — practical knowledge" },
  { id:28, fr:"connaître",    en:"to know (people)",ipa:"/kɔ.nɛtʁ/",   gender:null,  level:"A2", freq:42, theme:"Actions",    hint:"CON-NAÎTRE → 'connoisseur' = person who knows!" },
  { id:29, fr:"la ville",     en:"the city",        ipa:"/la vil/",     gender:"f",   level:"A2", freq:45, theme:"Places",     hint:"VILLA → Roman city concept" },
  { id:30, fr:"le travail",   en:"work",            ipa:"/lə tʁa.vaj/", gender:"m",   level:"A2", freq:43, theme:"Work",       hint:"TRAVEL comes from travail → work was difficult journey" },
  { id:31, fr:"choisir",      en:"to choose",       ipa:"/ʃwa.ziʁ/",    gender:null,  level:"A2", freq:50, theme:"Actions",    hint:"CHOI → 'choice' in English!" },
  { id:32, fr:"difficile",    en:"difficult",       ipa:"/di.fi.sil/",  gender:null,  level:"A2", freq:55, theme:"Adjectives", hint:"Looks like 'difficult' — cognate!" },
  { id:33, fr:"facile",       en:"easy",            ipa:"/fa.sil/",     gender:null,  level:"A2", freq:56, theme:"Adjectives", hint:"FACILE = easy in English too (effortless)" },
  { id:34, fr:"souvent",      en:"often",           ipa:"/su.vɑ̃/",      gender:null,  level:"A2", freq:48, theme:"Time",       hint:"SOU-VENT → 'sous vent' = under the wind — it often blows" },
  { id:35, fr:"ensemble",     en:"together",        ipa:"/ɑ̃.sɑ̃bl/",    gender:null,  level:"A2", freq:52, theme:"Basics",     hint:"Ensemble = musical group playing TOGETHER!" },
  { id:36, fr:"perdre",       en:"to lose",         ipa:"/pɛʁdʁ/",      gender:null,  level:"A2", freq:58, theme:"Actions",    hint:"PERDU = lost (you've heard 'cherchez la femme perdue')" },
  { id:37, fr:"trouver",      en:"to find",         ipa:"/tʁu.ve/",     gender:null,  level:"A2", freq:59, theme:"Actions",    hint:"TROUVER → trouvère = medieval poet who 'found' songs" },
  { id:38, fr:"attendre",     en:"to wait",         ipa:"/a.tɑ̃dʁ/",    gender:null,  level:"A2", freq:60, theme:"Actions",    hint:"ATTEND in English used to mean 'wait for'" },
  { id:39, fr:"croire",       en:"to believe",      ipa:"/kʁwaʁ/",      gender:null,  level:"A2", freq:61, theme:"Mind",       hint:"CROIRE → 'creed' = what you believe" },
  { id:40, fr:"lire",         en:"to read",         ipa:"/liʁ/",        gender:null,  level:"A2", freq:62, theme:"Actions",    hint:"LIRE → 'legible' shares same Latin root" },
  { id:41, fr:"écrire",       en:"to write",        ipa:"/e.kʁiʁ/",     gender:null,  level:"A2", freq:63, theme:"Actions",    hint:"ÉCRIRE → 'scribe' = one who writes" },
  { id:42, fr:"la question",  en:"the question",    ipa:"/la kɛs.tjɔ̃/", gender:"f",   level:"A2", freq:65, theme:"Language",   hint:"Perfect cognate with English!" },
  { id:43, fr:"la réponse",   en:"the answer",      ipa:"/la ʁe.pɔ̃s/",  gender:"f",   level:"A2", freq:66, theme:"Language",   hint:"RÉPONSE → 'response' in English" },
  { id:44, fr:"penser",       en:"to think",        ipa:"/pɑ̃.se/",      gender:null,  level:"A2", freq:67, theme:"Mind",       hint:"PENSER → 'pensive' = deep in thought" },
  { id:45, fr:"sentir",       en:"to feel / smell", ipa:"/sɑ̃.tiʁ/",    gender:null,  level:"A2", freq:68, theme:"Senses",     hint:"SENTIR → 'sentiment' = what you feel" },
  { id:46, fr:"le chemin",    en:"the path / way",  ipa:"/lə ʃə.mɛ̃/",  gender:"m",   level:"A2", freq:70, theme:"Places",     hint:"CHEMIN → French roads called 'chemins'" },
  { id:47, fr:"la lumière",   en:"the light",       ipa:"/la ly.mjɛʁ/", gender:"f",   level:"A2", freq:72, theme:"Nature",     hint:"LUMIÈRE → 'luminous' = full of light. Lumière brothers invented cinema!" },
  { id:48, fr:"nouveau",      en:"new",             ipa:"/nu.vo/",      gender:null,  level:"A2", freq:73, theme:"Adjectives", hint:"NOUVEAU = new (Beaujolais Nouveau = new wine!)" },
  { id:49, fr:"propre",       en:"clean / own",     ipa:"/pʁɔpʁ/",      gender:null,  level:"A2", freq:74, theme:"Adjectives", hint:"PROPRE → 'proper' = clean and appropriate" },
  { id:50, fr:"libre",        en:"free",            ipa:"/libʁ/",       gender:null,  level:"A2", freq:75, theme:"Adjectives", hint:"LIBRE → 'liberty' = freedom!" },

  // B1 - Intermediate
  { id:51, fr:"la confiance", en:"trust / confidence", ipa:"/la kɔ̃.fjɑ̃s/", gender:"f", level:"B1", freq:80, theme:"Emotions", hint:"CONFIANCE → 'confidence' — the inner trust" },
  { id:52, fr:"la crainte",   en:"fear / dread",   ipa:"/la kʁɛ̃t/",    gender:"f",   level:"B1", freq:82, theme:"Emotions",   hint:"CRAINDRE = to fear → crainte = the fear itself" },
  { id:53, fr:"pourtant",     en:"yet / however",  ipa:"/puʁ.tɑ̃/",     gender:null,  level:"B1", freq:85, theme:"Connectors", hint:"POUR = for + TANT = so much → 'for all that, yet...'" },
  { id:54, fr:"quand même",   en:"anyway / still", ipa:"/kɑ̃ mɛm/",     gender:null,  level:"B1", freq:86, theme:"Connectors", hint:"MÊME = same → 'same as before, anyway'" },
  { id:55, fr:"en effet",     en:"indeed",         ipa:"/ɑ̃n‿ɛ.fɛ/",    gender:null,  level:"B1", freq:87, theme:"Connectors", hint:"EN EFFET = in effect → something is actually happening" },
  { id:56, fr:"la démarche",  en:"approach/process",ipa:"/la de.maʁʃ/", gender:"f",  level:"B1", freq:90, theme:"Abstract",   hint:"DEMARCHE → diplomatic 'demarche' = formal approach" },
  { id:57, fr:"se méfier",    en:"to distrust",    ipa:"/sə me.fje/",   gender:null,  level:"B1", freq:92, theme:"Mind",       hint:"MÉ = bad + FIER = trust → to mis-trust" },
  { id:58, fr:"résoudre",     en:"to solve",       ipa:"/ʁe.zudʁ/",    gender:null,  level:"B1", freq:93, theme:"Actions",    hint:"RÉSOUDRE → 'resolve' — to find a resolution" },
  { id:59, fr:"prévenir",     en:"to warn / prevent", ipa:"/pʁe.və.niʁ/", gender:null, level:"B1", freq:94, theme:"Actions", hint:"PRÉ = before + VENIR = come → coming before to warn" },
  { id:60, fr:"le comportement", en:"behavior",   ipa:"/lə kɔ̃.pɔʁt.mɑ̃/",gender:"m",level:"B1", freq:95, theme:"Abstract",  hint:"COMPORTER → 'comport oneself' = how you behave" },
  { id:61, fr:"l'enjeu",      en:"the stake / issue", ipa:"/lɑ̃.ʒø/",  gender:"m",   level:"B1", freq:96, theme:"Abstract",   hint:"EN JEU = in play → what's at stake in the game" },
  { id:62, fr:"désormais",    en:"from now on",    ipa:"/de.zɔʁ.mɛ/",  gender:null,  level:"B1", freq:97, theme:"Time",       hint:"DÈS = from + OR = now + MAIS = but → 'from this point on'" },
  { id:63, fr:"dès que",      en:"as soon as",     ipa:"/dɛ kə/",      gender:null,  level:"B1", freq:98, theme:"Connectors", hint:"DÈS = from (the moment) + QUE = that" },
  { id:64, fr:"se rendre compte", en:"to realize", ipa:"/sə ʁɑ̃dʁ kɔ̃t/", gender:null, level:"B1", freq:99, theme:"Mind",   hint:"RENDRE COMPTE = to render an account → accounting to yourself" },
  { id:65, fr:"la nuance",    en:"nuance / subtlety", ipa:"/la ny.ɑ̃s/", gender:"f",  level:"B1", freq:100,theme:"Abstract",   hint:"French gave 'nuance' to the whole world!" },
  { id:66, fr:"méconnaître",  en:"to misunderstand",ipa:"/me.kɔ.nɛtʁ/",gender:null,  level:"B1", freq:101,theme:"Mind",       hint:"MÉ + CONNAÎTRE → to badly know = misunderstand" },
  { id:67, fr:"aboutir",      en:"to lead to / result in", ipa:"/a.bu.tiʁ/", gender:null, level:"B1", freq:102, theme:"Actions", hint:"ABOUT = end + IR = to go → to go to the end/result" },
  { id:68, fr:"la mise en œuvre", en:"implementation", ipa:"/la miz ɑ̃ œvʁ/", gender:"f", level:"B1", freq:103, theme:"Work", hint:"MISE = putting + EN ŒUVRE = into work → 'put into operation'" },
  { id:69, fr:"tel que",      en:"such as",        ipa:"/tɛl kə/",     gender:null,  level:"B1", freq:104,theme:"Connectors", hint:"TEL → 'such' — like telling what type of example follows" },
  { id:70, fr:"parvenir",     en:"to manage to / reach", ipa:"/paʁ.və.niʁ/", gender:null, level:"B1", freq:105, theme:"Actions", hint:"PAR = through + VENIR = come → to come through successfully" },

  // B2 - Advanced
  { id:71, fr:"s'avérer",     en:"to prove to be / turn out", ipa:"/sa.ve.ʁe/", gender:null, level:"B2", freq:110, theme:"Abstract", hint:"AVÉRER → 'verify' — to become verified as true" },
  { id:72, fr:"l'ambiguïté",  en:"ambiguity",      ipa:"/lɑ̃.bi.ɡɥi.te/",gender:"f",  level:"B2", freq:112,theme:"Abstract",   hint:"Near-perfect cognate with English 'ambiguity'" },
  { id:73, fr:"déclencher",   en:"to trigger / set off", ipa:"/de.klɑ̃.ʃe/", gender:null, level:"B2", freq:113, theme:"Actions", hint:"DÉ = un + CLENCHE = latch → to 'un-latch', set off" },
  { id:74, fr:"préconiser",   en:"to advocate for", ipa:"/pʁe.kɔ.ni.ze/", gender:null, level:"B2", freq:114, theme:"Language", hint:"PRÉ + CONISER → to advise beforehand = advocate" },
  { id:75, fr:"la pertinence","en":"relevance",    ipa:"/la pɛʁ.ti.nɑ̃s/",gender:"f",  level:"B2", freq:115,theme:"Abstract",   hint:"PERTINENT → English 'pertinent' = relevant, on-point" },
  { id:76, fr:"atténuer",     en:"to mitigate / soften", ipa:"/a.te.nɥe/", gender:null, level:"B2", freq:116, theme:"Actions", hint:"ATTÉNUER → 'attenuate' = to weaken/soften a signal" },
  { id:77, fr:"l'essor",      en:"the rise / surge", ipa:"/lɛ.sɔʁ/",   gender:"m",   level:"B2", freq:117,theme:"Abstract",   hint:"ESSOR = 'taking flight' — a surge upward like a bird" },
  { id:78, fr:"mettre en exergue", en:"to highlight / emphasize", ipa:"/mɛtʁ ɑ̃n‿ɛɡ.zɛʁɡ/", gender:null, level:"B2", freq:118, theme:"Language", hint:"EXERGUE = outside the work (coin inscription) → put in prominent position" },
  { id:79, fr:"au détriment de", en:"at the expense of", ipa:"/o de.tʁi.mɑ̃ də/", gender:null, level:"B2", freq:119, theme:"Abstract", hint:"DÉTRIMENT → English 'detriment' = harm/damage" },
  { id:80, fr:"sans équivoque", en:"unequivocally",  ipa:"/sɑ̃z‿e.ki.vɔk/", gender:null, level:"B2", freq:120, theme:"Language", hint:"ÉQUIVOQUE → 'equivocal' → SANS = without → unambiguous" },
];

const THEMES = [...new Set(VOCAB.map(w => w.theme))];
const LEVELS = ["A1", "A2", "B1", "B2"];
const LEVEL_COLORS = { A1: "#4ade80", A2: "#60a5fa", B1: "#f59e0b", B2: "#f87171" };
const LEVEL_BG = { A1: "rgba(74,222,128,0.12)", A2: "rgba(96,165,250,0.12)", B1: "rgba(245,158,11,0.12)", B2: "rgba(248,113,113,0.12)" };

// ─── SRS State Manager ────────────────────────────────────────────────────────
function initCards() {
  return VOCAB.reduce((acc, w) => {
    acc[w.id] = { ease: 2.5, interval: 1, reps: 0, due: Date.now(), lastReviewed: null };
    return acc;
  }, {});
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function FrenchApp() {
  const [screen, setScreen] = useState("dashboard");
  const [cards, setCards] = useState(initCards);
  const [unlockedLevel, setUnlockedLevel] = useState("A1");
  const [streak, setStreak] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [studyQueue, setStudyQueue] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [assocWord, setAssocWord] = useState(null);
  const [userAssocs, setUserAssocs] = useState({});
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterTheme, setFilterTheme] = useState("All");
  const [notification, setNotification] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);

  // Auto-unlock levels based on mastery
  useEffect(() => {
    const a1Words = VOCAB.filter(w => w.level === "A1");
    const masteredA1 = a1Words.filter(w => cards[w.id].reps >= 3).length;
    const a2Words = VOCAB.filter(w => w.level === "A2");
    const masteredA2 = a2Words.filter(w => cards[w.id].reps >= 3).length;
    const a1Words2 = VOCAB.filter(w => w.level === "A1");
    const masteredA12 = a1Words2.filter(w => cards[w.id].reps >= 3).length;

    if (masteredA12 >= 15) {
      if (unlockedLevel === "A1") setUnlockedLevel("A2");
      const masteredA2count = VOCAB.filter(w => w.level === "A2" && cards[w.id].reps >= 3).length;
      if (masteredA2count >= 15) {
        if (unlockedLevel !== "B1" && unlockedLevel !== "B2") setUnlockedLevel("B1");
        const masteredB1 = VOCAB.filter(w => w.level === "B1" && cards[w.id].reps >= 3).length;
        if (masteredB1 >= 10) setUnlockedLevel("B2");
      }
    }
  }, [cards]);

  const getDueCards = useCallback(() => {
    const levelOrder = ["A1", "A2", "B1", "B2"];
    const maxIdx = levelOrder.indexOf(unlockedLevel);
    return VOCAB
      .filter(w => levelOrder.indexOf(w.level) <= maxIdx)
      .filter(w => cards[w.id].due <= Date.now())
      .sort((a, b) => cards[a.id].due - cards[b.id].due);
  }, [cards, unlockedLevel]);

  const getNewCards = useCallback(() => {
    const levelOrder = ["A1", "A2", "B1", "B2"];
    const maxIdx = levelOrder.indexOf(unlockedLevel);
    return VOCAB
      .filter(w => levelOrder.indexOf(w.level) <= maxIdx)
      .filter(w => cards[w.id].reps === 0)
      .sort((a, b) => a.freq - b.freq)
      .slice(0, 5);
  }, [cards, unlockedLevel]);

  const startStudy = () => {
    const due = getDueCards();
    const newC = getNewCards();
    const queue = [...due, ...newC.filter(c => !due.find(d => d.id === c.id))];
    if (queue.length === 0) {
      showNotification("🎉 All caught up! Come back later.", "success");
      return;
    }
    setStudyQueue(queue);
    setCurrentCard(queue[0]);
    setFlipped(false);
    setSessionStats({ correct: 0, total: 0 });
    setScreen("study");
  };

  const rateCard = (quality) => {
    const word = currentCard;
    const updated = sm2(cards[word.id], quality);
    const newCards = { ...cards, [word.id]: updated };
    setCards(newCards);

    const correct = quality >= 2;
    setSessionStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setTotalReviewed(t => t + 1);
    setReviewHistory(h => [...h.slice(-29), { wordId: word.id, quality, time: Date.now() }]);

    const remaining = studyQueue.slice(1);
    if (quality === 0) remaining.push(word); // Again → add to end
    setStudyQueue(remaining);

    if (remaining.length === 0) {
      setStreak(s => s + 1);
      showNotification(`✨ Session complete! ${sessionStats.total + 1} cards reviewed.`, "success");
      setScreen("dashboard");
    } else {
      setCurrentCard(remaining[0]);
      setFlipped(false);
    }
  };

  const showNotification = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getMastery = (level) => {
    const words = VOCAB.filter(w => w.level === level);
    const mastered = words.filter(w => cards[w.id].reps >= 3).length;
    return Math.round((mastered / words.length) * 100);
  };

  const levelOrder = ["A1", "A2", "B1", "B2"];
  const maxLevelIdx = levelOrder.indexOf(unlockedLevel);
  const filteredVocab = VOCAB.filter(w => {
    const lvlOk = filterLevel === "All" || w.level === filterLevel;
    const themeOk = filterTheme === "All" || w.theme === filterTheme;
    const unlocked = levelOrder.indexOf(w.level) <= maxLevelIdx;
    return lvlOk && themeOk && unlocked;
  });

  const dueCount = getDueCards().length;
  const newCount = getNewCards().length;

  return (
    <div style={styles.app}>
      {/* Notification */}
      {notification && (
        <div style={{ ...styles.notification, background: notification.type === "success" ? "#22c55e" : "#3b82f6" }}>
          {notification.msg}
        </div>
      )}

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>
          <span style={styles.navLogoFr}>FR</span>
          <span style={styles.navLogoText}>Français</span>
        </div>
        <div style={styles.navLinks}>
          {[
            { key: "dashboard", icon: "⌂", label: "Home" },
            { key: "study",     icon: "⚡", label: "Study", badge: dueCount + newCount },
            { key: "vocab",     icon: "📚", label: "Vocab" },
            { key: "assoc",     icon: "🧠", label: "Mnemonics" },
          ].map(({ key, icon, label, badge }) => (
            <button
              key={key}
              onClick={() => key === "study" ? startStudy() : setScreen(key)}
              style={{ ...styles.navBtn, ...(screen === key ? styles.navBtnActive : {}) }}
            >
              <span>{icon}</span>
              <span style={styles.navBtnLabel}>{label}</span>
              {badge > 0 && <span style={styles.badge}>{badge}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* Screens */}
      <main style={styles.main}>
        {screen === "dashboard" && <Dashboard cards={cards} streak={streak} totalReviewed={totalReviewed} dueCount={dueCount} newCount={newCount} getMastery={getMastery} unlockedLevel={unlockedLevel} startStudy={startStudy} reviewHistory={reviewHistory} />}
        {screen === "study" && currentCard && <StudyScreen word={currentCard} flipped={flipped} setFlipped={setFlipped} rateCard={rateCard} studyQueue={studyQueue} sessionStats={sessionStats} userAssoc={userAssocs[currentCard.id]} />}
        {screen === "vocab" && <VocabScreen vocab={filteredVocab} cards={cards} filterLevel={filterLevel} setFilterLevel={setFilterLevel} filterTheme={filterTheme} setFilterTheme={setFilterTheme} onSelectWord={w => { setAssocWord(w); setScreen("assoc"); }} unlockedLevel={unlockedLevel} />}
        {screen === "assoc" && <AssocScreen assocWord={assocWord} setAssocWord={setAssocWord} userAssocs={userAssocs} setUserAssocs={setUserAssocs} vocab={VOCAB.filter(w => levelOrder.indexOf(w.level) <= maxLevelIdx)} cards={cards} />}
      </main>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ cards, streak, totalReviewed, dueCount, newCount, getMastery, unlockedLevel, startStudy, reviewHistory }) {
  const levelOrder = ["A1", "A2", "B1", "B2"];
  const maxIdx = levelOrder.indexOf(unlockedLevel);
  const totalWords = VOCAB.filter(w => levelOrder.indexOf(w.level) <= maxIdx).length;
  const masteredWords = VOCAB.filter(w => levelOrder.indexOf(w.level) <= maxIdx && cards[w.id].reps >= 3).length;

  return (
    <div style={styles.screen}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroLeft}>
          <div style={styles.heroTag}>Bonjour! 🇫🇷</div>
          <h1 style={styles.heroTitle}>Votre parcours<br/><span style={styles.heroAccent}>français</span></h1>
          <div style={styles.heroStats}>
            <div style={styles.heroStat}><span style={styles.heroStatNum}>{streak}</span><span style={styles.heroStatLabel}>day streak</span></div>
            <div style={styles.heroStatDivider}/>
            <div style={styles.heroStat}><span style={styles.heroStatNum}>{totalReviewed}</span><span style={styles.heroStatLabel}>reviewed</span></div>
            <div style={styles.heroStatDivider}/>
            <div style={styles.heroStat}><span style={styles.heroStatNum}>{masteredWords}</span><span style={styles.heroStatLabel}>mastered</span></div>
          </div>
        </div>
        <button onClick={startStudy} style={styles.studyBtn}>
          <span style={styles.studyBtnIcon}>⚡</span>
          <div>
            <div style={styles.studyBtnMain}>Study Now</div>
            <div style={styles.studyBtnSub}>{dueCount} due · {newCount} new</div>
          </div>
        </button>
      </div>

      {/* Level Progress */}
      <div style={styles.sectionTitle}>Level Progression</div>
      <div style={styles.levelGrid}>
        {levelOrder.map((lvl, i) => {
          const isUnlocked = i <= maxIdx;
          const mastery = getMastery(lvl);
          const count = VOCAB.filter(w => w.level === lvl).length;
          const masteredC = VOCAB.filter(w => w.level === lvl && cards[w.id].reps >= 3).length;
          return (
            <div key={lvl} style={{ ...styles.levelCard, ...(isUnlocked ? { borderColor: LEVEL_COLORS[lvl] + "55", background: LEVEL_BG[lvl] } : styles.levelCardLocked) }}>
              <div style={styles.levelCardTop}>
                <span style={{ ...styles.levelBadge, background: isUnlocked ? LEVEL_COLORS[lvl] : "#444", color: isUnlocked ? "#000" : "#888" }}>{lvl}</span>
                {!isUnlocked && <span style={styles.lockIcon}>🔒</span>}
              </div>
              <div style={styles.levelCardWords}>{masteredC}/{count} words</div>
              <div style={styles.progressBarWrap}>
                <div style={{ ...styles.progressBar, width: `${isUnlocked ? mastery : 0}%`, background: LEVEL_COLORS[lvl] }} />
              </div>
              <div style={styles.levelCardPct}>{isUnlocked ? `${mastery}% mastered` : "Locked"}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      {reviewHistory.length > 0 && (
        <>
          <div style={styles.sectionTitle}>Recent Activity</div>
          <div style={styles.activityBar}>
            {Array.from({ length: 30 }, (_, i) => {
              const reviews = reviewHistory.filter(r => {
                const d = new Date(r.time);
                const today = new Date();
                const daysAgo = Math.floor((today - d) / 86400000);
                return daysAgo === (29 - i);
              });
              const hasReview = reviews.length > 0;
              const avgQ = hasReview ? reviews.reduce((s, r) => s + r.quality, 0) / reviews.length : 0;
              const color = !hasReview ? "rgba(255,255,255,0.07)" : avgQ >= 2 ? "#4ade80" : "#f87171";
              return <div key={i} style={{ ...styles.activityDot, background: color }} title={`${reviews.length} reviews`} />;
            })}
          </div>
        </>
      )}

      {/* Quick stats */}
      <div style={styles.statsRow}>
        {[
          { label: "Total Vocab", value: totalWords, icon: "📖" },
          { label: "Mastered", value: masteredWords, icon: "✅" },
          { label: "In Progress", value: VOCAB.filter(w => levelOrder.indexOf(w.level) <= maxIdx && cards[w.id].reps > 0 && cards[w.id].reps < 3).length, icon: "🔄" },
          { label: "Not Started", value: VOCAB.filter(w => levelOrder.indexOf(w.level) <= maxIdx && cards[w.id].reps === 0).length, icon: "🆕" },
        ].map(({ label, value, icon }) => (
          <div key={label} style={styles.statCard}>
            <div style={styles.statIcon}>{icon}</div>
            <div style={styles.statValue}>{value}</div>
            <div style={styles.statLabel}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Study Screen ─────────────────────────────────────────────────────────────
function StudyScreen({ word, flipped, setFlipped, rateCard, studyQueue, sessionStats, userAssoc }) {
  const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

  return (
    <div style={styles.studyScreen}>
      {/* Progress bar */}
      <div style={styles.studyTopBar}>
        <div style={styles.studyProgress}>
          <div style={styles.studyProgressTrack}>
            <div style={{ ...styles.studyProgressFill, width: `${accuracy}%` }} />
          </div>
          <span style={styles.studyProgressLabel}>{sessionStats.total} done · {studyQueue.length} left</span>
        </div>
        <div style={{ ...styles.levelBadge, background: LEVEL_COLORS[word.level], color: "#000", fontSize: 11 }}>{word.level}</div>
      </div>

      {/* Card */}
      <div style={styles.cardWrap} onClick={() => !flipped && setFlipped(true)}>
        <div style={{ ...styles.flashcard, ...(flipped ? styles.flashcardFlipped : {}) }}>
          {/* Front */}
          <div style={styles.cardFront}>
            <div style={styles.cardTheme}>{word.theme}</div>
            <div style={styles.cardFrench}>{word.fr}</div>
            {word.gender && <div style={styles.cardGender}>{word.gender === "m" ? "masculine · le/un" : "feminine · la/une"}</div>}
            <div style={styles.cardIpa}>{word.ipa}</div>
            <div style={styles.cardTapHint}>tap to reveal →</div>
          </div>
          {/* Back */}
          <div style={styles.cardBack}>
            <div style={styles.cardEnglish}>{word.en}</div>
            <div style={styles.cardFrenchSmall}>{word.fr}</div>
            <div style={styles.cardHintBox}>
              <div style={styles.cardHintLabel}>💡 Memory hook</div>
              <div style={styles.cardHint}>{userAssoc || word.hint}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div style={styles.ratingWrap}>
          <div style={styles.ratingLabel}>How well did you know this?</div>
          <div style={styles.ratingBtns}>
            {[
              { quality: 0, label: "Again",  sub: "< 1 min", color: "#ef4444" },
              { quality: 1, label: "Hard",   sub: "~10 min", color: "#f97316" },
              { quality: 2, label: "Good",   sub: "1 day",   color: "#3b82f6" },
              { quality: 3, label: "Easy",   sub: "4 days",  color: "#22c55e" },
            ].map(({ quality, label, sub, color }) => (
              <button key={quality} onClick={() => rateCard(quality)} style={{ ...styles.ratingBtn, borderColor: color, color }}>
                <span style={styles.ratingBtnMain}>{label}</span>
                <span style={styles.ratingBtnSub}>{sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Vocab Explorer ───────────────────────────────────────────────────────────
function VocabScreen({ vocab, cards, filterLevel, setFilterLevel, filterTheme, setFilterTheme, onSelectWord, unlockedLevel }) {
  const [search, setSearch] = useState("");
  const filtered = vocab.filter(w =>
    w.fr.toLowerCase().includes(search.toLowerCase()) ||
    w.en.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.screen}>
      <div style={styles.screenHeader}>
        <h2 style={styles.screenTitle}>Vocabulary Explorer</h2>
        <div style={styles.filterRow}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search words..."
            style={styles.searchInput}
          />
          <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={styles.select}>
            <option value="All">All Levels</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filterTheme} onChange={e => setFilterTheme(e.target.value)} style={styles.select}>
            <option value="All">All Themes</option>
            {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.vocabGrid}>
        {filtered.map(word => {
          const card = cards[word.id];
          const mastered = card.reps >= 3;
          const inProgress = card.reps > 0 && card.reps < 3;
          return (
            <div key={word.id} style={{ ...styles.vocabCard, borderColor: LEVEL_COLORS[word.level] + "44" }} onClick={() => onSelectWord(word)}>
              <div style={styles.vocabCardTop}>
                <span style={{ ...styles.levelBadge, background: LEVEL_COLORS[word.level], color: "#000", fontSize: 10 }}>{word.level}</span>
                <span style={styles.vocabStatus}>{mastered ? "✅" : inProgress ? "🔄" : "🆕"}</span>
              </div>
              <div style={styles.vocabFr}>{word.fr}</div>
              <div style={styles.vocabEn}>{word.en}</div>
              <div style={styles.vocabIpa}>{word.ipa}</div>
              <div style={styles.vocabTheme}>{word.theme}</div>
              <div style={styles.vocabReps}>Rep {card.reps} · EF {card.ease.toFixed(1)}</div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div style={styles.empty}>No words found. Try adjusting filters.</div>}
    </div>
  );
}

// ─── Associations / Mnemonics Screen ─────────────────────────────────────────
function AssocScreen({ assocWord, setAssocWord, userAssocs, setUserAssocs, vocab, cards }) {
  const [input, setInput] = useState("");
  const [selectedWord, setSelectedWord] = useState(assocWord || vocab[0]);
  const [tab, setTab] = useState("browse");

  useEffect(() => {
    if (assocWord) { setSelectedWord(assocWord); setTab("edit"); }
  }, [assocWord]);

  useEffect(() => {
    setInput(userAssocs[selectedWord?.id] || "");
  }, [selectedWord, userAssocs]);

  const saveAssoc = () => {
    if (selectedWord) {
      setUserAssocs(a => ({ ...a, [selectedWord.id]: input }));
      setAssocWord(null);
      setTab("browse");
    }
  };

  const methodColors = ["#60a5fa", "#f59e0b", "#4ade80", "#f87171", "#a78bfa"];
  const methods = [
    { title: "Phonetic Hook", desc: "Find an English word that sounds like part of the French word", icon: "🔊", example: 'merci → "mercy" (begging for grace)' },
    { title: "Visual Image",  desc: "Create a vivid mental image that connects sound to meaning", icon: "🖼️", example: '"chat" (cat) — imagine a cat shushing you: "shhh!"' },
    { title: "Etymology",     desc: "Trace the word back to its Latin or Greek root", icon: "🏛️", example: '"dormir" → dormant → sleeping/inactive' },
    { title: "Story Link",    desc: "Build a mini story that encodes the French word in context", icon: "📖", example: '"aller" (to go) — "Allez!" shouts the coach — let\'s go!' },
    { title: "Cognate Map",   desc: "Link to an English word that shares a common ancestor", icon: "🔗", example: '"comprendre" → "comprehend" — to comprehend is to understand' },
  ];

  return (
    <div style={styles.screen}>
      <h2 style={styles.screenTitle}>Mnemonic Builder</h2>
      <p style={styles.screenSub}>Create memory associations that make French words unforgettable</p>

      <div style={styles.tabs}>
        {["browse", "edit", "guide"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
            {{ browse: "Browse Mnemonics", edit: "Build / Edit", guide: "Association Guide" }[t]}
          </button>
        ))}
      </div>

      {tab === "browse" && (
        <div style={styles.assocGrid}>
          {vocab.slice(0, 40).map(word => {
            const hasCustom = !!userAssocs[word.id];
            return (
              <div key={word.id} style={{ ...styles.assocCard, borderColor: hasCustom ? "#4ade80" : "#ffffff1a" }} onClick={() => { setSelectedWord(word); setTab("edit"); }}>
                <div style={styles.assocCardTop}>
                  <span style={{ ...styles.levelBadge, background: LEVEL_COLORS[word.level], color: "#000", fontSize: 10 }}>{word.level}</span>
                  {hasCustom && <span style={{ color: "#4ade80", fontSize: 11 }}>✏️ custom</span>}
                </div>
                <div style={styles.assocFr}>{word.fr}</div>
                <div style={styles.assocEn}>{word.en}</div>
                <div style={styles.assocHint}>{userAssocs[word.id] || word.hint}</div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "edit" && selectedWord && (
        <div style={styles.assocEditor}>
          <div style={styles.assocEditorCard}>
            <span style={{ ...styles.levelBadge, background: LEVEL_COLORS[selectedWord.level], color: "#000" }}>{selectedWord.level}</span>
            <div style={styles.assocEditorFr}>{selectedWord.fr}</div>
            <div style={styles.assocEditorEn}>{selectedWord.en}</div>
            <div style={styles.assocEditorIpa}>{selectedWord.ipa}</div>
          </div>

          <div style={styles.assocEditorSection}>
            <div style={styles.assocEditorLabel}>📖 Built-in memory hook</div>
            <div style={styles.assocEditorDefault}>{selectedWord.hint}</div>
          </div>

          <div style={styles.assocEditorSection}>
            <div style={styles.assocEditorLabel}>✏️ Your custom mnemonic</div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Write your own memory hook here... What image, story, or sound connection will make this word stick?"
              style={styles.assocTextarea}
            />
            <div style={styles.assocBtnRow}>
              <button onClick={saveAssoc} style={styles.saveBtn}>Save Mnemonic</button>
              {userAssocs[selectedWord.id] && (
                <button onClick={() => { setUserAssocs(a => { const n = {...a}; delete n[selectedWord.id]; return n; }); setInput(""); }} style={styles.clearBtn}>
                  Clear Custom
                </button>
              )}
            </div>
          </div>

          <div style={styles.assocEditorLabel}>🗂️ Browse other words</div>
          <div style={styles.wordPickerGrid}>
            {vocab.slice(0, 20).map(w => (
              <button key={w.id} onClick={() => setSelectedWord(w)} style={{ ...styles.wordPickerBtn, borderColor: selectedWord.id === w.id ? LEVEL_COLORS[w.level] : "transparent", background: selectedWord.id === w.id ? LEVEL_BG[w.level] : "rgba(255,255,255,0.04)" }}>
                {w.fr}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "guide" && (
        <div style={styles.guideGrid}>
          {methods.map((m, i) => (
            <div key={m.title} style={{ ...styles.guideCard, borderColor: methodColors[i] + "44" }}>
              <div style={styles.guideIcon}>{m.icon}</div>
              <div style={{ ...styles.guideTitle, color: methodColors[i] }}>{m.title}</div>
              <div style={styles.guideDesc}>{m.desc}</div>
              <div style={styles.guideExample}>{m.example}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0a0f",
  surface: "#13131a",
  surfaceHover: "#1a1a24",
  border: "rgba(255,255,255,0.08)",
  text: "#e8e8f0",
  muted: "#8888a8",
  accent: "#c084fc",
  accentGlow: "rgba(192,132,252,0.15)",
};

const styles = {
  app: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column" },
  nav: { background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, height: 56 },
  navLogo: { display: "flex", alignItems: "center", gap: 8 },
  navLogoFr: { background: "linear-gradient(135deg, #002395, #FFFFFF, #ED2939)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 900, fontSize: 20, letterSpacing: 1 },
  navLogoText: { fontWeight: 700, fontSize: 15, color: C.text, letterSpacing: 0.5 },
  navLinks: { display: "flex", gap: 4 },
  navBtn: { background: "none", border: "none", color: C.muted, cursor: "pointer", padding: "6px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 13, transition: "all 0.15s", position: "relative" },
  navBtnActive: { background: C.accentGlow, color: C.accent },
  navBtnLabel: { fontWeight: 500 },
  badge: { background: "#ef4444", color: "#fff", borderRadius: 999, padding: "1px 5px", fontSize: 10, fontWeight: 700, minWidth: 16, textAlign: "center" },
  main: { flex: 1, overflowY: "auto" },
  screen: { maxWidth: 900, margin: "0 auto", padding: "24px 20px" },
  notification: { position: "fixed", top: 60, right: 20, zIndex: 999, padding: "10px 18px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", animation: "fadeIn 0.2s ease" },

  // Dashboard
  hero: { background: `linear-gradient(135deg, #1a0a2e 0%, #0f172a 100%)`, borderRadius: 16, padding: "32px 28px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${C.border}`, flexWrap: "wrap", gap: 20 },
  heroLeft: { flex: 1 },
  heroTag: { color: C.accent, fontWeight: 600, fontSize: 13, marginBottom: 8, letterSpacing: 1 },
  heroTitle: { fontSize: 30, fontWeight: 800, lineHeight: 1.15, margin: "0 0 18px", color: "#fff" },
  heroAccent: { background: "linear-gradient(90deg, #c084fc, #818cf8)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroStats: { display: "flex", alignItems: "center", gap: 0 },
  heroStat: { display: "flex", flexDirection: "column", paddingRight: 20 },
  heroStatNum: { fontSize: 26, fontWeight: 800, color: "#fff" },
  heroStatLabel: { fontSize: 11, color: C.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 },
  heroStatDivider: { width: 1, height: 36, background: C.border, marginRight: 20 },
  studyBtn: { background: "linear-gradient(135deg, #7c3aed, #4f46e5)", border: "none", borderRadius: 14, padding: "14px 22px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 4px 20px rgba(124,58,237,0.4)", transition: "transform 0.15s, box-shadow 0.15s", flexShrink: 0 },
  studyBtnIcon: { fontSize: 24 },
  studyBtnMain: { fontWeight: 800, fontSize: 16 },
  studyBtnSub: { fontSize: 12, opacity: 0.75, fontWeight: 400 },

  sectionTitle: { fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 12, marginTop: 24 },
  levelGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 8 },
  levelCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", transition: "border-color 0.2s" },
  levelCardLocked: { background: "rgba(255,255,255,0.02)", border: `1px solid rgba(255,255,255,0.05)` },
  levelCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  levelBadge: { borderRadius: 6, padding: "2px 8px", fontWeight: 800, fontSize: 12, letterSpacing: 0.5 },
  lockIcon: { fontSize: 14 },
  levelCardWords: { fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 },
  progressBarWrap: { background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 5, overflow: "hidden", marginBottom: 6 },
  progressBar: { height: "100%", borderRadius: 4, transition: "width 0.5s ease" },
  levelCardPct: { fontSize: 11, color: C.muted, fontWeight: 500 },

  activityBar: { display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 20 },
  activityDot: { width: 14, height: 14, borderRadius: 3 },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 8 },
  statCard: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 12px", textAlign: "center" },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: 800, color: C.text },
  statLabel: { fontSize: 11, color: C.muted, fontWeight: 500, marginTop: 2 },

  // Study
  studyScreen: { maxWidth: 600, margin: "0 auto", padding: "20px 20px 100px" },
  studyTopBar: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  studyProgress: { flex: 1 },
  studyProgressTrack: { background: "rgba(255,255,255,0.08)", borderRadius: 6, height: 6, overflow: "hidden", marginBottom: 4 },
  studyProgressFill: { height: "100%", background: "linear-gradient(90deg, #4ade80, #22d3ee)", borderRadius: 6, transition: "width 0.4s ease" },
  studyProgressLabel: { fontSize: 12, color: C.muted },

  cardWrap: { perspective: 1000, cursor: "pointer", userSelect: "none" },
  flashcard: { position: "relative", minHeight: 300, transition: "transform 0.5s ease", transformStyle: "preserve-3d" },
  flashcardFlipped: { transform: "rotateY(180deg)" },
  cardFront: { backfaceVisibility: "hidden", position: "absolute", width: "100%", minHeight: 300, background: "linear-gradient(135deg, #13131a, #1a1a2e)", border: `1px solid rgba(192,132,252,0.2)`, borderRadius: 18, padding: "28px 28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxSizing: "border-box" },
  cardBack: { backfaceVisibility: "hidden", position: "absolute", width: "100%", minHeight: 300, background: "linear-gradient(135deg, #0f1a2e, #1a1a2e)", border: `1px solid rgba(96,165,250,0.25)`, borderRadius: 18, padding: "28px 28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "rotateY(180deg)", boxSizing: "border-box" },
  cardTheme: { fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  cardFrench: { fontSize: 44, fontWeight: 800, color: "#fff", textAlign: "center", letterSpacing: -1 },
  cardGender: { fontSize: 13, color: C.accent, fontWeight: 600, marginTop: 8 },
  cardIpa: { fontSize: 15, color: C.muted, marginTop: 6, fontFamily: "monospace" },
  cardTapHint: { fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 24, fontStyle: "italic" },
  cardEnglish: { fontSize: 32, fontWeight: 800, color: "#60a5fa", textAlign: "center", marginBottom: 10 },
  cardFrenchSmall: { fontSize: 20, color: "rgba(255,255,255,0.4)", marginBottom: 18, fontStyle: "italic" },
  cardHintBox: { background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 16px", width: "100%", boxSizing: "border-box" },
  cardHintLabel: { fontSize: 11, color: C.accent, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  cardHint: { fontSize: 14, color: C.muted, lineHeight: 1.5 },

  ratingWrap: { marginTop: 24 },
  ratingLabel: { fontSize: 13, color: C.muted, textAlign: "center", marginBottom: 12 },
  ratingBtns: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 },
  ratingBtn: { background: C.surface, border: "2px solid", borderRadius: 10, padding: "10px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transition: "all 0.15s" },
  ratingBtnMain: { fontWeight: 800, fontSize: 14 },
  ratingBtnSub: { fontSize: 10, opacity: 0.7 },

  // Vocab
  screenHeader: { marginBottom: 20 },
  screenTitle: { fontSize: 22, fontWeight: 800, marginBottom: 12, color: C.text },
  screenSub: { color: C.muted, fontSize: 14, marginBottom: 20, marginTop: -8 },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  searchInput: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, flex: 1, minWidth: 140 },
  select: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13 },
  vocabGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 },
  vocabCard: { background: C.surface, border: `1px solid`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", transition: "background 0.15s" },
  vocabCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  vocabFr: { fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 4 },
  vocabEn: { fontSize: 12, color: "#60a5fa", marginBottom: 4, fontWeight: 500 },
  vocabIpa: { fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 4 },
  vocabTheme: { fontSize: 10, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  vocabReps: { fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" },
  vocabStatus: { fontSize: 14 },
  empty: { textAlign: "center", color: C.muted, padding: "40px 0", fontSize: 14 },

  // Associations
  tabs: { display: "flex", gap: 6, marginBottom: 20, background: C.surface, padding: 4, borderRadius: 10, border: `1px solid ${C.border}`, width: "fit-content" },
  tab: { background: "none", border: "none", color: C.muted, cursor: "pointer", padding: "7px 14px", borderRadius: 7, fontSize: 13, fontWeight: 500, transition: "all 0.15s" },
  tabActive: { background: C.accentGlow, color: C.accent, fontWeight: 700 },
  assocGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 },
  assocCard: { background: C.surface, border: `1px solid`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", transition: "all 0.15s" },
  assocCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  assocFr: { fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 },
  assocEn: { fontSize: 13, color: "#60a5fa", fontWeight: 500, marginBottom: 8 },
  assocHint: { fontSize: 11, color: C.muted, lineHeight: 1.5, fontStyle: "italic" },

  assocEditor: { maxWidth: 600 },
  assocEditorCard: { background: "linear-gradient(135deg, #1a0a2e, #0f172a)", border: `1px solid rgba(192,132,252,0.2)`, borderRadius: 14, padding: "20px 24px", marginBottom: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  assocEditorFr: { fontSize: 36, fontWeight: 800, color: "#fff", marginTop: 8 },
  assocEditorEn: { fontSize: 18, color: "#60a5fa", fontWeight: 600 },
  assocEditorIpa: { fontSize: 14, color: C.muted, fontFamily: "monospace" },
  assocEditorSection: { marginBottom: 18 },
  assocEditorLabel: { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: C.muted, marginBottom: 8 },
  assocEditorDefault: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: C.muted, lineHeight: 1.6, fontStyle: "italic" },
  assocTextarea: { width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.text, fontSize: 14, lineHeight: 1.6, minHeight: 100, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", outline: "none" },
  assocBtnRow: { display: "flex", gap: 10, marginTop: 10 },
  saveBtn: { background: "linear-gradient(135deg, #7c3aed, #4f46e5)", border: "none", borderRadius: 8, padding: "10px 20px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 },
  clearBtn: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 16px", color: C.muted, fontWeight: 600, cursor: "pointer", fontSize: 14 },
  wordPickerGrid: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 },
  wordPickerBtn: { background: "rgba(255,255,255,0.04)", border: "2px solid", borderRadius: 6, padding: "5px 10px", color: C.text, cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s" },

  guideGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 },
  guideCard: { background: C.surface, border: `1px solid`, borderRadius: 12, padding: "18px 18px" },
  guideIcon: { fontSize: 24, marginBottom: 10 },
  guideTitle: { fontWeight: 800, fontSize: 14, marginBottom: 6 },
  guideDesc: { fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 10 },
  guideExample: { background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: "8px 10px", fontSize: 12, color: "rgba(255,255,255,0.5)", fontStyle: "italic", lineHeight: 1.5 },
};
