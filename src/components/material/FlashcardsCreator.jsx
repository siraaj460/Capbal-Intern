import { Flashcard } from '@/api/entities';
import { StudyMaterial } from '@/api/entities';
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Layers } from "lucide-react";

import { generateFlashcards } from "@/lib/ai";

export default function FlashcardsCreator({ open, onOpenChange, material, onCreated }) {
  const [count, setCount] = useState(12);
  const [busy, setBusy] = useState(false);

  const handleGenerate = async () => {
    setBusy(true);
    try {
      const res = await generateFlashcards(material.content, count);
      const cards = res.flashcards || [];
      const today = new Date().toISOString().slice(0, 10);
      await Flashcard.bulkCreate(cards.map((c) => ({
        ...c,
        material_id: material.id,
        subject: material.subject,
        next_review_date: today,
        mastery_level: "new",
        ease_factor: 2.5,
        interval_days: 0,
        repetitions: 0,
      })));
      onCreated?.(cards.length);
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      alert("Failed to generate flashcards.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Generate flashcards</DialogTitle>
          <DialogDescription>AI will extract the most test-worthy concepts into cards.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 mt-2">
          <Label>How many cards?</Label>
          <Input type="number" min={5} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Layers className="w-4 h-4 mr-1.5" />}
            {busy ? "Creating…" : "Create cards"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}