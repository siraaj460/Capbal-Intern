{
  "name": "QuizAttempt",
  "type": "object",
  "properties": {
    "quiz_id": {
      "type": "string"
    },
    "quiz_title": {
      "type": "string"
    },
    "subject": {
      "type": "string"
    },
    "score": {
      "type": "number",
      "description": "Score in percentage"
    },
    "correct_count": {
      "type": "number"
    },
    "total_questions": {
      "type": "number"
    },
    "time_spent_seconds": {
      "type": "number"
    },
    "difficulty": {
      "type": "string"
    },
    "answers": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "question": {
            "type": "string"
          },
          "user_answer": {
            "type": "string"
          },
          "correct_answer": {
            "type": "string"
          },
          "is_correct": {
            "type": "boolean"
          }
        }
      }
    }
  },
  "required": [
    "quiz_id"
  ]
}