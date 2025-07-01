import React, { useState } from "react";
import "./FlashcardViewer.css";

function FlashcardViewer({ flashcards }) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return <div>No flashcards to display.</div>;
  }

  const handlePrev = () => {
    setFlipped(false);
    setCurrent((c) => (c === 0 ? flashcards.length - 1 : c - 1));
  };

  const handleNext = () => {
    setFlipped(false);
    setCurrent((c) => (c === flashcards.length - 1 ? 0 : c + 1));
  };

  const handleFlip = () => setFlipped((f) => !f);

  return (
    <div className="flashcard-viewer">
      <div className="flashcard-controls">
        <button onClick={handlePrev}>&lt; Prev</button>
        <span>
          Card {current + 1} of {flashcards.length}
        </span>
        <button onClick={handleNext}>Next &gt;</button>
      </div>
      <div
        className={`flashcard ${flipped ? "flipped" : ""}`}
        onClick={handleFlip}
        tabIndex={0}
        role="button"
        aria-pressed={flipped}
        title="Click to flip"
      >
        <div className="flashcard-front">
          <strong>Q:</strong> {flashcards[current].question}
        </div>
        <div className="flashcard-back">
          <strong>A:</strong> {flashcards[current].answer}
        </div>
      </div>
      <div className="flashcard-tip">
        Click the card to flip. Use arrows to navigate.
      </div>
    </div>
  );
}

export default FlashcardViewer;