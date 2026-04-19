import { StudyMaterial, Quiz, Flashcard, QuizAttempt, StudySession } from '@/api/entities';
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ClipboardCheck, Layers, Download, Sparkles, Tag, Clock, BookOpen, MessageSquare } from "lucide-react";
import { analyzeContent } from "@/lib/ai";
import AudioSummary from "@/components/material/AudioSummary";
import QuizCreator from "@/components/material/QuizCreator";
import FlashcardsCreator from "@/components/material/FlashcardsCreator";

export default function MaterialDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [quizOpen, setQuizOpen] = useState(false);
  const [cardsOpen, setCardsOpen] = useState(false);
  const [audioScript, setAudioScript] = useState("");

  const { data: material, isLoading } = useQuery({
    queryKey: ["material", id],
    queryFn: () => StudyMaterial.filter({ id }).then((r) => r[0]),
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["quizzes-for", id],
    queryFn: () => Quiz.filter({ material_id: id }, "-created_at", 50),
    enabled: !!id,
  });

  const { data: cards = [] } = useQuery({
    queryKey: ["cards-for", id],
    queryFn: () => Flashcard.filter({ material_id: id }, "-created_at", 500),
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;
    // Try sessionStorage first (just generated), else regenerate on demand
    const cached = sessionStorage.getItem(`audio_script_${id}`);
    if (cached) setAudioScript(cached);
  }, [id]);

  const regenerateAudio = async () => {
    if (!material) return;
    const res = await analyzeContent(material.content, material.title);
    sessionStorage.setItem(`audio_script_${id}`, res.audio_script || "");
    setAudioScript(res.audio_script || "");
  };

  const handleExport = () => {
    if (!material) return;
    const lines = [
      `# ${material.title}`,
      `Subject: ${material.subject || "General"}`,
      "",
      "## Summary",
      material.summary || "",
      "",
      "## Key Topics",
      ...(material.key_topics || []).map((t) => `- ${t}`),
      "",
      "## Content",
      material.content || "",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${material.title.replace(/[^a-z0-9]/gi, "_")}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (isLoading || !material) {
    return <div className="h-64 rounded-2xl bg-secondary/60 animate-pulse" />;
  }

  return (
    <div>
      <Link to="/library" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to library
      </Link>

      {/* Masthead */}
      <section className="mb-10 pb-10 border-b border-border/60">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {material.subject && (
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent px-2.5 py-1 border border-accent/30 bg-accent/5 rounded-full">
              {material.subject}
            </span>
          )}
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground px-2.5 py-1 border border-border rounded-full">
            {material.source_type}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> {material.estimated_read_time} min read · {material.word_count} words
          </span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
          {material.title}
        </h1>
        {material.key_topics?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {material.key_topics.map((t, i) => (
              <span key={i} className="text-xs px-3 py-1 bg-secondary rounded-full flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-6">
          <Button onClick={() => setQuizOpen(true)} className="rounded-full">
            <ClipboardCheck className="w-4 h-4 mr-1.5" /> Create quiz
          </Button>
          <Button onClick={() => setCardsOpen(true)} variant="secondary" className="rounded-full">
            <Layers className="w-4 h-4 mr-1.5" /> Flashcards
          </Button>
          <Button onClick={() => navigate(`/voice-qa?material=${material.id}`)} variant="outline" className="rounded-full">
            <MessageSquare className="w-4 h-4 mr-1.5" /> Ask questions
          </Button>
          <Button onClick={handleExport} variant="ghost" className="rounded-full">
            <Download className="w-4 h-4 mr-1.5" /> Export
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Summary & content */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Summary</div>
            <div className="font-serif text-lg leading-relaxed text-foreground/90 first-letter:font-semibold first-letter:text-5xl first-letter:float-left first-letter:pr-3 first-letter:pt-1 first-letter:font-serif">
              {material.summary || "No summary generated."}
            </div>
          </section>

          <section>
            <details>
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Read full content
              </summary>
              <div className="mt-4 text-sm leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto pr-3 font-sans text-foreground/80">
                {material.content}
              </div>
            </details>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <AudioSummary script={audioScript} title={material.title} />
          {!audioScript && (
            <Button onClick={regenerateAudio} variant="outline" className="w-full rounded-full">
              <Sparkles className="w-4 h-4 mr-1.5" /> Generate audio script
            </Button>
          )}

          <div className="bg-card border border-border/60 rounded-2xl p-5 deckle-edge">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Generated</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><ClipboardCheck className="w-3.5 h-3.5 text-muted-foreground" /> Quizzes</span>
                <span className="font-mono text-xs">{quizzes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-muted-foreground" /> Flashcards</span>
                <span className="font-mono text-xs">{cards.length}</span>
              </div>
            </div>
            {quizzes.length > 0 && (
              <>
                <div className="scholarly-divider my-4" />
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Recent quizzes</div>
                <ul className="space-y-2">
                  {quizzes.slice(0, 4).map((q) => (
                    <li key={q.id}>
                      <Link to={`/quiz/${q.id}`} className="text-sm hover:text-primary flex items-center justify-between group">
                        <span className="truncate pr-2">{q.difficulty} · {q.total_questions} Qs</span>
                        <span className="text-xs text-muted-foreground group-hover:text-primary">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>
      </div>

      <QuizCreator open={quizOpen} onOpenChange={setQuizOpen} material={material} />
      <FlashcardsCreator
        open={cardsOpen}
        onOpenChange={setCardsOpen}
        material={material}
        onCreated={() => qc.invalidateQueries({ queryKey: ["cards-for", id] })}
      />
    </div>
  );
}
