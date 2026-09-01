const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); //for creating JWTs (secure tokens).
const pool = require('../config/db');


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
async function addAcademicYear(req, res) {
  try {
    const { term } = req.body;
    if (!term || term.trim() === "") {
      return res.status(400).json({ error: "Term is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO academic_year_table (AY_Name) VALUES (?)`,
      [term]
    );
    res.status(201).json({ id: result.insertId, term });
  } catch (err) {
    console.error("Error adding academic year:", err);
    res.status(500).json({ error: "Failed to add academic year" });
  }
}
async function removeAcademicYears(req, res) {
  try {
    const { ids } = req.body; // expects array of IDs
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

module.exports = { loadAcademicYear, addAcademicYear, removeAcademicYears };
