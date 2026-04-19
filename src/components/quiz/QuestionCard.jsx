import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export default function QuestionCard({ question, index, total, answer, onChange, reveal }) {
  const isCorrect = reveal && answer?.trim().toLowerCase() === question.correct_answer?.trim().toLowerCase();
  const type = question.type || "mcq";

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-8 deckle-edge animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Question {index + 1} / {total}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] px-2 py-0.5 border border-border rounded-full text-muted-foreground">
          {type.replace("_", " ")} · {question.difficulty || "medium"}
        </span>
      </div>

      <h2 className="font-serif text-2xl md:text-3xl leading-snug mb-6">
        {question.question}
      </h2>

      {(type === "mcq") && (
        <div className="grid gap-2.5">
          {question.options?.map((opt, i) => {
            const selected = answer === opt;
            const correct = reveal && opt === question.correct_answer;
            const wrong = reveal && selected && !correct;
            return (
              <button
                key={i}
                disabled={reveal}
                onClick={() => onChange(opt)}
                className={cn(
                  "text-left px-4 py-3.5 rounded-xl border transition-all flex items-center gap-3",
                  selected && !reveal && "border-primary bg-primary/5",
                  !selected && !reveal && "border-border hover:border-primary/40 hover:bg-secondary/40",
                  correct && "border-green-600 bg-green-600/10",
                  wrong && "border-destructive bg-destructive/10",
                )}
              >
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-sm">{opt}</span>
                {correct && <Check className="w-4 h-4 text-green-700" />}
                {wrong && <X className="w-4 h-4 text-destructive" />}
              </button>
            );
          })}
        </div>
      )}

      {type === "true_false" && (
        <div className="grid grid-cols-2 gap-3">
          {["True", "False"].map((opt) => {
            const selected = answer === opt;
            const correct = reveal && opt === question.correct_answer;
            const wrong = reveal && selected && !correct;
            return (
              <button
                key={opt}
                disabled={reveal}
                onClick={() => onChange(opt)}
                className={cn(
                  "py-5 rounded-xl border text-lg font-serif transition-all",
                  selected && !reveal && "border-primary bg-primary/5",
                  !selected && !reveal && "border-border hover:border-primary/40 hover:bg-secondary/40",
                  correct && "border-green-600 bg-green-600/10 text-green-800",
                  wrong && "border-destructive bg-destructive/10 text-destructive",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {type === "fill_blank" && (
        <div>
          <Input
            value={answer || ""}
            disabled={reveal}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer…"
            className="text-lg py-6"
          />
          {reveal && (
            <div className={cn("mt-3 text-sm font-mono px-3 py-2 rounded-lg", isCorrect ? "bg-green-600/10 text-green-800" : "bg-destructive/10 text-destructive")}>
              Correct answer: <span className="font-semibold">{question.correct_answer}</span>
            </div>
          )}
        </div>
      )}

      {reveal && question.explanation && (
        <div className="mt-5 border-t border-border/60 pt-4">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5">Explanation</div>
          <p className="text-sm leading-relaxed text-foreground/80">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}