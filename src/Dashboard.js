import React from "react";
import "./Dashboard.css";

function Dashboard({ sessions, onStartNew }) {
  // sessions: array of {subject, date, xp, score, streak}
  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Your Progress</h2>
      {(!sessions || sessions.length === 0) ? (
        <div className="dashboard-empty">
          <p>You haven't completed any sessions yet.</p>
          <button className="dashboard-new-btn" onClick={onStartNew}>
            Start Your First Lesson!
          </button>
        </div>
      ) : (
        <>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Date</th>
                <th>XP</th>
                <th>Quiz Score</th>
                <th>Streak</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i}>
                  <td>{s.subject}</td>
                  <td>{new Date(s.date).toLocaleDateString()}</td>
                  <td>{s.xp}</td>
                  <td>{s.score}</td>
                  <td>{s.streak}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="dashboard-new-btn" onClick={onStartNew}>
            Start New Lesson
          </button>
        </>
      )}
    </div>
  );
}

export default Dashboard;