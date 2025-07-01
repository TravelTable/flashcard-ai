import React, { useState } from "react";
import "./SubjectSelection.css";

const POPULAR_SUBJECTS = [
  "NSW Year 11 Computer Enterprise",
  "AP Biology",
  "GCSE Mathematics",
  "SAT English",
  "HSC Chemistry",
  "A-Level Physics",
  "IB History",
  "US History",
  "French Language",
  "Computer Science",
  "Business Studies",
  "World Geography"
];

function SubjectSelection({ onSubjectChosen }) {
  const [search, setSearch] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState(POPULAR_SUBJECTS);
  const [chosenSubject, setChosenSubject] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [error, setError] = useState("");

  // Update filtered subjects as user types
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setFilteredSubjects(
      POPULAR_SUBJECTS.filter((subj) =>
        subj.toLowerCase().includes(value.toLowerCase())
      )
    );
    setChosenSubject(value);
    setError("");
  };

  // When user clicks a subject from the list
  const handleSubjectClick = (subject) => {
    setSearch(subject);
    setChosenSubject(subject);
    setError("");
  };

  // When user clicks "Continue"
  const handleContinue = () => {
    if (!chosenSubject.trim()) {
      setError("Please enter or select a subject.");
      return;
    }
    onSubjectChosen({
      subject: chosenSubject.trim(),
      syllabus: syllabus.trim()
    });
  };

  return (
    <div className="subject-selection">
      <h2 className="subject-title">Choose Your Subject</h2>
      <p className="subject-desc">
        Search for your subject or add a new one. <br />
        <span className="subject-ai-tip">
          Our AI can generate flashcards and quizzes for any subject or curriculum!
        </span>
      </p>
      <div className="subject-search-box">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search or add your subject..."
          className="subject-search-input"
          autoFocus
        />
        {search && filteredSubjects.length > 0 && (
          <ul className="subject-dropdown">
            {filteredSubjects.map((subject) => (
              <li
                key={subject}
                className="subject-dropdown-item"
                onClick={() => handleSubjectClick(subject)}
              >
                {subject}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="subject-or">or</div>
      <textarea
        className="syllabus-input"
        value={syllabus}
        onChange={(e) => setSyllabus(e.target.value)}
        rows={4}
        placeholder="Paste syllabus or module dot-points here (optional, for more tailored flashcards and quizzes)..."
      />
      {error && <div className="subject-error">{error}</div>}
      <button className="subject-continue-btn" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
}

export default SubjectSelection;