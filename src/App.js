import React, { useState, useEffect } from "react";
import WelcomeScreen from "./WelcomeScreen";
import SubjectSelection from "./SubjectSelection";
import LessonQuizSession from "./LessonQuizSession";
import Dashboard from "./Dashboard";
import DevPanel from "./DevPanel";
import PracticeExamSession from "./PracticeExamSession";
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

  // Only show sidebar/header if NOT on welcome screen
  const showLayout = step !== 0;

  return (
    <div className="AppLayout">
      {showLayout && (
        <>
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
        </>
      )}

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
              <svg width="58" height="58" viewBox="0 0 140 140" style={{ display: "block" }}>
                <ellipse cx="70" cy="70" rx="55" ry="55" fill="#e3f0ff" />
                <ellipse cx="70" cy="70" rx="38" ry="32" fill="#1976d2" />
                <ellipse cx="70" cy="70" rx="32" ry="26" fill="#fff" />
                <ellipse cx="55" cy="72" rx="6" ry="8" fill="#1976d2" />
                <ellipse cx="85" cy="72" rx="6" ry="8" fill="#1976d2" />
                <ellipse cx="55" cy="74" rx="2.2" ry="3" fill="#fff" />
                <ellipse cx="85" cy="74" rx="2.2" ry="3" fill="#fff" />
                <path d="M60 85 Q70 75 80 85" stroke="#1976d2" strokeWidth="3" fill="none" />
              </svg>
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
