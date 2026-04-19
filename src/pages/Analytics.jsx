import { StudyMaterial, Quiz, Flashcard, QuizAttempt, StudySession } from '@/api/entities';
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import SectionHeader from "@/components/common/SectionHeader";
import EmptyState from "@/components/common/EmptyState";
import { BarChart3, TrendingUp, Target, Clock } from "lucide-react";
import StatTile from "@/components/dashboard/StatTile";
import { format, subDays } from "date-fns";
import { useAuth } from "@/lib/AuthContext";

export default function Analytics() {
  const { currentUser } = useAuth();
  const email = currentUser?.email;

  const { data: attempts = [] } = useQuery({ queryKey: ["attempts", email], queryFn: () => QuizAttempt.filter({ created_by: email }, "-created_at", 200), enabled: !!email });
  const { data: sessions = [] } = useQuery({ queryKey: ["sessions", email], queryFn: () => StudySession.filter({ created_by: email }, "-created_at", 500), enabled: !!email });
  const { data: cards = [] } = useQuery({ queryKey: ["flashcards", email], queryFn: () => Flashcard.filter({ created_by: email }, "-created_at", 500), enabled: !!email });

  const avgScore = attempts.length ? Math.round(attempts.reduce((a, b) => a + (b.score || 0), 0) / attempts.length) : 0;
  const totalMinutes = sessions.reduce((s, a) => s + (a.duration_minutes || 0), 0);

  // Score trend (last 10 attempts, oldest → newest)
  const scoreTrend = useMemo(() => {
    return [...attempts].slice(0, 12).reverse().map((a, i) => ({
      name: `#${i + 1}`,
      score: a.score,
      subject: a.subject || "—",
    }));
  }, [attempts]);

  // Minutes per day (last 7 days)
  const byDay = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const label = format(d, "MMM d");
      const minutes = sessions.filter((s) => {
        const sd = new Date(s.created_at);
        return sd.toDateString() === d.toDateString();
      }).reduce((s, a) => s + (a.duration_minutes || 0), 0);
      days.push({ day: label, minutes });
    }
    return days;
  }, [sessions]);

  // Subject breakdown
  const bySubject = useMemo(() => {
    const map = {};
    attempts.forEach((a) => {
      const s = a.subject || "General";
      map[s] = map[s] || { subject: s, attempts: 0, total: 0 };
      map[s].attempts += 1;
      map[s].total += a.score || 0;
    });
    return Object.values(map).map((x) => ({ subject: x.subject, avg: Math.round(x.total / x.attempts), attempts: x.attempts }));
  }, [attempts]);

  // Mastery distribution
  const mastery = useMemo(() => {
    const levels = ["new", "learning", "review", "mastered"];
    return levels.map((l) => ({ name: l, value: cards.filter((c) => (c.mastery_level || "new") === l).length }));
  }, [cards]);
  const COLORS = ["hsl(var(--muted-foreground))", "hsl(var(--chart-4))", "hsl(var(--chart-3))", "hsl(var(--chart-1))"];

  // Weakest topics (questions most often missed)
  const weakTopics = useMemo(() => {
    const miss = {};
    attempts.forEach((a) => {
      a.answers?.forEach((ans) => {
        if (!ans.is_correct) {
          const key = ans.question.slice(0, 60);
          miss[key] = (miss[key] || 0) + 1;
        }
      });
    });
    return Object.entries(miss).sort(([, a], [, b]) => b - a).slice(0, 5).map(([q, n]) => ({ q, n }));
  }, [attempts]);

  const hasData = attempts.length > 0 || sessions.length > 0;

  return (
    <div>
      <SectionHeader
        eyebrow="Learning analytics"
        title="The shape of your progress."
        description="Track your quiz performance, study rhythm, and mastery to focus where it matters most."
      />

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="Not enough data yet"
          description="Take a quiz or review a flashcard deck — your analytics will appear here."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatTile label="Quiz Attempts" value={attempts.length} icon={TrendingUp} accent="bg-primary/10 text-primary" />
            <StatTile label="Avg Score" value={`${avgScore}%`} icon={Target} accent="bg-accent/15 text-accent" />
            <StatTile label="Study Time" value={`${totalMinutes}m`} sub="total" icon={Clock} accent="bg-gold/15 text-foreground" />
            <StatTile label="Cards Mastered" value={cards.filter((c) => c.mastery_level === "mastered").length} icon={BarChart3} accent="bg-secondary text-foreground" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border/60 rounded-2xl p-6 deckle-edge">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">Score trend</div>
              <h3 className="font-serif text-xl mb-4">Your accuracy over attempts</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={scoreTrend}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--accent))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-6 deckle-edge">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">Study rhythm</div>
              <h3 className="font-serif text-xl mb-4">Minutes per day (last 7)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byDay}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="minutes" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-6 deckle-edge">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">Subjects</div>
              <h3 className="font-serif text-xl mb-4">Average score by subject</h3>
              {bySubject.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={bySubject} layout="vertical">
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis type="category" dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={11} width={90} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="avg" fill="hsl(var(--chart-1))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">No subject data yet.</div>
              )}
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-6 deckle-edge">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">Mastery</div>
              <h3 className="font-serif text-xl mb-4">Flashcard mastery distribution</h3>
              {cards.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={mastery} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                      {mastery.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-muted-foreground italic">Generate flashcards to see mastery.</div>
              )}
            </div>
          </div>

          {weakTopics.length > 0 && (
            <div className="mt-6 bg-card border border-border/60 rounded-2xl p-6 deckle-edge">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">Knowledge gaps</div>
              <h3 className="font-serif text-xl mb-4">Questions you miss most</h3>
              <ul className="space-y-2">
                {weakTopics.map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="font-mono text-xs text-accent shrink-0 mt-0.5">×{t.n}</span>
                    <span className="text-foreground/80">{t.q}…</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
