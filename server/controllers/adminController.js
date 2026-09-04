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

// Export functions
module.exports = { loadAcademicYear, addAcademicYear, removeAcademicYears, loadEnrollees, loadValidatedEnrollees, setAY, setSemester, toggleEvaluation, toggleEnrollment, getSystemSettings, getCurrentAcademicYear };
