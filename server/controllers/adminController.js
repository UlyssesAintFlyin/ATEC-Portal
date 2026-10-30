const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); //for creating JWTs (secure tokens).
const pool = require('../config/db');
const { sendEmail } = require("../config/emailService.js"); // Adjust relative path as needed

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
async function loadAcademicYearSemesters(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ays.AYS_ID,
        ay.AY_ID,
        ay.AY_Name,
        sem.semester_ID,
        sem.semester_name
      FROM academic_year_semester_table ays
      JOIN academic_year_table ay ON ays.AY_ID = ay.AY_ID
      JOIN semester_table sem ON ays.semester_ID = sem.semester_ID
      ORDER BY ay.AY_Name DESC, sem.semester_ID ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("Error loading academic year semesters:", err);
    res.status(500).json({ message: "Failed to load academic year semesters" });
  }
};
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
  const { sectionId, enrolleeIds, AYS_ID } = req.body;

  if (!sectionId || !AYS_ID || !Array.isArray(enrolleeIds) || enrolleeIds.length === 0) {
    return res.status(400).json({ error: "sectionId, AYS_ID and at least one enrollee are required" });
  }

  const connection = await pool.getConnection();
  const pendingEmails = [];
  try {
    await connection.beginTransaction();

    const [enrollees] = await connection.query(
      `SELECT * FROM enrollment_table WHERE enrollment_ID IN (?) AND status = 'Validated'`,
      [enrolleeIds]
    );
    if (enrollees.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "No validated enrollees found for the given IDs" });
    }

    // student_year_record_table.program is NOT NULL; fail early with a readable message
    const noProgram = enrollees.filter((e) => !e.program);

    const noLrn = enrollees.filter(
      (e) => !e.lrn || !/^\d{12}$/.test(String(e.lrn))
    );

    if (noLrn.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        error: `Invalid LRN for: ${noLrn
          .map((e) => `${e.f_Name} ${e.l_Name}`)
          .join(", ")}`,
      });
    }

    if (noProgram.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        error: `Missing program for: ${noProgram.map((e) => `${e.f_Name} ${e.l_Name}`).join(", ")}`,
      });
    }

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
      let formattedBirthdate = "";
      if (enrollee.birthdate) {
        if (typeof enrollee.birthdate === "string") {
          formattedBirthdate = enrollee.birthdate.split("T")[0].replace(/-/g, "");
        } else {
          const d = new Date(enrollee.birthdate);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          formattedBirthdate = `${year}${month}${day}`;
        }
      }

      const rawPassword = `${enrollee.l_Name.replace(/\s+/g, "").toLowerCase()}${formattedBirthdate}`;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      const [studentResult] = await connection.query(
        `INSERT INTO student_table
         (f_Name, m_Name, l_Name, password, gender, contact_Number, email, address,
          father_Name, father_Contact, mother_Name, mother_Contact, guardian_Name, guardian_Contact,
          birthdate, age, lrn, account_type_ID)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          enrollee.f_Name,
          enrollee.m_Name,
          enrollee.l_Name,
          hashedPassword,
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
           (student_ID, section_record_ID, AYS_ID, classification, program, department, specialization)
         VALUES (?, ?, ?, 'Regular', ?, ?, ?)`,
        [
          studentId,
          section_record_ID,
          AYS_ID,
          enrollee.program,
          normalizedDepartment,
          enrollee.specialization ?? null,
        ]
      );

      await connection.query(`DELETE FROM enrollment_table WHERE enrollment_ID = ?`, [
        enrollee.enrollment_ID,
      ]);

      if (enrollee.email) {
        pendingEmails.push({
          to: enrollee.email,
          subject: "Student Account Credentials",
          body: `Greetings, ${enrollee.f_Name}!\n\nYour enrollment has been validated and your student account has been created successfully.\n\nLogin Credentials:\nEmail: ${enrollee.email}\nTemporary Password: ${rawPassword}\n\nPlease log in and change your password immediately.`,
        });
      }

      createdStudents.push({ id: studentId, name: `${enrollee.f_Name} ${enrollee.l_Name}` });
    }

    await connection.commit();

    // Send emails only AFTER the commit, so nobody receives credentials for an
    // account that was rolled back. A failed email must not undo the conversion.
    let emailFailures = 0;
    for (const mail of pendingEmails) {
      try {
        await sendEmail(mail.to, mail.subject, mail.body);
      } catch (mailErr) {
        emailFailures++;
        console.error(`Failed to email ${mail.to}:`, mailErr);
      }
    }

    res.json({ success: true, students: createdStudents, emailFailures });
  } catch (err) {
    console.error("Error converting enrollees:", err);
    try { await connection.rollback(); } catch (_) { /* connection already gone */ }

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "A student with the same email or LRN already exists. No enrollees were converted.",
      });
    }
    res.status(500).json({ error: "Failed to convert enrollees" });
  } finally {
    connection.release();
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

async function initializeSectionYearRecords(req, res) {
  try {
    const [result] = await pool.query(`
      INSERT IGNORE INTO section_year_record_table (section_ID, AYS_ID)
      SELECT s.section_ID, ays.AYS_ID
      FROM section_table s
      CROSS JOIN academic_year_semester_table ays
    `);

    res.status(200).json({
      message: 'Section records initialized successfully across all academic year semesters.',
      newRecordsAdded: result.affectedRows
    });
  } catch (err) {
    console.error("Error initializing section year records:", err);
    res.sendStatus(500);
  }
}


// Create Section
async function createSection(req, res) {
  const connection = await pool.getConnection();

  try {
    const { sectionName, gradeLevel, department } = req.body;

    if (!sectionName || !gradeLevel || !department) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO section_table
       (section_Name, gradeLevel, department)
       VALUES (?, ?, ?)`,
      [sectionName, gradeLevel, department]
    );

    const sectionId = result.insertId;

    await connection.query(
      `INSERT INTO section_year_record_table
       (section_ID, AYS_ID)
       SELECT ?, ays.AYS_ID
       FROM academic_year_semester_table ays`,
      [sectionId]
    );

    await connection.commit();

    res.status(201).json({
      id: sectionId,
      sectionName,
      gradeLevel,
      department,
    });
  } catch (err) {
    await connection.rollback();

    console.error("Error creating section:", err);

    res.status(500).json({
      error: "Failed to create section",
    });
  } finally {
    connection.release();
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
              s.status,
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
         AND s.status = "Enrolled"
       ORDER BY s.l_Name ASC`,
      [sectionId, AYS_ID]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error loading students:", err.sqlMessage || err);
    res.status(500).json({ error: "Failed to load students" });
  }
}


async function getStudentById(req, res) {
  try {
    const { AYS_ID } = req.query;
    const { id } = req.params;

    if (!AYS_ID) return res.status(400).json({ error: "AYS_ID is required" });

    // password is intentionally NOT selected: the hash should never leave the server.
    // updateStudentById already keeps the current password when the field is blank.
    const [rows] = await pool.query(
      `SELECT
         s.f_Name, s.m_Name, s.l_Name, s.gender, s.contact_Number, s.email, s.address,
         s.father_Name, s.father_Contact, s.mother_Name, s.mother_Contact,
         s.guardian_Name, s.guardian_Contact,
         s.birthdate, s.age, s.lrn,
         syr.department, syr.program, syr.classification, syr.year_level,
         sec.section_Name, sec.gradeLevel, sec.section_ID,
         syr.AYS_ID
       FROM student_table s
       JOIN student_year_record_table syr
         ON syr.student_ID = s.student_ID AND syr.AYS_ID = ?
       LEFT JOIN section_year_record_table syrt
         ON syrt.section_record_ID = syr.section_record_ID
       LEFT JOIN section_table sec
         ON sec.section_ID = syrt.section_ID
       WHERE s.student_ID = ?`,
      [AYS_ID, id]
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
  const { id } = req.params;
  const {
    AYS_ID,
    f_Name,
    m_Name,
    l_Name,
    gender,
    contact_Number,
    email,
    address,
    father_Name,
    father_Contact,
    mother_Name,
    mother_Contact,
    guardian_Name,
    guardian_Contact,
    birthdate,
    age,
    lrn,
    password,
    department,
    program,
    section_ID,
  } = req.body;

  if (!AYS_ID) return res.status(400).json({ error: "AYS_ID is required" });

  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      "SELECT password FROM student_table WHERE student_ID = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const [[termRecord]] = await connection.query(
      `SELECT stud_record_ID, classification
       FROM student_year_record_table
       WHERE student_ID = ? AND AYS_ID = ?`,
      [id, AYS_ID]
    );
    if (!termRecord) {
      return res.status(404).json({ error: "This student has no record in that term" });
    }

    // Validate everything BEFORE writing anything
    let section_record_ID = null;
    const isRegular = termRecord.classification === "Regular";
    if (isRegular) {
      if (!section_ID) return res.status(400).json({ error: "section_ID is required" });
      const [sectionRows] = await connection.query(
        `SELECT section_record_ID
         FROM section_year_record_table
         WHERE section_ID = ? AND AYS_ID = ?`,
        [section_ID, AYS_ID]
      );
      if (sectionRows.length === 0) {
        return res.status(400).json({ error: "Invalid section/year combination" });
      }
      section_record_ID = sectionRows[0].section_record_ID;
    }

    let hashedPassword = existing[0].password;
    if (password && password.trim() !== "") {
      hashedPassword =
        password.startsWith("$2b$") || password.startsWith("$2a$")
          ? password
          : await bcrypt.hash(password.trim(), 10);
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE student_table
       SET f_Name = ?, m_Name = ?, l_Name = ?, gender = ?, contact_Number = ?, email = ?, address = ?,
           father_Name = ?, father_Contact = ?, mother_Name = ?, mother_Contact = ?,
           guardian_Name = ?, guardian_Contact = ?, birthdate = ?, age = ?, lrn = ?, password = ?
       WHERE student_ID = ?`,
      [
        f_Name || null,
        m_Name || null,
        l_Name || null,
        gender || null,
        contact_Number || null,
        email || null,
        address || null,
        father_Name || null,
        father_Contact || null,
        mother_Name || null,
        mother_Contact || null,
        guardian_Name || null,
        guardian_Contact || null,
        birthdate || null,
        age || null,
        lrn || null,
        hashedPassword,
        id,
      ]
    );

    // Only this term's record. Irregular students have no section, so theirs is never touched.
    if (isRegular) {
      await connection.query(
        `UPDATE student_year_record_table
         SET department = ?, program = ?, section_record_ID = ?
         WHERE stud_record_ID = ?`,
        [department, program, section_record_ID, termRecord.stud_record_ID]
      );
    } else {
      await connection.query(
        `UPDATE student_year_record_table
         SET department = ?, program = ?
         WHERE stud_record_ID = ?`,
        [department, program, termRecord.stud_record_ID]
      );
    }

    await connection.commit();
    return res.json({ success: true, message: "Student updated successfully" });
  } catch (err) {
    console.error("Error updating student:", err.sqlMessage || err);
    try { await connection.rollback(); } catch (_) { /* no open transaction */ }

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "That email or LRN is already used by another student" });
    }
    return res.status(500).json({ error: "Failed to update student" });
  } finally {
    connection.release();
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
      `SELECT sec.department, cyr.curriculum_ID AS currentCurriculumId
       FROM section_table sec
       JOIN section_year_record_table syrt ON sec.section_ID = syrt.section_ID
       LEFT JOIN curriculum_year_record_table cyr ON syrt.curriculum_record_ID = cyr.curriculum_record_ID
       WHERE sec.section_ID = ? AND syrt.AYS_ID = ?`,
      [sectionId, AYS_ID]
    );
    if (sectionRows.length === 0) return res.status(404).json({ error: "Section/year record not found" });

    const { department, currentCurriculumId } = sectionRows[0];
    const [curriculums] = await pool.query(
      `SELECT c.curriculum_ID AS id, c.curriculum_Name AS name, c.department
       FROM curriculum_table c
       JOIN curriculum_year_record_table cyr ON c.curriculum_ID = cyr.curriculum_ID
       WHERE cyr.AYS_ID = ? AND c.department = ?`,
      [AYS_ID, department]
    );

    res.json({ sectionId, currentCurriculumId, curriculumOptions: curriculums });
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
       FROM faculty_table WHERE position = 'Teacher' AND status = 'Active' AND faculty_ID!=2`,
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

async function getSectionOptions(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
          section_ID,
          section_Name,
          department,
          gradeLevel
       FROM section_table
       ORDER BY gradeLevel, section_Name`
    );

    res.json(rows);
  } catch (err) {
    res.sendStatus(500);
  }
}

async function getAYSOptions(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
          ays.AYS_ID,
          ay.AY_Name,
          sem.semester_name
       FROM academic_year_semester_table ays
       JOIN academic_year_table ay
         ON ay.AY_ID = ays.AY_ID
       JOIN semester_table sem
         ON sem.semester_ID = ays.semester_ID
       ORDER BY ay.AY_Name DESC`
    );

    res.json(rows);
  } catch (err) {
    res.sendStatus(500);
  }
}

async function transferSection(req, res) {
  const { sourceSectionId, sourceAYS_ID, targetSectionId, targetAYS_ID } = req.body;

  if (!sourceSectionId || !sourceAYS_ID || !targetSectionId || !targetAYS_ID) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  if (String(sourceAYS_ID) === String(targetAYS_ID)) {
    return res.status(400).json({ error: "Cannot transfer to the same Academic Year/Semester" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [[source]] = await connection.query(
      `SELECT section_record_ID, faculty_ID
       FROM section_year_record_table
       WHERE section_ID = ? AND AYS_ID = ?`,
      [sourceSectionId, sourceAYS_ID]
    );
    if (!source) {
      await connection.rollback();
      return res.status(404).json({ error: "Source section record not found" });
    }

    // Reuse the target record if it exists. A new one is created WITHOUT a curriculum:
    // curricula are per year level + semester, so the admin picks the right one on the
    // section's "Configure Instructors" page instead of the system guessing.
    const [[existingTarget]] = await connection.query(
      `SELECT section_record_ID
       FROM section_year_record_table
       WHERE section_ID = ? AND AYS_ID = ?`,
      [targetSectionId, targetAYS_ID]
    );

    let targetSectionRecordId;
    if (existingTarget) {
      targetSectionRecordId = existingTarget.section_record_ID;
    } else {
      const [created] = await connection.query(
        `INSERT INTO section_year_record_table (section_ID, AYS_ID, faculty_ID)
         VALUES (?, ?, ?)`,
        [targetSectionId, targetAYS_ID, source.faculty_ID]
      );
      targetSectionRecordId = created.insertId;
    }

    // How many students are eligible, so we can report how many were skipped
    const [[{ eligible }]] = await connection.query(
      `SELECT COUNT(*) AS eligible
       FROM student_year_record_table syr
       JOIN student_table st ON st.student_ID = syr.student_ID
       WHERE syr.section_record_ID = ?
         AND st.status = 'Enrolled'
         AND syr.classification = 'Regular'`,
      [source.section_record_ID]
    );

    // Regular, enrolled students only. Irregulars have no section; they are re-loaded each term.
    const [studentResult] = await connection.query(
      `INSERT INTO student_year_record_table
         (student_ID, section_record_ID, AYS_ID, classification, program, department, specialization)
       SELECT syr.student_ID, ?, ?, 'Regular', syr.program, syr.department, syr.specialization
       FROM student_year_record_table syr
       JOIN student_table st ON st.student_ID = syr.student_ID
       WHERE syr.section_record_ID = ?
         AND st.status = 'Enrolled'
         AND syr.classification = 'Regular'
         AND NOT EXISTS (
           SELECT 1 FROM student_year_record_table existing
           WHERE existing.student_ID = syr.student_ID AND existing.AYS_ID = ?
         )`,
      [targetSectionRecordId, targetAYS_ID, source.section_record_ID, targetAYS_ID]
    );

    // Copy teacher assignments only for subjects that belong to the TARGET section's
    // curriculum, and never overwrite a subject that already has a teacher there.
    // If the target has no curriculum yet, nothing is copied (assign teachers after
    // choosing the curriculum).
    const [toCopy] = await connection.query(
      `SELECT fyr.advisory, fyr.faculty_ID, fyr.subject_ID
       FROM faculty_year_record_table fyr
       WHERE fyr.section_record_ID = ?
         AND fyr.subject_ID IN (
           SELECT stc.subject_ID
           FROM section_year_record_table tgt
           JOIN curriculum_year_record_table cyr
             ON cyr.curriculum_record_ID = tgt.curriculum_record_ID
           JOIN subject_to_curriculum_table stc
             ON stc.curriculum_ID = cyr.curriculum_ID
           WHERE tgt.section_record_ID = ?
         )
         AND NOT EXISTS (
           SELECT 1 FROM faculty_year_record_table ex
           WHERE ex.section_record_ID = ? AND ex.subject_ID = fyr.subject_ID
         )`,
      [source.section_record_ID, targetSectionRecordId, targetSectionRecordId]
    );

    if (toCopy.length > 0) {
      await connection.query(
        `INSERT INTO faculty_year_record_table (advisory, faculty_ID, section_record_ID, subject_ID)
         VALUES ?`,
        [toCopy.map((r) => [r.advisory, r.faculty_ID, targetSectionRecordId, r.subject_ID])]
      );
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      transferredStudents: studentResult.affectedRows,
      skippedStudents: eligible - studentResult.affectedRows, // already had a record in the target term
      copiedTeacherAssignments: toCopy.length,
      targetSectionRecordId,
    });
  } catch (err) {
    console.error("Error transferring section:", err);
    try { await connection.rollback(); } catch (_) { /* connection already gone */ }
    return res.status(500).json({ error: "Failed to transfer section" });
  } finally {
    connection.release();
  }
}


async function dropStudents(req, res) {
  try {
    const { studentIds } = req.body;

    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ error: "No students selected" });
    }

    await pool.query(
      `UPDATE student_table
       SET status = 'Dropped'
       WHERE student_ID IN (?)`,
      [studentIds]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error("Error dropping students:", err);
    res.sendStatus(500);
  }
}


async function changePassword(req, res) {
  const { userId, role, currentPassword, newPassword, confirmPassword } = req.body;

  if (!userId || !role || !currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "New passwords do not match" });
  }

  try {
    const normalizedRole = role.toString().trim().toLowerCase();
    const tableName = normalizedRole === "student" ? "student_table" : "faculty_table";
    const idColumn = normalizedRole === "student" ? "student_ID" : "faculty_ID";

    const [rows] = await pool.query(
      `SELECT password FROM ${tableName} WHERE ${idColumn} = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    const match = await bcrypt.compare(currentPassword.trim(), rows[0].password);
    if (!match) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    const newHashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    await pool.query(
      `UPDATE ${tableName} SET password = ? WHERE ${idColumn} = ?`,
      [newHashedPassword, userId]
    );

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    return res.status(500).json({ message: "Server error during password update" });
  }
}



// Export functions
module.exports = {
  loadAcademicYear,
  loadAcademicYearSemesters,
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
  initializeSectionYearRecords,
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
  getAYSOptions,
  getSectionOptions,
  transferSection,
  dropStudents,
  changePassword,
  convertEnrollees
};
