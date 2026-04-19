import { StudyMaterial, Quiz, Flashcard, QuizAttempt, StudySession } from '@/api/entities';
import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, Check, RotateCcw, Sparkles, Flame } from "lucide-react";
import SectionHeader from "@/components/common/SectionHeader";
import EmptyState from "@/components/common/EmptyState";
import FlipCard from "@/components/flashcards/FlipCard";
import { sm2, isDue } from "@/lib/spacedRepetition";
import { useAuth } from "@/lib/AuthContext";

export default function Flashcards() {
  const qc = useQueryClient();
  const { currentUser } = useAuth();
  const email = currentUser?.email;
  const [subject, setSubject] = useState("all");
  const [flipped, setFlipped] = useState(false);
  const [idx, setIdx] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["flashcards", email],
    queryFn: () => Flashcard.filter({ created_by: email }, "-created_at", 500),
    enabled: !!email,
  });

  const subjects = useMemo(() => Array.from(new Set(cards.map((c) => c.subject).filter(Boolean))), [cards]);

  const deck = useMemo(() => {
    let filtered = cards;
    if (subject !== "all") filtered = filtered.filter((c) => c.subject === subject);
    return filtered.filter(isDue);
  }, [cards, subject]);

  const current = deck[idx];

  const rate = async (quality) => {
    if (!current) return;
    const update = sm2(current, quality);
    await Flashcard.update(current.id, update);
    await StudySession.create({
      activity_type: "flashcard",
      subject: current.subject,
      duration_minutes: 1,
      material_id: current.material_id,
    });
    setSessionCount((s) => s + 1);
    setFlipped(false);
    if (idx + 1 >= deck.length) {
      qc.invalidateQueries({ queryKey: ["flashcards", email] });
      setIdx(0);
    } else {
      setIdx((i) => i + 1);
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Spaced repetition"
        title="Flashcards, reviewed."
        description="Rate your recall on each card. Mine schedules the next review for the perfect moment you're about to forget."
        action={
          <div className="flex items-center gap-2">
            {subjects.length > 0 && (
              <Select value={subject} onValueChange={(v) => { setSubject(v); setIdx(0); }}>
                <SelectTrigger className="w-40 rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-6 mb-6 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Layers className="w-4 h-4" /> {deck.length} due
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Flame className="w-4 h-4 text-accent" /> {sessionCount} reviewed this session
        </span>
      </div>

      {isLoading ? (
        <div className="h-96 rounded-3xl bg-secondary/60 animate-pulse" />
      ) : cards.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No flashcards yet"
          description="Open a material and generate flashcards to start reviewing."
        />
      ) : deck.length === 0 ? (
        <EmptyState
          icon={Check}
          title="You're all caught up!"
          description="No cards are due for review. Come back later — the spacing algorithm will bring them back at the optimal moment."
        />
      ) : (
        <div className="max-w-2xl mx-auto">
          <FlipCard card={current} flipped={flipped} onFlip={() => setFlipped(true)} />

          {!flipped ? (
            <div className="text-center text-xs text-muted-foreground mt-6">Click the card to reveal the answer</div>
          ) : (
            <div className="mt-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground text-center mb-3">How well did you remember?</div>
              <div className="grid grid-cols-4 gap-2">
                <Button onClick={() => rate(0)} variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/5">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Again
                </Button>
                <Button onClick={() => rate(3)} variant="outline">Hard</Button>
                <Button onClick={() => rate(4)} variant="outline">Good</Button>
                <Button onClick={() => rate(5)} className="bg-primary">
                  <Check className="w-3.5 h-3.5 mr-1.5" /> Easy
                </Button>
              </div>
            </div>
          )}

          <div className="text-center mt-5 text-xs text-muted-foreground">
            {idx + 1} of {deck.length} · {current?.mastery_level}
          </div>
        </div>
      )}
    </div>
  );
}
