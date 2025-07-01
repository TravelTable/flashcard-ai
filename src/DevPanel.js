import React, { useState } from "react";
import "./DevPanel.css";

function DevPanel({ analytics }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="devpanel-fab"
        onClick={() => setOpen((v) => !v)}
        title="Open Dev Panel"
      >
        🛠️
      </button>
      {open && (
        <div className="devpanel-modal">
          <div className="devpanel-header">
            <span>Dev Analytics Panel</span>
            <button className="devpanel-close" onClick={() => setOpen(false)}>
              ✖
            </button>
          </div>
          <div className="devpanel-content">
            <div><b>Total Visits:</b> {analytics.totalVisits}</div>
            <div><b>Total Sessions:</b> {analytics.totalSessions}</div>
            <div><b>Unique Subjects:</b> {Object.keys(analytics.subjectCounts).length}</div>
            <div><b>Most Popular Subjects:</b>
              <ol>
                {Object.entries(analytics.subjectCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([subject, count]) => (
                    <li key={subject}>{subject} ({count})</li>
                  ))}
              </ol>
            </div>
            <div><b>Last Visit:</b> {analytics.lastVisit ? new Date(analytics.lastVisit).toLocaleString() : "Never"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DevPanel;