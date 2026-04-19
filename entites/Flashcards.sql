{
  "name": "Flashcard",
  "type": "object",
  "properties": {
    "material_id": {
      "type": "string"
    },
    "subject": {
      "type": "string"
    },
    "front": {
      "type": "string",
      "description": "Question or term"
    },
    "back": {
      "type": "string",
      "description": "Answer or definition"
    },
    "hint": {
      "type": "string"
    },
    "ease_factor": {
      "type": "number",
      "default": 2.5,
      "description": "Spaced repetition ease factor"
    },
    "interval_days": {
      "type": "number",
      "default": 1
    },
    "repetitions": {
      "type": "number",
      "default": 0
    },
    "next_review_date": {
      "type": "string",
      "format": "date"
    },
    "last_reviewed": {
      "type": "string",
      "format": "date-time"
    },
    "mastery_level": {
      "type": "string",
      "enum": [
        "new",
        "learning",
        "review",
        "mastered"
      ],
      "default": "new"
    }
  },
  "required": [
    "front",
    "back"
  ]
}