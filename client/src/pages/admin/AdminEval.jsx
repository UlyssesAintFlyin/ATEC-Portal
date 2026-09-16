import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./AdminEval.css";

const API_URL = process.env.REACT_APP_API_URL;

export default function Evaluation() {
  const { id } = useParams();

  const [faculty, setFaculty] = useState(null);
  const [overall, setOverall] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/evaluation/summary/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load evaluation summary");
        return res.json();
      })
      .then((data) => {
        setFaculty(data.faculty);
        setOverall(data.overall);
        setCategories(data.categories);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return null;

  if (error) {
    return (
      <div className="evaluation">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="evaluation">
      <div className="evaluationHeader">
        <h2>Faculty Evaluation</h2>
        <p>Below is the summary of the faculty member's evaluation.</p>
        <button>Send via Email</button>
      </div>

      <div className="professorsDiv">
        <div className="professor">
          <div className="circle">{overall}</div>
          <div>
            <h3>{faculty.f_Name} {faculty.l_Name}</h3>
            <h6>{faculty.position}</h6>
          </div>
        </div>

        <div className="sum">
          {categories.length === 0 && (
            <p>No evaluation data yet for this term.</p>
          )}

          {categories.map((cat) => (
            <div className="variety" key={cat.category_ID}>
              <p>{cat.category_Name}</p>
              <div className="side">
                <div
                  className="measure"
                  style={{ width: `${(cat.avgScore / 5) * 100}%` }}
                ></div>
              </div>
              <h6>{cat.avgScore}</h6>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}