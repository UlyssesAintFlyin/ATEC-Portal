const bcrypt = require("bcrypt");
const pool = require('../config/db');
const crypto = require('crypto');

// GET all faculties
async function getAllFaculties(req, res) {
      try {
    const [rows] = await pool.query(
      `SELECT faculty_ID AS id,
              CONCAT(
         l_Name, ', ',
         f_Name, ' ',
         CASE 
           WHEN m_Name IS NOT NULL AND m_Name <> '' 
           THEN CONCAT(LEFT(m_Name,1), '.')
           ELSE ''
         END
       ) AS facultyName,
            age,
            gender,
            position,
            status
       FROM faculty_table`
    );

    res.json(rows);
  } catch (err) {
    console.error("Error loading faculty:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to load sections" });
  }
};

async function getFacultyById(req, res) {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM faculty_table WHERE faculty_ID = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Faculty not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function updateFaculty(req, res) {
  const { id } = req.params;
  const {
    f_Name,
    l_Name,
    m_Name,
    birthdate,
    gender,
    email,
    age,
    address,
    contact_Number,
    position,
    status,
    emergency_Name,
    emergency_Number,
    password,
  } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT password FROM faculty_table WHERE faculty_ID = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    let hashedPassword = existing[0].password;

    if (password && password !== existing[0].password) {
      if (!password.startsWith("$2b$") && !password.startsWith("$2a$")) {
        hashedPassword = await bcrypt.hash(password.trim(), 10);
      } else {
        hashedPassword = password;
      }
    }

    const query = `
      UPDATE faculty_table 
      SET 
        f_Name = ?, 
        l_Name = ?, 
        m_Name = ?, 
        birthdate = ?, 
        gender = ?, 
        email = ?, 
        age = ?, 
        address = ?, 
        contact_Number = ?, 
        position = ?, 
        status = ?, 
        emergency_Name = ?, 
        emergency_Number = ?, 
        password = ?
      WHERE faculty_ID = ?
    `;

    const values = [
      f_Name || null,
      l_Name || null,
      m_Name || null,
      birthdate || null,
      gender || null,
      email || null,
      age || null,
      address || null,
      contact_Number || null,
      position || null,
      status || null,
      emergency_Name || null,
      emergency_Number || null,
      hashedPassword,
      id,
    ];

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    return res.json({
      message: "Faculty updated successfully",
      faculty_ID: id,
      ...req.body,
    });
  } catch (err) {
    console.error("Error updating faculty:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function createFaculty(req, res) {
  const {
    f_Name, l_Name, m_Name, birthdate, gender,
    email, contact_Number, address,
  } = req.body;

  if (!f_Name || !l_Name || !email || !contact_Number || !address) {
    return res.status(400).json({ error: "Missing required faculty fields" });
  }

  const formattedBirthdate = birthdate
    ? new Date(birthdate).toISOString().split("T")[0].replace(/-/g, "")
    : "";

  const rawPassword = `${l_Name.replace(/\s+/g, "").toLowerCase()}${formattedBirthdate}`;
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const columns = [
      "f_Name",
      "l_Name",
      "m_Name",
      "gender",
      "email",
      "contact_Number",
      "address",
      "password",
      "account_type_id"
    ];
    const values = [
      f_Name,
      l_Name,
      m_Name,
      gender,
      email,
      contact_Number,
      address,
      hashedPassword,
      2
    ];

    if (birthdate) {
      columns.push("birthdate");
      values.push(birthdate);
    }

    const placeholders = columns.map(() => "?").join(", ");
    const [facultyResult] = await connection.query(
      `INSERT INTO faculty_table (${columns.join(", ")}) VALUES (${placeholders})`,
      values
    );

    const faculty_ID = facultyResult.insertId;

    await connection.commit();
    res.status(201).json({
      faculty_ID,
      f_Name,
      l_Name,
      m_Name,
      birthdate,
      gender,
      email,
      contact_Number,
      address,
      account_type_id: 2
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
}

module.exports = {
    getAllFaculties,
    getFacultyById,
    createFaculty,
    updateFaculty,
};
