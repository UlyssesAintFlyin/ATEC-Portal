const pool = require('../config/db'); 
const ExcelJS = require('exceljs');

// subjects belonging to a curriculum, deterministic order
async function getSubjectsForCurriculum(conn, curriculumId) {
  const [subjects] = await conn.query(
    `SELECT s.subject_ID, s.subject_code, s.subject_Name
     FROM subject_to_curriculum_table stc
     JOIN subject_table s ON stc.subject_ID = s.subject_ID
     WHERE stc.curriculum_ID = ?
     ORDER BY s.subject_code`,
    [curriculumId]
  );
  return subjects;
}

// students currently in this section for this term
async function getStudentsInSection(conn, sectionId, aysId) {
  const [students] = await conn.query(
    `SELECT st.student_ID, st.lrn, st.f_Name, st.m_Name, st.l_Name
     FROM student_year_record_table syr
     JOIN student_table st ON syr.student_ID = st.student_ID
     WHERE syr.section_ID = ? AND syr.AYS_ID = ?
     ORDER BY st.l_Name, st.f_Name`,
    [sectionId, aysId]
  );
  return students;
}

function formatName(st) {
  const middleInitial = st.m_Name ? ` ${st.m_Name.charAt(0)}.` : '';
  return `${st.l_Name}, ${st.f_Name}${middleInitial}`;
}

// GET /admin/grades/template?sectionId=&curriculumId=&aysId=
async function getGradeTemplate (req, res) {
  const { sectionId, curriculumId, aysId } = req.query;
  if (!sectionId || !curriculumId || !aysId) {
    return res.status(400).json({ message: 'sectionId, curriculumId, and aysId are required' });
  }

  const conn = await pool.getConnection();
  try {
    const subjects = await getSubjectsForCurriculum(conn, curriculumId);
    const students = await getStudentsInSection(conn, sectionId, aysId);

    if (subjects.length === 0) {
      return res.status(400).json({ message: 'This curriculum has no subjects assigned' });
    }
    if (students.length === 0) {
      return res.status(400).json({ message: 'No students enrolled in this section' });
    }

    // Existing grades, so re-downloads show current state instead of blanks
    const studentIds = students.map((s) => s.student_ID);
    const [existingGrades] = await conn.query(
      `SELECT student_ID, subject_ID, grade_value
       FROM grade_table
       WHERE section_ID = ? AND AYS_ID = ? AND student_ID IN (?)`,
      [sectionId, aysId, studentIds.length ? studentIds : [0]]
    );
    const gradeLookup = {}; // `${student_ID}_${subject_ID}` -> grade_value
    existingGrades.forEach((g) => {
      gradeLookup[`${g.student_ID}_${g.subject_ID}`] = g.grade_value;
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Grades');

    sheet.columns = [
      { header: 'LRN', key: 'lrn', width: 15 },
      { header: 'Student Name', key: 'name', width: 30 },
      ...subjects.map((s) => ({ header: s.subject_code, key: `subj_${s.subject_ID}`, width: 12 })),
    ];

    students.forEach((st) => {
      const row = { lrn: st.lrn, name: formatName(st) };
      subjects.forEach((s) => {
        const key = `subj_${s.subject_ID}`;
        const existing = gradeLookup[`${st.student_ID}_${s.subject_ID}`];
        row[key] = existing !== undefined ? existing : '';
      });
      sheet.addRow(row);
    });

    sheet.getColumn('lrn').font = { color: { argb: 'FF888888' } };
    sheet.getColumn('name').font = { color: { argb: 'FF888888' } };
    sheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=grade_template_section${sectionId}.xlsx`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate template' });
  } finally {
    conn.release();
  }
};

// POST /admin/grades/import  (multipart/form-data: file, sectionId, curriculumId, aysId)
async function importGrades (req, res) {
  const { sectionId, curriculumId, aysId } = req.body;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  if (!sectionId || !curriculumId || !aysId) {
    return res.status(400).json({ message: 'sectionId, curriculumId, and aysId are required' });
  }

  const conn = await pool.getConnection();
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.worksheets[0];

    const subjects = await getSubjectsForCurriculum(conn, curriculumId);
    const subjectByCode = Object.fromEntries(subjects.map((s) => [s.subject_code, s.subject_ID]));

    // Map header columns (3+) to subject_ID; validate against current curriculum
    const headerRow = sheet.getRow(1).values; // 1-indexed; index 0 unused
    const columnSubjectMap = {};
    for (let col = 3; col < headerRow.length; col++) {
      const code = headerRow[col];
      if (!code) continue;
      if (!subjectByCode[code]) {
        return res.status(400).json({
          message: `Column "${code}" does not match a subject in this curriculum. Please re-download the template.`,
        });
      }
      columnSubjectMap[col] = subjectByCode[code];
    }
    if (Object.keys(columnSubjectMap).length === 0) {
      return res.status(400).json({ message: 'No subject columns found in file' });
    }

    const students = await getStudentsInSection(conn, sectionId, aysId);
    const studentByLRN = Object.fromEntries(students.map((s) => [String(s.lrn), s.student_ID]));

    const errors = [];
    const gradeRows = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const lrn = String(row.getCell(1).value ?? '').trim();
      if (!lrn) return;

      const studentId = studentByLRN[lrn];
      if (!studentId) {
        errors.push(`Row ${rowNumber}: LRN ${lrn} is not currently enrolled in this section`);
        return;
      }

      for (const [colIndex, subjectId] of Object.entries(columnSubjectMap)) {
        const cell = row.getCell(Number(colIndex));
        const value = cell.value;
        if (value === null || value === undefined || value === '') continue; // ungraded, skip

        const gradeValue = Number(value);
        if (Number.isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
          errors.push(`Row ${rowNumber}, ${headerRow[colIndex]}: invalid grade value "${value}"`);
          continue;
        }

        gradeRows.push([gradeValue, studentId, subjectId, sectionId, aysId]);
      }
    });

    if (errors.length > 0) {
      return res.status(422).json({ message: 'Validation failed', errors });
    }
    if (gradeRows.length === 0) {
      return res.status(400).json({ message: 'No valid grade entries found in file' });
    }

    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO grade_table (grade_value, student_ID, subject_ID, section_ID, AYS_ID)
       VALUES ?
       ON DUPLICATE KEY UPDATE grade_value = VALUES(grade_value), updated_at = CURRENT_TIMESTAMP`,
      [gradeRows]
    );
    await conn.commit();

    res.json({ message: `Imported ${gradeRows.length} grade entries successfully` });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Failed to import grades' });
  } finally {
    conn.release();
  }
};

async function getStudCurriculumRecord(req, res) {
  const { studentId } = req.query;
  if (!studentId) return res.status(400).json({ message: 'studentId is required' });

  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT ays.AYS_ID, ay.AY_Name, sem.semester_Name
       FROM student_year_record_table syr
       JOIN academic_year_semester_table ays ON syr.AYS_ID = ays.AYS_ID
       JOIN academic_year_table ay ON ays.AY_ID = ay.AY_ID
       JOIN semester_table sem ON ays.semester_ID = sem.semester_ID
       WHERE syr.student_ID = ?
       ORDER BY ay.AY_Name DESC, sem.semester_Name DESC`,
      [studentId]
    );
    res.json(
      rows.map((r) => ({
        id: r.AYS_ID,
        label: `${r.AY_Name} - ${r.semester_Name}`,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch academic year options' });
  }
}

// GET /grades/report?studentId=&aysId=
async function getStudentGradeReport(req, res) {
  const { studentId, aysId } = req.query;
  if (!studentId || !aysId) {
    return res.status(400).json({ message: 'studentId and aysId are required' });
  }

  try {
    // Section the student was in for this specific AYS
    const [[record]] = await pool.query(
      `SELECT sec.section_Name
       FROM student_year_record_table syr
       LEFT JOIN section_table sec ON syr.section_ID = sec.section_ID
       WHERE syr.student_ID = ? AND syr.AYS_ID = ?`,
      [studentId, aysId]
    );

    const [rows] = await pool.query(
      `SELECT
         g.subject_ID,
         s.subject_Name,
         g.grade_value,
         f.f_Name AS instructor_fName,
         f.l_Name AS instructor_lName
       FROM grade_table g
       JOIN subject_table s ON g.subject_ID = s.subject_ID
       LEFT JOIN faculty_load_table fl
         ON fl.subject_ID = g.subject_ID
        AND fl.section_ID = g.section_ID
        AND fl.AYS_ID = g.AYS_ID
       LEFT JOIN faculty_table f ON fl.faculty_ID = f.faculty_ID
       WHERE g.student_ID = ? AND g.AYS_ID = ?
       ORDER BY s.subject_Name`,
      [studentId, aysId]
    );

    const report = rows.map((r) => ({
      id: r.subject_ID,
      subjectName: r.subject_Name,
      instructor: r.instructor_fName ? `${r.instructor_fName} ${r.instructor_lName}` : "Unassigned",
      grade: r.grade_value,
    }));

    res.json({
      report,
      sectionName: record?.section_Name ?? "—",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch grade report' });
  }
}

module.exports = {
  getGradeTemplate,
  importGrades,
  getStudCurriculumRecord,
  getStudentGradeReport,
};