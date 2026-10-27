import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

const HEDVIG = "'Hedvig Letters Serif', sans-serif";
const FRAUNCES = "Fraunces, serif";
const ARIAL = "Arial, Helvetica, sans-serif";

// Inline styles cannot do @import, so the font import lives here.
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Hedvig+Letters+Serif:opsz@12..24&display=swap');
`;

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
            padding: w640 ? "40px 5vw 30px" : w1024 ? "50px 6vw 40px" : "60px 120px 40px",
        },
        evaluationHeader: { width: "100%", maxWidth: 900, marginBottom: 30 },
        h2: {
            fontFamily: HEDVIG,
            fontSize: "clamp(24px, 4vw, 35px)",
            color: '#242C54',
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
            display: "flex",
            flexDirection: "column",
            gap: 20,
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
        professorH3: {
            fontFamily: HEDVIG,
            fontSize: 20,
            color: '#242C54',
            textShadow: "1px 1px 10px #85858549",
            margin: "0 0 4px",
        },
        professorH6: {
            fontFamily: "sans-serif",
            fontWeight: "normal",
            fontSize: 14,
            color: "#5f5f5f",
            textShadow: "1px 1px 10px #85858549",
            margin: 0,
        },

        // Category scores
        sum: {
            display: "flex",
            flexDirection: "column",
            gap: 14,
            backgroundColor: '#242C54',
            border: ".5px solid rgb(91, 110, 163)",
            borderRadius: w640 ? 12 : 15,
            padding: w640 ? "20px 16px" : "26px 30px",
        },
        sumEmpty: {
            fontFamily: ARIAL,
            fontSize: 14,
            color: "rgb(165, 165, 165)",
            margin: 0,
        },
        variety: {
            display: "flex",
            flexDirection: w640 ? "column" : "row",
            alignItems: w640 ? "stretch" : "center",
            gap: w640 ? 6 : 16,
        },
        varietyName: {
            flex: w640 ? undefined : "0 0 220px",
            fontFamily: ARIAL,
            fontSize: 14,
            color: "rgb(223, 220, 243)",
            margin: 0,
        },
        side: {
            flex: 1,
            height: 12,
            borderRadius: 6,
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            overflow: "hidden",
        },
        measure: {
            height: "100%",
            borderRadius: 6,
            backgroundColor: "#7198d3",
            transition: "width 0.4s ease",
        },
        varietyScore: {
            flex: w640 ? undefined : "0 0 40px",
            textAlign: w640 ? "left" : "right",
            fontFamily: FRAUNCES,
            fontWeight: 600,
            fontSize: 15,
            color: "#b1ad8a",
            margin: 0,
        },

        // Comments, shown below the grades
        commentsSection: {
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: 10,
        },
        commentsTitle: {
            fontFamily: FRAUNCES,
            fontWeight: 500,
            fontSize: 22,
            color: '#242C54',
            margin: "0 0 4px",
            paddingBottom: 8,
            borderBottom: "1px solid rgba(0, 0, 0, 0.15)",
        },
        comment: {
            padding: "14px 18px",
            border: "rgba(87, 92, 165, 0.596) 1px solid",
            backgroundColor: "#ffffffda",
            borderRadius: 12,
            boxShadow: "1px 1px 20px #acacac49",
        },
        commentText: {
            fontFamily: ARIAL,
            fontSize: 14,
            lineHeight: 1.5,
            color: "#3a3a3a",
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
        },
        commentsEmpty: {
            fontFamily: ARIAL,
            fontSize: 14,
            color: "#8a8a8a",
            margin: 0,
        },
    };
}

export default function FacultyReport() {
    const { user } = useAuth();
    const width = useWindowWidth();
    const st = makeStyles(width);

    const [faculty, setFaculty] = useState(null);
    const [categories, setCategories] = useState([]);
    const [comments, setComments] = useState([]);
    const [overall, setOverall] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user || !user.id) {
            return;
        }

        const loadReport = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/evaluation/summary/${user.id}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to load evaluation."
                    );
                }

                setFaculty(data.faculty);
                setCategories(data.categories || []);
                setComments(data.comments || []);
                setOverall(data.overall || 0);

            } catch (error) {
                console.error("Faculty report error:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, [user]);

    const message = (text) => (
        <div style={st.evaluation}>
            <style>{GLOBAL_CSS}</style>
            <div style={st.evaluationHeader}>
                <h2 style={st.h2}>Faculty Evaluation</h2>
                <p style={st.p}>{text}</p>
            </div>
        </div>
    );

    if (loading) return message("Loading evaluation...");
    if (error) return message(error);
    if (!faculty) return message("No evaluation data found.");

    return (
        <div style={st.evaluation}>
            <style>{GLOBAL_CSS}</style>

            <div style={st.evaluationHeader}>
                <h2 style={st.h2}>Faculty Evaluation</h2>
                <p style={st.p}>Below is the summary of your evaluation.</p>
            </div>

            <div style={st.professorsDiv}>
                <div style={st.professor}>
                    <div style={st.circle}>{Number(overall).toFixed(1)}</div>
                    <div>
                        <h3 style={st.professorH3}>
                            {faculty.f_Name} {faculty.l_Name}
                        </h3>
                        <h6 style={st.professorH6}>{faculty.position}</h6>
                    </div>
                </div>

                <div style={st.sum}>
                    {categories.length === 0 ? (
                        <p style={st.sumEmpty}>
                            No student evaluations have been submitted yet.
                        </p>
                    ) : (
                        categories.map((category) => (
                            <div style={st.variety} key={category.category_ID}>
                                <p style={st.varietyName}>{category.category_Name}</p>
                                <div style={st.side}>
                                    <div
                                        style={{
                                            ...st.measure,
                                            width: (Number(category.avgScore) / 5) * 100 + "%",
                                        }}
                                    ></div>
                                </div>
                                <h6 style={st.varietyScore}>
                                    {Number(category.avgScore).toFixed(1)}
                                </h6>
                            </div>
                        ))
                    )}
                </div>

                <div style={st.commentsSection}>
                    <h4 style={st.commentsTitle}>Student Comments ({comments.length})</h4>

                    {comments.length === 0 && (
                        <p style={st.commentsEmpty}>No comments yet for this term.</p>
                    )}

                    {comments.map((text, i) => (
                        <div style={st.comment} key={i}>
                            <p style={st.commentText}>{text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}