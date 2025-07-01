import React, { useState } from "react";
import FlashcardViewer from "./FlashcardViewer";
import { generateFlashcards } from "./api";
import "./App.css";

function App() {
  const [subject, setSubject] = useState("NSW Year 11 Computer Enterprise");
  const [syllabus, setSyllabus] = useState("");
  const [bibliography, setBibliography] = useState(
    `Anazifa R & Djukri D (2017), Australian Government (2005), Connolly R et al. (2015), Deloitte (2017), Education Council (2015, 2019), FYA (2017), Heersink H & Moskal B (2010), ITEEA, K–12 CS Framework Steering Committee, Lapuz AME & Fugencio MN (2020), NESA, NSW Department of Education (2017), Shute VJ, Sun C & Asbell-Clarke J (2017), Sterling L (2016), Terada Y (2021), The Royal Society (2017), Thomson S (2015), Wing J (2006).`
  );
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [jsonView, setJsonView] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setFlashcards([]);
    try {
      const prompt = `
You are an expert teacher and exam coach.
Your task is to generate as many high-quality Q&A flashcards as possible for student revision, based on the official syllabus and the following bibliography.

Instructions:
- Each flashcard should focus on a key concept, syllabus point, definition, process, technology, or example relevant to the "${subject}" course.
- Make the "question" suitable for the front of a flashcard (exam-style, concise, clear, may use syllabus keywords).
- Make the "answer" clear, accurate, and student-friendly, as it should appear on the back of the card.
- Do NOT limit the number of flashcards—cover all major syllabus topics, outcomes, and bibliography themes.
- Output ONLY a JSON array, like this:
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  ...
]

Bibliography:
${bibliography}

${syllabus ? `If provided, also incorporate content from the full syllabus or module dot-points:\n${syllabus}` : ""}
Do not include explanations or extra text—just the JSON array of flashcards.
      `.trim();

      const result = await generateFlashcards(prompt);
      setFlashcards(result);
    } catch (err) {
      setError(
        err.message ||
          "An error occurred while generating flashcards. Please try again."
      );
    }
    setLoading(false);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(flashcards, null, 2));
  };

  return (
    <div className="App">
      <header>
        <h1>Ultimate AI Flashcard Generator</h1>
        <p>
          Enter a subject/topic and (optionally) syllabus or bibliography. Click
          "Generate Flashcards" to get a giant JSON array of Q&A pairs for
          revision.
        </p>
      </header>
      <div className="input-section">
        <label>
          <span>Subject/Topic:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. NSW Year 11 Computer Enterprise"
            autoFocus
          />
        </label>
        <label>
          <span>Bibliography (optional):</span>
          <textarea
            value={bibliography}
            onChange={(e) => setBibliography(e.target.value)}
            rows={3}
          />
        </label>
        <label>
          <span>Syllabus/Module Dot-points (optional):</span>
          <textarea
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            rows={4}
            placeholder="Paste syllabus or module dot-points here..."
          />
        </label>
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Flashcards"}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {flashcards.length > 0 && (
        <div className="results-section">
          <div className="results-actions">
            <button onClick={() => setJsonView((v) => !v)}>
              {jsonView ? "Preview as Flipcards" : "View as JSON"}
            </button>
            <button onClick={handleCopyJSON}>Copy JSON</button>
            <a
              href={`data:application/json,${encodeURIComponent(
                JSON.stringify(flashcards, null, 2)
              )}`}
              download="flashcards.json"
              className="export-btn"
            >
              Export JSON
            </a>
          </div>
          {jsonView ? (
            <pre className="json-view">
              {JSON.stringify(flashcards, null, 2)}
            </pre>
          ) : (
            <FlashcardViewer flashcards={flashcards} />
          )}
        </div>
      )}
      <footer>
        <p>
          Powered by OpenAI GPT-4. Built for advanced syllabus-based flashcard
          generation.
        </p>
      </footer>
    </div>
  );
}

export default App;