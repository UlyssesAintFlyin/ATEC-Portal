import styles from '../admin/AdminEval.css';

export default function FacultyReport() {
  return (
    <div className="evaluation">
      <div className="evaluationHeader">
        <h2>Faculty Evaluation</h2>
        <p>Below is the summary of your evaluation.</p>
      </div>

      <div className="professorsDiv">
        <div className="professor">
          <div className="circle">4.5</div>
          <div>
            <h3>Professor 1</h3>
            <h6>Mathematics</h6>
          </div>
        </div>

        <div className="sum">
          <div className="variety">
            <p>Personality and Appearance</p>
            <div className="side">
              <div className="measure"></div>
            </div>
            <h6>4.3</h6>
          </div>

          <div className="variety">
            <p>Teaching Effectiveness</p>
            <div className="side">
              <div className="measure"></div>
            </div>
            <h6>4.0</h6>
          </div>

          <div className="variety">
            <p>Classroom Management</p>
            <div className="side">
              <div className="measure"></div>
            </div>
            <h6>3.8</h6>
          </div>

          <div className="variety">
            <p>Communication Skills</p>
            <div className="side">
              <div className="measure"></div>
            </div>
            <h6>4.5</h6>
          </div>

          <div className="variety">
            <p>Punctuality</p>
            <div className="side">
              <div className="measure"></div>
            </div>
            <h6>4.7</h6>
          </div>
        </div>
      </div>
    </div>
  );
}