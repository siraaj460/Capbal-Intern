{
  "name": "Quiz",
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "material_id": {
      "type": "string",
      "description": "Reference to StudyMaterial"
    },
    "subject": {
      "type": "string"
    },
    "difficulty": {
      "type": "string",
      "enum": [
        "easy",
        "medium",
        "hard",
        "adaptive"
      ],
      "default": "medium"
    },
    "questions": {
      "type": "array",
      "description": "List of quiz questions",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": [
              "mcq",
              "true_false",
              "fill_blank"
            ]
          },
          "question": {
            "type": "string"
          },
          "options": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "correct_answer": {
            "type": "string"
          },
          "explanation": {
            "type": "string"
          },
          "difficulty": {
            "type": "string",
            "enum": [
              "easy",
              "medium",
              "hard"
            ]
          }
        }
      }
    },
    "total_questions": {
      "type": "number"
    }
  },
  "required": [
    "title"
  ]
}