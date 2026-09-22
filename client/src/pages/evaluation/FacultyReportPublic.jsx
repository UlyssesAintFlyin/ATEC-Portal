import "../admin/AdminEval.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

export default function FacultyReport() {
    const { user } = useAuth();

    const [faculty, setFaculty] = useState(null);
    const [categories, setCategories] = useState([]);
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

    if (loading) {
        return (
            <div className="evaluation">
                <div className="evaluationHeader">
                    <h2>Faculty Evaluation</h2>
                    <p>Loading evaluation...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="evaluation">
                <div className="evaluationHeader">
                    <h2>Faculty Evaluation</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!faculty) {
        return (
            <div className="evaluation">
                <div className="evaluationHeader">
                    <h2>Faculty Evaluation</h2>
                    <p>No evaluation data found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="evaluation">

            <div className="evaluationHeader">
                <h2>Faculty Evaluation</h2>
                <p>Below is the summary of your evaluation.</p>
            </div>

            <div className="professorsDiv">

                <div className="professor">

                    <div className="circle">
                        {Number(overall).toFixed(1)}
                    </div>

                    <div>
                        <h3>
                            {faculty.f_Name} {faculty.l_Name}
                        </h3>

                        <h6>
                            {faculty.position}
                        </h6>
                    </div>

                </div>

                <div className="sum">

                    {categories.length === 0 ? (
                        <p>No student evaluations have been submitted yet.</p>
                    ) : (
                        categories.map((category) => (
                            <div
                                className="variety"
                                key={category.category_ID}
                            >

                                <p>
                                    {category.category_Name}
                                </p>

                                <div className="side">
                                    <div
                                        className="measure"
                                        style={{
                                            width:
                                                (Number(category.avgScore) / 5) * 100 +
                                                "%"
                                        }}
                                    ></div>
                                </div>

                                <h6>
                                    {Number(category.avgScore).toFixed(1)}
                                </h6>

                            </div>
                        ))
                    )}

                </div>

            </div>

        </div>
    );
}