import React, { useState, useEffect } from "react";
import WelcomeScreen from "./WelcomeScreen";
import SubjectSelection from "./SubjectSelection";
import LessonQuizSession from "./LessonQuizSession";
import Dashboard from "./Dashboard";
import DevPanel from "./DevPanel";
import { generateFlashcardsAndQuizzes } from "./api";
import "./App.css";

const SESSIONS_KEY = "flashbot_sessions_v1";

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

// Practice Exam Mode Component (integrated for now)
function PracticeExamSession({ quizzes, onComplete, timeLimit = 300 }) {
  // timeLimit in seconds (default 5 minutes)
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState("");
  const [timer, setTimer] = useState(timeLimit);
  const [mascotMood, setMascotMood] = useState("neutral");

  useEffect(() => {
    if (!examStarted || examFinished) return;
    if (timer <= 0) {
      setExamFinished(true);
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [examStarted, examFinished, timer]);

  const handleStart = () => {
    setExamStarted(true);
    setTimer(timeLimit);
    setCurrent(0);
    setAnswers([]);
    setExamFinished(false);
    setMascotMood("neutral");
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
    setAnswers([...answers, { index: current, answer: selected, correct }]);
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
    });
  };

  // Timer display
  const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
  const seconds = String(timer % 60).padStart(2, "0");

  // Render question
  const renderQuestion = () => {
    const q = quizzes[current];
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
            disabled={!!selected && selected.length > 0}
          />
        </div>
      );
    }
    return null;
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
          </ul>
        </div>
        <button className="lesson-next-btn" onClick={handleStart}>
          Start Practice Exam
        </button>
      </div>
    );
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

function App() {
  const [step, setStep] = useState(0); // 0: Welcome, 1: Subject, 2: Loading, 3: Lesson/Quiz, 4: Dashboard, 5: Practice Exam
  const [subjectInfo, setSubjectInfo] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dev mode and analytics state
  const [devMode, setDevMode] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalVisits: 0,
    totalSessions: 0,
    subjectCounts: {},
    lastVisit: null,
  });

  // Load sessions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSIONS_KEY);
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch {
        setSessions([]);
      }
    }
    // Enable dev mode if ?dev=1 in URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("dev") === "1" || localStorage.getItem("flashbot_devmode") === "1") {
      setDevMode(true);
      localStorage.setItem("flashbot_devmode", "1");
    }
    // Update analytics
    let analyticsData = JSON.parse(localStorage.getItem("flashbot_analytics") || "{}");
    analyticsData.totalVisits = (analyticsData.totalVisits || 0) + 1;
    analyticsData.lastVisit = new Date().toISOString();
    localStorage.setItem("flashbot_analytics", JSON.stringify(analyticsData));
    setAnalytics({
      totalVisits: analyticsData.totalVisits || 1,
      totalSessions: analyticsData.totalSessions || 0,
      subjectCounts: analyticsData.subjectCounts || {},
      lastVisit: analyticsData.lastVisit,
    });
  }, []);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // When a session is completed, update analytics
  useEffect(() => {
    if (sessions.length > 0) {
      let analyticsData = JSON.parse(localStorage.getItem("flashbot_analytics") || "{}");
      analyticsData.totalSessions = sessions.length;
      analyticsData.subjectCounts = analyticsData.subjectCounts || {};
      const lastSession = sessions[sessions.length - 1];
      if (lastSession && lastSession.subject) {
        analyticsData.subjectCounts[lastSession.subject] = (analyticsData.subjectCounts[lastSession.subject] || 0) + 1;
      }
      localStorage.setItem("flashbot_analytics", JSON.stringify(analyticsData));
      setAnalytics({
        totalVisits: analyticsData.totalVisits || 1,
        totalSessions: analyticsData.totalSessions || 0,
        subjectCounts: analyticsData.subjectCounts || {},
        lastVisit: analyticsData.lastVisit,
      });
    }
  }, [sessions]);

  // When user clicks "Get Started"
  const handleStart = () => setStep(1);

  // When user selects subject/syllabus and clicks "Continue"
  const handleSubjectChosen = async (info) => {
    setSubjectInfo(info);
    setApiError("");
    setLoading(true);
    setStep(2);
    try {
      const data = await generateFlashcardsAndQuizzes(info);
      setLessonData(data);
      setStep(3);
    } catch (err) {
      setApiError(err.message || "Failed to generate lesson. Please try again.");
      setStep(1);
    }
    setLoading(false);
  };

  // When lesson/quiz session is complete
  const handleSessionComplete = (sessionStats) => {
    setSessions([
      ...sessions,
      {
        subject: subjectInfo.subject,
        date: new Date().toISOString(),
        xp: sessionStats?.xp || 0,
        score: sessionStats?.score || "",
        streak: sessionStats?.streak || 0,
      },
    ]);
    setLessonData(null);
    setSubjectInfo(null);
    setStep(4); // Show dashboard
  };

  // Start a new lesson from dashboard
  const handleStartNewLesson = () => setStep(1);

  // Practice Exam: When complete, go to dashboard
  const handlePracticeExamComplete = (examStats) => {
    setSessions([
      ...sessions,
      {
        subject: subjectInfo?.subject || "Practice Exam",
        date: new Date().toISOString(),
        xp: 0,
        score: examStats?.score || "",
        streak: 0,
        exam: true,
        examStats,
      },
    ]);
    setLessonData(null);
    setSubjectInfo(null);
    setStep(4);
  };

  // Sidebar navigation
  const handleSidebarNav = (navStep) => {
    setSidebarOpen(false);
    setStep(navStep);
  };

  // Sidebar links
  const sidebarLinks = [
    { label: "Home", icon: "🏠", step: 0 },
    { label: "Subjects", icon: "📚", step: 1 },
    { label: "Dashboard", icon: "📊", step: 4 },
    { label: "Practice Exam", icon: "📝", step: 5 },
    ...(devMode ? [{ label: "Dev Panel", icon: "🛠️", step: null }] : []),
  ];

  // For Practice Exam: Use quizzes from lessonData or fallback
  let practiceExamQuizzes = [];
  if (lessonData && lessonData.quizzes && lessonData.quizzes.length > 0) {
    // Randomly select up to 15 questions for the exam
    practiceExamQuizzes = shuffle(lessonData.quizzes).slice(0, 15);
  }

  return (
    <div className="AppLayout">
      {/* Header */}
      <header className={`AppHeader${sidebarOpen ? " sidebar-open" : ""}`}>
        <button
          className="SidebarToggle"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <span className="hamburger"></span>
        </button>
        <div className="AppLogoTitle" onClick={() => setStep(0)}>
          <svg width="36" height="36" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="header-mascot">
            <circle cx="70" cy="70" r="65" fill="#e3f0ff" />
            <ellipse cx="70" cy="80" rx="45" ry="38" fill="#fff" />
            <ellipse cx="70" cy="60" rx="38" ry="32" fill="#2196f3" />
            <ellipse cx="70" cy="60" rx="32" ry="26" fill="#fff" />
            <ellipse cx="52" cy="60" rx="6" ry="8" fill="#2196f3" />
            <ellipse cx="88" cy="60" rx="6" ry="8" fill="#2196f3" />
            <ellipse cx="52" cy="62" rx="2.2" ry="3" fill="#fff" />
            <ellipse cx="88" cy="62" rx="2.2" ry="3" fill="#fff" />
            <rect x="56" y="78" width="28" height="6" rx="3" fill="#2196f3" />
            <ellipse cx="70" cy="110" rx="20" ry="6" fill="#e3f0ff" />
            <rect x="67" y="18" width="6" height="18" rx="3" fill="#2196f3" />
            <circle cx="70" cy="15" r="5" fill="#fff" stroke="#2196f3" strokeWidth="2" />
          </svg>
          <span className="AppTitle">Flashcard AI</span>
        </div>
      </header>

      {/* Sidebar */}
      <nav className={`Sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="SidebarHeader">
          <span className="SidebarTitle">Menu</span>
          <button className="SidebarClose" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}>
            ×
          </button>
        </div>
        <ul className="SidebarLinks">
          {sidebarLinks.map((link, idx) => (
            <li key={link.label}>
              <button
                className="SidebarLink"
                onClick={() => {
                  if (link.step !== null) handleSidebarNav(link.step);
                }}
              >
                <span className="SidebarIcon">{link.icon}</span>
                {link.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="SidebarFooter">
          <span className="SidebarVersion">v1.0</span>
        </div>
      </nav>

      {/* Overlay for sidebar */}
      {sidebarOpen && <div className="SidebarOverlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <main className={`AppMain${sidebarOpen ? " sidebar-open" : ""}`}>
        {step === 0 && <WelcomeScreen onStart={handleStart} />}
        {step === 1 && (
          <>
            <SubjectSelection onSubjectChosen={handleSubjectChosen} />
            {apiError && (
              <div style={{
                color: "#b71c1c",
                background: "#e3f0ff",
                padding: "1rem",
                borderRadius: "1.2rem",
                margin: "1rem auto",
                maxWidth: 420,
                fontWeight: 600,
                textAlign: "center"
              }}>
                {apiError}
              </div>
            )}
          </>
        )}
        {step === 2 && (
          <div style={{
            marginTop: "6rem",
            textAlign: "center",
            color: "#1976d2",
            fontSize: "1.25rem",
            fontWeight: 500
          }}>
            <div className="mascot-container" style={{ marginBottom: "1.5rem" }}>
              {/* Small mascot for loading */}
              <svg
                width="70"
                height="70"
                viewBox="0 0 140 140"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="robot-mascot"
                style={{ animation: "mascot-bounce 1.2s infinite" }}
              >
                <circle cx="70" cy="70" r="65" fill="#e3f0ff" />
                <ellipse cx="70" cy="80" rx="45" ry="38" fill="#fff" />
                <ellipse cx="70" cy="60" rx="38" ry="32" fill="#2196f3" />
                <ellipse cx="70" cy="60" rx="32" ry="26" fill="#fff" />
                <ellipse cx="52" cy="60" rx="6" ry="8" fill="#2196f3" />
                <ellipse cx="88" cy="60" rx="6" ry="8" fill="#2196f3" />
                <ellipse cx="52" cy="62" rx="2.2" ry="3" fill="#fff" />
                <ellipse cx="88" cy="62" rx="2.2" ry="3" fill="#fff" />
                <rect x="56" y="78" width="28" height="6" rx="3" fill="#2196f3" />
                <ellipse cx="70" cy="110" rx="20" ry="6" fill="#e3f0ff" />
                <rect x="67" y="18" width="6" height="18" rx="3" fill="#2196f3" />
                <circle cx="70" cy="15" r="5" fill="#fff" stroke="#2196f3" strokeWidth="2" />
              </svg>
            </div>
            Generating your lesson and quiz...
          </div>
        )}
        {step === 3 && lessonData && (
          <LessonQuizSession
            flashcards={lessonData.flashcards}
            quizzes={lessonData.quizzes}
            onComplete={(stats) => handleSessionComplete(stats)}
          />
        )}
        {step === 4 && (
          <Dashboard sessions={sessions} onStartNew={handleStartNewLesson} />
        )}
        {step === 5 && lessonData && practiceExamQuizzes.length > 0 && (
          <PracticeExamSession
            quizzes={practiceExamQuizzes}
            onComplete={handlePracticeExamComplete}
            timeLimit={600} // 10 minutes for exam
          />
        )}
        {step === 5 && (!lessonData || practiceExamQuizzes.length === 0) && (
          <div className="lesson-quiz-session">
            <div className="lesson-header">
              <MascotFace mood="sad" />
              <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#1976d2" }}>Practice Exam Mode</div>
            </div>
            <div style={{ margin: "1.2rem 0", fontSize: "1.08rem", color: "#263859" }}>
              <p>You need to generate a subject and lesson before starting a practice exam.</p>
              <button className="lesson-next-btn" onClick={() => setStep(1)}>
                Choose Subject
              </button>
            </div>
          </div>
        )}
        {devMode && <DevPanel analytics={analytics} />}
      </main>
    </div>
  );
}

export default App;
