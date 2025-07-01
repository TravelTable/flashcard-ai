// src/api.js

export async function generateFlashcardsAndQuizzes({ subject, syllabus }) {
  const prompt = `
You are an expert teacher and exam coach.
Your task is to generate as many high-quality flashcards and quiz questions as possible for student revision, based on the following subject and (if provided) syllabus.

Instructions:
- For flashcards: Each should focus on a key concept, definition, process, technology, or example relevant to the subject.
- For quizzes: Include a mix of multiple choice, true/false, fill-in-the-blank, and short answer questions. Each quiz question should have the correct answer and 3 plausible distractors (for MCQ).
- Make all questions suitable for the front of a flashcard or quiz (exam-style, concise, clear, may use syllabus keywords).
- Make all answers clear, accurate, and student-friendly.
- Output a JSON object with two arrays: "flashcards" and "quizzes", like this:
{
  "flashcards": [
    {"question": "...", "answer": "..."},
    ...
  ],
  "quizzes": [
    {"type": "mcq", "question": "...", "options": ["...", "...", "...", "..."], "answer": "..."},
    {"type": "truefalse", "question": "...", "answer": "True"},
    {"type": "fillblank", "question": "The CPU is also known as the ____.", "answer": "central processing unit"},
    {"type": "short", "question": "...", "answer": "..."},
    ...
  ]
}

Subject: ${subject}
${syllabus ? `Syllabus:\n${syllabus}` : ""}

Do not include explanations or extra text—just the JSON object.
  `.trim();

  const response = await fetch("/api/generate-flashcards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.flashcards || !data.quizzes) {
    throw new Error("No flashcards or quizzes returned from server.");
  }
  return data;
}