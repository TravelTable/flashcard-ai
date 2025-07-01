import React, { useState } from "react";
import "./LessonQuizSession.css";

// Helper to shuffle an array (for quiz options)
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Cute mascot SVG (small, for reactions)
function MascotFace({ mood = "neutral" }) {
  // mood: "happy", "neutral", "sad"
  let mouth, color;
  if (mood === "happy") {
    mouth = <path d="M60 80 Q70 90 80 80" stroke="#2196f3" strokeWidth="3" fill="none" />;
    color = "#2196f3";
  } else if (mood === "sad") {
    mouth = <path d="M60 85 Q70 75 80 85" stroke="#1976d2" strokeWidth="3" fill="none" />;
    color = "#1976d2";
  } else {
    mouth = <rect x="62" y="80" width="16" height="4" rx="2" fill="#90caf9" />;
    color = "#2196f3";
  }
  return (
    <svg width="44" height="44" viewBox="0 0 140 140" style={{ display: "block" }}>
      <ellipse cx="70" cy="70" rx="55" ry="55" fill="#e3f0ff" />
      <ellipse cx="70" cy="70" rx="38" ry="32" fill={color} />
      <ellipse cx="70" cy="70" rx="32" ry="26" fill="#fff" />
      <ellipse cx="55" cy="72" rx="6" ry="8" fill={color} />
      <ellipse cx="85" cy="72" rx="6" ry="8" fill={color} />
      <ellipse cx="55" cy="74" rx="2.2" ry="3" fill="#fff" />
      <ellipse cx="85" cy="74" rx="2.2" ry="3" fill="#fff" />
      {mouth}
    </svg>
  );
}

function XPBar({ progress, total }) {
  const percent = Math.round((progress / total) * 100);
  return (
    <div className="xp-bar">
      <div className="xp-bar-fill" style={{ width: `${percent}%` }} />
      <span className="xp-bar-text">
        {progress} / {total} XP
      </span>
    </div>
  );
}

function LessonQuizSession({ flashcards, quizzes, onComplete }) {
  const [step, setStep] = useState(0); // 0: flashcards, 1: quizzes, 2: complete
  const [flashIndex, setFlashIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [mascotMood, setMascotMood] = useState("neutral");
  const [quizResults, setQuizResults] = useState([]);

  // For input-based quiz types
  const [quizInput, setQuizInput] = useState("");
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Reset input state when moving to a new quiz
  React.useEffect(() => {
    setQuizInput("");
    setQuizSubmitted(false);
  }, [quizIndex, step]);

  // --- Flashcard Logic ---
  const handleFlip = () => setShowAnswer((v) => !v);

  const handleNextFlash = () => {
    setShowAnswer(false);
    setXp((prev) => prev + 5);
    if (flashIndex < flashcards.length - 1) {
      setFlashIndex(flashIndex + 1);
    } else {
      setStep(1); // Move to quizzes
    }
  };

  // --- Quiz Logic ---
  const handleQuizAnswer = (isCorrect) => {
    setQuizResults([
      ...quizResults,
      { index: quizIndex, correct: isCorrect }
    ]);
    setXp((prev) => prev + (isCorrect ? 10 : 0));
    setStreak((prev) => {
      const newStreak = isCorrect ? prev + 1 : 0;
      setMaxStreak((max) => (newStreak > max ? newStreak : max));
      return newStreak;
    });
    setMascotMood(isCorrect ? "happy" : "sad");
    setTimeout(() => {
      setMascotMood("neutral");
      if (quizIndex < quizzes.length - 1) {
        setQuizIndex(quizIndex + 1);
      } else {
        setStep(2); // Complete
      }
    }, 900);
  };

  // --- Render Flashcard ---
  const renderFlashcard = () => {
    const card = flashcards[flashIndex];
    return (
      <div className="lesson-card animated-flip" onClick={handleFlip} tabIndex={0}>
        <div className={`card-face card-front ${showAnswer ? "hide" : ""}`}>
          <span className="card-label">Flashcard</span>
          <div className="card-q">{card.question}</div>
          <div className="card-tip">Click to flip</div>
        </div>
        <div className={`card-face card-back ${showAnswer ? "show" : ""}`}>
          <span className="card-label">Answer</span>
          <div className="card-a">{card.answer}</div>
          <div className="card-tip">Click to flip back</div>
        </div>
      </div>
    );
  };

  // --- Render Quiz Card ---
  const renderQuizCard = () => {
    const q = quizzes[quizIndex];
    if (q.type === "mcq") {
      const options = shuffle([q.answer, ...q.options.filter(opt => opt !== q.answer)]).slice(0, 4);
      return (
        <div className="lesson-card quiz-card">
          <span className="card-label">Multiple Choice</span>
          <div className="card-q">{q.question}</div>
          <div className="quiz-options">
            {options.map((opt, i) => (
              <button
                key={i}
                className="quiz-option-btn"
                onClick={() => handleQuizAnswer(opt === q.answer)}
                tabIndex={0}
                disabled={quizSubmitted}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (q.type === "truefalse") {
      return (
        <div className="lesson-card quiz-card">
          <span className="card-label">True/False</span>
          <div className="card-q">{q.question}</div>
          <div className="quiz-options">
            <button
              className="quiz-option-btn"
              onClick={() => handleQuizAnswer(q.answer === "True")}
              tabIndex={0}
              disabled={quizSubmitted}
            >
              True
            </button>
            <button
              className="quiz-option-btn"
              onClick={() => handleQuizAnswer(q.answer === "False")}
              tabIndex={0}
              disabled={quizSubmitted}
            >
              False
            </button>
          </div>
        </div>
      );
    }
    if (q.type === "fillblank") {
      const handleSubmit = () => {
        const isCorrect = quizInput.trim().toLowerCase() === q.answer.trim().toLowerCase();
        setQuizSubmitted(true);
        handleQuizAnswer(isCorrect);
      };

      return (
        <div className="lesson-card quiz-card">
          <span className="card-label">Fill in the Blank</span>
          <div className="card-q">{q.question}</div>
          <input
            className="quiz-input"
            value={quizInput}
            onChange={(e) => setQuizInput(e.target.value)}
            disabled={quizSubmitted}
            placeholder="Type your answer"
            tabIndex={0}
          />
          <button
            className="quiz-option-btn"
            onClick={handleSubmit}
            disabled={quizSubmitted || !quizInput.trim()}
          >
            Submit
          </button>
        </div>
      );
    }
    if (q.type === "short") {
      const handleSubmit = () => {
        // Accept if answer is similar (case-insensitive substring match)
        const isCorrect =
          quizInput.trim().toLowerCase().includes(q.answer.trim().toLowerCase()) ||
          q.answer.trim().toLowerCase().includes(quizInput.trim().toLowerCase());
        setQuizSubmitted(true);
        handleQuizAnswer(isCorrect);
      };

      return (
        <div className="lesson-card quiz-card">
          <span className="card-label">Short Answer</span>
          <div className="card-q">{q.question}</div>
          <input
            className="quiz-input"
            value={quizInput}
            onChange={(e) => setQuizInput(e.target.value)}
            disabled={quizSubmitted}
            placeholder="Type your answer"
            tabIndex={0}
          />
          <button
            className="quiz-option-btn"
            onClick={handleSubmit}
            disabled={quizSubmitted || !quizInput.trim()}
          >
            Submit
          </button>
        </div>
      );
    }
    return null;
  };

  // --- Render Completion Screen ---
  const renderComplete = () => {
    const correct = quizResults.filter(r => r.correct).length;
    const total = quizResults.length;
    return (
      <div className="lesson-complete">
        <MascotFace mood="happy" />
        <h2>Session Complete!</h2>
        <div className="xp-summary">
          <span>XP Earned: <b>{xp}</b></span>
          <span>Quiz Score: <b>{correct} / {total}</b></span>
        </div>
        <div className="streak-summary">
          {maxStreak > 1 && (
            <span>🔥 Longest Streak: {maxStreak} correct in a row!</span>
          )}
        </div>
        <button className="lesson-restart-btn" onClick={() => onComplete({
          xp,
          score: `${correct} / ${total}`,
          streak: maxStreak
        })}>
          Back to Dashboard
        </button>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="lesson-quiz-session">
      <div className="lesson-header">
        <MascotFace mood={mascotMood} />
        <XPBar progress={xp} total={flashcards.length * 5 + quizzes.length * 10} />
      </div>
      {step === 0 && (
        <div>
          <div className="lesson-progress">
            Flashcard {flashIndex + 1} / {flashcards.length}
          </div>
          {renderFlashcard()}
          <button className="lesson-next-btn" onClick={handleNextFlash}>
            {flashIndex < flashcards.length - 1 ? "Next" : "Start Quiz"}
          </button>
        </div>
      )}
      {step === 1 && (
        <div>
          <div className="lesson-progress">
            Quiz {quizIndex + 1} / {quizzes.length}
          </div>
          {renderQuizCard()}
        </div>
      )}
      {step === 2 && renderComplete()}
    </div>
  );
}

export default LessonQuizSession;