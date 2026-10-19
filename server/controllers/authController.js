const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); //for creating JWTs (secure tokens).
const pool = require('../config/db'); // database connection
const { sendEmail } = require('../config/emailService');
const crypto = require('crypto');

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


async function requestOtp(req, res) {
  const { email } = req.body;

  try {
    const [students] = await pool.query(`SELECT student_ID AS id FROM student_table WHERE email = ?`, [email]);
    const [faculty] = await pool.query(`SELECT faculty_ID AS id FROM faculty_table WHERE email = ?`, [email]);

    const userType = students.length > 0 ? 'student_table' : faculty.length > 0 ? 'faculty_table' : null;
    const userId = students[0]?.id || faculty[0]?.id;

    if (!userId) return res.status(404).json({ message: 'Email address not found.' });

    // Generate 6-digit OTP and 10-minute expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const idColumn = userType === 'student_table' ? 'student_ID' : 'faculty_ID';
    await pool.query(
      `UPDATE ${userType} SET reset_otp = ?, otp_expires_at = ? WHERE ${idColumn} = ?`,
      [otp, expiresAt, userId]
    );

    try {
      const transporter = require('nodemailer').createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: { rejectUnauthorized: false }
      });

      await transporter.sendMail({
        from: `"ATEC AXIOM" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Verification Code',
        text: `Your 6-digit OTP code to reset your password is: ${otp}\n\nThis code will expire in 10 minutes.`,
      });
    } catch (mailErr) {
      console.error('Nodemailer Error Details:', mailErr);
      return res.status(500).json({ message: `Failed to send email: ${mailErr.message}` });
    }

    res.json({ message: 'OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while requesting OTP.' });
  }
}

async function verifyOtpAndReset(req, res) {
  const { email, otp } = req.body;

  try {
    const [students] = await pool.query(
      `SELECT student_ID AS id, reset_otp, otp_expires_at FROM student_table WHERE email = ?`,
      [email]
    );
    const [faculty] = await pool.query(
      `SELECT faculty_ID AS id, reset_otp, otp_expires_at FROM faculty_table WHERE email = ?`,
      [email]
    );

    const user = students[0] || faculty[0];
    const userType = students.length > 0 ? 'student_table' : faculty.length > 0 ? 'faculty_table' : null;
    const idColumn = userType === 'student_table' ? 'student_ID' : 'faculty_ID';

    if (!user || user.reset_otp !== otp || new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ message: 'Invalid or expired OTP code.' });
    }

    const tempPassword = crypto.randomBytes(4).toString('hex'); 
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await pool.query(
      `UPDATE ${userType} SET password = ?, reset_otp = NULL, otp_expires_at = NULL WHERE ${idColumn} = ?`,
      [hashedPassword, user.id]
    );

    await sendEmail(
      email,
      'Your New Password',
      `Your password reset request has been processed.\n\nYour new temporary password is: ${tempPassword}\n\nPlease sign in with this password and change it in your settings immediately.`
    );

    res.json({ message: 'New password sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while resetting password.' });
  }
}

module.exports = { login, requestOtp, verifyOtpAndReset };
