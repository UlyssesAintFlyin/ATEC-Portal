const pool = require('../config/db'); // your mysql2 pool

// GET all curricula
exports.getAllCurricula = async (req, res) => {
  const { AY_ID } = req.query;
  try {
    let query = `SELECT c.*, ay.AY_Name 
                 FROM curriculum_table c
                 LEFT JOIN academic_year_table ay ON c.AY_ID = ay.AY_ID`;
    const params = [];

    if (AY_ID) {
      query += ` WHERE c.AY_ID = ?`;
      params.push(AY_ID);
    }

    query += ` ORDER BY c.curriculum_ID DESC`;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch curricula' });
  }
};

// GET single curriculum (with its subjects)
exports.getCurriculumById = async (req, res) => {
  const { id } = req.params;
  try {
    const [[curriculum]] = await pool.query(
      `SELECT * FROM curriculum_table WHERE curriculum_ID = ?`,
      [id]
    );
    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }

    const [subjects] = await pool.query(
      `SELECT s.* 
       FROM subject_to_curriculum_table stc
       JOIN subject_table s ON stc.subject_ID = s.subject_ID
       WHERE stc.curriculum_ID = ?`,
      [id]
    );

    res.json({ ...curriculum, subjects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch curriculum' });
  }
};

// CREATE curriculum
exports.createCurriculum = async (req, res) => {
  const { curriculum_Name, AY_ID } = req.body;
  if (!curriculum_Name || !AY_ID) {
    return res.status(400).json({ message: 'curriculum_Name and AY_ID are required' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO curriculum_table (curriculum_Name, AY_ID) VALUES (?, ?)`,
      [curriculum_Name, AY_ID]
    );
    res.status(201).json({ curriculum_ID: result.insertId, curriculum_Name, AY_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create curriculum' });
  }
};

// UPDATE curriculum
exports.updateCurriculum = async (req, res) => {
  const { id } = req.params;
  const { curriculum_Name, AY_ID } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE curriculum_table SET curriculum_Name = ?, AY_ID = ? WHERE curriculum_ID = ?`,
      [curriculum_Name, AY_ID, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }
    res.json({ message: 'Curriculum updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update curriculum' });
  }
};

// DELETE curriculum
exports.deleteCurriculum = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `DELETE FROM curriculum_table WHERE curriculum_ID = ?`,
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }
    res.json({ message: 'Curriculum deleted' });
  } catch (err) {
    console.error(err);
    // RESTRICT on AY_ID FK / CASCADE on subject links — this will only fail
    // if some other table still references this curriculum_ID
    res.status(500).json({ message: 'Failed to delete curriculum' });
  }
};

// ADD subject(s) to curriculum
exports.addSubjectsToCurriculum = async (req, res) => {
  const { id } = req.params; // curriculum_ID
  const { subject_IDs } = req.body; // array of subject_ID

  if (!Array.isArray(subject_IDs) || subject_IDs.length === 0) {
    return res.status(400).json({ message: 'subject_IDs must be a non-empty array' });
  }

  try {
    const values = subject_IDs.map((subId) => [id, subId]);
    await pool.query(
      `INSERT IGNORE INTO subject_to_curriculum_table (curriculum_ID, subject_ID) VALUES ?`,
      [values]
    );
    res.status(201).json({ message: 'Subjects added to curriculum' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add subjects' });
  }
};

// REMOVE a subject from curriculum
exports.removeSubjectFromCurriculum = async (req, res) => {
  const { id, subjectId } = req.params;
  try {
    const [result] = await pool.query(
      `DELETE FROM subject_to_curriculum_table WHERE curriculum_ID = ? AND subject_ID = ?`,
      [id, subjectId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Link not found' });
    }
    res.json({ message: 'Subject removed from curriculum' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to remove subject' });
  }
};