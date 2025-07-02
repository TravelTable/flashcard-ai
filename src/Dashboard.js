import React, { useMemo } from "react";
import "./Dashboard.css";

/**
 * Dashboard Component
 * Shows a summary table of all completed learning sessions.
 * Features:
 * - Accessible, semantic markup
 * - Responsive, animated, and visually unified with the app
 * - Handles empty state and non-empty state
 * - Advanced: calculates totals, best streak, XP, and quiz stats
 * - Keyboard accessible and screen-reader friendly
 *
 * Props:
 * - sessions: Array of session objects:
 *   { subject: string, date: string|Date, xp: number, score: string|number, streak: number }
 * - onStartNew: function to start a new lesson
 */
function Dashboard({ sessions, onStartNew }) {
  // Memoize stats for performance
  const stats = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        totalXP: 0,
        bestStreak: 0,
        avgScore: 0,
        totalSessions: 0,
        lastSession: null,
        subjects: [],
      };
    }
    let totalXP = 0;
    let bestStreak = 0;
    let totalScore = 0;
    let totalSessions = sessions.length;
    let lastSession = sessions[0];
    let subjects = {};
    sessions.forEach((s) => {
      totalXP += Number(s.xp) || 0;
      bestStreak = Math.max(bestStreak, Number(s.streak) || 0);
      totalScore += Number(s.score) || 0;
      if (!lastSession || new Date(s.date) > new Date(lastSession.date)) {
        lastSession = s;
      }
      if (s.subject) {
        subjects[s.subject] = (subjects[s.subject] || 0) + 1;
      }
    });
    const avgScore = totalSessions > 0 ? (totalScore / totalSessions).toFixed(2) : 0;
    return {
      totalXP,
      bestStreak,
      avgScore,
      totalSessions,
      lastSession,
      subjects: Object.entries(subjects).map(([name, count]) => ({ name, count })),
    };
  }, [sessions]);

  return (
    <div className="dashboard" role="region" aria-label="User Progress Dashboard">
      <h2 className="dashboard-title" tabIndex={0}>Your Progress</h2>
      {/* Summary Stats */}
      {sessions && sessions.length > 0 && (
        <div
          className="dashboard-summary"
          style={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.2rem",
            gap: "0.7rem",
            background: "linear-gradient(90deg, #e3eaff 60%, #f7faff 100%)",
            borderRadius: "1.2rem",
            boxShadow: "0 1px 8px #2196f322",
            padding: "0.7rem 1.1rem",
            fontWeight: 600,
            fontSize: "1.07rem",
          }}
          aria-label="Progress summary"
        >
          <span title="Total XP" aria-label={`Total XP: ${stats.totalXP}`}>
            <span role="img" aria-label="XP">⭐</span> {stats.totalXP} XP
          </span>
          <span title="Best Streak" aria-label={`Best streak: ${stats.bestStreak} days`}>
            <span role="img" aria-label="Streak">🔥</span> {stats.bestStreak} day streak
          </span>
          <span title="Average Quiz Score" aria-label={`Average quiz score: ${stats.avgScore}`}>
            <span role="img" aria-label="Quiz">📝</span> Avg Score: {stats.avgScore}
          </span>
          <span title="Total Sessions" aria-label={`Total sessions: ${stats.totalSessions}`}>
            <span role="img" aria-label="Sessions">📚</span> {stats.totalSessions} sessions
          </span>
        </div>
      )}

      {/* Empty State */}
      {(!sessions || sessions.length === 0) ? (
        <div className="dashboard-empty" tabIndex={0}>
          <p>You haven't completed any sessions yet.</p>
          <button
            className="dashboard-new-btn"
            onClick={onStartNew}
            aria-label="Start your first lesson"
            autoFocus
          >
            Start Your First Lesson!
          </button>
        </div>
      ) : (
        <>
          {/* Table of Sessions */}
          <table className="dashboard-table" aria-label="Progress Table">
            <thead>
              <tr>
                <th scope="col">Subject</th>
                <th scope="col">Date</th>
                <th scope="col">XP</th>
                <th scope="col">Quiz Score</th>
                <th scope="col">Streak</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i}>
                  <td>{s.subject}</td>
                  <td>
                    <time dateTime={new Date(s.date).toISOString()}>
                      {new Date(s.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </td>
                  <td>
                    <span aria-label={`${s.xp} experience points`}>
                      {s.xp}
                    </span>
                  </td>
                  <td>
                    <span aria-label={`Quiz score: ${s.score}`}>
                      {s.score}
                    </span>
                  </td>
                  <td>
                    <span aria-label={`Streak: ${s.streak} days`}>
                      {s.streak}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Subject Breakdown */}
          {stats.subjects.length > 1 && (
            <div
              className="dashboard-subjects"
              style={{
                width: "100%",
                marginBottom: "1.2rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "0.7rem",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "1.01rem",
                color: "#1976d2",
                fontWeight: 600,
              }}
              aria-label="Subject breakdown"
            >
              {stats.subjects.map((subj, idx) => (
                <span
                  key={subj.name}
                  style={{
                    background: "#e3f0ff",
                    borderRadius: "1.1rem",
                    padding: "0.3rem 1.1rem",
                    boxShadow: "0 1px 4px #2196f322",
                  }}
                  aria-label={`${subj.name}: ${subj.count} sessions`}
                >
                  {subj.name}: {subj.count}
                </span>
              ))}
            </div>
          )}

          {/* Last Session Info */}
          {stats.lastSession && (
            <div
              className="dashboard-last-session"
              style={{
                width: "100%",
                marginBottom: "1.2rem",
                background: "linear-gradient(90deg, #f7faff 60%, #e3eaff 100%)",
                borderRadius: "1.1rem",
                boxShadow: "0 1px 8px #2196f322",
                padding: "0.6rem 1.1rem",
                fontSize: "1.01rem",
                color: "#263859",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "0.7rem",
              }}
              aria-label="Last session"
            >
              <span role="img" aria-label="Last session">⏰</span>
              Last session: <b>{stats.lastSession.subject}</b> on{" "}
              <time dateTime={new Date(stats.lastSession.date).toISOString()}>
                {new Date(stats.lastSession.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              , XP: <b>{stats.lastSession.xp}</b>, Score: <b>{stats.lastSession.score}</b>
            </div>
          )}

          {/* Start New Lesson Button */}
          <button
            className="dashboard-new-btn"
            onClick={onStartNew}
            aria-label="Start a new lesson"
          >
            Start New Lesson
          </button>
        </>
      )}
    </div>
  );
}

export default Dashboard;
