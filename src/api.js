export async function generateFlashcards(prompt) {
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
  if (!Array.isArray(data.flashcards)) {
    throw new Error("No flashcards returned from server.");
  }
  return data.flashcards;
}