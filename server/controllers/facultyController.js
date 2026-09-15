const pool = require('../config/db');
const crypto = require('crypto');

// GET all faculties
async function getAllFaculties(req, res) {
    const { AYS_ID } = req.query;
    try {

        const [rows] = await pool.query(
            `SELECT f.faculty_ID as id, 
	CONCAT(
		f.L_Name, ', ',
        f.f_Name, ' ', 
        CASE
			WHEN f.m_Name IS NOT NULL AND f.m_Name <> ''
            THEN CONCAT(LEFT(f.m_Name,1), '.')
            ELSE ''
		END
        ) AS facultyName,
        TIMESTAMPDIFF(YEAR, f.birthdate, CURDATE()) AS age,
        f.gender,
        COALESCE(fyr.advisory, 'No advisory') AS advisory
        FROM faculty_year_record_table fyr
        JOIN faculty_table f ON fyr.faculty_ID = f.faculty_ID
        WHERE fyr.AYS_ID = ?
        ORDER BY f.l_Name ASC;`, [AYS_ID]);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
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

async function createFaculty(req, res) {
  const { f_Name, l_Name, m_Name, birthdate, gender, email, AYS_ID } = req.body;

  if (!AYS_ID) {
    return res.status(400).json({ error: 'AYS_ID is required' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [facultyResult] = await connection.query(
      'INSERT INTO faculty_table (f_Name, l_Name, m_Name, birthdate, gender, email) VALUES (?, ?, ?, ?, ?, ?)',
      [f_Name, l_Name, m_Name, birthdate, gender, email]
    );
    const faculty_ID = facultyResult.insertId;

    await connection.query(
      'INSERT INTO faculty_year_record_table (faculty_ID, AYS_ID) VALUES (?, ?)',
      [faculty_ID, AYS_ID]
    );

    await connection.commit();
    res.status(201).json({ faculty_ID, f_Name, l_Name, m_Name, birthdate, gender, email, AYS_ID });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    connection.release();
  }
}

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
    email, contact_Number, address, AYS_ID,
  } = req.body;

  if (!AYS_ID) {
    return res.status(400).json({ error: 'AYS_ID is required' });
  }
  if (!f_Name || !l_Name || !email || !contact_Number || !address) {
    return res.status(400).json({ error: 'Missing required faculty fields' });
  }

  const tempPassword = crypto.randomBytes(4).toString('hex'); 

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const columns = ['f_Name', 'l_Name', 'm_Name', 'gender', 'email', 'contact_Number', 'address', 'password'];
    const values = [f_Name, l_Name, m_Name, gender, email, contact_Number, address, tempPassword];

    if (birthdate) {
      columns.push('birthdate');
      values.push(birthdate);
    }

    const placeholders = columns.map(() => '?').join(', ');
    const [facultyResult] = await connection.query(
      `INSERT INTO faculty_table (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    );
    const faculty_ID = facultyResult.insertId;

    await connection.query(
      'INSERT INTO faculty_year_record_table (faculty_ID, AYS_ID) VALUES (?, ?)',
      [faculty_ID, AYS_ID]
    );

    await connection.commit();
    res.status(201).json({
      faculty_ID, f_Name, l_Name, m_Name, birthdate, gender, email,
      contact_Number, address, AYS_ID, tempPassword,
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Internal server error' });
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
