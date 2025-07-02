import React, { useState, useEffect, useRef } from "react";
import "./FlashcardViewer.css";

/**
 * Advanced FlashcardViewer
 * Features:
 * - Keyboard navigation (arrow keys, space to flip)
 * - Progress tracking (per card, session stats)
 * - Mark cards as "known" or "unknown"
 * - Shuffle and reset deck
 * - Timer per card and total session
 * - Accessibility improvements
 * - Animations for transitions
 * - Responsive design
 * - Export/Import progress (JSON)
 * - Dark mode toggle
 * - Audio read-aloud (TTS)
 */

function shuffleArray(array) {
  // Fisher-Yates shuffle
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const LOCAL_STORAGE_KEY = "flashcardViewerProgress_v2";

function FlashcardViewer({ flashcards }) {
  // State
  const [deck, setDeck] = useState([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState({});
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    viewed: 0,
    startTime: null,
    totalTime: 0,
    perCardTime: {},
  });
  const [shuffle, setShuffle] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [importExportData, setImportExportData] = useState("");
  const [showStats, setShowStats] = useState(false);

  const timerRef = useRef(null);
  const cardStartTimeRef = useRef(Date.now());
  const ttsUtteranceRef = useRef(null);

  // Load deck and progress
  useEffect(() => {
    let initialDeck = flashcards ? flashcards.slice() : [];
    let saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed.deck &&
          parsed.deck.length === initialDeck.length &&
          parsed.deck.every((c, i) => c.question === initialDeck[i].question)
        ) {
          setDeck(parsed.deck);
          setKnown(parsed.known || {});
          setSessionStats(parsed.sessionStats || sessionStats);
          setCurrent(parsed.current || 0);
          setShuffle(parsed.shuffle || false);
          setDarkMode(parsed.darkMode || false);
          return;
        }
      } catch (e) {}
    }
    setDeck(initialDeck);
    setKnown({});
    setSessionStats({
      correct: 0,
      incorrect: 0,
      viewed: 0,
      startTime: Date.now(),
      totalTime: 0,
      perCardTime: {},
    });
    setCurrent(0);
    setShuffle(false);
    setDarkMode(false);
  }, [flashcards]);

  // Save progress
  useEffect(() => {
    if (deck.length === 0) return;
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        deck,
        current,
        known,
        sessionStats,
        shuffle,
        darkMode,
      })
    );
  }, [deck, current, known, sessionStats, shuffle, darkMode]);

  // Timer logic
  useEffect(() => {
    if (deck.length === 0) return;
    if (!sessionStats.startTime) {
      setSessionStats((s) => ({
        ...s,
        startTime: Date.now(),
      }));
    }
    timerRef.current = setInterval(() => {
      setSessionStats((s) => ({
        ...s,
        totalTime: Math.floor((Date.now() - s.startTime) / 1000),
      }));
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, [deck.length, sessionStats.startTime]);

  // Per-card timer
  useEffect(() => {
    cardStartTimeRef.current = Date.now();
    // eslint-disable-next-line
  }, [current]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === " " || e.key === "Enter") {
        handleFlip();
      } else if (e.key === "k" || e.key === "K") {
        markKnown(true);
      } else if (e.key === "u" || e.key === "U") {
        markKnown(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line
  }, [current, flipped, deck, known]);

  // TTS
  useEffect(() => {
    if (!ttsEnabled) return;
    if (!window.speechSynthesis) return;
    if (ttsUtteranceRef.current) {
      window.speechSynthesis.cancel();
    }
    const utter = new window.SpeechSynthesisUtterance(
      flipped
        ? deck[current]?.answer || ""
        : deck[current]?.question || ""
    );
    utter.rate = 1;
    utter.pitch = 1;
    utter.lang = "en-US";
    ttsUtteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
    return () => {
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line
  }, [ttsEnabled, current, flipped, deck]);

  if (!deck || deck.length === 0) {
    return (
      <div className={`flashcard-viewer${darkMode ? " dark" : ""}`}>
        <div>No flashcards to display.</div>
      </div>
    );
  }

  function handlePrev() {
    setFlipped(false);
    updatePerCardTime();
    setCurrent((c) => (c === 0 ? deck.length - 1 : c - 1));
  }

  function handleNext() {
    setFlipped(false);
    updatePerCardTime();
    setCurrent((c) => (c === deck.length - 1 ? 0 : c + 1));
  }

  function handleFlip() {
    setFlipped((f) => !f);
    if (!flipped) {
      setSessionStats((s) => ({
        ...s,
        viewed: s.viewed + 1,
      }));
    }
  }

  function markKnown(isKnown) {
    setKnown((k) => ({
      ...k,
      [deck[current].question]: isKnown,
    }));
    setSessionStats((s) => ({
      ...s,
      correct: isKnown ? s.correct + 1 : s.correct,
      incorrect: !isKnown ? s.incorrect + 1 : s.incorrect,
    }));
    handleNext();
  }

  function handleShuffle() {
    const shuffled = shuffleArray(deck);
    setDeck(shuffled);
    setCurrent(0);
    setFlipped(false);
    setShuffle(true);
    setSessionStats((s) => ({
      ...s,
      startTime: Date.now(),
      totalTime: 0,
      perCardTime: {},
      viewed: 0,
      correct: 0,
      incorrect: 0,
    }));
    setKnown({});
  }

  function handleReset() {
    setDeck(flashcards.slice());
    setCurrent(0);
    setFlipped(false);
    setShuffle(false);
    setSessionStats({
      correct: 0,
      incorrect: 0,
      viewed: 0,
      startTime: Date.now(),
      totalTime: 0,
      perCardTime: {},
    });
    setKnown({});
  }

  function updatePerCardTime() {
    const now = Date.now();
    const elapsed = Math.floor((now - cardStartTimeRef.current) / 1000);
    setSessionStats((s) => ({
      ...s,
      perCardTime: {
        ...s.perCardTime,
        [deck[current].question]: (s.perCardTime[deck[current].question] || 0) + elapsed,
      },
    }));
    cardStartTimeRef.current = now;
  }

  function handleExport() {
    const data = {
      known,
      sessionStats,
      deck,
      current,
      shuffle,
      darkMode,
    };
    setImportExportData(JSON.stringify(data, null, 2));
    setImportExportOpen(true);
  }

  function handleImport() {
    try {
      const data = JSON.parse(importExportData);
      if (
        data.deck &&
        data.deck.length === flashcards.length &&
        data.deck.every((c, i) => c.question === flashcards[i].question)
      ) {
        setDeck(data.deck);
        setKnown(data.known || {});
        setSessionStats(data.sessionStats || sessionStats);
        setCurrent(data.current || 0);
        setShuffle(data.shuffle || false);
        setDarkMode(data.darkMode || false);
        setImportExportOpen(false);
      } else {
        alert("Deck mismatch or invalid data.");
      }
    } catch (e) {
      alert("Invalid JSON.");
    }
  }

  function handleTtsToggle() {
    setTtsEnabled((t) => !t);
  }

  function handleDarkModeToggle() {
    setDarkMode((d) => !d);
  }

  function handleShowStats() {
    setShowStats((s) => !s);
  }

  // Responsive font size
  const fontSize =
    deck[current]?.question.length > 120 || deck[current]?.answer.length > 120
      ? "1rem"
      : "1.18rem";

  // Progress bar
  const progress =
    ((Object.keys(known).length / deck.length) * 100).toFixed(1);

  // Per-card time
  const perCardTime =
    sessionStats.perCardTime[deck[current].question] || 0;

  // Accessibility: aria-live for card content
  return (
    <div className={`flashcard-viewer${darkMode ? " dark" : ""}`}>
      <div className="flashcard-toolbar">
        <button onClick={handleShuffle} title="Shuffle deck">
          🔀 Shuffle
        </button>
        <button onClick={handleReset} title="Reset progress">
          ♻️ Reset
        </button>
        <button onClick={handleExport} title="Export progress">
          ⬇️ Export
        </button>
        <button
          onClick={() => setImportExportOpen(true)}
          title="Import progress"
        >
          ⬆️ Import
        </button>
        <button onClick={handleDarkModeToggle} title="Toggle dark mode">
          {darkMode ? "🌞 Light" : "🌙 Dark"}
        </button>
        <button onClick={handleTtsToggle} title="Toggle read aloud">
          {ttsEnabled ? "🔊 TTS On" : "🔈 TTS Off"}
        </button>
        <button onClick={handleShowStats} title="Show stats">
          📊 Stats
        </button>
      </div>
      <div className="flashcard-progress-bar">
        <div
          className="flashcard-progress"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flashcard-controls">
        <button onClick={handlePrev} aria-label="Previous card">
          &lt; Prev
        </button>
        <span>
          Card {current + 1} of {deck.length}
        </span>
        <button onClick={handleNext} aria-label="Next card">
          Next &gt;
        </button>
      </div>
      <div
        className={`flashcard${flipped ? " flipped" : ""}`}
        onClick={handleFlip}
        tabIndex={0}
        role="button"
        aria-pressed={flipped}
        title="Click to flip"
        style={{ fontSize }}
        aria-live="polite"
      >
        <div className="flashcard-front">
          <strong>Q:</strong> {deck[current].question}
        </div>
        <div className="flashcard-back">
          <strong>A:</strong> {deck[current].answer}
        </div>
      </div>
      <div className="flashcard-actions">
        <button
          className={`known-btn${known[deck[current].question] === true ? " active" : ""}`}
          onClick={() => markKnown(true)}
          aria-label="Mark as known"
        >
          👍 Known
        </button>
        <button
          className={`unknown-btn${known[deck[current].question] === false ? " active" : ""}`}
          onClick={() => markKnown(false)}
          aria-label="Mark as unknown"
        >
          👎 Unknown
        </button>
      </div>
      <div className="flashcard-tip">
        Click the card to flip. Use arrows or space/enter to navigate/flip.<br />
        <span>
          <b>Shortcuts:</b> ←/→: Prev/Next, Space/Enter: Flip, K/U: Known/Unknown
        </span>
      </div>
      <div className="flashcard-status">
        <span>
          <b>Progress:</b> {Object.keys(known).length}/{deck.length} cards marked
        </span>
        <span>
          <b>Session:</b> {formatTime(sessionStats.totalTime)}
        </span>
        <span>
          <b>This card:</b> {formatTime(perCardTime)}
        </span>
      </div>
      {importExportOpen && (
        <div className="flashcard-modal">
          <div className="flashcard-modal-content">
            <h3>Import/Export Progress</h3>
            <textarea
              value={importExportData}
              onChange={(e) => setImportExportData(e.target.value)}
              rows={10}
              style={{ width: "100%" }}
            />
            <div style={{ marginTop: "1rem" }}>
              <button onClick={handleImport}>Import</button>
              <button
                onClick={() => {
                  setImportExportOpen(false);
                  setImportExportData("");
                }}
              >
                Close
              </button>
            </div>
            <div style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
              <b>Export:</b> Copy the above JSON to save your progress.<br />
              <b>Import:</b> Paste previously exported JSON and click Import.
            </div>
          </div>
        </div>
      )}
      {showStats && (
        <div className="flashcard-modal">
          <div className="flashcard-modal-content">
            <h3>Session Statistics</h3>
            <ul>
              <li>
                <b>Cards viewed:</b> {sessionStats.viewed}
              </li>
              <li>
                <b>Known:</b> {sessionStats.correct}
              </li>
              <li>
                <b>Unknown:</b> {sessionStats.incorrect}
              </li>
              <li>
                <b>Total time:</b> {formatTime(sessionStats.totalTime)}
              </li>
              <li>
                <b>Average time per card:</b>{" "}
                {formatTime(
                  Math.floor(
                    sessionStats.totalTime /
                      (Object.keys(sessionStats.perCardTime).length || 1)
                  )
                )}
              </li>
            </ul>
            <button onClick={handleShowStats}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashcardViewer;
