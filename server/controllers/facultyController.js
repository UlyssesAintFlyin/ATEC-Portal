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
    const { f_Name, l_Name, m_Name, birthdate, gender, email } = req.body;
    try {
        const [result] = await pool.query('UPDATE faculty_table SET f_Name = ?, l_Name = ?, m_Name = ?, birthdate = ?, gender = ?, email = ? WHERE faculty_ID = ?', [f_Name, l_Name, m_Name, birthdate, gender, email, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Faculty not found' });
        }
        res.json({ faculty_ID: id, f_Name, l_Name, m_Name, birthdate, gender, email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function createFaculty(req, res) {
  const {
    f_Name, l_Name, m_Name, birthdate, gender,
    email, contact_Number, address,
  } = req.body;

  if (!f_Name || !l_Name || !email || !contact_Number || !address) {
    return res.status(400).json({ error: "Missing required faculty fields" });
  }

  const tempPassword = crypto.randomBytes(4).toString("hex");

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
      tempPassword,
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
      tempPassword,
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
