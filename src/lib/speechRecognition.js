// Web Speech API - recognition
export function createRecognizer({ onResult, onEnd, onError, lang = "en-US" } = {}) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = lang;
  r.interimResults = true;
  r.continuous = false;
  r.onresult = (e) => {
    let interim = "", final = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += t; else interim += t;
    }
    onResult && onResult({ interim, final });
  };
  r.onend = () => onEnd && onEnd();
  r.onerror = (e) => onError && onError(e);
  return r;
}

export function speechSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}