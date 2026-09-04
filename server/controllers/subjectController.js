const pool = require('../config/db');

exports.getAllSubjects = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM subject_table ORDER BY subject_Name ASC`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
};

exports.getSubjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const [[subject]] = await pool.query(
      `SELECT * FROM subject_table WHERE subject_ID = ?`,
      [id]
    );
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch subject' });
  }
};

exports.createSubject = async (req, res) => {
  const { subject_Name, subject_code, units } = req.body;
  if (!subject_Name || !subject_code || units == null) {
    return res.status(400).json({ message: 'subject_Name, subject_code, and units are required' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO subject_table (subject_Name, subject_code, units) VALUES (?, ?, ?)`,
      [subject_Name, subject_code, units]
    );
    res.status(201).json({ subject_ID: result.insertId, subject_Name, subject_code, units });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create subject' });
  }
};

exports.updateSubject = async (req, res) => {
  const { id } = req.params;
  const { subject_Name, subject_code, units } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE subject_table SET subject_Name = ?, subject_code = ?, units = ? WHERE subject_ID = ?`,
      [subject_Name, subject_code, units, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update subject' });
  }
};

exports.deleteSubject = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `DELETE FROM subject_table WHERE subject_ID = ?`,
      [id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete subject' });
  }
};