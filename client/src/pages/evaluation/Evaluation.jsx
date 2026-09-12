import styles from "./Evaluation.css";
import { useState, useEffect } from "react";
import Blockade from "../../components/Blockade";
import { useAuth } from "../../context/AuthContext";

export default function Evaluation() {
  const [showEval, setShowEval] = useState(false);
  const [answers, setAnswers] = useState({});
  const { user } = useAuth();

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [evaluationOpen, setEvaluationOpen] = useState(false);
  const [termLabel, setTermLabel] = useState("");

  const [facultyList, setFacultyList] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const CHOICES = [
    "Strongly Disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree",
  ];

  const API_URL = process.env.REACT_APP_API_URL;

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
    fetch(`${API_URL}/evaluation/faculty`)
      .then((res) => res.json())
      .then((data) => setFacultyList(data.faculty || []))
      .catch((err) => console.error("Failed to load faculty:", err));

    fetch(`${API_URL}/evaluation/questions`)
      .then((res) => res.json())
      .then((data) => setSections(data.sections || []))
      .catch((err) => console.error("Failed to load questions:", err));
  }, []);

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

  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

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
          answers
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Evaluation submitted successfully!");
        setShowEval(false);
        setAnswers({});
      } else {
        alert(data.message || "Failed to submit evaluation.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Cannot connect to the server.");
    }
  };

  return (
    <div className="evaluation">
      <div className="evaluationHeader">
        <h2>Evaluate Professor</h2>
        <p>
          Below is the list of faculty members you need to evaluate. Please
          complete all evaluations honestly and carefully.
        </p>
      </div>

      <div className="professorsDiv">
        {facultyList.map((fac) => (
          <div
            className="professor"
            key={fac.faculty_ID}
            onClick={() => {
              setSelectedFaculty(fac);
              setShowEval(true);
            }}
          >
            <div className="circle">-</div>
            <div>
              <h3>{fac.f_Name} {fac.l_Name}</h3>
            </div>
          </div>
        ))}
      </div>

      {showEval && selectedFaculty && (
        <div className="Evaluationform">
          <button className="backButton" onClick={() => setShowEval(false)}>
            Back
          </button>

          <div className="formInner">
            <div className="formHeader">
              <div className="formHeaderText">
                <h6><i>Evaluation Form</i></h6>
                <p>
                  Below is the list of faculty members you need to evaluate.
                  <br />
                  Please complete all evaluations honestly and carefully.
                </p>
              </div>

              <div className="current">
                <p>Currently Evaluating - {selectedFaculty.f_Name} {selectedFaculty.l_Name}</p>
              </div>
            </div>

            <div className="grade">
              <div className="main">
                {sections.map((section) => (
                  <div key={section.category_ID} className="sectionBlock">
                    <h6>{section.category_Name}</h6>
                    {section.questions.map((question, idx) => (
                      <div className="questions" key={question.question_ID}>
                        <p>{idx + 1}. {question.question_text}</p>
                        <div className="choices">
                          {CHOICES.map((choice) => (
                            <button
                              key={choice}
                              className={answers[question.question_ID] === choice ? "selected" : ""}
                              onClick={() => handleSelect(question.question_ID, choice)}
                            >
                              {choice}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <button className="submitButton" onClick={handleSubmit}>
                  Submit Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}