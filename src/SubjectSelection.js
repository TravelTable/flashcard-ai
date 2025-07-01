import React, { useState, useRef, useEffect } from "react";
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
  "World Geography",
  "AP Calculus AB",
  "AP Calculus BC",
  "AP Chemistry",
  "AP Physics 1",
  "AP Physics 2",
  "AP Physics C",
  "AP Statistics",
  "AP US Government",
  "AP World History",
  "AP Psychology",
  "AP Environmental Science",
  "AP Human Geography",
  "AP Macroeconomics",
  "AP Microeconomics",
  "AP English Literature",
  "AP English Language",
  "AP Art History",
  "AP Music Theory",
  "AP Computer Science A",
  "AP Computer Science Principles",
  "A-Level Mathematics",
  "A-Level Chemistry",
  "A-Level Biology",
  "A-Level Economics",
  "A-Level English Literature",
  "A-Level English Language",
  "A-Level Geography",
  "A-Level History",
  "A-Level Business",
  "A-Level Psychology",
  "A-Level Sociology",
  "A-Level Politics",
  "A-Level Law",
  "A-Level Further Mathematics",
  "A-Level Computer Science",
  "IB Mathematics: Analysis and Approaches",
  "IB Mathematics: Applications and Interpretation",
  "IB Chemistry",
  "IB Biology",
  "IB Physics",
  "IB Economics",
  "IB Business Management",
  "IB Psychology",
  "IB Geography",
  "IB English Literature",
  "IB English Language and Literature",
  "IB Environmental Systems and Societies",
  "IB Global Politics",
  "IB History of the Americas",
  "IB French B",
  "IB Spanish B",
  "IB Mandarin B",
  "IB German B",
  "IB Visual Arts",
  "IB Music",
  "IB Theatre",
  "IB Film",
  "IB Computer Science",
  "SAT Mathematics",
  "SAT Reading",
  "SAT Writing and Language",
  "SAT Physics",
  "SAT Chemistry",
  "SAT Biology",
  "SAT US History",
  "SAT World History",
  "SAT Literature",
  "SAT French",
  "SAT Spanish",
  "SAT German",
  "SAT Italian",
  "SAT Latin",
  "SAT Modern Hebrew",
  "SAT Chinese",
  "SAT Japanese",
  "SAT Korean",
  "GCSE English Language",
  "GCSE English Literature",
  "GCSE Biology",
  "GCSE Chemistry",
  "GCSE Physics",
  "GCSE Combined Science",
  "GCSE Geography",
  "GCSE History",
  "GCSE French",
  "GCSE Spanish",
  "GCSE German",
  "GCSE Computer Science",
  "GCSE Business",
  "GCSE Economics",
  "GCSE Psychology",
  "GCSE Sociology",
  "GCSE Religious Studies",
  "GCSE Art and Design",
  "GCSE Music",
  "GCSE Drama",
  "GCSE Physical Education",
  "GCSE Design and Technology",
  "GCSE Food Preparation and Nutrition",
  "GCSE Media Studies",
  "GCSE Citizenship Studies",
  "GCSE Statistics",
  "GCSE Further Mathematics",
  "GCSE Latin",
  "GCSE Classical Greek",
  "GCSE Mandarin",
  "GCSE Italian",
  "GCSE Polish",
  "GCSE Russian",
  "GCSE Urdu",
  "GCSE Arabic",
  "GCSE Bengali",
  "GCSE Gujarati",
  "GCSE Hebrew",
  "GCSE Japanese",
  "GCSE Panjabi",
  "GCSE Persian",
  "GCSE Portuguese",
  "GCSE Turkish",
  "GCSE Modern Greek",
  "GCSE Dutch",
  "GCSE Irish",
  "GCSE Welsh",
  "GCSE Chinese",
  "GCSE Czech",
  "GCSE Danish",
  "GCSE Finnish",
  "GCSE Hungarian",
  "GCSE Slovak",
  "GCSE Swedish",
  "GCSE Thai",
  "GCSE Croatian",
  "GCSE Romanian",
  "GCSE Bulgarian",
  "GCSE Lithuanian",
  "GCSE Estonian",
  "GCSE Latvian",
  "GCSE Slovenian",
  "GCSE Maltese",
  "GCSE Norwegian",
  "GCSE Serbian",
  "GCSE Ukrainian",
  "GCSE Vietnamese",
  "GCSE Filipino",
  "GCSE Malay",
  "GCSE Swahili",
  "GCSE Afrikaans",
  "GCSE Zulu",
  "GCSE Xhosa",
  "GCSE Sesotho",
  "GCSE Setswana",
  "GCSE Sepedi",
  "GCSE Tshivenda",
  "GCSE Siswati",
  "GCSE isiNdebele",
  "GCSE isiXhosa",
  "GCSE isiZulu",
  "GCSE Shona",
  "GCSE Chichewa",
  "GCSE Yoruba",
  "GCSE Igbo",
  "GCSE Hausa",
  "GCSE Somali",
  "GCSE Amharic",
  "GCSE Tigrinya",
  "GCSE Oromo",
  "GCSE Malagasy",
  "GCSE Malagasy",
  "GCSE Maori",
  "GCSE Samoan",
  "GCSE Tongan",
  "GCSE Fijian",
  "GCSE Tahitian",
  "GCSE Hawaiian",
  "GCSE Chamorro",
  "GCSE Palauan",
  "GCSE Marshallese",
  "GCSE Bislama",
  "GCSE Tok Pisin",
  "GCSE Hiri Motu",
  "GCSE Tetum",
  "GCSE Pidgin English",
  "GCSE Tokelauan",
  "GCSE Tuvaluan",
  "GCSE Nauruan",
  "GCSE Kiribati",
  "GCSE Niuean",
  "GCSE Rapa Nui",
  "GCSE Rarotongan",
  "GCSE Mangarevan",
  "GCSE Marquesan",
  "GCSE Tuamotuan",
  "GCSE Austral",
  "GCSE Gambier",
  "GCSE Rapa",
  "GCSE Pitcairn-Norfolk",
  "GCSE Pitkern",
  "GCSE Norfuk",
  "GCSE English as a Second Language",
  "GCSE English as an Additional Language",
  "GCSE English as a Foreign Language",
  "GCSE English as a New Language",
  "GCSE English for Speakers of Other Languages",
  "GCSE English for Academic Purposes",
  "GCSE English for Occupational Purposes",
  "GCSE English for Specific Purposes",
  "GCSE English for Business",
  "GCSE English for Law",
  "GCSE English for Medicine",
  "GCSE English for Science",
  "GCSE English for Technology",
  "GCSE English for Engineering",
  "GCSE English for Tourism",
  "GCSE English for Hospitality",
  "GCSE English for Aviation",
  "GCSE English for Maritime Studies",
  "GCSE English for Military Purposes",
  "GCSE English for Police Purposes",
  "GCSE English for Fire Services",
  "GCSE English for Emergency Services",
  "GCSE English for Social Work",
  "GCSE English for Nursing",
  "GCSE English for Healthcare",
  "GCSE English for Dentistry",
  "GCSE English for Pharmacy",
  "GCSE English for Veterinary Science",
  "GCSE English for Agriculture",
  "GCSE English for Horticulture",
  "GCSE English for Forestry",
  "GCSE English for Fisheries",
  "GCSE English for Mining",
  "GCSE English for Oil and Gas",
  "GCSE English for Renewable Energy",
  "GCSE English for Environmental Science",
  "GCSE English for Climate Change",
  "GCSE English for Sustainable Development",
  "GCSE English for International Relations",
  "GCSE English for Diplomacy",
  "GCSE English for Peacekeeping",
  "GCSE English for Humanitarian Aid",
  "GCSE English for Disaster Relief",
  "GCSE English for Refugees",
  "GCSE English for Migrants",
  "GCSE English for Asylum Seekers",
  "GCSE English for Integration",
  "GCSE English for Inclusion",
  "GCSE English for Diversity",
  "GCSE English for Equality",
  "GCSE English for Social Justice",
  "GCSE English for Human Rights",
  "GCSE English for Gender Equality",
  "GCSE English for LGBTQ+",
  "GCSE English for Disability",
  "GCSE English for Mental Health",
  "GCSE English for Wellbeing",
  "GCSE English for Mindfulness",
  "GCSE English for Meditation",
  "GCSE English for Yoga",
  "GCSE English for Fitness",
  "GCSE English for Nutrition",
  "GCSE English for Dietetics",
  "GCSE English for Sports Science",
  "GCSE English for Physical Education",
  "GCSE English for Coaching",
  "GCSE English for Personal Training",
  "GCSE English for Sports Medicine",
  "GCSE English for Physiotherapy",
  "GCSE English for Occupational Therapy",
  "GCSE English for Speech Therapy",
  "GCSE English for Audiology",
  "GCSE English for Optometry",
  "GCSE English for Podiatry",
  "GCSE English for Osteopathy",
  "GCSE English for Chiropractic",
  "GCSE English for Acupuncture",
  "GCSE English for Homeopathy",
  "GCSE English for Naturopathy",
  "GCSE English for Herbal Medicine",
  "GCSE English for Aromatherapy",
  "GCSE English for Reflexology",
  "GCSE English for Reiki",
  "GCSE English for Crystal Healing",
  "GCSE English for Energy Healing",
  "GCSE English for Spiritual Healing",
  "GCSE English for Shamanism",
  "GCSE English for Astrology",
  "GCSE English for Numerology",
  "GCSE English for Tarot",
  "GCSE English for Palmistry",
  "GCSE English for Psychic Development",
  "GCSE English for Mediumship",
  "GCSE English for Channeling",
  "GCSE English for Clairvoyance",
  "GCSE English for Clairaudience",
  "GCSE English for Clairsentience",
  "GCSE English for Claircognizance",
  "GCSE English for Clairalience",
  "GCSE English for Clairgustance",
  "GCSE English for Remote Viewing",
  "GCSE English for Astral Projection",
  "GCSE English for Lucid Dreaming",
  "GCSE English for Dream Interpretation",
  "GCSE English for Past Life Regression",
  "GCSE English for Future Life Progression",
  "GCSE English for Life Between Lives",
  "GCSE English for Spirit Guides",
  "GCSE English for Angels",
  "GCSE English for Archangels",
  "GCSE English for Ascended Masters",
  "GCSE English for Elementals",
  "GCSE English for Fairies",
  "GCSE English for Elves",
  "GCSE English for Dwarves",
  "GCSE English for Gnomes",
  "GCSE English for Trolls",
  "GCSE English for Goblins",
  "GCSE English for Orcs",
  "GCSE English for Dragons",
  "GCSE English for Unicorns",
  "GCSE English for Mermaids",
  "GCSE English for Werewolves",
  "GCSE English for Vampires",
  "GCSE English for Zombies",
  "GCSE English for Ghosts",
  "GCSE English for Spirits",
  "GCSE English for Demons",
  "GCSE English for Angels",
  "GCSE English for Gods",
  "GCSE English for Goddesses",
  "GCSE English for Mythology",
  "GCSE English for Folklore",
  "GCSE English for Legends",
  "GCSE English for Fairy Tales",
  "GCSE English for Fables",
  "GCSE English for Parables",
  "GCSE English for Proverbs",
  "GCSE English for Sayings",
  "GCSE English for Idioms",
  "GCSE English for Phrases",
  "GCSE English for Expressions",
  "GCSE English for Slang",
  "GCSE English for Colloquialisms",
  "GCSE English for Jargon",
  "GCSE English for Technical Terms",
  "GCSE English for Scientific Terms",
  "GCSE English for Medical Terms",
  "GCSE English for Legal Terms",
  "GCSE English for Business Terms",
  "GCSE English for Financial Terms",
  "GCSE English for Economic Terms",
  "GCSE English for Political Terms",
  "GCSE English for Historical Terms",
  "GCSE English for Geographical Terms",
  "GCSE English for Mathematical Terms",
  "GCSE English for Computing Terms",
  "GCSE English for Engineering Terms",
  "GCSE English for Technological Terms",
  "GCSE English for Environmental Terms",
  "GCSE English for Social Terms",
  "GCSE English for Cultural Terms",
  "GCSE English for Religious Terms",
  "GCSE English for Philosophical Terms",
  "GCSE English for Psychological Terms",
  "GCSE English for Sociological Terms",
  "GCSE English for Anthropological Terms",
  "GCSE English for Archaeological Terms",
  "GCSE English for Linguistic Terms",
  "GCSE English for Literary Terms",
  "GCSE English for Artistic Terms",
  "GCSE English for Musical Terms",
  "GCSE English for Dramatic Terms",
  "GCSE English for Cinematic Terms",
  "GCSE English for Theatrical Terms",
  "GCSE English for Dance Terms",
  "GCSE English for Sports Terms",
  "GCSE English for Games Terms",
  "GCSE English for Hobbies Terms",
  "GCSE English for Crafts Terms",
  "GCSE English for DIY Terms",
  "GCSE English for Gardening Terms",
  "GCSE English for Cooking Terms",
  "GCSE English for Baking Terms",
  "GCSE English for Sewing Terms",
  "GCSE English for Knitting Terms",
  "GCSE English for Crocheting Terms",
  "GCSE English for Embroidery Terms",
  "GCSE English for Quilting Terms",
  "GCSE English for Weaving Terms",
  "GCSE English for Spinning Terms",
  "GCSE English for Dyeing Terms",
  "GCSE English for Pottery Terms",
  "GCSE English for Sculpture Terms",
  "GCSE English for Painting Terms",
  "GCSE English for Drawing Terms",
  "GCSE English for Printmaking Terms",
  "GCSE English for Photography Terms",
  "GCSE English for Film Terms",
  "GCSE English for Animation Terms",
  "GCSE English for Graphic Design Terms",
  "GCSE English for Web Design Terms",
  "GCSE English for UX Design Terms",
  "GCSE English for UI Design Terms",
  "GCSE English for Game Design Terms",
  "GCSE English for Fashion Design Terms",
  "GCSE English for Interior Design Terms",
  "GCSE English for Architecture Terms",
  "GCSE English for Engineering Design Terms",
  "GCSE English for Industrial Design Terms",
  "GCSE English for Product Design Terms",
  "GCSE English for Service Design Terms",
  "GCSE English for Systems Design Terms",
  "GCSE English for Process Design Terms",
  "GCSE English for Organizational Design Terms",
  "GCSE English for Strategic Design Terms",
  "GCSE English for Innovation Terms",
  "GCSE English for Creativity Terms",
  "GCSE English for Problem Solving Terms",
  "GCSE English for Critical Thinking Terms",
  "GCSE English for Analytical Thinking Terms",
  "GCSE English for Logical Thinking Terms",
  "GCSE English for Lateral Thinking Terms",
  "GCSE English for Divergent Thinking Terms",
  "GCSE English for Convergent Thinking Terms",
  "GCSE English for Decision Making Terms",
  "GCSE English for Planning Terms",
  "GCSE English for Organization Terms",
  "GCSE English for Time Management Terms",
  "GCSE English for Project Management Terms",
  "GCSE English for Leadership Terms",
  "GCSE English for Teamwork Terms",
  "GCSE English for Communication Terms",
  "GCSE English for Negotiation Terms",
  "GCSE English for Conflict Resolution Terms",
  "GCSE English for Mediation Terms",
  "GCSE English for Facilitation Terms",
  "GCSE English for Coaching Terms",
  "GCSE English for Mentoring Terms",
  "GCSE English for Training Terms",
  "GCSE English for Teaching Terms",
  "GCSE English for Learning Terms",
  "GCSE English for Assessment Terms",
  "GCSE English for Evaluation Terms",
  "GCSE English for Feedback Terms",
  "GCSE English for Reflection Terms",
  "GCSE English for Self-Assessment Terms",
  "GCSE English for Peer Assessment Terms",
  "GCSE English for Formative Assessment Terms",
  "GCSE English for Summative Assessment Terms",
  "GCSE English for Diagnostic Assessment Terms",
  "GCSE English for Ipsative Assessment Terms",
  "GCSE English for Norm-Referenced Assessment Terms",
  "GCSE English for Criterion-Referenced Assessment Terms",
  "GCSE English for Standardized Assessment Terms",
  "GCSE English for Non-Standardized Assessment Terms",
  "GCSE English for Authentic Assessment Terms",
  "GCSE English for Performance Assessment Terms",
  "GCSE English for Portfolio Assessment Terms",
  "GCSE English for Project-Based Assessment Terms",
  "GCSE English for Inquiry-Based Assessment Terms",
  "GCSE English for Problem-Based Assessment Terms",
  "GCSE English for Case-Based Assessment Terms",
  "GCSE English for Simulation-Based Assessment Terms",
  "GCSE English for Game-Based Assessment Terms",
  "GCSE English for Peer Review Terms",
  "GCSE English for Self-Review Terms",
  "GCSE English for Double-Blind Review Terms",
  "GCSE English for Open Review Terms",
  "GCSE English for Post-Publication Review Terms",
  "GCSE English for Editorial Review Terms",
  "GCSE English for Reviewer Terms",
  "GCSE English for Author Terms",
  "GCSE English for Editor Terms",
  "GCSE English for Publisher Terms",
  "GCSE English for Journal Terms",
  "GCSE English for Conference Terms",
  "GCSE English for Symposium Terms",
  "GCSE English for Workshop Terms",
  "GCSE English for Seminar Terms",
  "GCSE English for Webinar Terms",
  "GCSE English for Online Course Terms",
  "GCSE English for MOOC Terms",
  "GCSE English for SPOC Terms",
  "GCSE English for Microlearning Terms",
  "GCSE English for Blended Learning Terms",
  "GCSE English for Flipped Classroom Terms",
  "GCSE English for Distance Learning Terms",
  "GCSE English for E-Learning Terms",
  "GCSE English for Mobile Learning Terms",
  "GCSE English for Social Learning Terms",
  "GCSE English for Collaborative Learning Terms",
  "GCSE English for Cooperative Learning Terms",
  "GCSE English for Experiential Learning Terms",
  "GCSE English for Service Learning Terms",
  "GCSE English for Work-Based Learning Terms",
  "GCSE English for Apprenticeship Terms",
  "GCSE English for Internship Terms",
  "GCSE English for Placement Terms",
  "GCSE English for Practicum Terms",
  "GCSE English for Residency Terms",
  "GCSE English for Fellowship Terms",
  "GCSE English for Scholarship Terms",
  "GCSE English for Grant Terms",
  "GCSE English for Funding Terms",
  "GCSE English for Sponsorship Terms",
  "GCSE English for Endowment Terms",
  "GCSE English for Donation Terms",
  "GCSE English for Philanthropy Terms",
  "GCSE English for Charity Terms",
  "GCSE English for Volunteering Terms",
  "GCSE English for Community Service Terms",
  "GCSE English for Civic Engagement Terms",
  "GCSE English for Social Responsibility Terms",
  "GCSE English for Sustainability Terms",
  "GCSE English for Environmental Responsibility Terms",
  "GCSE English for Corporate Social Responsibility Terms",
  "GCSE English for Ethical Leadership Terms",
  "GCSE English for Governance Terms",
  "GCSE English for Compliance Terms",
  "GCSE English for Risk Management Terms",
  "GCSE English for Audit Terms",
  "GCSE English for Quality Assurance Terms",
  "GCSE English for Quality Control Terms",
  "GCSE English for Continuous Improvement Terms",
  "GCSE English for Lean Terms",
  "GCSE English for Six Sigma Terms",
  "GCSE English for Kaizen Terms",
  "GCSE English for Total Quality Management Terms",
  "GCSE English for Business Process Reengineering Terms",
  "GCSE English for Change Management Terms",
  "GCSE English for Organizational Development Terms",
  "GCSE English for Talent Management Terms",
  "GCSE English for Human Resource Management Terms",
  "GCSE English for Recruitment Terms",
  "GCSE English for Selection Terms",
  "GCSE English for Onboarding Terms",
  "GCSE English for Training and Development Terms",
  "GCSE English for Performance Management Terms",
  "GCSE English for Compensation and Benefits Terms",
  "GCSE English for Employee Relations Terms",
  "GCSE English for Labor Relations Terms",
  "GCSE English for Industrial Relations Terms",
  "GCSE English for Occupational Health and Safety Terms",
  "GCSE English for Employee Engagement Terms",
  "GCSE English for Employee Retention Terms",
  "GCSE English for Employee Satisfaction Terms",
  "GCSE English for Employee Wellbeing Terms",
  "GCSE English for Diversity and Inclusion Terms",
  "GCSE English for Equal Opportunity Terms",
  "GCSE English for Affirmative Action Terms",
  "GCSE English for Anti-Discrimination Terms",
  "GCSE English for Harassment Terms",
  "GCSE English for Bullying Terms",
  "GCSE English for Grievance Terms",
  "GCSE English for Disciplinary Terms",
  "GCSE English for Termination Terms",
  "GCSE English for Redundancy Terms",
  "GCSE English for Outplacement Terms",
  "GCSE English for Retirement Terms",
  "GCSE English for Succession Planning Terms",
  "GCSE English for Workforce Planning Terms",
  "GCSE English for Workforce Analytics Terms",
  "GCSE English for HR Information Systems Terms",
  "GCSE English for HR Metrics Terms",
  "GCSE English for HR Dashboards Terms",
  "GCSE English for HR Reporting Terms",
  "GCSE English for HR Compliance Terms",
  "GCSE English for HR Audits Terms",
  "GCSE English for HR Policies Terms",
  "GCSE English for HR Procedures Terms",
  "GCSE English for HR Manuals Terms",
  "GCSE English for HR Handbooks Terms",
  "GCSE English for HR Forms Terms",
  "GCSE English for HR Templates Terms",
  "GCSE English for HR Letters Terms",
  "GCSE English for HR Contracts Terms",
  "GCSE English for HR Agreements Terms",
  "GCSE English for HR Notices Terms",
  "GCSE English for HR Circulars Terms",
  "GCSE English for HR Memos Terms",
  "GCSE English for HR Announcements Terms",
  "GCSE English for HR Newsletters Terms",
  "GCSE English for HR Bulletins Terms",
  "GCSE English for HR Updates Terms",
  "GCSE English for HR Alerts Terms",
  "GCSE English for HR Reminders Terms",
  "GCSE English for HR Invitations Terms",
  "GCSE English for HR Confirmations Terms",
  "GCSE English for HR Acknowledgements Terms",
  "GCSE English for HR Apologies Terms",
  "GCSE English for HR Congratulations Terms",
  "GCSE English for HR Condolences Terms",
  "GCSE English for HR Thank You Terms",
  "GCSE English for HR Welcome Terms",
  "GCSE English for HR Farewell Terms",
  "GCSE English for HR Good Luck Terms",
  "GCSE English for HR Best Wishes Terms",
  "GCSE English for HR Regards Terms",
  "GCSE English for HR Sincerely Terms",
  "GCSE English for HR Yours Faithfully Terms",
  "GCSE English for HR Yours Truly Terms",
  "GCSE English for HR Yours Respectfully Terms",
  "GCSE English for HR Yours Cordially Terms",
  "GCSE English for HR Yours Affectionately Terms",
  "GCSE English for HR Yours Lovingly Terms",
  "GCSE English for HR Yours Devotedly Terms",
  "GCSE English for HR Yours Obediently Terms",
  "GCSE English for HR Yours Humbly Terms",
  "GCSE English for HR Yours Gratefully Terms",
  "GCSE English for HR Yours Appreciatively Terms",
  "GCSE English for HR Yours Obligingly Terms",
  "GCSE English for HR Yours Faithfully Yours",
  "GCSE English for HR Yours Truly Yours",
  "GCSE English for HR Yours Respectfully Yours",
  "GCSE English for HR Yours Cordially Yours",
  "GCSE English for HR Yours Affectionately Yours",
  "GCSE English for HR Yours Lovingly Yours",
  "GCSE English for HR Yours Devotedly Yours",
  "GCSE English for HR Yours Obediently Yours",
  "GCSE English for HR Yours Humbly Yours",
  "GCSE English for HR Yours Gratefully Yours",
  "GCSE English for HR Yours Appreciatively Yours",
  "GCSE English for HR Yours Obligingly Yours"
];

function SubjectSelection({ onSubjectChosen }) {
  const [search, setSearch] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState(POPULAR_SUBJECTS);
  const [chosenSubject, setChosenSubject] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [subjects, setSubjects] = useState(POPULAR_SUBJECTS);
  const searchBoxRef = useRef(null);

  // Update filtered subjects as user types
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setFilteredSubjects(
      subjects.filter((subj) =>
        subj.toLowerCase().includes(value.toLowerCase())
      )
    );
    setChosenSubject(value);
    setError("");
    setShowDropdown(true);
  };

  // When user clicks a subject from the list
  const handleSubjectClick = (subject) => {
    setSearch(subject);
    setChosenSubject(subject);
    setError("");
    setShowDropdown(false);
  };

  // When user clicks "Add" button
  const handleAddSubject = () => {
    const trimmed = search.trim();
    if (!trimmed) {
      setError("Please enter a subject name to add.");
      return;
    }
    if (subjects.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setError("Subject already exists.");
      return;
    }
    setSubjects([trimmed, ...subjects]);
    setFilteredSubjects([trimmed, ...filteredSubjects]);
    setChosenSubject(trimmed);
    setSearch(trimmed);
    setError("");
    setShowDropdown(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, []);

  // Responsive: focus input on mount
  useEffect(() => {
    if (searchBoxRef.current) {
      const input = searchBoxRef.current.querySelector("input");
      if (input) input.focus();
    }
  }, []);

  return (
    <div className="subject-selection-outer">
      <div className="subject-selection">
        <h2 className="subject-title">Choose Your Subject</h2>
        <p className="subject-desc">
          Search for your subject or add a new one. <br />
          <span className="subject-ai-tip">
            Our AI can generate flashcards and quizzes for any subject or curriculum!
          </span>
        </p>
        <div className="subject-search-box" ref={searchBoxRef}>
          <div className="subject-search-row">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search or add your subject..."
              className="subject-search-input"
              onFocus={() => setShowDropdown(true)}
              aria-label="Search or add your subject"
            />
            <button
              className="subject-add-btn"
              onClick={handleAddSubject}
              aria-label="Add subject"
              type="button"
            >
              Add
            </button>
          </div>
          {showDropdown && search && filteredSubjects.length > 0 && (
            <ul className="subject-dropdown">
              {filteredSubjects.slice(0, 12).map((subject) => (
                <li
                  key={subject}
                  className="subject-dropdown-item"
                  onClick={() => handleSubjectClick(subject)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSubjectClick(subject);
                    }
                  }}
                >
                  {subject}
                </li>
              ))}
              {filteredSubjects.length > 12 && (
                <li className="subject-dropdown-item subject-dropdown-more">
                  ...and {filteredSubjects.length - 12} more
                </li>
              )}
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
    </div>
  );
}

export default SubjectSelection;