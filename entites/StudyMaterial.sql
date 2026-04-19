{
  "name": "StudyMaterial",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Title of the study material"
    },
    "subject": {
      "type": "string",
      "description": "Subject or category"
    },
    "source_type": {
      "type": "string",
      "enum": [
        "pdf",
        "document",
        "text",
        "url"
      ],
      "default": "text"
    },
    "file_url": {
      "type": "string",
      "description": "URL of uploaded source file"
    },
    "content": {
      "type": "string",
      "description": "Extracted text content"
    },
    "summary": {
      "type": "string",
      "description": "AI generated summary"
    },
    "key_topics": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Key topics extracted from content"
    },
    "audio_url": {
      "type": "string",
      "description": "Generated audio summary URL"
    },
    "word_count": {
      "type": "number"
    },
    "estimated_read_time": {
      "type": "number",
      "description": "Estimated read time in minutes"
    }
  },
  "required": [
    "title"
  ]
}