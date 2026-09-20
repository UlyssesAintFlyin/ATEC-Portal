const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); //for creating JWTs (secure tokens).
const pool = require('../config/db');

// Load Academic Year
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
// Add Academic Year
async function addAcademicYear(req, res) {
  try {
    const { term } = req.body;
    if (!term || term.trim() === "") {
      return res.status(400).json({ error: "Term is required" });
    }
    const [yearResult] = await pool.query(
      `INSERT INTO academic_year_table (AY_Name) VALUES (?)`,
      [term]
    );
    const ayId = yearResult.insertId;

    await pool.query(
      `INSERT INTO academic_year_semester_table (AY_ID, semester_ID) VALUES (?, ?), (?, ?)`,
      [ayId, 1, ayId, 2]
    );

    res.status(201).json({ AY_ID: ayId, AY_Name: term });
  } catch (err) {
    console.error("Error adding academic year:", err);
    res.status(500).json({ error: "Failed to add academic year" });
  }
}
// Remove Academic Years
async function removeAcademicYears(req, res) {
  try {
    const { ids } = req.body;
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

// Load Enrollees
async function loadEnrollees(req, res) {
  try {
    const { ayId } = req.query;

    let query = `
      SELECT e.enrollment_ID AS id, 
             CONCAT(e.f_Name, ' ', e.l_name) AS enrollee, 
             status
      FROM enrollment_table e
    `;
    const params = [];

    if (ayId) {
      query += `
        JOIN academic_year_semester_table ays ON e.AYS_ID = ays.AYS_ID
        WHERE ays.AY_ID = ? AND status = 'Pending'
      `;
      params.push(ayId);
    } else {
      query += ` WHERE status = 'Pending' `;
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error loading enrollees:", err);
    res.status(500).json({ error: "Failed to load enrollees" });
  }
}
// Load Validated Enrollees
async function loadValidatedEnrollees(req, res) {
  try {
    const { ayId, sectionId } = req.query;

    const [sectionRows] = await pool.query(
      `SELECT department FROM section_table WHERE section_ID = ?`,
      [sectionId]
    );

    if (sectionRows.length === 0) {
      return res.json([]);
    }

    const department = sectionRows[0].department;

    let query = `
      SELECT e.enrollment_ID AS id,
             CONCAT(
               e.l_Name, ', ',
               e.f_Name, ' ',
               CASE 
                 WHEN e.m_Name IS NOT NULL AND e.m_Name <> '' 
                 THEN CONCAT(LEFT(e.m_Name,1), '.')
                 ELSE ''
               END
             ) AS enrollee,
             e.status,
             CASE 
               WHEN LOWER(e.student_type) = 'college' THEN 'College'
               WHEN LOWER(e.student_type) = 'seniorhigh' THEN 'Senior High School'
               ELSE e.student_type
             END AS student_type
      FROM enrollment_table e
      JOIN academic_year_semester_table ays ON e.AYS_ID = ays.AYS_ID
      WHERE e.status = 'Validated'
        AND (
          (LOWER(e.student_type) = 'college' AND LOWER(?) = 'college')
          OR (LOWER(e.student_type) = 'seniorhigh' AND LOWER(?) = 'senior high school')
        )
    `;

    const params = [department, department];

    if (ayId) {
      query += ` AND ays.AY_ID = ?`;
      params.push(ayId);
    }

    query += ` ORDER BY e.l_Name ASC`;

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to load validated enrollees" });
  }
}


// Set AY and Semester
async function ays(req, res) {
  try {
    if (req.method === "GET") {
      const [rows] = await pool.query(`
        SELECT ays.AYS_ID, ay.AY_ID, ay.AY_Name, sem.semester_ID, sem.semester_name
        FROM academic_year_semester_table ays
        JOIN academic_year_table ay ON ays.AY_ID = ay.AY_ID
        JOIN semester_table sem ON ays.semester_ID = sem.semester_ID
        ORDER BY ay.AY_Name, sem.semester_ID
      `);

      const [settings] = await pool.query(
        `SELECT enrollment_AYS_ID FROM system_settings_table WHERE system_settings_ID = 1`
      );

      const currentAYS = settings[0]?.enrollment_AYS_ID;
      const currentRow = rows.find(r => r.AYS_ID === currentAYS);

      return res.json({
        academicYears: [...new Map(rows.map(r => [r.AY_ID, { id: r.AY_ID, name: r.AY_Name }])).values()],
        semesters: [...new Map(rows.map(r => [r.semester_ID, { id: r.semester_ID, name: r.semester_name }])).values()],
        currentAY: currentRow?.AY_ID,
        currentSemester: currentRow?.semester_ID
      });
    }

    if (req.method === "PUT") {
      const { ay_ID, semester_ID } = req.body;

      const [rows] = await pool.query(
        `SELECT AYS_ID 
         FROM academic_year_semester_table 
         WHERE AY_ID = ? AND semester_ID = ?`,
        [ay_ID, semester_ID]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "No matching AYS_ID found" });
      }

      const aysId = rows[0].AYS_ID;

      await pool.query(
        `UPDATE system_settings_table 
         SET enrollment_AYS_ID = ?, evaluation_AYS_ID = ?, updated_at = CURRENT_TIMESTAMP
         WHERE system_settings_ID = 1`,
        [aysId, aysId]
      );

      return res.json({ success: true, aysId });
    }
  } catch (err) {
    console.error("Error in ays:", err);
    res.status(500).json({ error: "Failed to handle AYS" });
  }
}



// Toggle evaluation
async function toggleEvaluation(req, res) {
  try {
    const { enabled } = req.body;
    await pool.query(
      `UPDATE system_settings_table 
       SET evaluation_settings_value = ?, updated_at = CURRENT_TIMESTAMP
       WHERE system_settings_ID = 1`,
      [enabled ? 1 : 0]
    );
    res.json({ success: true, evaluation_settings_value: enabled });
  } catch (err) {
    console.error("Error toggling evaluation:", err);
    res.status(500).json({ error: "Failed to toggle evaluation" });
  }
}

// Toggle enrollment
async function toggleEnrollment(req, res) {
  try {
    const { enabled } = req.body;
    await pool.query(
      `UPDATE system_settings_table 
       SET enrollment_settings_value = ?, updated_at = CURRENT_TIMESTAMP
       WHERE system_settings_ID = 1`,
      [enabled ? 1 : 0]
    );
    res.json({ success: true, enrollment_settings_value: enabled });
  } catch (err) {
    console.error("Error toggling enrollment:", err);
    res.status(500).json({ error: "Failed to toggle enrollment" });
  }
}

// Get current system settings
async function getSystemSettings(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT evaluation_settings_value, enrollment_settings_value, enrollment_AYS_ID, evaluation_AYS_ID 
       FROM system_settings_table 
       WHERE system_settings_ID = 1`
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "System settings not found" });
    }

    res.json(rows[0]); // { evaluation_settings_value: 1, enrollment_settings_value: 0 }
  } catch (err) {
    console.error("Error fetching system settings:", err);
    res.status(500).json({ error: "Failed to fetch system settings" });
  }
}

// Get current academic year
async function getCurrentAcademicYear(req, res) {
  try {
    const [settings] = await pool.query(
      `SELECT enrollment_AYS_ID FROM system_settings_table WHERE system_settings_ID = 1`
    );

    if (settings.length === 0 || !settings[0].enrollment_AYS_ID) {
      return res.status(404).json({ error: "No active academic year set" });
    }

    const [rows] = await pool.query(
      `SELECT ay.AY_ID, ay.AY_Name, sem.semester_name
       FROM academic_year_semester_table ays
       JOIN academic_year_table ay ON ays.AY_ID = ay.AY_ID
       JOIN semester_table sem ON ays.semester_ID = sem.semester_ID
       WHERE ays.AYS_ID = ?`,
      [settings[0].enrollment_AYS_ID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Active academic year not found" });
    }

    res.json(rows[0]); // { AY_ID, AY_Name }
  } catch (err) {
    console.error("Error getting current academic year:", err);
    res.status(500).json({ error: "Failed to get current academic year" });
  }
}

// Reject enrollees
async function rejectEnrollees(req, res) {
  try {
    console.log("Reject request body:", req.body); // Debug

    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided" });
    }

    await pool.query(
      `UPDATE enrollment_table 
       SET status = 'Rejected' 
       WHERE enrollment_ID IN (?)`,
      [ids]
    );

    res.json({ success: true, rejected: ids });
  } catch (err) {
    console.error("Error rejecting enrollees:", err);
    res.status(500).json({ error: "Failed to reject enrollees" });
  }
}

// Validate enrollee
async function validateEnrollee(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "No enrollee ID provided" });
    }

    await pool.query(
      `UPDATE enrollment_table 
       SET status = 'Validated' 
       WHERE enrollment_ID = ?`,
      [id]
    );

    res.json({ success: true, acceptedId: id });
  } catch (err) {
    console.error("Error accepting enrollee:", err);
    res.status(500).json({ error: "Failed to accept enrollee" });
  }
}
// Get enrollee by ID
async function getEnrolleeById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT 
        f_Name, m_Name, l_Name, gender, age, contact_Number, email, address,
        father_Name, father_Contact, mother_Name, mother_Contact,
        guardian_Name, guardian_Contact,
        birthdate, transferring_from, AYS_ID,
        student_type, term, year_level, track, program, status
       FROM enrollment_table
       WHERE enrollment_ID = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch enrollee info" });
  }
}

//Convert Enrolee to Student
async function convertEnrollees(req, res) {
  console.log("Request body:", req.body);
  const { sectionId, enrolleeIds, AYS_ID } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [enrollees] = await connection.query(
      `SELECT * FROM enrollment_table WHERE enrollment_ID IN (?) AND status = 'Validated'`,
      [enrolleeIds]
    );
    console.log(enrollees);
    const [sectionRows] = await connection.query(
      `SELECT syr.section_record_ID, sec.department
       FROM section_year_record_table syr
       JOIN section_table sec ON syr.section_ID = sec.section_ID
       WHERE syr.section_ID = ? AND syr.AYS_ID = ?`,
      [sectionId, AYS_ID]
    );
    if (sectionRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Section/year record not found" });
    }
    const { section_record_ID, department } = sectionRows[0];

    const createdStudents = [];

    for (const enrollee of enrollees) {
      const [studentResult] = await connection.query(
        `INSERT INTO student_table 
         (f_Name, m_Name, l_Name, password, gender, contact_Number, email, address, 
          father_Name, father_Contact, mother_Name, mother_Contact, guardian_Name, guardian_Contact, 
          birthdate, age, lrn, account_type_ID) 
         VALUES (?, ?, ?, "password123", ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          enrollee.f_Name,
          enrollee.m_Name,
          enrollee.l_Name,
          enrollee.gender,
          enrollee.contact_Number,
          enrollee.email,
          enrollee.address,
          enrollee.father_Name,
          enrollee.father_Contact,
          enrollee.mother_Name,
          enrollee.mother_Contact,
          enrollee.guardian_Name,
          enrollee.guardian_Contact,
          enrollee.birthdate,
          enrollee.age,
          enrollee.lrn || null,
          enrollee.account_type_ID || null,
        ]
      );

      const studentId = studentResult.insertId;

      const normalizedDepartment =
        enrollee.student_type?.toLowerCase() === "college"
          ? "College"
          : enrollee.student_type?.toLowerCase() === "seniorhigh"
          ? "Senior High School"
          : department;

      await connection.query(
        `INSERT INTO student_year_record_table
         (student_ID, section_record_ID, program, department, specialization)
         VALUES (?, ?, ?, ?, ?)`,
        [
          studentId,
          section_record_ID,
          enrollee.track,
          normalizedDepartment,
          enrollee.specialization,
        ]
      );

      await connection.query(
        `DELETE FROM enrollment_table WHERE enrollment_ID = ?`,
        [enrollee.enrollment_ID]
      );

      createdStudents.push({
        id: studentId,
        name: `${enrollee.f_Name} ${enrollee.l_Name}`,
      });
    }

    await connection.commit();
    res.json({ success: true, students: createdStudents });
  } catch (err) {
    console.error("Error converting enrollees:", err);
    if (connection) await connection.rollback();
    res.status(500).json({ error: "Failed to convert enrollees" });
  } finally {
    if (connection) connection.release();
  }
}




// Load Section
async function loadSections(req, res) {
  try {

    const [rows] = await pool.query(
      `SELECT section_ID AS id,
              section_Name AS sectionName,
              gradeLevel,
              department         
       FROM section_table
       `,  
    );

    res.json(rows);
  } catch (err) {
    console.error("Error loading sections:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to load sections" });
  }
}



// Create Section
async function createSection(req, res) {
  try {
    const { sectionName, gradeLevel, department } = req.body;

    if (!sectionName || !gradeLevel || !department) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO section_table (section_Name, gradeLevel, department) 
       VALUES (?, ?, ?)`,
      [sectionName, gradeLevel, department]
    );

    res.status(201).json({
      id: result.insertId,
      sectionName,
      gradeLevel,
      department,
    });
  } catch (err) {
    console.error("Error creating section:", err);
    res.status(500).json({ error: "Failed to create section" });
  }
}

// Delete Section
async function deleteSections(req, res) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No IDs provided for deletion" });
    }

    await pool.query(
      `DELETE FROM section_table WHERE Section_ID IN (?)`,
      [ids]
    );

    res.json({ message: "Section(s) deleted successfully" });
  } catch (err) {
    console.error("Error deleting sections:", err);
    res.status(500).json({ error: "Failed to delete sections" });
  }
}

// Load Section Students 
async function loadStudentsBySection(req, res) {
  try {
    const { sectionId } = req.params;
    const { AYS_ID } = req.query;

    const [rows] = await pool.query(
      `SELECT s.student_ID AS id,
              CONCAT(
                s.l_Name, ', ',
                s.f_Name, ' ',
                CASE 
                  WHEN s.m_Name IS NOT NULL AND s.m_Name <> '' 
                  THEN CONCAT(LEFT(s.m_Name,1), '.')
                  ELSE ''
                END
              ) AS studentName,
              s.gender,
              TIMESTAMPDIFF(YEAR, s.birthdate, CURDATE()) AS age,
              syr.program,
              syr.specialization,
              syr.department,
              syrt.AYS_ID
       FROM student_year_record_table syr
       JOIN student_table s 
         ON syr.student_ID = s.student_ID
       JOIN section_year_record_table syrt 
         ON syr.section_record_ID = syrt.section_record_ID
       WHERE syrt.section_ID = ? 
         AND syrt.AYS_ID = ?
       ORDER BY s.l_Name ASC`,
      [sectionId, AYS_ID]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error loading students:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to load students" });
  }
}


//getStudent Info by ID
async function getStudentById(req, res) {
  try {
    const { AYS_ID } = req.query;
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        s.f_Name, s.m_Name, s.l_Name, s.gender, s.contact_Number, s.email, s.address,
        s.father_Name, s.father_Contact, s.mother_Name, s.mother_Contact,
        s.guardian_Name, s.guardian_Contact,
        s.birthdate, s.age, s.lrn, s.password,
        syr.department, syr.program,
        sec.section_Name, sec.gradeLevel, sec.section_ID,
        syrt.AYS_ID
       FROM student_table s
       JOIN student_year_record_table syr 
         ON s.student_ID = syr.student_ID
       JOIN section_year_record_table syrt 
         ON syr.section_record_ID = syrt.section_record_ID
       JOIN section_table sec 
         ON syrt.section_ID = sec.section_ID
       WHERE s.student_ID = ? 
         AND syrt.AYS_ID = ?`,
      [id, AYS_ID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching student info:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to fetch student info" });
  }
}


async function updateStudentById(req, res) {
  try {
    const { id } = req.params;
    const { AYS_ID } = req.body;

    const {
      f_Name, m_Name, l_Name, gender, contact_Number, email, address,
      father_Name, father_Contact, mother_Name, mother_Contact,
      guardian_Name, guardian_Contact,
      birthdate, age, lrn, password,
      department, program, section_ID
    } = req.body;

    let hashedPassword = null;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    await pool.query(
      `UPDATE student_table
       SET f_Name = ?, m_Name = ?, l_Name = ?, gender = ?, contact_Number = ?, email = ?, address = ?,
           father_Name = ?, father_Contact = ?, mother_Name = ?, mother_Contact = ?,
           guardian_Name = ?, guardian_Contact = ?, birthdate = ?, age = ?, lrn = ?, password = ?
       WHERE student_ID = ?`,
      [
        f_Name, m_Name, l_Name, gender, contact_Number, email, address,
        father_Name, father_Contact, mother_Name, mother_Contact,
        guardian_Name, guardian_Contact, birthdate, age, lrn, hashedPassword, id
      ]
    );

    const [sectionRows] = await pool.query(
      `SELECT section_record_ID 
       FROM section_year_record_table 
       WHERE section_ID = ? AND AYS_ID = ?`,
      [section_ID, AYS_ID]
    );

    if (sectionRows.length === 0) {
      return res.status(400).json({ error: "Invalid section/year combination" });
    }

    const section_record_ID = sectionRows[0].section_record_ID;

    await pool.query(
      `UPDATE student_year_record_table
       SET department = ?, program = ?, section_record_ID = ?
       WHERE student_ID = ?`,
      [department, program, section_record_ID, id]
    );

    res.json({ success: true, message: "Student updated successfully" });
  } catch (err) {
    console.error("Error updating student:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to update student" });
  }
}

async function loadFaculty(req, res) {
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
       FROM faculty_table `
    );

    res.json(rows);
  } catch (err) {
    console.error("Error loading faculty:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to load sections" });
  }
}

async function getSectionsByDepartment(req, res) {
  try {
    const { department, AYS_ID } = req.query;

    const [rows] = await pool.query(
      `SELECT sec.section_ID, sec.section_Name, sec.gradeLevel
       FROM section_table sec
       JOIN section_year_record_table syrt 
         ON sec.section_ID = syrt.section_ID
       WHERE sec.department = ? 
         AND syrt.AYS_ID = ?
       ORDER BY sec.gradeLevel, sec.section_Name`,
      [department, AYS_ID]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching sections:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
}

async function getSectionAdvisers(req, res) {
  try {
    const { sectionId, AYS_ID } = req.query;
    if (!sectionId || !AYS_ID) return res.status(400).json({ error: "sectionId and AYS_ID are required" });

    const [sectionRows] = await pool.query(
      `SELECT sec.section_ID, sec.section_Name,
              syrt.faculty_ID AS currentAdviserId,
              CONCAT(f.l_Name, ', ', f.f_Name,
                CASE WHEN f.m_Name IS NOT NULL AND f.m_Name <> '' 
                     THEN CONCAT(' ', LEFT(f.m_Name,1), '.') ELSE '' END
              ) AS currentAdviserName
       FROM section_table sec
       JOIN section_year_record_table syrt ON sec.section_ID = syrt.section_ID
       LEFT JOIN faculty_table f ON syrt.faculty_ID = f.faculty_ID
       WHERE sec.section_ID = ? AND syrt.AYS_ID = ?`,
      [sectionId, AYS_ID]
    );
    if (sectionRows.length === 0) return res.status(404).json({ error: "Section not found for given year" });

    const section = sectionRows[0];
    const [facultyRows] = await pool.query(
      `SELECT faculty_ID AS id,
              CONCAT(l_Name, ', ', f_Name,
                CASE WHEN m_Name IS NOT NULL AND m_Name <> '' 
                     THEN CONCAT(' ', LEFT(m_Name,1), '.') ELSE '' END
              ) AS name, position, status
       FROM faculty_table WHERE status != 'Resigned'`
    );

    res.json({
      sectionId: section.section_ID,
      sectionName: section.section_Name,
      currentAdviser: { id: section.currentAdviserId, name: section.currentAdviserName },
      facultyOptions: facultyRows
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch advisers" });
  }
}

async function assignAdviser(req, res) {
  try {
    const { sectionId, AYS_ID, facultyId } = req.body;
    if (!sectionId || !AYS_ID) return res.status(400).json({ error: "sectionId and AYS_ID are required" });

    if (facultyId) {
      const [rows] = await pool.query(`SELECT status FROM faculty_table WHERE faculty_ID = ?`, [facultyId]);
      if (rows.length === 0) return res.status(404).json({ error: "Faculty not found" });
      if (rows[0].status === "Resigned") return res.status(400).json({ error: "Cannot assign a resigned faculty" });
    }

    const [result] = await pool.query(
      `UPDATE section_year_record_table SET faculty_ID = ? WHERE section_ID = ? AND AYS_ID = ?`,
      [facultyId || null, sectionId, AYS_ID]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Section/year record not found" });

    res.json({ message: "Adviser updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update adviser" });
  }
}

async function listCurriculumsBySection(req, res) {
  try {
    const { sectionId, AYS_ID } = req.query;
    if (!sectionId || !AYS_ID) return res.status(400).json({ error: "sectionId and AYS_ID are required" });

    const [sectionRows] = await pool.query(
      `SELECT sec.department, syrt.curriculum_record_ID
       FROM section_table sec
       JOIN section_year_record_table syrt ON sec.section_ID = syrt.section_ID
       WHERE sec.section_ID = ? AND syrt.AYS_ID = ?`,
      [sectionId, AYS_ID]
    );
    if (sectionRows.length === 0) return res.status(404).json({ error: "Section/year record not found" });

    const { department, curriculum_record_ID } = sectionRows[0];
    const [curriculums] = await pool.query(
      `SELECT c.curriculum_ID AS id, c.curriculum_Name AS name, c.department
       FROM curriculum_table c
       JOIN curriculum_year_record_table cyr ON c.curriculum_ID = cyr.curriculum_ID
       WHERE cyr.AYS_ID = ? AND c.department = ?`,
      [AYS_ID, department]
    );

    res.json({ sectionId, currentCurriculumId: curriculum_record_ID, curriculumOptions: curriculums });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch curriculums" });
  }
}

async function updateSectionCurriculum(req, res) {
  try {
    const { sectionId, AYS_ID, curriculumId } = req.body;
    if (!sectionId || !AYS_ID) return res.status(400).json({ error: "sectionId and AYS_ID are required" });

    let curriculum_record_ID = null;
    if (curriculumId) {
      const [rows] = await pool.query(
        `SELECT curriculum_record_ID FROM curriculum_year_record_table WHERE curriculum_ID = ? AND AYS_ID = ?`,
        [curriculumId, AYS_ID]
      );
      if (rows.length === 0) return res.status(404).json({ error: "Curriculum/year record not found" });
      curriculum_record_ID = rows[0].curriculum_record_ID;
    }

    const [result] = await pool.query(
      `UPDATE section_year_record_table SET curriculum_record_ID = ? WHERE section_ID = ? AND AYS_ID = ?`,
      [curriculum_record_ID, sectionId, AYS_ID]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Section/year record not found" });

    res.json({ message: "Curriculum updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update curriculum" });
  }
}

async function getCurrentSubjectTeacher(req, res) {
  try {
    const { subjectId, sectionId, AYS_ID } = req.query;
    if (!subjectId || !sectionId || !AYS_ID) return res.status(400).json({ error: "subjectId, sectionId, and AYS_ID are required" });

    const [rows] = await pool.query(
      `SELECT f.faculty_ID AS id, CONCAT(f.f_Name, ' ', f.l_Name) AS name
       FROM faculty_year_record_table fyr
       JOIN faculty_table f ON f.faculty_ID = fyr.faculty_ID
       JOIN section_year_record_table syrt ON fyr.section_record_ID = syrt.section_record_ID
       WHERE fyr.subject_ID = ? AND syrt.section_ID = ? AND syrt.AYS_ID = ?`,
      [subjectId, sectionId, AYS_ID]
    );
    const currentTeacher = rows.length > 0 ? rows[0] : null;

    const [teachers] = await pool.query(
      `SELECT faculty_ID AS id, CONCAT(f_Name, ' ', l_Name) AS name
       FROM faculty_table WHERE position = 'Teacher' AND status = 'Active'`
    );

    res.json({ currentTeacher, teacherOptions: teachers });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve current teacher" });
  }
}

async function assignTeacherToSubject(req, res) {
  try {
    const { subjectId, sectionId, AYS_ID, teacherId } = req.body;
    if (!subjectId || !sectionId || !AYS_ID) return res.status(400).json({ error: "subjectId, sectionId, and AYS_ID are required" });

    const [sectionRows] = await pool.query(
      `SELECT section_record_ID FROM section_year_record_table WHERE section_ID = ? AND AYS_ID = ?`,
      [sectionId, AYS_ID]
    );
    if (sectionRows.length === 0) return res.status(404).json({ error: "Section/year record not found" });

    const section_record_ID = sectionRows[0].section_record_ID;
    const [rows] = await pool.query(
      `SELECT * FROM faculty_year_record_table WHERE subject_ID = ? AND section_record_ID = ?`,
      [subjectId, section_record_ID]
    );

    if (rows.length > 0) {
      await pool.query(
        `UPDATE faculty_year_record_table SET faculty_ID = ? WHERE subject_ID = ? AND section_record_ID = ?`,
        [teacherId || null, subjectId, section_record_ID]
      );
    } else {
      await pool.query(
        `INSERT INTO faculty_year_record_table (subject_ID, section_record_ID, faculty_ID) VALUES (?, ?, ?)`,
        [subjectId, section_record_ID, teacherId || null]
      );
    }

    let updatedTeacher = null;
    if (teacherId) {
      const [teacherRows] = await pool.query(
        `SELECT faculty_ID AS id, CONCAT(f_Name, ' ', l_Name) AS name FROM faculty_table WHERE faculty_ID = ?`,
        [teacherId]
      );
      updatedTeacher = teacherRows[0] || null;
    }

    res.json({ message: "Teacher assignment saved successfully", currentTeacher: updatedTeacher });
  } catch (err) {
    res.status(500).json({ error: "Failed to save teacher assignment" });
  }
}






// Export functions
module.exports = {
  loadAcademicYear,
  addAcademicYear,
  removeAcademicYears,
  loadEnrollees,
  loadValidatedEnrollees,
  ays,
  toggleEvaluation,
  toggleEnrollment,
  getSystemSettings,
  getCurrentAcademicYear,
  rejectEnrollees,
  getEnrolleeById,
  validateEnrollee,
  loadSections,
  getSectionsByDepartment,
  createSection,
  deleteSections,
  loadStudentsBySection,
  convertEnrollees,

  getStudentById,
  updateStudentById, 
  loadFaculty,
  getSectionAdvisers, 
  assignAdviser, 
  listCurriculumsBySection,
  updateSectionCurriculum,
  getCurrentSubjectTeacher,
  assignTeacherToSubject,
};
