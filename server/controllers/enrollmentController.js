const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); //for creating JWTs (secure tokens).
const pool = require('../config/db');


async function loadEnrollee(req, res) {
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
    console.error("Error loading enrollees:", err);
    res.status(500).json({ error: "Failed to load enrollees" });
  }
}

module.exports={ loadEnrollee };