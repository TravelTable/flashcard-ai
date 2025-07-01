import React, { useState, useEffect } from "react";
import WelcomeScreen from "./WelcomeScreen";
import SubjectSelection from "./SubjectSelection";
import LessonQuizSession from "./LessonQuizSession";
import Dashboard from "./Dashboard";
import DevPanel from "./DevPanel";
import { generateFlashcardsAndQuizzes } from "./api";
import "./App.css";

const SESSIONS_KEY = "flashbot_sessions_v1";

function App() {
  const [step, setStep] = useState(0); // 0: Welcome, 1: Subject, 2: Loading, 3: Lesson/Quiz, 4: Dashboard
  const [subjectInfo, setSubjectInfo] = useState(null);
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [sessions, setSessions] = useState([]);

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

  return (
    <div className="App">
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
      {devMode && <DevPanel analytics={analytics} />}
    </div>
  );
}

export default App;