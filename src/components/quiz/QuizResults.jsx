import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, ArrowRight, Check, X } from "lucide-react";

export default function QuizResults({ quiz, answers, score, correctCount, total, onRetry }) {
  const message = score >= 90 ? "Outstanding." : score >= 70 ? "Well done." : score >= 50 ? "Keep going." : "Review and try again.";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-primary text-primary-foreground rounded-3xl p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5" />
        <Trophy className="w-10 h-10 text-accent mx-auto mb-4 relative z-10" />
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary-foreground/60 mb-2 relative z-10">Result</div>
        <div className="font-serif text-7xl font-semibold mb-2 relative z-10">{score}%</div>
        <div className="font-serif italic text-primary-foreground/80 text-lg relative z-10">"{message}"</div>
        <div className="mt-4 text-sm text-primary-foreground/70 relative z-10">
          {correctCount} correct out of {total}
        </div>
      </div>

      <div className="mt-8 bg-card border border-border/60 rounded-2xl p-6 deckle-edge">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-4">Review</div>
        <ul className="space-y-3">
          {quiz.questions.map((q, i) => {
            const user = answers[i] || "";
            const correct = user.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase();
            return (
              <li key={i} className="flex items-start gap-3 border-b border-border/60 last:border-0 pb-3 last:pb-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${correct ? "bg-green-600/15 text-green-700" : "bg-destructive/15 text-destructive"}`}>
                  {correct ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 text-sm">
                  <div className="font-medium">{q.question}</div>
                  {!correct && (
                    <div className="text-xs text-muted-foreground mt-1">
                      You answered: <span className="italic">{user || "—"}</span> · Correct: <span className="font-semibold">{q.correct_answer}</span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex gap-2 mt-6 justify-center">
        <Button onClick={onRetry} variant="outline" className="rounded-full">
          <RotateCcw className="w-4 h-4 mr-1.5" /> Retry
        </Button>
        <Link to={`/material/${quiz.material_id}`}>
          <Button className="rounded-full">Back to material <ArrowRight className="w-4 h-4 ml-1.5" /></Button>
        </Link>
      </div>
    </div>
  );
}