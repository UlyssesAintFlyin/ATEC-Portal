import { useState, useEffect } from "react";
import Blockade from "../../components/Blockade";
import { useAuth } from "../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const NAVY = "#242C54";
const HEDVIG = "'Hedvig Letters Serif', sans-serif";
const FRAUNCES = "Fraunces, serif";
const ARIAL = "Arial, Helvetica, sans-serif";

const CHOICES = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

// Inline styles cannot do @import or @keyframes, so these two live here.
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Hedvig+Letters+Serif:opsz@12..24&display=swap');
@keyframes slideFadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes textIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}
`;

// Replaces the @media queries
function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

// Replaces the :hover rules
function Hover({ as: Tag = "div", style, hoverStyle, children, ...rest }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Tag
      style={hovered ? { ...style, ...hoverStyle } : style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function makeStyles(width) {
  const w1024 = width <= 1024;
  const w640 = width <= 640;

  return {
    evaluation: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minHeight: w640 ? "100vh" : "91vh",
      backgroundColor: "#fffffffd",
      padding: w640 ? "90px 5vw 30px" : w1024 ? "50px 6vw 40px" : "60px 120px 40px",
    },
    evaluationHeader: { width: "100%", maxWidth: 900, marginBottom: 30 },
    h2: {
      fontFamily: HEDVIG,
      fontSize: "clamp(24px, 4vw, 35px)",
      color: NAVY,
      margin: "0 0 10px",
      textShadow: "1px 1px 10px #85858549",
    },
    p: {
      fontFamily: "sans-serif",
      fontSize: "clamp(13px, 2vw, 15px)",
      color: "#bbbaba",
      textShadow: "1px 1px 10px #85858549",
      margin: 0,
    },

    professorsDiv: {
      display: "grid",
      gridTemplateColumns: w640
        ? "1fr"
        : w1024
          ? "repeat(auto-fill, minmax(200px, 1fr))"
          : "repeat(auto-fill, minmax(220px, 1fr))",
      gap: w640 ? 14 : 20,
      width: "100%",
      maxWidth: 900,
    },
    professor: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      minHeight: w640 ? 80 : 120,
      padding: w640 ? "16px 20px 16px 82px" : "16px 20px 16px 90px",
      border: "rgba(87, 92, 165, 0.596) 1px solid",
      backgroundColor: "#ffffffda",
      borderRadius: 15,
      boxShadow: "1px 1px 20px #acacac49",
      transition: "transform 0.2s ease",
    },
    professorHover: {
      boxShadow: "0px 5px 20px #5f5f5f77",
      cursor: "pointer",
      transform: "translateY(-5px)",
    },
    professorH3: {
      fontFamily: HEDVIG,
      fontSize: 20,
      color: NAVY,
      textShadow: "1px 1px 10px #85858549",
      margin: "0 0 4px",
    },
    circle: {
      position: "absolute",
      left: w640 ? 16 : 18,
      top: "50%",
      transform: "translateY(-50%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: w640 ? 44 : 52,
      width: w640 ? 44 : 52,
      borderRadius: "50%",
      backgroundColor: "#7198d3",
      fontFamily: HEDVIG,
      fontSize: w640 ? 15 : 18,
      color: "#2e1e02",
      textShadow: "1px 1px 10px #85858549",
    },

    // Evaluation form
    evaluationForm: {
      position: "fixed",
      inset: 0,
      display: "flex",
      justifyContent: "center",
      padding: w640 ? "24px 12px 40px" : w1024 ? "30px 16px" : "40px 20px",
      backgroundColor: "#e2e1e1f3",
      boxShadow: "1px 1px 100px #00000049",
      animation: "slideFadeIn 0.5s ease forwards",
      overflowY: "auto",
      scrollbarWidth: "thin",
      scrollbarColor: "#ffffff transparent",
      zIndex: 100,
    },
    formInner: {
      width: "100%",
      maxWidth: 900,
      paddingTop: w640 ? 40 : 50,
    },
    backButton: {
      position: "fixed",
      top: w640 ? 16 : 20,
      left: w640 ? 16 : 20,
      height: 34,
      padding: "0 16px",
      borderRadius: 17,
      border: "1px solid rgb(74, 88, 105)",
      backgroundColor: "#2b335f",
      color: "rgb(223, 220, 243)",
      fontFamily: ARIAL,
      fontSize: 13,
      cursor: "pointer",
      transition: "background-color 0.2s ease, color 0.2s ease",
      zIndex: 101,
    },
    backButtonHover: { backgroundColor: "white", color: "#2b335f" },
    formHeader: {
      display: "flex",
      flexDirection: w640 ? "column" : "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: w640 ? 12 : 16,
      borderBottom: "1px solid rgba(0, 0, 0, 0.15)",
      paddingBottom: 20,
      marginBottom: 10,
    },
    formHeaderText: { flex: "1 1 110px" },
    formH6: {
      fontFamily: FRAUNCES,
      fontSize: 40,
      color: "#1b1c33",
      textShadow: "1px 1px 10px #ffffff49",
      fontWeight: 500,
      letterSpacing: "0.5px",
      margin: "0 0 8px",
      animation: "textIn 1.5s ease forwards",
    },
    formP: {
      fontFamily: ARIAL,
      fontSize: 14,
      color: "rgb(39, 38, 38)",
      textShadow: "2px 2px 10px rgb(243, 243, 243)",
      letterSpacing: "0.5px",
      margin: 0,
      animation: "textIn 1s ease forwards",
    },
    current: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: w640 ? "flex-start" : undefined,
      flex: "0 0 auto",
      padding: "10px 18px",
      backgroundColor: "transparent",
      border: "1px solid rgb(180, 180, 180)",
      borderRadius: 10,
    },
    currentP: {
      fontFamily: ARIAL,
      fontSize: 13,
      color: "black",
      textShadow: "2px 2px 10px rgb(243, 243, 243)",
      letterSpacing: "0.5px",
      margin: 0,
      whiteSpace: "nowrap",
      animation: "textIn 1s ease forwards",
    },

    // Grade / question card
    grade: {
      display: "flex",
      justifyContent: "center",
      width: "100%",
      backgroundColor: NAVY,
      borderRadius: w640 ? 12 : 15,
      border: ".5px solid rgb(91, 110, 163)",
      padding: w640 ? "20px 0" : w1024 ? "26px 0" : "30px 0",
      marginTop: 20,
      marginBottom: 40,
    },
    main: {
      display: "flex",
      flexDirection: "column",
      width: w640 ? "92%" : w1024 ? "94%" : "90%",
    },
    sectionBlock: { width: "100%" },
    sectionH6: {
      position: "static",
      fontFamily: FRAUNCES,
      fontWeight: 500,
      color: "#b1ad8a",
      fontSize: 15,
      width: "100%",
      marginTop: 25,
      marginBottom: 10,
      marginLeft: 0,
      marginRight: 0,
      borderBottom: "1px solid rgba(177, 173, 138, 0.4)",
      paddingBottom: 6,
      textShadow: "none",
      letterSpacing: "normal",
    },
    questions: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      width: "100%",
      height: "auto",
      padding: "10px 0",
      borderTop: "0.5px solid rgba(255, 255, 255, 0.12)",
      gap: 8,
    },
    questionP: {
      position: "static",
      fontFamily: ARIAL,
      fontSize: 14,
      color: "rgb(165, 165, 165)",
      textShadow: "1px 1px 1px rgb(27, 23, 23)",
      letterSpacing: "0.5px",
      animation: "textIn 2s ease forwards",
      margin: 0,
    },
    choices: {
      display: "flex",
      flexDirection: w640 ? "column" : "row",
      flexWrap: "wrap",
      width: "100%",
      gap: 8,
    },
    choiceBtn: {
      height: 35,
      flex: w640 ? "1 1 auto" : "1 1 130px",
      width: w640 ? "100%" : undefined,
      minWidth: 100,
      borderRadius: 5,
      border: "1px solid rgb(74, 88, 105)",
      backgroundColor: "#2b335f",
      color: "rgb(223, 220, 243)",
      textShadow: "1px 1px 10px rgb(27, 23, 23)",
      fontSize: 12,
      cursor: "pointer",
      transition: "background-color 0.2s ease, color 0.2s ease, border 0.2s ease",
    },
    choiceBtnHover: {
      border: "1px solid rgb(125, 159, 204)",
      backgroundColor: "white",
      color: "#2b335f",
    },
    choiceBtnSelected: {
      backgroundColor: "#7198d3",
      border: "1px solid #7198d3",
      color: "#10173a",
      fontWeight: 600,
    },
    submitButton: {
      marginTop: 40,
      marginBottom: 20,
      height: 44,
      width: w640 ? "100%" : 220,
      maxWidth: "100%",
      alignSelf: "center",
      borderRadius: 22,
      border: "none",
      backgroundColor: "#b1ad8a",
      color: "#1C2541",
      fontFamily: "Fraunces, Arial, sans-serif",
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "0.5px",
      cursor: "pointer",
      boxShadow: "1px 1px 15px #00000049",
      transition: "background-color 0.2s ease, transform 0.15s ease",
    },
    submitButtonHover: {
      backgroundColor: "#cfc9a0",
      transform: "translateY(-2px)",
    },
    commentsLabel: {
  display: "block",
  marginTop: 30,
  marginBottom: 8,
  fontFamily: FRAUNCES,
  fontWeight: 500,
  fontSize: 15,
  color: "#b1ad8a",
},
commentsTextarea: {
  width: "100%",
  boxSizing: "border-box",
  minHeight: 110,
  padding: 12,
  borderRadius: 8,
  border: "1px solid rgb(74, 88, 105)",
  backgroundColor: "#2b335f",
  color: "rgb(223, 220, 243)",
  fontFamily: ARIAL,
  fontSize: 14,
  resize: "vertical",
  outline: "none",
},
commentsCount: {
  alignSelf: "flex-end",
  marginTop: 4,
  fontFamily: ARIAL,
  fontSize: 12,
  color: "rgb(165, 165, 165)",
},
  };
}

export default function Evaluation() {
  const width = useWindowWidth();
  const st = makeStyles(width);

  const [showEval, setShowEval] = useState(false);
  const [answers, setAnswers] = useState({});
  const { user } = useAuth();

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [evaluationOpen, setEvaluationOpen] = useState(false);
  const [termLabel, setTermLabel] = useState("");

  const [facultyList, setFacultyList] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [comments, setComments] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/system-settings`)
      .then((res) => res.json())
      .then((data) => {
        setEvaluationOpen(Boolean(data.evaluation_settings_value));
        if (data.evaluation_AY_Name) {
          setTermLabel(
            `${data.evaluation_AY_Name}, ${data.evaluation_semester_name}`,
          );
        }
      })
      .catch(() => setEvaluationOpen(false))
      .finally(() => setSettingsLoading(false));
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    fetch(`${API_URL}/evaluation/faculty/${user.id}`)
      .then((res) => res.json())
      .then((data) => setFacultyList(data.faculty || []))
      .catch((err) => console.error("Failed to load faculty:", err));

    fetch(`${API_URL}/evaluation/questions`)
      .then((res) => res.json())
      .then((data) => setSections(data.sections || []))
      .catch((err) => console.error("Failed to load questions:", err));
  }, [user?.id]);

  if (settingsLoading) {
    return null;
  }

  if (!evaluationOpen) {
    return (
      <Blockade
        userName={user?.name}
        messageDetail={
          termLabel
            ? `Evaluation for ${termLabel} is currently closed.`
            : "This page is currently unavailable as evaluation is temporarily closed."
        }
        statusDetail="Evaluation Closed"
      />
    );
  }

  const handleSelect = (questionId, choice) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const totalQuestions = sections.reduce((sum, sec) => sum + sec.questions.length, 0);

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    
    if (answeredCount < totalQuestions) {
      alert(`Please answer all questions. (${answeredCount}/${totalQuestions} completed)`);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/evaluation/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evaluationId: selectedFaculty.evaluation_ID,
          studentId: user?.id,
          answers,
          comments, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Evaluation submitted successfully!");
        setFacultyList((prev) =>
          prev.map((f) =>
            f.faculty_ID === selectedFaculty.faculty_ID ? { ...f, evaluated: true } : f,
          ),
        );
        setShowEval(false);
        setAnswers({});
        setComments("");
      } else {
        alert(data.message || "Failed to submit evaluation.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Cannot connect to the server.");
    }
    
  };

  return (
    <div style={st.evaluation}>
      <style>{GLOBAL_CSS}</style>

      <div style={st.evaluationHeader}>
        <h2 style={st.h2}>Evaluate Professor</h2>
        <p style={st.p}>
          Below is the list of faculty members you need to evaluate. Please
          complete all evaluations honestly and carefully.
        </p>
      </div>

      <div style={st.professorsDiv}>
        {facultyList.length === 0 && <p style={st.p}>No faculty to evaluate yet.</p>}
        {facultyList.map((fac) => (
          <Hover
            key={fac.faculty_ID}
            style={{ ...st.professor, opacity: fac.evaluated ? 0.5 : 1 }}
            hoverStyle={st.professorHover}
            onClick={() => {
              if (fac.evaluated) return;
              setSelectedFaculty(fac);
              setComments("");
              setShowEval(true);
            }}
          >
            <div style={st.circle}>-</div>
            <div>
              <h3 style={st.professorH3}>
                {fac.f_Name} {fac.l_Name}
              </h3>
              <p style={st.p}>{fac.subjects || "Adviser"}</p>
              {fac.evaluated && <small>Already evaluated</small>}
            </div>
          </Hover>
        ))}
      </div>

      {showEval && selectedFaculty && (
        <div style={st.evaluationForm}>
          <Hover
            as="button"
            style={st.backButton}
            hoverStyle={st.backButtonHover}
            onClick={() => setShowEval(false)}
          >
            Back
          </Hover>

          <div style={st.formInner}>
            <div style={st.formHeader}>
              <div style={st.formHeaderText}>
                <h6 style={st.formH6}>
                  <i>Evaluation Form</i>
                </h6>
                <p style={st.formP}>
                  Below is the list of faculty members you need to evaluate.
                  <br />
                  Please complete all evaluations honestly and carefully.
                </p>
              </div>

              <div style={st.current}>
                <p style={st.currentP}>
                  Currently Evaluating - {selectedFaculty.f_Name} {selectedFaculty.l_Name}
                </p>
              </div>
            </div>

            <div style={st.grade}>
              <div style={st.main}>
                {sections.map((section) => (
                  <div key={section.category_ID} style={st.sectionBlock}>
                    <h6 style={st.sectionH6}>{section.category_Name}</h6>
                    {section.questions.map((question, idx) => (
                      <div style={st.questions} key={question.question_ID}>
                        <p style={st.questionP}>
                          {idx + 1}. {question.question_text}
                        </p>
                        <div style={st.choices}>
                          {CHOICES.map((choice) => {
                            const selected = answers[question.question_ID] === choice;
                            return (
                              <Hover
                                as="button"
                                key={choice}
                                style={
                                  selected
                                    ? { ...st.choiceBtn, ...st.choiceBtnSelected }
                                    : st.choiceBtn
                                }
                                hoverStyle={selected ? undefined : st.choiceBtnHover}
                                onClick={() => handleSelect(question.question_ID, choice)}
                              >
                                {choice}
                              </Hover>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                  <label htmlFor="comments" style={st.commentsLabel}>
                    Additional comments for the teacher (optional)
                  </label>
                  <textarea
                    id="comments"
                    style={st.commentsTextarea}
                    value={comments}
                    maxLength={500}
                    placeholder="Type here..."
                    onChange={(e) => setComments(e.target.value)}
                  />
                  <span style={st.commentsCount}>{comments.length}/500</span>
                <Hover
                  as="button"
                  style={st.submitButton}
                  hoverStyle={st.submitButtonHover}
                  onClick={handleSubmit}
                >
                  Submit Evaluation
                </Hover>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}