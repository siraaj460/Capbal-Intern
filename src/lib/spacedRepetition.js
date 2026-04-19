// SM-2 lite spaced repetition
export function sm2(card, quality) {
  // quality 0..5 : 0 = forgot, 5 = perfect
  let { ease_factor = 2.5, interval_days = 0, repetitions = 0 } = card;

  if (quality < 3) {
    repetitions = 0;
    interval_days = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval_days = 1;
    else if (repetitions === 2) interval_days = 3;
    else interval_days = Math.round(interval_days * ease_factor);
  }

  ease_factor = Math.max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const next = new Date();
  next.setDate(next.getDate() + interval_days);

  let mastery_level = "learning";
  if (quality < 3) mastery_level = "learning";
  else if (repetitions >= 5 && ease_factor > 2.5) mastery_level = "mastered";
  else if (repetitions >= 2) mastery_level = "review";

  return {
    ease_factor: Number(ease_factor.toFixed(2)),
    interval_days,
    repetitions,
    next_review_date: next.toISOString().slice(0, 10),
    last_reviewed: new Date().toISOString(),
    mastery_level,
  };
}

export function isDue(card) {
  if (!card.next_review_date) return true;
  return new Date(card.next_review_date) <= new Date();
}