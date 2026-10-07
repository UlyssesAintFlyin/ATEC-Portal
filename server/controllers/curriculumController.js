const pool = require('../config/db');

// GET all curricula (with optional term/AYS_ID filter)
exports.getAllCurricula = async (req, res) => {
  const { AYS_ID } = req.query;
  try {
    let query = `
      SELECT c.curriculum_ID, c.curriculum_Name, c.department,
             cyr.curriculum_record_ID, cyr.AYS_ID,
             ay.AY_Name, sem.semester_name
      FROM curriculum_table c
      LEFT JOIN curriculum_year_record_table cyr ON cyr.curriculum_ID = c.curriculum_ID
      LEFT JOIN academic_year_semester_table ays ON cyr.AYS_ID = ays.AYS_ID
      LEFT JOIN academic_year_table ay ON ays.AY_ID = ay.AY_ID
      LEFT JOIN semester_table sem ON ays.semester_ID = sem.semester_ID
    `;
    const params = [];
    if (AYS_ID) {
      query += ` WHERE cyr.AYS_ID = ?`;
      params.push(AYS_ID);
    }
    query += ` ORDER BY c.curriculum_ID DESC`;
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching curricula:", err);
    res.status(500).json({ message: 'Failed to fetch curricula' });
  }
};

// GET single curriculum by ID (with terms and assigned subjects)
exports.getCurriculumById = async (req, res) => {
  const { id } = req.params;
  try {
    const [[curriculum]] = await pool.query(
      `SELECT * FROM curriculum_table WHERE curriculum_ID = ?`, [id]
    );
    if (!curriculum) return res.status(404).json({ message: 'Curriculum not found' });

    const [yearRecords] = await pool.query(
      `SELECT cyr.curriculum_record_ID, cyr.AYS_ID, ay.AY_Name, sem.semester_name
       FROM curriculum_year_record_table cyr
       JOIN academic_year_semester_table ays ON cyr.AYS_ID = ays.AYS_ID
       JOIN academic_year_table ay ON ays.AY_ID = ay.AY_ID
       JOIN semester_table sem ON ays.semester_ID = sem.semester_ID
       WHERE cyr.curriculum_ID = ?`, [id]
    );

    const [subjects] = await pool.query(
      `SELECT s.* FROM subject_to_curriculum_table stc
       JOIN subject_table s ON stc.subject_ID = s.subject_ID
       WHERE stc.curriculum_ID = ?`, [id]
    );

    res.json({ ...curriculum, yearRecords, subjects });
  } catch (err) {
    console.error("Error fetching curriculum details:", err);
    res.status(500).json({ message: 'Failed to fetch curriculum' });
  }
};

// CREATE curriculum — Transaction for identity creation and term link
exports.createCurriculum = async (req, res) => {
  const { curriculum_Name, AYS_ID, department } = req.body;
  if (!curriculum_Name || !AYS_ID) {
    return res.status(400).json({ message: 'curriculum_Name and AYS_ID are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO curriculum_table (curriculum_Name, department) VALUES (?, ?)`,
      [curriculum_Name.trim(), department || null]
    );
    const curriculum_ID = result.insertId;

    await conn.query(
      `INSERT INTO curriculum_year_record_table (curriculum_ID, AYS_ID) VALUES (?, ?)`,
      [curriculum_ID, AYS_ID]
    );

    await conn.commit();
    res.status(201).json({ curriculum_ID, curriculum_Name, AYS_ID, department: department || null });
  } catch (err) {
    await conn.rollback();
    console.error("Error creating curriculum:", err);
    res.status(500).json({ message: 'Failed to create curriculum' });
  } finally {
    conn.release();
  }
};

// UPDATE curriculum identity
exports.updateCurriculum = async (req, res) => {
  const { id } = req.params;
  const { curriculum_Name, department } = req.body;

  if (!curriculum_Name) {
    return res.status(400).json({ message: 'curriculum_Name is required' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE curriculum_table SET curriculum_Name = ?, department = ? WHERE curriculum_ID = ?`,
      [curriculum_Name.trim(), department || null, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Curriculum not found' });
    }
    res.json({ message: 'Curriculum updated successfully' });
  } catch (err) {
    console.error("Error updating curriculum:", err);
    res.status(500).json({ message: 'Failed to update curriculum' });
  }
};

// ASSIGN / MIGRATE curriculum to a term
exports.assignCurriculumToTerm = async (req, res) => {
  const { id } = req.params; 
  const { AYS_ID } = req.body;

  if (!id || !AYS_ID) {
    return res.status(400).json({ message: 'Curriculum ID and AYS_ID are required.' });
  }

  try {
    const [[curriculum]] = await pool.query(
      `SELECT curriculum_ID FROM curriculum_table WHERE curriculum_ID = ?`,
      [id]
    );
    if (!curriculum) {
      return res.status(404).json({ message: 'Curriculum record not found.' });
    }

    const [[existing]] = await pool.query(
      `SELECT curriculum_record_ID FROM curriculum_year_record_table WHERE curriculum_ID = ? AND AYS_ID = ?`,
      [id, AYS_ID]
    );

    if (existing) {
      return res.status(409).json({ message: 'This curriculum is already assigned to this term.' });
    }

    const [result] = await pool.query(
      `INSERT INTO curriculum_year_record_table (curriculum_ID, AYS_ID) VALUES (?, ?)`,
      [id, AYS_ID]
    );

    res.status(201).json({
      message: 'Curriculum assigned to term successfully.',
      curriculum_record_ID: result.insertId,
      curriculum_ID: Number(id),
      AYS_ID: Number(AYS_ID)
    });
  } catch (err) {
    console.error("Error assigning curriculum to term:", err);
    res.status(500).json({ message: 'Failed to assign curriculum to term.' });
  }
};

// REMOVE curriculum term link
exports.removeCurriculumFromTerm = async (req, res) => {
  const { id, aysId } = req.params;
  try {
    const [result] = await pool.query(
      `DELETE FROM curriculum_year_record_table WHERE curriculum_ID = ? AND AYS_ID = ?`,
      [id, aysId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Term assignment not found' });
    }
    res.json({ message: 'Curriculum unassigned from term' });
  } catch (err) {
    console.error("Error removing curriculum term record:", err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return res.status(409).json({
        message: 'Cannot remove curriculum term assignment because it is currently in use by active sections.'
      });
    }
    res.status(500).json({ message: 'Failed to remove term assignment' });
  }
};

// ADD subjects to curriculum
exports.addSubjectsToCurriculum = async (req, res) => {
  const { id } = req.params;
  const { subject_IDs } = req.body;

  if (!Array.isArray(subject_IDs) || subject_IDs.length === 0) {
    return res.status(400).json({ message: 'subject_IDs must be a non-empty array' });
  }

  try {
    const curriculumIdNum = parseInt(id, 10);
    const values = subject_IDs.map((subId) => [curriculumIdNum, parseInt(subId, 10)]);
    await pool.query(
      `INSERT IGNORE INTO subject_to_curriculum_table (curriculum_ID, subject_ID) VALUES ?`,
      [values]
    );
    res.status(201).json({ message: 'Subjects added to curriculum' });
  } catch (err) {
    console.error("Error adding subjects to curriculum:", err);
    res.status(500).json({ message: 'Failed to add subjects' });
  }
};

// REMOVE subject from curriculum
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
    console.error("Error removing subject from curriculum:", err);
    res.status(500).json({ message: 'Failed to remove subject' });
  }
};