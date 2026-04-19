import { StudyMaterial, Quiz, Flashcard, QuizAttempt, StudySession } from '@/api/entities';
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, Volume2, Loader2, MessageSquare } from "lucide-react";
import SectionHeader from "@/components/common/SectionHeader";
import EmptyState from "@/components/common/EmptyState";
import { createRecognizer, speechSupported } from "@/lib/speechRecognition";
import { speak, stopSpeaking } from "@/lib/tts";
import { askAboutMaterial } from "@/lib/ai";

export default function VoiceQA() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("material") || "";
  const [materialId, setMaterialId] = useState(initial);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const recRef = useRef(null);
  const scrollRef = useRef(null);

  const { data: materials = [] } = useQuery({
    queryKey: ["materials"],
    queryFn: () => StudyMaterial.list("-created_at", 200),
  });

  const material = materials.find((m) => m.id === materialId);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, thinking]);

  const startListening = () => {
    if (!speechSupported()) { alert("Speech recognition is not supported in this browser."); return; }
    const r = createRecognizer({
      onResult: ({ interim, final }) => setInput((final || interim).trim()),
      onEnd: () => setListening(false),
      onError: () => setListening(false),
    });
    if (!r) return;
    recRef.current = r;
    r.start();
    setListening(true);
  };
  const stopListening = () => { recRef.current?.stop(); setListening(false); };

  const send = async () => {
    if (!input.trim() || !material) return;
    const q = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setThinking(true);
    try {
      const ans = await askAboutMaterial(material.content, q);
      setMessages((m) => [...m, { role: "assistant", content: ans }]);
      speak(ans);
      await StudySession.create({
        activity_type: "voice_qa",
        subject: material.subject,
        duration_minutes: 1,
        material_id: material.id,
      });
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't answer that right now." }]);
    } finally {
      setThinking(false);
    }
  };

  const pickMaterial = (id) => { setMaterialId(id); setMessages([]); stopSpeaking(); setParams({ material: id }, { replace: true }); };

  return (
    <div>
      <SectionHeader
        eyebrow="Voice Q&A tutor"
        title="Ask your material anything."
        description="Speak or type questions about your study material. Mine will answer, and read it back to you."
        action={
          <Select value={materialId} onValueChange={pickMaterial}>
            <SelectTrigger className="w-64 rounded-full">
              <SelectValue placeholder="Choose a material…" />
            </SelectTrigger>
            <SelectContent>
              {materials.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      {!material ? (
        <EmptyState
          icon={MessageSquare}
          title="Pick a material to begin"
          description="Select any study material from the dropdown above and start asking questions."
        />
      ) : (
        <div className="max-w-3xl mx-auto bg-card border border-border/60 rounded-3xl p-6 deckle-edge">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/60">
            <Volume2 className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">{material.title}</span>
            <span className="text-xs text-muted-foreground ml-auto">{material.subject}</span>
          </div>

          <div ref={scrollRef} className="min-h-[320px] max-h-[480px] overflow-y-auto space-y-4 pr-1 mb-5">
            {messages.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <p className="font-serif italic text-lg mb-2">"What would you like to understand?"</p>
                <p className="text-xs">Try: "Explain the main idea in simple terms" or "Give me 3 examples of…"</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={listening ? stopListening : startListening}
              variant={listening ? "destructive" : "outline"}
              size="icon"
              className="rounded-full shrink-0"
              title={listening ? "Stop" : "Start voice input"}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={listening ? "Listening…" : "Type or speak your question"}
              className="rounded-full"
            />
            <Button onClick={send} disabled={!input.trim() || thinking} className="rounded-full shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
