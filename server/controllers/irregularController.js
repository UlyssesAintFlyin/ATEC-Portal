const pool = require('../config/db');

const PASSING_GRADE = 75; // grades are imported as 0-100

async function getIrregularStudents(req, res) {
  const { AYS_ID } = req.query;
  if (!AYS_ID) return res.status(400).json({ error: "AYS_ID is required" });
  try {
    const [rows] = await pool.query(
      `SELECT syr.stud_record_ID, s.student_ID,
              CONCAT(s.l_Name, ', ', s.f_Name) AS studentName,
              s.gender,
              TIMESTAMPDIFF(YEAR, s.birthdate, CURDATE()) AS age,
              syr.program, syr.year_level, syr.department,
              COALESCE(SUM(sub.units), 0) AS totalUnits
       FROM student_year_record_table syr
       JOIN student_table s ON s.student_ID = syr.student_ID
       LEFT JOIN student_subject_enrollment_table e
              ON e.stud_record_ID = syr.stud_record_ID AND e.status = 'Approved'
       LEFT JOIN subject_table sub ON sub.subject_ID = e.subject_ID
       WHERE syr.AYS_ID = ? AND syr.classification = 'Irregular' AND s.status = 'Enrolled'
       GROUP BY syr.stud_record_ID, s.student_ID
       ORDER BY s.l_Name, s.f_Name`,
      [AYS_ID]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load irregular students" });
  }
}


async function getStudentLoad(req, res) {
  const { studentId } = req.params;
  const { AYS_ID } = req.query;
  if (!AYS_ID) return res.status(400).json({ error: "AYS_ID is required" });
  try {
    const [[record]] = await pool.query(
      `SELECT stud_record_ID FROM student_year_record_table WHERE student_ID = ? AND AYS_ID = ?`,
      [studentId, AYS_ID]
    );
    if (!record) return res.status(404).json({ error: "Student term record not found" });

    const [currentLoad] = await pool.query(
      `SELECT e.enrollment_subject_ID, e.status, e.reason,
              sub.subject_ID, sub.subject_code, sub.subject_Name, sub.units,
              sec.section_Name
       FROM student_subject_enrollment_table e
       JOIN subject_table sub ON sub.subject_ID = e.subject_ID
       JOIN section_year_record_table sy ON sy.section_record_ID = e.section_record_ID
       JOIN section_table sec ON sec.section_ID = sy.section_ID
       WHERE e.stud_record_ID = ? AND e.status <> 'Dropped'
       ORDER BY sub.subject_code`,
      [record.stud_record_ID]
    );

    const [openClasses] = await pool.query(
      `SELECT sy.section_record_ID, sec.section_Name, sec.gradeLevel,
              sub.subject_ID, sub.subject_code, sub.subject_Name, sub.units
       FROM section_year_record_table sy
       JOIN section_table sec ON sec.section_ID = sy.section_ID
       JOIN curriculum_year_record_table cyr ON cyr.curriculum_record_ID = sy.curriculum_record_ID
       JOIN subject_to_curriculum_table stc ON stc.curriculum_ID = cyr.curriculum_ID
       JOIN subject_table sub ON sub.subject_ID = stc.subject_ID
       WHERE sy.AYS_ID = ? AND sec.department = 'College'
         AND NOT EXISTS (SELECT 1 FROM student_subject_enrollment_table e
                         WHERE e.stud_record_ID = ? AND e.subject_ID = sub.subject_ID
                           AND e.status IN ('Requested','Approved'))
         AND NOT EXISTS (SELECT 1 FROM grade_table g
                         WHERE g.student_ID = ? AND g.subject_ID = sub.subject_ID
                           AND g.grade_value >= ?)
       ORDER BY sec.gradeLevel, sec.section_Name, sub.subject_code`,
      [AYS_ID, record.stud_record_ID, studentId, PASSING_GRADE]
    );
    res.json({ currentLoad, openClasses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load student subjects" });
  }
}

async function addStudentLoad(req, res) {
  const { studentId } = req.params;
  const { AYS_ID, section_record_ID, subject_ID, reason } = req.body;
  if (!AYS_ID || !section_record_ID || !subject_ID) {
    return res.status(400).json({ error: "AYS_ID, section_record_ID and subject_ID are required" });
  }
  try {
    const [[record]] = await pool.query(
      `SELECT stud_record_ID, classification
       FROM student_year_record_table WHERE student_ID = ? AND AYS_ID = ?`,
      [studentId, AYS_ID]
    );
    if (!record) return res.status(404).json({ error: "Student term record not found" });
    if (record.classification !== "Irregular") {
      return res.status(400).json({ error: "Student is not marked irregular" });
    }

    const [[offered]] = await pool.query(
      `SELECT 1
       FROM section_year_record_table sy
       JOIN curriculum_year_record_table cyr ON cyr.curriculum_record_ID = sy.curriculum_record_ID
       JOIN subject_to_curriculum_table stc ON stc.curriculum_ID = cyr.curriculum_ID
       WHERE sy.section_record_ID = ? AND sy.AYS_ID = ? AND stc.subject_ID = ?`,
      [section_record_ID, AYS_ID, subject_ID]
    );
    if (!offered) return res.status(400).json({ error: "That class is not offered this term" });

    const [[passed]] = await pool.query(
      `SELECT 1 FROM grade_table
       WHERE student_ID = ? AND subject_ID = ? AND grade_value >= ?`,
      [studentId, subject_ID, PASSING_GRADE]
    );
    if (passed) return res.status(400).json({ error: "Subject already passed" });

    await pool.query(
      `INSERT INTO student_subject_enrollment_table
         (stud_record_ID, section_record_ID, subject_ID, status, reason)
       VALUES (?, ?, ?, 'Approved', ?)
       ON DUPLICATE KEY UPDATE section_record_ID = VALUES(section_record_ID),
                               status = 'Approved', reason = VALUES(reason)`,
      [record.stud_record_ID, section_record_ID, subject_ID, reason || null]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add subject" });
  }
}

async function updateLoadStatus(req, res) {
  const { id } = req.params;
  const { status, reason } = req.body;
  if (!["Requested", "Approved", "Rejected", "Dropped"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  try {
    await pool.query(
      `UPDATE student_subject_enrollment_table SET status = ?, reason = COALESCE(?, reason)
       WHERE enrollment_subject_ID = ?`,
      [status, reason || null, id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update load" });
  }
}

async function setIrregularClassification(req, res) {
  const { studentId } = req.params;
  const { AYS_ID, carryOver = true } = req.body;
  if (!AYS_ID) return res.status(400).json({ error: "AYS_ID is required" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[record]] = await conn.query(
      `SELECT syr.stud_record_ID, syr.classification, syr.section_record_ID, syr.department,
              sec.gradeLevel, sy.curriculum_record_ID
       FROM student_year_record_table syr
       LEFT JOIN section_year_record_table sy ON sy.section_record_ID = syr.section_record_ID
       LEFT JOIN section_table sec ON sec.section_ID = sy.section_ID
       WHERE syr.student_ID = ? AND syr.AYS_ID = ?`,
      [studentId, AYS_ID]
    );
    if (!record) {
      await conn.rollback();
      return res.status(404).json({ error: "No term record for this student in that term" });
    }
    if (record.department !== "College") {
      await conn.rollback();
      return res.status(400).json({ error: "Only college students can be marked irregular" });
    }
    if (record.classification === "Irregular") {
      await conn.rollback();
      return res.json({ success: true, message: "Already irregular" });
    }

    await conn.query(
      `UPDATE student_year_record_table
       SET classification = 'Irregular', year_level = ?, section_record_ID = NULL
       WHERE stud_record_ID = ?`,
      [record.gradeLevel, record.stud_record_ID]
    );

    // Start their load with the classes they were already taking
    if (carryOver && record.curriculum_record_ID) {
      await conn.query(
        `INSERT IGNORE INTO student_subject_enrollment_table
           (stud_record_ID, section_record_ID, subject_ID, status, reason)
         SELECT ?, ?, stc.subject_ID, 'Approved', 'Carried over from section'
         FROM curriculum_year_record_table cyr
         JOIN subject_to_curriculum_table stc ON stc.curriculum_ID = cyr.curriculum_ID
         WHERE cyr.curriculum_record_ID = ?`,
        [record.stud_record_ID, record.section_record_ID, record.curriculum_record_ID]
      );
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to mark student irregular" });
  } finally {
    conn.release();
  }
}

module.exports = {
  getIrregularStudents,
  getStudentLoad,
  addStudentLoad,
  updateLoadStatus,
  setIrregularClassification,
};