import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Square, Headphones, Volume2 } from "lucide-react";
import { speak, stopSpeaking, pauseSpeaking, resumeSpeaking, getVoices } from "@/lib/tts";

export default function AudioSummary({ script, title }) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const load = () => {
      const v = getVoices();
      setVoices(v);
      const pref = v.find((x) => /Samantha|Google.*English|Natural/i.test(x.name)) || v.find((x) => x.lang?.startsWith("en"));
      if (pref) setVoiceName(pref.name);
    };
    load();
    if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = load;
    return () => stopSpeaking();
  }, []);

  const handlePlay = () => {
    if (paused) {
      resumeSpeaking();
      setPaused(false);
      setPlaying(true);
      return;
    }
    const u = speak(script || "No audio script available.", { rate, voiceName });
    if (!u) {
      alert("Your browser doesn't support speech synthesis.");
      return;
    }
    ref.current = u;
    setPlaying(true);
    setPaused(false);
    u.onend = () => { setPlaying(false); setPaused(false); };
  };
  const handlePause = () => { pauseSpeaking(); setPaused(true); setPlaying(false); };
  const handleStop = () => { stopSpeaking(); setPlaying(false); setPaused(false); };

  if (!script) {
    return (
      <div className="text-sm text-muted-foreground italic">Audio script not available for this material.</div>
    );
  }

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 deckle-edge">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center">
          <Headphones className="w-5 h-5 text-accent" />
        </div>
        <div>
          <div className="font-serif text-lg leading-tight">Spoken summary</div>
          <div className="text-xs text-muted-foreground">A ~2 minute narrated recap of "{title}"</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {!playing ? (
          <Button onClick={handlePlay} className="rounded-full"><Play className="w-4 h-4 mr-1.5" />{paused ? "Resume" : "Play"}</Button>
        ) : (
          <Button onClick={handlePause} variant="secondary" className="rounded-full"><Pause className="w-4 h-4 mr-1.5" />Pause</Button>
        )}
        <Button onClick={handleStop} variant="ghost" size="icon" className="rounded-full"><Square className="w-4 h-4" /></Button>

        <div className="flex items-center gap-2 ml-auto">
          <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground tabular-nums w-10">{rate.toFixed(1)}×</span>
          <Slider value={[rate]} onValueChange={(v) => setRate(v[0])} min={0.6} max={1.6} step={0.1} className="w-28" />
        </div>
      </div>

      {voices.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Voice:</span>
          <select
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            className="bg-transparent border border-border rounded-md px-2 py-1 text-foreground max-w-[240px]"
          >
            {voices.filter((v) => v.lang?.startsWith("en")).map((v) => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-5 border-t border-border/60 pt-5">
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">Read transcript</summary>
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap font-serif">{script}</p>
        </details>
      </div>
    </div>
  );
}