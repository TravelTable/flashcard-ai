import React, { useState, useEffect } from "react";
import "./LessonQuizSession.css";
import FlashcardViewer from "./FlashcardViewer";

// -------------------- Helpers --------------------
function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// -------------------- Mascot --------------------
function MascotFace({ mood = "neutral" }) {
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
    <svg width="58" height="58" viewBox="0 0 140 140" style={{ display: "block" }}>
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

// -------------------- XP Bar --------------------
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

// -------------------- Main Component --------------------
function LessonQuizSession({ flashcards, quizzes, onComplete }) {
  // ----- State -----
  const [step, setStep] = useState(0); // 0: flashcards, 1: quizzes, 2: complete
  const [quizIndex, setQuizIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [mascotMood, setMascotMood] = useState("neutral");
  const [quizResults, setQuizResults] = useState([]);
  const [quizInput, setQuizInput] = useState("");
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Flashcard session stats
  const [flashcardSessionStats, setFlashcardSessionStats] = useState({
    xp: 0,
    completed: false,
    knownCount: 0,
    unknownCount: 0,
    timeSpent: 0,
    streak: 0,
    maxStreak: 0,
    score: "",
  });

  // ----- Effects -----
  useEffect(() => {
    setQuizInput("");
    setQuizSubmitted(false);
  }, [quizIndex, step]);

  // ----- Quiz Logic -----
  const handleQuizAnswer = (isCorrect) => {
    setQuizResults((prev) => [
      ...prev,
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

  // ----- Render Quiz Card -----
  const renderQuizCard = () => {
    const q = quizzes[quizIndex];
    if (!q) return null;

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

  // ----- Render Completion Screen -----
  const renderComplete = () => {
    const correct = quizResults.filter(r => r.correct).length;
    const total = quizResults.length;
    const totalXp = xp + flashcardSessionStats.xp;
    const totalScore = `${correct} / ${total}`;
    const totalStreak = Math.max(maxStreak, flashcardSessionStats.maxStreak);

    return (
      <div className="lesson-complete">
        <MascotFace mood="happy" />
        <h2>Session Complete!</h2>
        <div className="xp-summary">
          <span>XP Earned: <b>{totalXp}</b></span>
          <span>Quiz Score: <b>{totalScore}</b></span>
        </div>
        <div className="streak-summary">
          {totalStreak > 1 && (
            <span>🔥 Longest Streak: {totalStreak} correct in a row!</span>
          )}
        </div>
        <button className="lesson-restart-btn" onClick={() => onComplete({
          xp: totalXp,
          score: totalScore,
          streak: totalStreak
        })}>
          Back to Dashboard
        </button>
      </div>
    );
  };

  // ----- FlashcardViewer Completion Handler -----
  function handleFlashcardSessionComplete(stats) {
    setFlashcardSessionStats(stats);
    setXp((prev) => prev + stats.xp);
    setStep(1); // Move to quizzes
  }

  // ----- Main Render -----
  return (
    <div className="lesson-quiz-session">
      <div className="lesson-header">
        <MascotFace mood={mascotMood} />
        <XPBar
          progress={xp + flashcardSessionStats.xp}
          total={flashcards.length * 5 + quizzes.length * 10}
        />
      </div>
      {step === 0 && (
        <div>
          <div className="lesson-progress">
            Flashcards ({flashcards.length})
          </div>
          <FlashcardViewer
            flashcards={flashcards}
            onSessionComplete={handleFlashcardSessionComplete}
            sessionXpPerCard={5}
            showSessionCompleteButton={true}
            showProgressBar={true}
            showKnownUnknown={true}
            showStatsButton={true}
            showTtsButton={true}
            showDarkModeButton={true}
            showImportExportButton={true}
          />
          <button
            className="lesson-next-btn"
            onClick={() => handleFlashcardSessionComplete({
              xp: flashcardSessionStats.xp || (flashcards.length * 5),
              completed: true,
              knownCount: flashcardSessionStats.knownCount || 0,
              unknownCount: flashcardSessionStats.unknownCount || 0,
              timeSpent: flashcardSessionStats.timeSpent || 0,
              streak: flashcardSessionStats.streak || 0,
              maxStreak: flashcardSessionStats.maxStreak || 0,
              score: flashcardSessionStats.score || "",
            })}
            style={{ marginTop: "1.5rem" }}
          >
            {flashcardSessionStats.completed ? "Continue to Quiz" : "Skip to Quiz"}
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
