// Cache voices by language prefix
const cachedVoices = {}

function findVoice(langPrefix) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  if (cachedVoices[langPrefix]) return cachedVoices[langPrefix]
  const voices = window.speechSynthesis.getVoices()
  // Try exact match first, then prefix match
  let voice = voices.find(v => v.lang === langPrefix) ||
              voices.find(v => v.lang.startsWith(langPrefix.split('-')[0])) ||
              null
  cachedVoices[langPrefix] = voice
  return voice
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Clear cache when voices change (can happen on first load)
    Object.keys(cachedVoices).forEach(key => delete cachedVoices[key])
  }
}

export function speak(text, lang = 'fr-FR') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const trimmed = typeof text === 'string' ? text.trim() : ''
  if (!trimmed) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(trimmed)
  utterance.lang = lang
  utterance.rate = 0.85
  const voice = findVoice(lang)
  if (voice) utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
}

export function isSpeechAvailable() {
  return typeof window !== 'undefined' && !!window.speechSynthesis
}
