import React from "react";

export default function FlipCard({ card, flipped, onFlip }) {
  return (
    <div
      className="relative w-full h-[340px] md:h-[400px] cursor-pointer"
      style={{ perspective: 1400 }}
      onClick={onFlip}
    >
      <div
        className="absolute inset-0 transition-transform duration-500"
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-card border border-border/60 rounded-3xl p-10 flex flex-col items-center justify-center text-center deckle-edge"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Question</div>
          <div className="font-serif text-2xl md:text-3xl leading-snug max-w-xl">
            {card.front}
          </div>
          {card.hint && (
            <div className="text-xs italic text-muted-foreground mt-6">Hint: {card.hint}</div>
          )}
          <div className="absolute bottom-5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Tap to reveal
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-primary text-primary-foreground border border-primary rounded-3xl p-10 flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary-foreground/60 mb-4">Answer</div>
          <div className="font-serif text-2xl md:text-3xl leading-snug max-w-xl">
            {card.back}
          </div>
        </div>
      </div>
    </div>
  );
}