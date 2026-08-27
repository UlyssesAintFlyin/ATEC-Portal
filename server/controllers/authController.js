const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); //for creating JWTs (secure tokens).
const pool = require('../config/db'); // database connection

async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Try student first
    const [students] = await pool.query(
      `SELECT s.student_ID AS id, s.f_Name, s.l_Name, s.password, a.account_type
       FROM student_table s
       LEFT JOIN account_type_table a ON s.account_type_ID = a.account_type_ID
       WHERE s.email = ?`,
      [email]
    );

    // Then faculty (covers Teacher and Admin)
    const [faculty] = await pool.query(
      `SELECT f.faculty_ID AS id, f.f_Name, f.l_Name, f.password, a.account_type
       FROM faculty_table f
       LEFT JOIN account_type_table a ON f.account_type_ID = a.account_type_ID
       WHERE f.email = ?`,
      [email]
    );

    const account = students[0] || faculty[0];
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const match = await bcrypt.compare(password, account.password);
    if (!match) return res.status(401).json({ message: 'Incorrect password' });

    //If all arguments are valid, build the payload
    const payload = {
      id: account.id,
      name: `${account.f_Name} ${account.l_Name}`,
      role: account.account_type, 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' }); //token with 8hr before expiry

    res.json({ token, user: payload }); //responds with the token and user
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
}

module.exports = { login };
