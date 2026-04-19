// Browser Web Speech API helpers - no external credits
let currentUtterance = null;

export function speak(text, { rate = 1, pitch = 1, voiceName } = {}) {
  if (!("speechSynthesis" in window)) return null;
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  u.pitch = pitch;
  const voices = window.speechSynthesis.getVoices();
  if (voiceName) {
    const v = voices.find((v) => v.name === voiceName);
    if (v) u.voice = v;
  } else {
    // Prefer a natural English voice
    const preferred = voices.find((v) => /Google|Samantha|Natural|Neural/i.test(v.name) && v.lang.startsWith("en"));
    if (preferred) u.voice = preferred;
  }
  currentUtterance = u;
  window.speechSynthesis.speak(u);
  return u;
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

export function pauseSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.pause();
}

export function resumeSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.resume();
}

export function isSpeaking() {
  return "speechSynthesis" in window && window.speechSynthesis.speaking;
}

export function getVoices() {
  if (!("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices();
}