import styles from "./Evaluation.css";
import { useState, useEffect } from "react";
import Blockade from "../../components/Blockade";
import { useAuth } from "../../context/AuthContext";

export default function Evaluation() {
  const [showEval, setShowEval] = useState(false);
  const [answers, setAnswers] = useState({});
  const { user } = useAuth();

  const CHOICES = [
    "Strongly Disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree",
  ];

  const SECTIONS = [
    {
      title: "I - Personality and Appearance",
      questions: [
        "Shows a pleasant personality, happy disposition in life and behave professionally as a teacher.",
        "Talks clearly and audibly",
        "Approachable and accommodating.",
        "Shows evidence of love for his/her work.",
        "Displays no irritating speech mannerisms.",
      ],
    },
    {
      title: "II - Teaching Methodology",
      questions: [
        "Performs regular monitoring of attendance.",
        "Shows mastery on his/her subject matter.",
        "Presents the lesson clearly, logically and orderly.",
        "Answers student's questions satisfactorily.",
        "Uses methods/techniques appropriate for the lessons.",
        "Sustains student's interest and participation from the beginning up to the end of the online class.",
        "Sometimes asks challenging and thought provoking questions to exercise students' critical thinking.",
        "Evaluates student's learning for the day through quiz, activities or oral recitation.",
        "Explains lessons (either in English or Filipino).",
        "Has correct diction and pronunciation when explaining the lesson.",
        "Uses instructional aides. (PPT/Photos/video/Audio/Tools & Materials)",
        "Starts and ends up his/her classes on time.",
        "Always present on his/her class.",
      ],
    },
    {
      title: "III - Class & Classroom Management",
      questions: [
        "Did you learn a lot from this teacher?",
        "Entertains problems of students & gives advice.",
        "Shows concern for student.",
        "Manages class discipline in the classroom during class.",
        "Gives everyone an equal chance.",
        "Acknowledges student's responses and questions.",
      ],
    },
    {
      title: "IV - Child Protection Policy Implementation",
      questions: [
        "Protects student's confidentiality especially when you shared sensitive information.",
        "Never say/use/mention malicious words during class, break time or any time in school vicinity.",
        "Never show or display any malicious acts.",
        "Never give a joke that may offend a student or any individual.",
        "Never bully a student or any individual.",
      ],
    },
  ];

  const handleSelect = (key, choice) => {
    setAnswers((prev) => ({ ...prev, [key]: choice }));
  };

  const handleSubmit = () => {
    const totalQuestions = 29;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions) {
      alert(
        `Please answer all questions. (${answeredCount}/${totalQuestions} completed)`,
      );
      return;
    }

    console.log("Submitted evaluation:", answers);
    setShowEval(false);
  };

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [evaluationOpen, setEvaluationOpen] = useState(false);
  const [termLabel, setTermLabel] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/system-settings")
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

  if (settingsLoading) {
    return null;
  }

  if (!evaluationOpen) {
    return (
      <Blockade
            userName={user?.name}   // pull from your AuthContext
            messageDetail={
                termLabel
                    ? `Evaluation for ${termLabel} is currently closed.`
                    : "This page is currently unavailable as evaluation is temporarily closed."
            }
            statusDetail="Evaluation Closed"
        />
    );
  }

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
        <div className="professor" onClick={() => setShowEval(true)}>
          <div className="circle">4.5</div>
          <div>
            <h3>Professor 1</h3>
            <h6>Mathematics</h6>
          </div>
        </div>
        <div className="professor" onClick={() => setShowEval(true)}>
          <div className="circle">4.5</div>
          <div>
            <h3>Professor 2</h3>
            <h6>Science</h6>
          </div>
        </div>
        <div className="professor"></div>
        <div className="professor"></div>
        <div className="professor"></div>
        <div className="professor"></div>
        <div className="professor"></div>
        <div className="professor"></div>
      </div>

      {showEval && (
        <div className="Evaluationform">
          <button className="backButton" onClick={() => setShowEval(false)}>
            Back
          </button>

          <div className="formInner">
            <div className="formHeader">
              <div className="formHeaderText">
                <h6>
                  <i>Evaluation Form</i>
                </h6>
                <p>
                  Below is the list of faculty members you need to evaluate.
                  <br />
                  Please complete all evaluations honestly and carefully.
                </p>
              </div>

              <div className="current">
                <p>Currently Evaluating - Professor 1</p>
              </div>
            </div>

            <div className="grade">
              <div className="main">
                {SECTIONS.map((section, sectionIndex) => (
                  <div key={section.title} className="sectionBlock">
                    <h6>{section.title}</h6>
                    {section.questions.map((question, questionIndex) => {
                      const key = `${sectionIndex}-${questionIndex}`;
                      return (
                        <div className="questions" key={key}>
                          <p>
                            {questionIndex + 1}. {question}
                          </p>
                          <div className="choices">
                            {CHOICES.map((choice) => (
                              <button
                                key={choice}
                                className={
                                  answers[key] === choice ? "selected" : ""
                                }
                                onClick={() => handleSelect(key, choice)}
                              >
                                {choice}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <form>
                  <label htmlFor="comments">Additional comments:</label>
                  <textarea
                    id="comments"
                    name="comments"
                    rows="5"
                    cols="50"
                    placeholder="Type here..."
                  ></textarea>
                </form>
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
