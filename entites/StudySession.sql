{
  "name": "StudySession",
  "type": "object",
  "properties": {
    "activity_type": {
      "type": "string",
      "enum": [
        "quiz",
        "flashcard",
        "reading",
        "audio",
        "voice_qa"
      ]
    },
    "subject": {
      "type": "string"
    },
    "duration_minutes": {
      "type": "number"
    },
    "material_id": {
      "type": "string"
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "activity_type"
  ]
}