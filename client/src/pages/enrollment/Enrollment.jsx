import { useState, useEffect } from "react";
import Blockade from "../../components/Blockade";

const API_URL = process.env.REACT_APP_API_URL;

const NAVY = "#242C54";
const NAVY_DARK = "#1a2040";
const LIGHT_BG = "rgb(243, 245, 249)";
const BORDER = "rgb(163, 163, 163)";
const FRAUNCES = "Fraunces, serif";
const QUATTRO = "Quattrocento, serif";

// Only things inline styles cannot do: font import and box-sizing reset.
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Quattrocento:wght@400;700&display=swap');
.enrollment-root, .enrollment-root * { box-sizing: border-box; }
`;

const SHS_TRACKS = {
  Academic: [
    { value: "STEM", label: "Science, Technology, Engineering, and Mathematics (STEM)" },
    { value: "BE", label: "Business and Entrepreneurship" },
    { value: "ASSH", label: "Arts, Social Sciences, and Humanities" },
  ],
  TechPro: [
    { value: "ICT", label: "Information, Communication, and Technology (ICT)" },
    { value: "INDTECH", label: "Industrial Technology" },
    { value: "HT", label: "Hospitality Tourism" },
  ],
};

const EMPTY_DETAILS = {
  lastName: "",
  firstName: "",
  middleName: "",
  age: "",
  gender: "",
  homeAddress: "",
  contact: "",
  email: "",
  birthdate: "",
  mothersName: "",
  mothersContact: "",
  fathersName: "",
  fathersContact: "",
  prevSchool: "",
  guardiansName: "",
  guardiansContact: "",
};

const EMPTY_PROGRAM = {
  term: "",
  year: "",
  gradeLevel: "",
  track: "",
  program: "",
};

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
  const w768 = width <= 768;
  const w480 = width <= 480;

  const boxWidth = w768 ? "100%" : w1024 ? "80%" : "60%";

  const cardBase = {
    border: `1px solid ${BORDER}`,
    borderRadius: w480 ? 14 : 20,
    boxShadow: "1px 1px 10px rgb(184, 183, 183)",
  };

  const headingBase = {
    fontFamily: FRAUNCES,
    fontWeight: 400,
    fontSize: w480 ? 20 : w768 ? 24 : 30,
    color: NAVY,
    textShadow: "1px 1px 2px rgb(207, 205, 205)",
    margin: 0,
  };

  const textBase = {
    fontFamily: QUATTRO,
    fontWeight: 300,
    fontSize: w480 ? 13 : 15,
    color: NAVY,
    textShadow: "1px 1px 2px rgb(197, 197, 197)",
    margin: "6px 0 0 0",
  };

  const stepCircle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: w480 ? 26 : 30,
    height: w480 ? 26 : 30,
    borderRadius: "50%",
    border: `1px solid ${NAVY}`,
    backgroundColor: "transparent",
    color: NAVY,
    fontFamily: QUATTRO,
    fontSize: w480 ? 12 : 14,
    flexShrink: 0,
    margin: 0,
  };

  const primaryBtn = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "10px 20px",
    backgroundColor: NAVY,
    color: "aliceblue",
    border: "none",
    borderRadius: 8,
    fontFamily: QUATTRO,
    fontSize: 14,
    cursor: "pointer",
    width: w480 ? "100%" : undefined,
  };

  const outlineBtn = {
    padding: "10px 20px",
    backgroundColor: "transparent",
    color: NAVY,
    border: `1px solid ${NAVY}`,
    borderRadius: 8,
    fontFamily: QUATTRO,
    fontSize: 14,
    cursor: "pointer",
  };

  const groupMobile = w480
    ? { flex: "1 1 100%", minWidth: 0, width: "100%" }
    : {};

  return {
    parent: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: w480 ? "30px 12px" : w768 ? "40px 16px" : "60px 20px",
      minHeight: "91vh",
    },
    cont: {
      display: "flex",
      flexDirection: w480 ? "column" : "row",
      alignItems: w480 ? "flex-start" : undefined,
      width: boxWidth,
      maxWidth: 900,
      flexWrap: "wrap",
      marginBottom: 20,
    },
    leftTop: { width: w480 ? "100%" : "50%" },
    leftTopH6: {
      margin: 0,
      fontFamily: FRAUNCES,
      color: NAVY,
      fontSize: w480 ? 22 : w768 ? 28 : 36,
      textShadow: "1px 1px 1px gray",
    },
    leftTopP: {
      margin: "8px 0 0 0",
      fontFamily: QUATTRO,
      color: NAVY,
      fontSize: w480 ? 13 : 15,
      textShadow: "1px 1px 5px rgb(177, 177, 177)",
    },
    rightTop: {
      display: "flex",
      alignItems: "center",
      justifyContent: w480 ? "flex-start" : "center",
      width: w480 ? "100%" : "50%",
      marginTop: w480 ? 16 : 10,
    },
    stepCircle,
    stepCircleFilled: {
      ...stepCircle,
      backgroundColor: NAVY,
      color: "aliceblue",
    },
    load: { width: "18%", height: 1, border: "1px solid black" },

    child: {
      ...cardBase,
      position: "relative",
      width: boxWidth,
      maxWidth: 1000,
      padding: w480 ? "20px 16px 24px 16px" : w768 ? "25px 25px 30px 25px" : "30px 40px 40px 40px",
    },
    childH6: headingBase,
    childP: textBase,
    stepLabel: { ...textBase, fontSize: 12, marginBottom: 0 },
    typeTag: {
      ...textBase,
      position: w480 ? "static" : "absolute",
      display: w480 ? "inline-block" : undefined,
      top: w768 ? 25 : 30,
      right: w768 ? 25 : 40,
      margin: w480 ? "10px 0 0 0" : 0,
      fontSize: w480 ? 13 : w768 ? 13 : 15,
    },

    first: {
      ...cardBase,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: boxWidth,
      maxWidth: 1000,
      padding: w480 ? "40px 16px 60px 16px" : w768 ? "50px 25px 80px 25px" : "70px 40px 130px 40px",
    },
    firstH6: headingBase,
    firstP: textBase,
    typeCards: {
      display: "flex",
      flexWrap: "wrap",
      flexDirection: w480 ? "column" : "row",
      alignItems: w480 ? "stretch" : undefined,
      justifyContent: "center",
      gap: w480 ? 16 : 40,
      marginTop: 30,
    },
    typeCard: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: w480 ? "100%" : 220,
      maxWidth: "100%",
      height: 100,
      border: `1px solid ${BORDER}`,
      borderRadius: 10,
      cursor: "pointer",
    },
    typeCardHover: {
      borderColor: NAVY,
      boxShadow: "1px 1px 8px rgb(197, 197, 197)",
    },
    typeCardP: {
      margin: 0,
      fontFamily: QUATTRO,
      color: NAVY,
      textShadow: "none",
    },
    statusBtn: { ...outlineBtn, marginTop: 30, padding: "10px 24px" },
    outlineHover: { backgroundColor: LIGHT_BG },

    studentForm: { width: "100%", marginTop: 30, color: "black" },
    form: { width: "100%" },
    formRow: {
      display: "flex",
      flexDirection: w480 ? "column" : "row",
      flexWrap: "wrap",
      gap: w480 ? 14 : 20,
      marginBottom: w480 ? 14 : 20,
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minWidth: w768 ? 130 : 150,
      ...groupMobile,
    },
    formGroupSmall: {
      display: "flex",
      flexDirection: "column",
      flex: "0 0 100px",
      minWidth: 100,
      ...groupMobile,
    },
    formGroupWide: {
      display: "flex",
      flexDirection: "column",
      flex: "1 1 100%",
      marginBottom: 20,
      ...(w480 ? { minWidth: 0, width: "100%" } : {}),
    },
    label: {
      fontFamily: QUATTRO,
      fontSize: 12,
      color: "black",
      marginBottom: 6,
    },
    input: {
      height: 34,
      padding: "0 10px",
      border: `1px solid ${BORDER}`,
      borderRadius: 6,
      fontFamily: QUATTRO,
      fontSize: 14,
      color: "black",
      width: "100%",
    },
    inputReadOnly: {
      height: 34,
      padding: "0 10px",
      border: `1px solid ${BORDER}`,
      borderRadius: 6,
      fontFamily: QUATTRO,
      fontSize: 14,
      width: "100%",
      backgroundColor: LIGHT_BG,
      color: "rgb(90, 90, 90)",
    },
    divider: {
      border: "none",
      borderTop: "1px solid rgb(210, 210, 210)",
      margin: "10px 0 20px 0",
    },
    btnRow: {
      display: "flex",
      flexDirection: w480 ? "column-reverse" : "row",
      justifyContent: "flex-end",
      gap: 12,
      flexWrap: "wrap",
    },
    continueBtn: primaryBtn,
    continueHover: { backgroundColor: NAVY_DARK },
    backBtn: { ...outlineBtn, width: w480 ? "100%" : undefined },

    reviewGrid: {
      display: "flex",
      flexDirection: w480 ? "column" : "row",
      flexWrap: "wrap",
      gap: w480 ? 16 : 30,
    },
    reviewLeft: { flex: "1 1 300px" },
    reviewRight: {
      flex: "1 1 300px",
      display: "flex",
      flexDirection: "column",
      gap: 20,
    },
    reviewDivider: {
      width: w768 ? "100%" : 1,
      height: w768 ? 1 : undefined,
      backgroundColor: "rgb(210, 210, 210)",
      alignSelf: "stretch",
    },

    confirmation: {
      ...cardBase,
      borderRadius: w480 ? 14 : 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      width: w768 ? "100%" : "60%",
      maxWidth: 700,
      padding: w480 ? "40px 16px" : w768 ? "50px 25px" : "70px 40px",
    },
    success: {
      fontFamily: FRAUNCES,
      fontWeight: 400,
      fontSize: w480 ? 20 : 24,
      color: NAVY,
      textShadow: "1px 1px 2px rgb(207, 205, 205)",
      margin: "0 0 20px 0",
    },
    confirmP: {
      fontFamily: QUATTRO,
      fontWeight: 300,
      fontSize: 15,
      color: NAVY,
      margin: "6px 0",
    },
    enrollmentCode: {
      fontFamily: FRAUNCES,
      fontSize: w480 ? 22 : w768 ? 28 : 36,
      color: NAVY,
      letterSpacing: w480 ? 1 : 2,
      backgroundColor: LIGHT_BG,
      padding: w768 ? "12px 20px" : "14px 30px",
      borderRadius: 10,
      margin: "10px 0 20px 0",
      textShadow: "1px 1px 2px rgb(207, 205, 205)",
    },
    backToEnrollment: {
      background: "none",
      border: "none",
      padding: 0,
      marginTop: 20,
      textDecoration: "underline",
      cursor: "pointer",
      fontSize: 14,
    },

    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalBox: {
      backgroundColor: "white",
      border: `1px solid ${BORDER}`,
      width: "90%",
      maxWidth: 400,
      padding: w480 ? 20 : 30,
      borderRadius: 16,
      boxShadow: "1px 1px 50px rgba(0, 0, 0, 0.2)",
      display: "flex",
      flexDirection: "column",
    },
    modalH6: {
      fontFamily: FRAUNCES,
      fontWeight: 400,
      fontSize: 22,
      color: NAVY,
      margin: "0 0 20px 0",
    },
    modalInput: {
      height: 34,
      padding: "0 10px",
      border: `1px solid ${BORDER}`,
      borderRadius: 6,
      fontFamily: QUATTRO,
      fontSize: 14,
      color: "black",
      marginBottom: 16,
    },
    modalCheckBtn: {
      padding: "10px 20px",
      borderRadius: 8,
      fontFamily: QUATTRO,
      fontSize: 14,
      cursor: "pointer",
      marginBottom: 12,
      backgroundColor: NAVY,
      color: "aliceblue",
      border: "none",
    },
    modalCloseBtn: {
      padding: "10px 20px",
      borderRadius: 8,
      fontFamily: QUATTRO,
      fontSize: 14,
      cursor: "pointer",
      marginBottom: 12,
      backgroundColor: "transparent",
      color: NAVY,
      border: `1px solid ${NAVY}`,
    },
    statusError: {
      color: "#b3261e",
      fontFamily: QUATTRO,
      fontSize: 13,
      margin: "-8px 0 12px 0",
    },
    statusResult: {
      backgroundColor: LIGHT_BG,
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
    },
    statusResultP: {
      fontFamily: QUATTRO,
      fontSize: 14,
      color: NAVY,
      margin: "4px 0",
    },
  };
}

export default function Enrollment() {
  const width = useWindowWidth();
  const s = makeStyles(width);

  const [step, setStep] = useState(1);
  const [studentType, setStudentType] = useState("");
  const [enrollmentCode, setEnrollmentCode] = useState("");

  // for the pop-up code checking modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusCodeInput, setStatusCodeInput] = useState("");
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState("");

  const [studentDetails, setStudentDetails] = useState(EMPTY_DETAILS);
  const [programTerm, setProgramTerm] = useState(EMPTY_PROGRAM);

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [termLabel, setTermLabel] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/system-settings`)
      .then((res) => res.json())
      .then((data) => {
        setEnrollmentOpen(Boolean(data.enrollment_settings_value));
        if (data.enrollment_AY_Name) {
          setTermLabel(
            `${data.enrollment_AY_Name}, ${data.enrollment_semester_name}`,
          );
        }
      })
      .catch(() => setEnrollmentOpen(false))
      .finally(() => setSettingsLoading(false));
  }, []);

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setStatusCodeInput("");
    setStatusResult(null);
    setStatusError("");
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setStudentDetails({ ...studentDetails, [name]: value });
  };

  const handleProgramChange = (e) => {
    const { name, value } = e.target;
    if (name === "program" && studentType === "seniorHigh") {
      setProgramTerm({ ...programTerm, program: value, track: "" });
    } else {
      setProgramTerm({ ...programTerm, [name]: value });
    }
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handleTypeSelect = (type) => {
    setStudentType(type);
    setProgramTerm(EMPTY_PROGRAM);
    setStep(2);
  };

  const handleProgramSubmit = (e) => {
    e.preventDefault();

    if (studentType === "college") {
      if (!programTerm.term || !programTerm.year || !programTerm.program) {
        alert("Please fill out all fields: Term, Year, and Program.");
        return;
      }
    } else if (studentType === "seniorHigh") {
      if (!programTerm.gradeLevel || !programTerm.track || !programTerm.program) {
        alert("Please fill out all fields: Grade Level, Track & Specialization, and Program.");
        return;
      }
    }

    setStep(4);
  };

  const handleBack = (target) => {
    setStep(target);
  };

  const handleBackToEnrollment = () => {
    setStep(1);
    setStudentType("");
    setEnrollmentCode("");
    setStudentDetails(EMPTY_DETAILS);
    setProgramTerm(EMPTY_PROGRAM);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    const enrollmentData = { studentDetails, studentType, programTerm };

    try {
      const response = await fetch(`${API_URL}/enrollment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrollmentData),
      });

      const data = await response.json();

      if (response.ok) {
        setEnrollmentCode(data.enrollmentCode);
        setStep(5);
      } else {
        alert(data.message || "Failed to submit enrollment.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Cannot connect to the server.");
    }
  };

  const handleCheckStatus = async () => {
    setStatusError("");
    setStatusResult(null);

    if (!statusCodeInput.trim()) {
      setStatusError("Please enter your enrollment code.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/enrollment/status/${statusCodeInput.trim()}`,
      );
      const data = await response.json();

      if (response.ok) {
        setStatusResult(data.enrollment);
      } else {
        setStatusError(data.message || "Enrollment not found.");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatusError("Cannot connect to the server.");
    }
  };

  if (settingsLoading) {
    return null;
  }

  if (!enrollmentOpen) {
    return (
      <Blockade
        greeting="Pleasant Day, Aspiring Atecian!"
        messageDetail={
          termLabel
            ? `Enrollment for ${termLabel} is currently closed.`
            : "This page is currently unavailable as enrollment is temporarily closed."
        }
        statusDetail="Enrollment Closed"
      />
    );
  }

  const fullName =
    `${studentDetails.firstName} ${studentDetails.middleName} ${studentDetails.lastName}`.trim();

  // Small helpers to keep the markup short
  const renderField = (name, label, { type = "text", required = true, small = false } = {}) => (
    <div style={small ? s.formGroupSmall : s.formGroup}>
      <label htmlFor={name} style={s.label}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={studentDetails[name]}
        onChange={handleDetailsChange}
        required={required}
        style={s.input}
      />
    </div>
  );

  const renderReadOnly = (label, value, groupStyle = s.formGroup) => (
    <div style={groupStyle}>
      <label style={s.label}>{label}</label>
      <input type="text" value={value} readOnly style={s.inputReadOnly} />
    </div>
  );

  const renderSelect = (id, label, value, options, extra = {}) => (
    <div style={s.formGroup}>
      <label htmlFor={id} style={s.label}>{label}</label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={handleProgramChange}
        style={s.input}
        {...extra}
      >
        {options}
      </select>
    </div>
  );

  const stepStyle = (n) => {
    // step 2 -> circle 1, step 3 -> circle 2, step 4 -> circle 3
    const active = step === n;
    const done = step > n;
    return active || done ? s.stepCircleFilled : s.stepCircle;
  };

  return (
    <div className="enrollment-root" style={s.parent}>
      <style>{GLOBAL_CSS}</style>

      <div style={s.cont}>
        <div style={s.leftTop}>
          <h6 style={s.leftTopH6}>Course Enrollment</h6>
          <p style={s.leftTopP}>
            Complete each step below to reserve you place for incoming term.
          </p>
        </div>
        {step !== 1 && step !== 5 && (
          <div style={s.rightTop}>
            <p style={stepStyle(2)}>1</p>
            <div style={s.load}></div>
            <p style={stepStyle(3)}>2</p>
            <div style={s.load}></div>
            <p style={stepStyle(4)}>3</p>
          </div>
        )}
      </div>

      {step === 1 && (
        <div style={s.first}>
          <h6 style={s.firstH6}>Select student type</h6>
          <p style={s.firstP}>Choose which student you are.</p>
          <div style={s.typeCards}>
            <Hover
              style={s.typeCard}
              hoverStyle={s.typeCardHover}
              onClick={() => handleTypeSelect("college")}
            >
              <p style={s.typeCardP}>College</p>
            </Hover>
            <Hover
              style={s.typeCard}
              hoverStyle={s.typeCardHover}
              onClick={() => handleTypeSelect("seniorHigh")}
            >
              <p style={s.typeCardP}>Senior high school</p>
            </Hover>
          </div>
          <Hover
            as="button"
            type="button"
            style={s.statusBtn}
            hoverStyle={s.outlineHover}
            onClick={() => setShowStatusModal(true)}
          >
            View Enrollment Status
          </Hover>
        </div>
      )}

      {step === 2 && (
        <div style={s.child}>
          <p style={s.stepLabel}>Step 1 of 3</p>
          <h6 style={s.childH6}>Student Details</h6>
          <p style={s.childP}>Provide the details needed.</p>
          <div style={s.studentForm}>
            <form onSubmit={handleDetailsSubmit} style={s.form}>
              <div style={s.formRow}>
                {renderField("lastName", "Last name:")}
                {renderField("firstName", "First name:")}
                {renderField("middleName", "Middle name:", { required: false })}
              </div>

              <div style={s.formRow}>
                {renderField("age", "Age:", { type: "number", small: true })}
                <div style={s.formGroupSmall}>
                  <label htmlFor="gender" style={s.label}>Gender/Sex:</label>
                  <select
                    id="gender"
                    name="gender"
                    value={studentDetails.gender}
                    onChange={handleDetailsChange}
                    required
                    style={s.input}
                  >
                    <option value="">Select Gender/Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                {renderField("homeAddress", "Home address:")}
                {renderField("contact", "Contact number:")}
                {renderField("email", "Email:", { type: "email" })}
              </div>

              <div style={s.formRow}>
                {renderField("birthdate", "Birthdate:", { type: "date" })}
                {renderField("mothersName", "Mother's Maiden Name:", { required: false })}
                {renderField("mothersContact", "Mother's Contact Number:", { required: false })}
              </div>

              <div style={s.formRow}>
                {renderField("fathersName", "Father's Name:", { required: false })}
                {renderField("fathersContact", "Father's Contact Number:", { required: false })}
                {renderField("prevSchool", "Previous School:")}
              </div>

              <div style={s.formRow}>
                {renderField("guardiansName", "Guardian's Name:")}
                {renderField("guardiansContact", "Guardian's Contact Number:")}
              </div>

              <div style={s.divider}></div>

              <div style={s.btnRow}>
                <button type="button" style={s.backBtn} onClick={() => handleBack(1)}>
                  Back
                </button>
                <Hover as="button" type="submit" style={s.continueBtn} hoverStyle={s.continueHover}>
                  Continue
                </Hover>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={s.child}>
          <p style={s.stepLabel}>Step 2 of 3</p>
          <h6 style={s.childH6}>Program and Term</h6>
          <p style={s.childP}>Please select your program and term.</p>
          <p style={s.typeTag}>
            {studentType === "college" ? "College" : "Senior High School"}
          </p>
          <div style={s.studentForm}>
            <form onSubmit={handleProgramSubmit} style={s.form}>
              <div style={s.formRow}>
                {studentType === "college" &&
                  renderSelect("term", "Term", programTerm.term, (
                    <>
                      <option value="">Select Term</option>
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="Summer">Summer</option>
                    </>
                  ))}

                {studentType === "college"
                  ? renderSelect("year", "Year", programTerm.year, (
                      <>
                        <option value="">Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </>
                    ))
                  : renderSelect("gradeLevel", "Grade Level", programTerm.gradeLevel, (
                      <>
                        <option value="">Select Grade Level</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </>
                    ))}

                {renderSelect("program", "Program", programTerm.program, (
                  <>
                    <option value="">Select Program</option>
                    {studentType === "college" ? (
                      <>
                        <option value="Diploma in Information Technology">
                          Diploma in Information Technology
                        </option>
                        <option value="Diploma in Restaurant Technology">
                          Diploma in Restaurant Technology
                        </option>
                        <option value="Diploma in Hospitality Technology">
                          Diploma in Hospitality Technology
                        </option>
                      </>
                    ) : (
                      <>
                        <option value="Academic">Academic</option>
                        <option value="TechPro">TechPro</option>
                      </>
                    )}
                  </>
                ))}

                {studentType === "seniorHigh" &&
                  renderSelect(
                    "track",
                    "Track & Specialization",
                    programTerm.track,
                    (
                      <>
                        <option value="">
                          {programTerm.program
                            ? "Select Track & Specialization"
                            : "Select a program first"}
                        </option>
                        {(SHS_TRACKS[programTerm.program] || []).map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </>
                    ),
                    { disabled: !programTerm.program },
                  )}
              </div>

              <div style={s.divider}></div>

              <div style={s.btnRow}>
                <button type="button" style={s.backBtn} onClick={() => handleBack(2)}>
                  Back
                </button>
                <Hover as="button" type="submit" style={s.continueBtn} hoverStyle={s.continueHover}>
                  Continue
                </Hover>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={s.child}>
          <p style={s.stepLabel}>Step 3 of 3</p>
          <h6 style={s.childH6}>Review you details</h6>
          <p style={s.childP}>Please review your information carefully before proceeding.</p>
          <div style={s.studentForm}>
            <form onSubmit={handleFinalSubmit} style={s.form}>
              <div style={s.reviewGrid}>
                <div style={s.reviewLeft}>
                  {renderReadOnly("Full name", fullName, s.formGroupWide)}
                  <div style={s.formRow}>
                    {renderReadOnly("Age", studentDetails.age, s.formGroupSmall)}
                    {renderReadOnly("Gender", studentDetails.gender, s.formGroupSmall)}
                    {renderReadOnly("Contact no.", studentDetails.contact, s.formGroupSmall)}
                  </div>
                  {renderReadOnly("Home address", studentDetails.homeAddress, s.formGroupWide)}
                  {renderReadOnly("Email address", studentDetails.email, s.formGroupWide)}
                  {renderReadOnly("Guardian's Name", studentDetails.guardiansName, s.formGroupWide)}
                  {renderReadOnly("Guardian's Contact", studentDetails.guardiansContact, s.formGroupWide)}
                </div>

                <div style={s.reviewDivider}></div>

                <div style={s.reviewRight}>
                  {studentType === "college" &&
                    renderReadOnly("Term", programTerm.term)}
                  {renderReadOnly(
                    studentType === "seniorHigh" ? "Grade Level" : "Year",
                    studentType === "seniorHigh" ? programTerm.gradeLevel : programTerm.year,
                  )}
                  {renderReadOnly("Program", programTerm.program)}
                  {studentType === "seniorHigh" &&
                    renderReadOnly("Track", programTerm.track)}
                </div>
              </div>

              <div style={s.divider}></div>

              <div style={s.btnRow}>
                <button type="button" style={s.backBtn} onClick={() => handleBack(3)}>
                  Back
                </button>
                <Hover as="button" type="submit" style={s.continueBtn} hoverStyle={s.continueHover}>
                  Submit
                </Hover>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === 5 && (
        <div style={s.confirmation}>
          <p style={s.success}>You have successfully submitted your enrollment!</p>

          <p style={s.confirmP}>Your enrollment code is:</p>

          <h2 style={s.enrollmentCode}>{enrollmentCode}</h2>

          <p style={s.confirmP}>
            Keep this code, you'll need it to check your enrollment status. Just
            navigate to the enrollment page and press enrollment status.
          </p>

          <button type="button" style={s.backToEnrollment} onClick={handleBackToEnrollment}>
            Back to Enrollment
          </button>
        </div>
      )}

      {showStatusModal && (
        <div style={s.modalOverlay} onClick={handleCloseStatusModal}>
          <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
            <h6 style={s.modalH6}>Check Enrollment Status</h6>
            <input
              type="text"
              placeholder="e.g. ATEC-2025-00042"
              value={statusCodeInput}
              onChange={(e) => setStatusCodeInput(e.target.value)}
              style={s.modalInput}
            />
            <Hover
              as="button"
              type="button"
              style={s.modalCheckBtn}
              hoverStyle={s.continueHover}
              onClick={handleCheckStatus}
            >
              Check
            </Hover>

            {statusError && <p style={s.statusError}>{statusError}</p>}

            {statusResult && (
              <div style={s.statusResult}>
                <p style={s.statusResultP}>
                  <strong>Name:</strong> {statusResult.f_Name} {statusResult.l_Name}
                </p>
                <p style={s.statusResultP}>
                  <strong>Status:</strong> {statusResult.status}
                </p>
                <p style={s.statusResultP}>
                  <strong>Submitted:</strong>{" "}
                  {new Date(statusResult.created_at).toLocaleDateString()}
                </p>
              </div>
            )}

            <Hover
              as="button"
              type="button"
              style={s.modalCloseBtn}
              hoverStyle={s.outlineHover}
              onClick={handleCloseStatusModal}
            >
              Close
            </Hover>
          </div>
        </div>
      )}
    </div>
  );
}