import React from "react";

export default function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div className="max-w-2xl">
        {eyebrow && (
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
            {eyebrow}
          </div>
        )}
        <h2 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-muted-foreground text-[15px] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}