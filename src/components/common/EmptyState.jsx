import React from "react";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="border border-dashed border-border rounded-2xl py-16 px-6 text-center bg-card/50">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-secondary mx-auto flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="font-serif text-xl text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}