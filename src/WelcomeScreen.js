import React from "react";
import "./WelcomeScreen.css";

function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome-screen">
      <div className="mascot-container">
        {/* Cute robot mascot SVG */}
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="robot-mascot"
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
          {/* Antenna */}
          <rect x="67" y="18" width="6" height="18" rx="3" fill="#2196f3" />
          <circle cx="70" cy="15" r="5" fill="#fff" stroke="#2196f3" strokeWidth="2" />
        </svg>
      </div>
      <h1 className="welcome-title">Welcome to FlashBot!</h1>
      <p className="welcome-message">
        Our AI can generate flashcards and quizzes for <b>any subject</b>, from <b>any country</b> or curriculum.
        <br />
        Just search or add your subject below!
      </p>
      <button className="get-started-btn" onClick={onStart}>
        Get Started
      </button>
    </div>
  );
}

export default WelcomeScreen;