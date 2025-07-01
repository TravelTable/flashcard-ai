// api/generate-flashcards.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing or invalid prompt" });
    return;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: "OpenAI API key not set in environment" });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a world-class exam coach and teacher. You generate as many high-quality Q&A flashcards as possible, in JSON array format, for student revision based on the prompt. Output only the JSON array, no extra text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      res.status(500).json({ error: "OpenAI API error: " + error });
      return;
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || "";

    // Extract JSON array from content
    let jsonStart = content.indexOf("[");
    let jsonEnd = content.lastIndexOf("]");
    if (jsonStart === -1 || jsonEnd === -1) {
      res.status(500).json({ error: "Could not find JSON array in API response." });
      return;
    }
    let jsonString = content.slice(jsonStart, jsonEnd + 1);

    let flashcards;
    try {
      flashcards = JSON.parse(jsonString);
      if (!Array.isArray(flashcards)) throw new Error();
    } catch (e) {
      res.status(500).json({ error: "Failed to parse flashcards JSON from API response." });
      return;
    }

    res.status(200).json({ flashcards });
  } catch (err) {
    res.status(500).json({ error: err.message || "Unknown server error" });
  }
}