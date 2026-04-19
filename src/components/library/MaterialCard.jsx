import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Tag, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { StudyMaterial } from "@/api/entities";

const typeLabel = { pdf: "PDF", document: "Document", text: "Notes", url: "Link", docx: "Word", pptx: "PowerPoint" };

export default function MaterialCard({ material, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${material.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await StudyMaterial.delete(material.id);
      onDeleted?.(material.id);
    } catch (err) {
      alert("Failed to delete: " + err.message);
      setDeleting(false);
    }
  };

  return (
    <div className="relative group">
      <Link
        to={`/material/${material.id}`}
        className="block bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5 deckle-edge"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground px-2 py-0.5 border border-border rounded-full">
              {typeLabel[material.source_type] || "Material"}
            </span>
            {material.subject && (
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent px-2 py-0.5 border border-accent/30 bg-accent/5 rounded-full">
                {material.subject}
              </span>
            )}
          </div>
          <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        <h3 className="font-serif text-xl font-semibold leading-tight mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {material.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {material.summary || material.content?.slice(0, 180) || "No summary yet."}
        </p>

        {material.key_topics?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {material.key_topics.slice(0, 3).map((t, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> {t}
              </span>
            ))}
            {material.key_topics.length > 3 && (
              <span className="text-[11px] text-muted-foreground">+{material.key_topics.length - 3} more</span>
            )}
          </div>
        )}

        <div className="scholarly-divider my-4" />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {material.estimated_read_time || 1} min read
          </span>
          <span>{material.created_at ? formatDistanceToNow(new Date(material.created_at), { addSuffix: true }) : ""}</span>
        </div>
      </Link>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive hover:text-white"
        title="Delete material"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
