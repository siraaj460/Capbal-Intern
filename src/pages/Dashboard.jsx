import { StudyMaterial, Quiz, Flashcard, QuizAttempt, StudySession } from '@/api/entities';
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { BookMarked, ClipboardCheck, Layers, Target, Plus, ArrowRight, Sparkles, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatTile from "@/components/dashboard/StatTile";
import RecentActivity from "@/components/dashboard/RecentActivity";
import MaterialCard from "@/components/library/MaterialCard";
import { useAuth } from "@/lib/AuthContext";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const email = currentUser?.email;

  const { data: materials = [] } = useQuery({ queryKey: ["materials", email], queryFn: () => StudyMaterial.filter({ created_by: email }, "-created_at", 50), enabled: !!email });
  const { data: attempts = [] } = useQuery({ queryKey: ["attempts", email], queryFn: () => QuizAttempt.filter({ created_by: email }, "-created_at", 50), enabled: !!email });
  const { data: flashcards = [] } = useQuery({ queryKey: ["flashcards", email], queryFn: () => Flashcard.filter({ created_by: email }, "-created_at", 500), enabled: !!email });
  const { data: sessions = [] } = useQuery({ queryKey: ["sessions", email], queryFn: () => StudySession.filter({ created_by: email }, "-created_at", 20), enabled: !!email });

  const avgScore = attempts.length ? Math.round(attempts.reduce((a, b) => a + (b.score || 0), 0) / attempts.length) : 0;
  const dueCount = flashcards.filter((c) => !c.next_review_date || new Date(c.next_review_date) <= new Date()).length;
  const mastered = flashcards.filter((c) => c.mastery_level === "mastered").length;

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-12">
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10 max-w-2xl">
            <div className="text-[11px] uppercase tracking-[0.3em] text-primary-foreground/60 mb-3 flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> The study atelier
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight mb-4">
              {currentUser?.full_name ? `Welcome back, ${currentUser.full_name.split(" ")[0]}.` : "Welcome back."}<br />
              <em className="font-serif italic text-accent">Learn deeply</em>, recall effortlessly.
            </h1>
            <p className="text-primary-foreground/70 text-base md:text-lg leading-relaxed mb-6 max-w-xl">
              Transform any PDF, article or lecture note into summaries, adaptive quizzes, spaced-repetition flashcards and spoken lessons — all crafted by AI.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/library?upload=1">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full">
                  <Plus className="w-4 h-4 mr-1.5" /> Add material
                </Button>
              </Link>
              <Link to="/library">
                <Button size="lg" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 rounded-full">
                  Browse library <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatTile label="Materials" value={materials.length} sub="in library" icon={BookMarked} accent="bg-primary/10 text-primary" />
        <StatTile label="Quiz Avg" value={`${avgScore}%`} sub={`${attempts.length} attempts`} icon={ClipboardCheck} accent="bg-accent/15 text-accent" />
        <StatTile label="Cards Due" value={dueCount} sub="for review today" icon={Layers} accent="bg-gold/15 text-foreground" />
        <StatTile label="Mastered" value={mastered} sub={`of ${flashcards.length} cards`} icon={Target} accent="bg-secondary text-foreground" />
      </section>

      {/* Recent materials + activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Recently added</div>
              <h3 className="font-serif text-2xl mt-1">Continue where you left off</h3>
            </div>
            <Link to="/library" className="text-sm text-muted-foreground hover:text-foreground link-underline">All materials →</Link>
          </div>
          {materials.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl p-10 text-center bg-card/40">
              <p className="font-serif text-xl mb-2">Nothing here yet</p>
              <p className="text-sm text-muted-foreground mb-4">Start by adding your first study material.</p>
              <Link to="/library?upload=1"><Button><Plus className="w-4 h-4 mr-1.5" /> Add material</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {materials.slice(0, 4).map((m) => <MaterialCard key={m.id} material={m} />)}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Activity</div>
              <h3 className="font-serif text-2xl mt-1 flex items-center gap-2"><Flame className="w-5 h-5 text-accent" /> Your streak</h3>
            </div>
          </div>
          <div className="bg-card border border-border/60 rounded-2xl p-5 deckle-edge">
            <RecentActivity sessions={sessions} />
          </div>
        </div>
      </section>
    </div>
  );
}
