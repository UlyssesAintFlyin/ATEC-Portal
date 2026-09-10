const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); //for creating JWTs (secure tokens).
const pool = require('../config/db');

// Load Academic Year
async function loadAcademicYear(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT AY_ID AS id, AY_Name 
       FROM academic_year_table`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error loading academic years:", err);
    res.status(500).json({ error: "Failed to load academic years" });
  }
}
// Add Academic Year
async function addAcademicYear(req, res) {
  try {
    const { term } = req.body;
    if (!term || term.trim() === "") {
      return res.status(400).json({ error: "Term is required" });
    }
    const [yearResult] = await pool.query(
      `INSERT INTO academic_year_table (AY_Name) VALUES (?)`,
      [term]
    );
    const ayId = yearResult.insertId;

    await pool.query(
      `INSERT INTO academic_year_semester_table (AY_ID, semester_ID) VALUES (?, ?), (?, ?)`,
      [ayId, 1, ayId, 2]
    );

    res.status(201).json({ AY_ID: ayId, AY_Name: term });
  } catch (err) {
    console.error("Error adding academic year:", err);
    res.status(500).json({ error: "Failed to add academic year" });
  }
}
// Remove Academic Years
async function removeAcademicYears(req, res) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    await pool.query(
      `DELETE FROM academic_year_table WHERE AY_ID IN (?)`,
      [ids]
    );

    res.json({ success: true, removed: ids });
  } catch (err) {
    console.error("Error removing academic years:", err);
    res.status(500).json({ error: "Failed to remove academic years" });
  }
}

// Load Enrollees
async function loadEnrollees(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT e.enrollment_ID AS id, 
              CONCAT(e.f_Name, ' ', e.l_name) AS enrollee, 
              status
       FROM enrollment_table e
       WHERE status = 'Pending'`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error loading enrollees:", err);
    res.status(500).json({ error: "Failed to load enrollees" });
  }
}
// Load Validated Enrollees
async function loadValidatedEnrollees(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT e.enrollment_ID AS id, 
              CONCAT(e.f_Name, ' ', e.l_name) AS enrollee, 
              status 
       FROM enrollment_table e
       WHERE status = 'Validated'`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error loading validated enrollees:", err);
    res.status(500).json({ error: "Failed to load validated enrollees" });
  }
}
// Set Academic Year
async function setAY(req, res) {
  try {
    const { AY_ID } = req.body;
    if (!AY_ID) {
      return res.status(400).json({ error: "AY_ID is required" });
    }
    const [rows] = await pool.query(
      `SELECT AYS_ID 
       FROM academic_year_semester_table 
       WHERE AY_ID = ? AND semester_ID = 1`,
      [AY_ID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No matching AYS_ID found" });
    }

    const aysId = rows[0].AYS_ID;

    await pool.query(
      `UPDATE system_settings_table 
       SET enrollment_AYS_ID = ?, 
       evaluation_AYS_ID = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE system_settings_ID = 1`,
      [aysId, aysId]
    );
    res.json({ success: true, enrollment_AYS_ID: aysId });
  } catch (err) {
    console.error("Error in setAY:", err);
    res.status(500).json({ error: "Failed to set academic year" });
  }
}
// Set Semester
async function setSemester(req, res) {
  try {
    const { semester_ID } = req.body || {}
    const [settings] = await pool.query(
      `SELECT enrollment_AYS_ID 
       FROM system_settings_table 
       WHERE system_settings_ID = 1`
    );

    const { enrollment_AYS_ID } = settings[0];

    const [ayRow] = await pool.query(
      `SELECT AY_ID FROM academic_year_semester_table WHERE AYS_ID = ?`,
      [enrollment_AYS_ID]
    );
    const ayId = ayRow[0].AY_ID;

    const [semRows] = await pool.query(
      `SELECT sem.semester_ID, sem.semester_name, ays.AYS_ID
       FROM academic_year_semester_table ays
       JOIN semester_table sem ON ays.semester_ID = sem.semester_ID
       WHERE ays.AY_ID = ?`,
      [ayId]
    );

    if (semester_ID) {
      const match = semRows.find(r => r.semester_ID === semester_ID);
      await pool.query(
        `UPDATE system_settings_table 
         SET enrollment_AYS_ID = ?, evaluation_AYS_ID = ?
         WHERE system_settings_ID = 1`,
        [match.AYS_ID, match.AYS_ID]
      );
    }

    res.json({
      semesters: semRows.map(r => ({ id: r.semester_ID, name: r.semester_name })),
      selected: semester_ID
        ? semRows.find(r => r.semester_ID === semester_ID).semester_name
        : semRows[0].semester_name
    });
  } catch (err) {
    console.error("Error in setSemester:", err);
    res.status(500).json({ error: "Failed to set semester" });
  }
}

// Toggle evaluation
async function toggleEvaluation(req, res) {
  try {
    const { enabled } = req.body;
    await pool.query(
      `UPDATE system_settings_table 
       SET evaluation_settings_value = ?, updated_at = CURRENT_TIMESTAMP
       WHERE system_settings_ID = 1`,
      [enabled ? 1 : 0]
    );
    res.json({ success: true, evaluation_settings_value: enabled });
  } catch (err) {
    console.error("Error toggling evaluation:", err);
    res.status(500).json({ error: "Failed to toggle evaluation" });
  }
}

// Toggle enrollment
async function toggleEnrollment(req, res) {
  try {
    const { enabled } = req.body;
    await pool.query(
      `UPDATE system_settings_table 
       SET enrollment_settings_value = ?, updated_at = CURRENT_TIMESTAMP
       WHERE system_settings_ID = 1`,
      [enabled ? 1 : 0]
    );
    res.json({ success: true, enrollment_settings_value: enabled });
  } catch (err) {
    console.error("Error toggling enrollment:", err);
    res.status(500).json({ error: "Failed to toggle enrollment" });
  }
}

// Get current system settings
async function getSystemSettings(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT evaluation_settings_value, enrollment_settings_value 
       FROM system_settings_table 
       WHERE system_settings_ID = 1`
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "System settings not found" });
    }

    res.json(rows[0]); // { evaluation_settings_value: 1, enrollment_settings_value: 0 }
  } catch (err) {
    console.error("Error fetching system settings:", err);
    res.status(500).json({ error: "Failed to fetch system settings" });
  }
}

// Get current academic year
async function getCurrentAcademicYear(req, res) {
  try {
    const [settings] = await pool.query(
      `SELECT enrollment_AYS_ID FROM system_settings_table WHERE system_settings_ID = 1`
    );

    if (settings.length === 0 || !settings[0].enrollment_AYS_ID) {
      return res.status(404).json({ error: "No active academic year set" });
    }

    const [rows] = await pool.query(
      `SELECT ay.AY_ID, ay.AY_Name
       FROM academic_year_semester_table ays
       JOIN academic_year_table ay ON ays.AY_ID = ay.AY_ID
       WHERE ays.AYS_ID = ?`,
      [settings[0].enrollment_AYS_ID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Active academic year not found" });
    }

    res.json(rows[0]); // { AY_ID, AY_Name }
  } catch (err) {
    console.error("Error getting current academic year:", err);
    res.status(500).json({ error: "Failed to get current academic year" });
  }
}

// Reject enrollees
async function rejectEnrollees(req, res) {
  try {
    console.log("Reject request body:", req.body); // Debug

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    await pool.query(
      `UPDATE enrollment_table 
       SET status = 'Rejected' 
       WHERE enrollment_ID IN (?)`,
      [ids]
    );

    res.json({ success: true, rejected: ids });
  } catch (err) {
    console.error("Error rejecting enrollees:", err);
    res.status(500).json({ error: "Failed to reject enrollees" });
  }
}

// Validate enrollee
async function validateEnrollee(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "No enrollee ID provided" });
    }

    await pool.query(
      `UPDATE enrollment_table 
       SET status = 'Validated' 
       WHERE enrollment_ID = ?`,
      [id]
    );

    res.json({ success: true, acceptedId: id });
  } catch (err) {
    console.error("Error accepting enrollee:", err);
    res.status(500).json({ error: "Failed to accept enrollee" });
  }
}
// Get enrollee by ID
async function getEnrolleeById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        f_Name, m_Name, l_Name, gender, age, contact_Number, email, address,
        father_Name, father_Contact, mother_Name, mother_Contact,
        guardian_Name, guardian_Contact,
        birthdate, transferring_from, AYS_ID,
        student_type, term, year_level, track, program, status
       FROM enrollment_table
       WHERE enrollment_ID = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch enrollee info" });
  }
}

//Convert Enrolee to Student
async function convertEnrollees(req, res) {
  const { sectionId, enrolleeIds, AYS_ID } = req.body;

  try {
    // Get enrollee info
    const [enrollees] = await pool.query(
      `SELECT * FROM enrollment_table WHERE enrollment_ID IN (?) AND status = 'Validated'`,
      [enrolleeIds]
    );

    const createdStudents = [];

    for (const enrollee of enrollees) {
      // Insert into student_table
      const [studentResult] = await pool.query(
        `INSERT INTO student_table 
         (f_Name, m_Name, l_Name, gender, contact_Number, email, address, birthdate, 
          father_Name, father_Contact, mother_Name, mother_Contact, guardian_Name, guardian_Contact, password) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          enrollee.f_Name,
          enrollee.m_Name,
          enrollee.l_Name,
          enrollee.gender,
          enrollee.contact_Number,
          enrollee.email,
          enrollee.address,
          enrollee.birthdate,
          enrollee.father_Name,
          enrollee.father_Contact,
          enrollee.mother_Name,
          enrollee.mother_Contact,
          enrollee.guardian_Name,
          enrollee.guardian_Contact,
          enrollee.email // or generate a default password
        ]
      );

      const studentId = studentResult.insertId;

      // Insert into student_year_record_table
      await pool.query(
        `INSERT INTO student_year_record_table
        (student_ID, section_ID, AYS_ID, program, department, specialization)
        SELECT ?, ?, ?, ?, s.department, ?
        FROM section_table s
        WHERE s.section_ID = ?`,
        [studentId, sectionId, AYS_ID, enrollee.program, enrollee.specialization, sectionId]
      );

      // Mark enrollee as converted
      await pool.query(
        `DELETE FROM enrollment_table WHERE enrollment_ID = ?`,
        [enrollee.enrollment_ID]
      );

      createdStudents.push({
        id: studentId,
        name: `${enrollee.f_Name} ${enrollee.l_Name}`
      });
    }

    res.json({ success: true, students: createdStudents });
  } catch (err) {
    console.error("Error converting enrollees:", err);
    res.status(500).json({ error: "Failed to convert enrollees" });
  }
}

// Load Section
async function loadSections(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT Section_ID AS id, Section_Name AS sectionName, 
              gradeLevel, department
       FROM section_table`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error loading sections:", err);
    res.status(500).json({ error: "Failed to load sections" });
  }
}

// Create Section
async function createSection(req, res) {
  try {
    const { sectionName, gradeLevel, department } = req.body;

    if (!sectionName || !gradeLevel || !department) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO section_table (section_Name, gradeLevel, department) 
       VALUES (?, ?, ?)`,
      [sectionName, gradeLevel, department]
    );

    res.status(201).json({
      id: result.insertId,
      sectionName,
      gradeLevel,
      department,
    });
  } catch (err) {
    console.error("Error creating section:", err);
    res.status(500).json({ error: "Failed to create section" });
  }
}

// Delete Section
async function deleteSections(req, res) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided for deletion" });
    }

    await pool.query(
      `DELETE FROM section_table WHERE Section_ID IN (?)`,
      [ids]
    );

    res.json({ message: "Section(s) deleted successfully" });
  } catch (err) {
    console.error("Error deleting sections:", err);
    res.status(500).json({ error: "Failed to delete sections" });
  }
}

// Load Section Students 
async function loadStudentsBySection(req, res) {
  try {
    const { sectionId } = req.params;

    const [rows] = await pool.query(
      `SELECT s.student_ID AS id,
              CONCAT(s.f_Name, ' ', s.m_Name, ' ', s.l_Name) AS studentName,
              s.gender,
              YEAR(CURDATE()) - YEAR(s.birthdate) AS age,
              syr.program
       FROM student_year_record_table syr
       JOIN student_table s ON syr.student_ID = s.student_ID
       WHERE syr.section_ID = ?`,
      [sectionId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error loading students:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to load students" });
  }
}

//getStudent Info by ID
async function getStudentById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        f_Name, m_Name, l_Name, gender, contact_Number, email, address,
        father_Name, father_Contact, mother_Name, mother_Contact,
        guardian_Name, guardian_Contact,
        birthdate, account_type_ID, created_at
       FROM student_table
       WHERE student_ID = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching student info:", err);
    res.status(500).json({ error: "Failed to fetch student info" });
  }
}

// Export functions
module.exports = {
  loadAcademicYear,
  addAcademicYear,
  removeAcademicYears,
  loadEnrollees,
  loadValidatedEnrollees,
  setAY,
  setSemester,
  toggleEvaluation,
  toggleEnrollment,
  getSystemSettings,
  getCurrentAcademicYear,
  rejectEnrollees,
  getEnrolleeById,
  validateEnrollee,
  loadSections,
  createSection,
  deleteSections,
  loadStudentsBySection,
  convertEnrollees,
  getStudentById
};
