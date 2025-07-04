import React, { useState, useEffect, useRef } from "react";
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

// Mascot for exam mode
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

function PracticeExamSession({ quizzes, onComplete, timeLimit = 600 }) {
  // timeLimit in seconds (default 10 minutes)
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState("");
  const [timer, setTimer] = useState(timeLimit);
  const [mascotMood, setMascotMood] = useState("neutral");
  const [reviewMode, setReviewMode] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (!examStarted || examFinished) return;
    if (timer <= 0) {
      setExamFinished(true);
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [examStarted, examFinished, timer]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [current, examStarted, reviewMode]);

  // Keyboard navigation
  useEffect(() => {
    if (!examStarted || examFinished || reviewMode) return;
    const handleKeyDown = (e) => {
      if (["mcq", "truefalse"].includes(quizzes[current].type)) {
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          const opts = getOptions();
          if (!selected) setSelected(opts[0]);
          else {
            const idx = opts.indexOf(selected);
            setSelected(opts[(idx + 1) % opts.length]);
          }
        }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          const opts = getOptions();
          if (!selected) setSelected(opts[opts.length - 1]);
          else {
            const idx = opts.indexOf(selected);
            setSelected(opts[(idx - 1 + opts.length) % opts.length]);
          }
        }
        if (e.key === "Enter" && selected) {
          e.preventDefault();
          handleSubmit();
        }
      } else if ((quizzes[current].type === "fillblank" || quizzes[current].type === "short") && e.key === "Enter" && selected) {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [selected, current, examStarted, examFinished, reviewMode]);

  const handleStart = () => {
    setExamStarted(true);
    setTimer(timeLimit);
    setCurrent(0);
    setAnswers([]);
    setExamFinished(false);
    setReviewMode(false);
    setMascotMood("neutral");
    setSelected("");
  };

  const handleSelect = (value) => {
    setSelected(value);
  };

  const handleSubmit = () => {
    const q = quizzes[current];
    let correct = false;
    if (q.type === "mcq" || q.type === "truefalse") {
      correct = selected === q.answer;
    } else {
      correct = selected.trim().toLowerCase() === q.answer.trim().toLowerCase();
    }
    setAnswers([...answers, { index: current, answer: selected, correct, question: q }]);
    setMascotMood(correct ? "happy" : "sad");
    setTimeout(() => {
      setMascotMood("neutral");
      setSelected("");
      if (current < quizzes.length - 1) {
        setCurrent(current + 1);
      } else {
        setExamFinished(true);
      }
    }, 700);
  };

  const handleFinish = () => {
    setExamFinished(true);
  };

  const handleBackToDashboard = () => {
    onComplete({
      score: `${answers.filter(a => a.correct).length} / ${quizzes.length}`,
      correct: answers.filter(a => a.correct).length,
      total: quizzes.length,
      timeUsed: timeLimit - timer,
      answers,
    });
  };

  const handleReview = () => {
    setReviewMode(true);
    setCurrent(0);
  };

  const handleReviewNav = (dir) => {
    if (dir === "prev" && current > 0) setCurrent(current - 1);
    if (dir === "next" && current < quizzes.length - 1) setCurrent(current + 1);
  };

  // Timer display
  const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
  const seconds = String(timer % 60).padStart(2, "0");

  // Get options for MCQ/TF
  const getOptions = () => {
    const q = quizzes[current];
    if (q.type === "mcq") {
      return shuffle([q.answer, ...q.options.filter(opt => opt !== q.answer)]).slice(0, 4);
    }
    if (q.type === "truefalse") {
      return ["True", "False"];
    }
    return [];
  };

  // Render question
  const renderQuestion = () => {
    const q = quizzes[current];
    if (!q) return null;
    if (q.type === "mcq") {
      const options = getOptions();
      return (
        <div className="lesson-card quiz-card">
          <span className="card-label">Multiple Choice</span>
          <div className="card-q">{q.question}</div>
          <div className="quiz-options">
            {options.map((opt, i) => (
              <button
                key={i}
                className={`quiz-option-btn${selected === opt ? " selected" : ""}`}
                onClick={() => handleSelect(opt)}
                tabIndex={0}
                disabled={selected && selected !== opt}
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
              className={`quiz-option-btn${selected === "True" ? " selected" : ""}`}
              onClick={() => handleSelect("True")}
              tabIndex={0}
              disabled={selected && selected !== "True"}
            >
              True
            </button>
            <button
              className={`quiz-option-btn${selected === "False" ? " selected" : ""}`}
              onClick={() => handleSelect("False")}
              tabIndex={0}
              disabled={selected && selected !== "False"}
            >
              False
            </button>
          </div>
        </div>
      );
    }
    if (q.type === "fillblank" || q.type === "short") {
      return (
        <div className="lesson-card quiz-card">
          <span className="card-label">{q.type === "fillblank" ? "Fill in the Blank" : "Short Answer"}</span>
          <div className="card-q">{q.question}</div>
          <input
            className="quiz-input"
            value={selected}
            onChange={(e) => handleSelect(e.target.value)}
            placeholder="Type your answer"
            tabIndex={0}
            ref={inputRef}
            disabled={!!selected && selected.length > 0}
          />
        </div>
      );
    }
    return null;
  };

  // Render review
  const renderReview = () => {
    const a = answers[current];
    if (!a) return null;
    const q = a.question;
    return (
      <div className="lesson-quiz-session">
        <div className="lesson-header">
          <MascotFace mood={a.correct ? "happy" : "sad"} />
          <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#1976d2" }}>Review Answers</div>
        </div>
        <div className="lesson-progress">
          Question {current + 1} / {quizzes.length}
        </div>
        <div className="lesson-card quiz-card">
          <span className="card-label">{q.type === "mcq" ? "Multiple Choice" : q.type === "truefalse" ? "True/False" : q.type === "fillblank" ? "Fill in the Blank" : "Short Answer"}</span>
          <div className="card-q">{q.question}</div>
          <div style={{ margin: "1.1rem 0", fontWeight: 600 }}>
            <span style={{ color: a.correct ? "#43a047" : "#e53935" }}>
              Your Answer: {a.answer}
            </span>
            <br />
            <span style={{ color: "#1976d2" }}>
              Correct Answer: {q.answer}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1.2rem", marginTop: "1.2rem" }}>
          <button className="lesson-next-btn" onClick={() => handleReviewNav("prev")} disabled={current === 0}>Previous</button>
          <button className="lesson-next-btn" onClick={() => handleReviewNav("next")} disabled={current === quizzes.length - 1}>Next</button>
        </div>
        <button className="lesson-restart-btn" style={{ marginTop: "1.2rem" }} onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
      </div>
    );
  };

  // Render summary
  const renderSummary = () => {
    const correct = answers.filter(a => a.correct).length;
    return (
      <div className="lesson-complete">
        <MascotFace mood={correct / quizzes.length > 0.7 ? "happy" : "neutral"} />
        <h2>Practice Exam Complete!</h2>
        <div className="xp-summary">
          <span>Score: <b>{correct} / {quizzes.length}</b></span>
        </div>
        <div className="xp-summary">
          <span>Time Used: <b>{Math.floor((timeLimit - timer) / 60)}:{String((timeLimit - timer) % 60).padStart(2, "0")}</b></span>
        </div>
        <button className="lesson-next-btn" onClick={handleReview}>
          Review Answers
        </button>
        <button className="lesson-restart-btn" onClick={handleBackToDashboard}>
          Back to Dashboard
        </button>
      </div>
    );
  };

  if (!examStarted) {
    return (
      <div className="lesson-quiz-session">
        <div className="lesson-header">
          <MascotFace mood="neutral" />
          <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#1976d2" }}>Practice Exam Mode</div>
        </div>
        <div style={{ margin: "1.2rem 0", fontSize: "1.08rem", color: "#263859" }}>
          <ul style={{ textAlign: "left", margin: "0 auto", maxWidth: 420 }}>
            <li>Random selection of questions from your subject.</li>
            <li>Timed exam: {Math.floor(timeLimit / 60)} minutes.</li>
            <li>No hints, no retries. One attempt per question.</li>
            <li>Score and time summary at the end.</li>
            <li>Keyboard navigation: Arrow keys to select, Enter to submit.</li>
          </ul>
        </div>
        <button className="lesson-next-btn" onClick={handleStart}>
          Start Practice Exam
        </button>
      </div>
    );
  }

  if (reviewMode) {
    return renderReview();
  }

  if (examFinished || timer <= 0) {
    return (
      <div className="lesson-quiz-session">
        {renderSummary()}
      </div>
    );
  }

  return (
    <div className="lesson-quiz-session">
      <div className="lesson-header">
        <MascotFace mood={mascotMood} />
        <div className="xp-bar" style={{ maxWidth: 120 }}>
          <div className="xp-bar-fill" style={{ width: `${Math.round(((current + 1) / quizzes.length) * 100)}%`, background: "#ff9800" }} />
          <span className="xp-bar-text" style={{ color: "#ff9800" }}>
            {current + 1} / {quizzes.length}
          </span>
        </div>
        <div className="exam-timer" style={{
          fontWeight: 700,
          fontSize: "1.1rem",
          color: timer < 30 ? "#e53935" : "#1976d2",
          marginLeft: "1.2rem"
        }}>
          ⏰ {minutes}:{seconds}
        </div>
      </div>
      <div className="lesson-progress">
        Practice Exam Question {current + 1} / {quizzes.length}
      </div>
      {renderQuestion()}
      <button
        className="lesson-next-btn"
        style={{ marginTop: "1.2rem" }}
        onClick={handleSubmit}
        disabled={!selected}
      >
        Submit Answer
      </button>
      <button
        className="lesson-restart-btn"
        style={{ marginTop: "0.7rem", background: "#fff", color: "#1976d2", border: "1.5px solid #1976d2" }}
        onClick={handleFinish}
      >
        Finish Exam Early
      </button>
    </div>
  );
}

export default PracticeExamSession;
