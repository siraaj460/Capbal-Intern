import { Quiz } from '@/api/entities';
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Sparkles } from "lucide-react";

import { generateQuiz } from "@/lib/ai";
import { useNavigate } from "react-router-dom";

export default function QuizCreator({ open, onOpenChange, material }) {
  const [count, setCount] = useState(8);
  const [difficulty, setDifficulty] = useState("medium");
  const [types, setTypes] = useState({ mcq: true, true_false: true, fill_blank: true });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const toggleType = (k) => setTypes((t) => ({ ...t, [k]: !t[k] }));

  const handleGenerate = async () => {
    setBusy(true);
    try {
      const typeList = Object.entries(types).filter(([, v]) => v).map(([k]) => k);
      if (typeList.length === 0) { alert("Pick at least one question type."); setBusy(false); return; }

      const res = await generateQuiz(material.content, { count, difficulty, types: typeList });
      const questions = res.questions || [];
      const quiz = await Quiz.create({
        title: `${material.title} – Quiz`,
        material_id: material.id,
        subject: material.subject,
        difficulty,
        questions,
        total_questions: questions.length,
      });
      onOpenChange(false);
      navigate(`/quiz/${quiz.id}`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate quiz. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Craft a new quiz</DialogTitle>
          <DialogDescription>Let Mine generate intelligent questions from this material.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label># Questions</Label>
              <Input type="number" min={3} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="adaptive">Adaptive (auto-tune)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Question types</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: "mcq", label: "Multiple choice" },
                { k: "true_false", label: "True / False" },
                { k: "fill_blank", label: "Fill blank" },
              ].map(({ k, label }) => (
                <label key={k} className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 cursor-pointer transition ${types[k] ? "border-primary bg-primary/5" : "border-border"}`}>
                  <Checkbox checked={types[k]} onCheckedChange={() => toggleType(k)} />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
            {busy ? "Generating…" : "Generate quiz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}