import { StudyMaterial, Quiz, Flashcard, QuizAttempt, StudySession } from '@/api/entities';
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ChevronRight, Check } from "lucide-react";
import QuestionCard from "@/components/quiz/QuestionCard";
import QuizResults from "@/components/quiz/QuizResults";

export default function QuizRunner() {
  const { id } = useParams();
  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", id],
    queryFn: () => Quiz.get(id),
  });

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reveal, setReveal] = useState(false);
  const [done, setDone] = useState(false);
  const [startAt] = useState(Date.now());
  const [attempt, setAttempt] = useState(null);

  // Adaptive difficulty: re-order remaining questions based on running performance
  const orderedQuestions = useMemo(() => {
    if (!quiz) return [];
    if (quiz.difficulty !== "adaptive") return quiz.questions;
    const order = ["easy", "medium", "hard"];
    return [...quiz.questions].sort((a, b) => order.indexOf(a.difficulty) - order.indexOf(b.difficulty));
  }, [quiz]);

  const total = orderedQuestions.length;
  const current = orderedQuestions[idx];

  const finish = async (finalAnswers) => {
    let correct = 0;
    const review = orderedQuestions.map((q, i) => {
      const ua = (finalAnswers[i] || "").trim();
      const isCorrect = ua.toLowerCase() === (q.correct_answer || "").trim().toLowerCase();
      if (isCorrect) correct++;
      return { question: q.question, user_answer: ua, correct_answer: q.correct_answer, is_correct: isCorrect };
    });
    const score = Math.round((correct / total) * 100);
    const seconds = Math.round((Date.now() - startAt) / 1000);

    const created = await QuizAttempt.create({
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      subject: quiz.subject,
      score,
      correct_count: correct,
      total_questions: total,
      time_spent_seconds: seconds,
      difficulty: quiz.difficulty,
      answers: review,
    });
    await StudySession.create({
      activity_type: "quiz",
      subject: quiz.subject,
      duration_minutes: Math.max(1, Math.round(seconds / 60)),
      material_id: quiz.material_id,
    });
    setAttempt(created);
    setDone(true);
  };

  const handleSubmitAnswer = () => {
    if (reveal) {
      if (idx === total - 1) {
        finish(answers);
      } else {
        setIdx((i) => i + 1);
        setReveal(false);
      }
    } else {
      setReveal(true);
    }
  };

  if (isLoading || !quiz) return <div className="h-64 rounded-2xl bg-secondary/60 animate-pulse" />;

  if (done && attempt) {
    return (
      <QuizResults
        quiz={{ ...quiz, questions: orderedQuestions }}
        answers={answers}
        score={attempt.score}
        correctCount={attempt.correct_count}
        total={attempt.total_questions}
        onRetry={() => { setAnswers({}); setIdx(0); setReveal(false); setDone(false); setAttempt(null); }}
      />
    );
  }

  return (
    <div>
      <Link to={`/material/${quiz.material_id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{quiz.title}</div>
          <div className="text-xs text-muted-foreground">{idx + 1} / {total}</div>
        </div>
        <Progress value={((idx + (reveal ? 1 : 0)) / total) * 100} className="h-1 mb-8" />

        <QuestionCard
          question={current}
          index={idx}
          total={total}
          answer={answers[idx]}
          onChange={(v) => setAnswers({ ...answers, [idx]: v })}
          reveal={reveal}
        />

        <div className="flex justify-between items-center mt-6">
          <Button variant="ghost" disabled={idx === 0 || reveal} onClick={() => { setIdx(i => Math.max(0, i - 1)); setReveal(false); }}>
            Previous
          </Button>
          <Button onClick={handleSubmitAnswer} disabled={!reveal && !answers[idx]} className="rounded-full">
            {reveal ? (idx === total - 1 ? <>Finish <Check className="w-4 h-4 ml-1.5" /></> : <>Next <ChevronRight className="w-4 h-4 ml-1.5" /></>) : "Check answer"}
          </Button>
        </div>
      </div>
    </div>
  );
}