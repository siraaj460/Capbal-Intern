import { StudyMaterial, Quiz, Flashcard, QuizAttempt, StudySession } from '@/api/entities';
import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Library as LibraryIcon } from "lucide-react";

import SectionHeader from "@/components/common/SectionHeader";
import EmptyState from "@/components/common/EmptyState";
import MaterialCard from "@/components/library/MaterialCard";
import UploadDialog from "@/components/library/UploadDialog";
import { useAuth } from "@/lib/AuthContext";

export default function Library() {
  const [params, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const qc = useQueryClient();
  const { currentUser } = useAuth();
  const email = currentUser?.email;

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["materials", email],
    queryFn: () => StudyMaterial.filter({ created_by: email }, "-created_at", 200),
    enabled: !!email,
  });

  useEffect(() => {
    if (params.get("upload") === "1") {
      setOpen(true);
      params.delete("upload");
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const filtered = materials.filter((m) => {
    const s = q.toLowerCase();
    if (!s) return true;
    return (
      m.title?.toLowerCase().includes(s) ||
      m.subject?.toLowerCase().includes(s) ||
      m.key_topics?.some((t) => t.toLowerCase().includes(s))
    );
  });

  return (
    <div>
      <SectionHeader
        eyebrow="Your Library"
        title="Every text, distilled."
        description="Your collection of study materials, summaries and extracted key topics. Open one to generate quizzes, flashcards and audio lessons."
        action={
          <Button onClick={() => setOpen(true)} className="rounded-full">
            <Plus className="w-4 h-4 mr-1.5" /> Add material
          </Button>
        }
      />

      <div className="mb-8 relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, subject or topic…"
          className="pl-10 bg-card rounded-full"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-secondary/60 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={LibraryIcon}
          title={materials.length === 0 ? "Your library is empty" : "No materials match"}
          description={materials.length === 0 ? "Upload a PDF, paste notes, or add your first document to get started." : "Try a different search."}
          action={
            materials.length === 0 && (
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" /> Add your first material
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => <MaterialCard key={m.id} material={m} onDeleted={(id) => qc.setQueryData(["materials", email], (old) => old?.filter(x => x.id !== id))} />)}
        </div>
      )}

      <UploadDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={() => qc.invalidateQueries({ queryKey: ["materials", email] })}
      />
    </div>
  );
}
