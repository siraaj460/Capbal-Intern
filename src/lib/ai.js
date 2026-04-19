// AI functions using Supabase Edge Function as proxy to Claude API
import { supabase } from '@/api/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callClaude(prompt, responseSchema = null) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || SUPABASE_ANON_KEY;

  const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ prompt, responseSchema })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI request failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error);
  
  const text = data.text || "";
  if (responseSchema) {
    try {
      return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      return {};
    }
  }
  return text;
}

export async function analyzeContent(content, title) {
  const prompt = `Analyze this study material titled "${title}".
Return JSON with: summary (3-5 paragraphs as one string), key_topics (array of 5-8 strings), audio_script (2-3 min spoken text).

MATERIAL:
"""
${content.slice(0, 12000)}
"""`;

  return await callClaude(prompt, {
    type: "object",
    properties: {
      summary: { type: "string" },
      key_topics: { type: "array", items: { type: "string" } },
      audio_script: { type: "string" }
    }
  });
}

export async function generateQuiz(content, { count = 8, difficulty = "medium", types = ["mcq", "true_false", "fill_blank"] } = {}) {
  const prompt = `Create ${count} quiz questions from this material. Use types: ${types.join(", ")}. Difficulty: ${difficulty}.
Rules:
- MCQ: exactly 4 options, correct_answer must match one option verbatim
- true_false: options ["True","False"]
- fill_blank: question has "____", correct_answer is the missing word
- Include explanation for each

MATERIAL:
"""
${content.slice(0, 12000)}
"""`;

  return await callClaude(prompt, {
    type: "object",
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string" },
            question: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            correct_answer: { type: "string" },
            explanation: { type: "string" },
            difficulty: { type: "string" }
          }
        }
      }
    }
  });
}

export async function generateFlashcards(content, count = 10) {
  const prompt = `Create ${count} study flashcards from this material. Each card needs front (question/term) and back (answer/definition), plus optional hint.

MATERIAL:
"""
${content.slice(0, 12000)}
"""`;

  return await callClaude(prompt, {
    type: "object",
    properties: {
      flashcards: {
        type: "array",
        items: {
          type: "object",
          properties: {
            front: { type: "string" },
            back: { type: "string" },
            hint: { type: "string" }
          }
        }
      }
    }
  });
}

export async function askAboutMaterial(content, question) {
  const prompt = `Answer the student's question using the study material. Be clear and concise (max 150 words).

MATERIAL:
"""
${content.slice(0, 12000)}
"""

QUESTION: ${question}`;

  return await callClaude(prompt);
}