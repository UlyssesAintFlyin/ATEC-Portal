const pool = require('../config/db');
const ExcelJS = require('exceljs');

// Resolve the section_record_ID for a given section + term
async function getSectionRecordId(conn, sectionId, aysId) {
  const [[row]] = await conn.query(
    `SELECT section_record_ID FROM section_year_record_table WHERE section_ID = ? AND AYS_ID = ?`,
    [sectionId, aysId]
  );
  return row ? row.section_record_ID : null;
}

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

/**
 * Everyone who can be graded in this section's classes this term.
 *
 *  - Regular students: belong to the section, take every subject in `subjects`.
 *  - Irregular students: have no home section; they appear only for the
 *    subjects they have an Approved load for in THIS section record.
 *
 * Returns [{ student_ID, f_Name, m_Name, l_Name, kind, allowed:Set<subject_ID> }]
 */
async function getRoster(conn, sectionRecordId, subjects) {
  const [regulars] = await conn.query(
    `SELECT st.student_ID, st.f_Name, st.m_Name, st.l_Name
     FROM student_year_record_table syr
     JOIN student_table st ON syr.student_ID = st.student_ID
     WHERE syr.section_record_ID = ?
       AND syr.classification = 'Regular'
       AND st.status = 'Enrolled'`,
    [sectionRecordId]
  );

  const [loaded] = await conn.query(
    `SELECT st.student_ID, st.f_Name, st.m_Name, st.l_Name, e.subject_ID
     FROM student_subject_enrollment_table e
     JOIN student_year_record_table syr ON syr.stud_record_ID = e.stud_record_ID
     JOIN student_table st ON st.student_ID = syr.student_ID
     WHERE e.section_record_ID = ?
       AND e.status = 'Approved'
       AND st.status = 'Enrolled'`,
    [sectionRecordId]
  );

  const allSubjectIds = subjects.map((s) => s.subject_ID);
  const byId = new Map();

  regulars.forEach((st) => {
    byId.set(st.student_ID, { ...st, kind: 'Regular', allowed: new Set(allSubjectIds) });
  });

  loaded.forEach((row) => {
    let entry = byId.get(row.student_ID);
    if (!entry) {
      entry = {
        student_ID: row.student_ID,
        f_Name: row.f_Name,
        m_Name: row.m_Name,
        l_Name: row.l_Name,
        kind: 'Irregular',
        allowed: new Set(),
      };
      byId.set(row.student_ID, entry);
    }
    // a regular student already has every subject; only irregulars are limited
    if (entry.kind === 'Irregular') entry.allowed.add(row.subject_ID);
  });

  return [...byId.values()].sort(
    (a, b) => a.l_Name.localeCompare(b.l_Name) || a.f_Name.localeCompare(b.f_Name)
  );
}

function formatName(st) {
  const middleInitial = st.m_Name ? ` ${st.m_Name.charAt(0)}.` : '';
  return `${st.l_Name}, ${st.f_Name}${middleInitial}`;
}

const ID_HEADER = 'Student ID';

// GET /grades/template?sectionId=&curriculumId=&aysId=
async function getGradeTemplate(req, res) {
  const { sectionId, curriculumId, aysId } = req.query;
  if (!sectionId || !curriculumId || !aysId) {
    return res.status(400).json({ message: 'sectionId, curriculumId, and aysId are required' });
  }

  const conn = await pool.getConnection();
  try {
    const sectionRecordId = await getSectionRecordId(conn, sectionId, aysId);
    if (!sectionRecordId) {
      return res.status(404).json({ message: 'Section/year record not found' });
    }

    const subjects = await getSubjectsForCurriculum(conn, curriculumId);
    if (subjects.length === 0) {
      return res.status(400).json({ message: 'This curriculum has no subjects assigned' });
    }

    const students = await getRoster(conn, sectionRecordId, subjects);
    if (students.length === 0) {
      return res.status(400).json({ message: 'No students enrolled in this section' });
    }

    const studentIds = students.map((s) => s.student_ID);
    const [existingGrades] = await conn.query(
      `SELECT student_ID, subject_ID, grade_value
       FROM grade_table
       WHERE section_record_ID = ? AND student_ID IN (?)`,
      [sectionRecordId, studentIds]
    );
    const gradeLookup = {};
    existingGrades.forEach((g) => {
      gradeLookup[`${g.student_ID}_${g.subject_ID}`] = g.grade_value;
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Grades');

    sheet.columns = [
      { header: ID_HEADER, key: 'studentId', width: 12 },
      { header: 'Student Name', key: 'name', width: 34 },
      ...subjects.map((s) => ({ header: s.subject_code, key: `subj_${s.subject_ID}`, width: 12 })),
    ];

    const GREY_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };

    students.forEach((st) => {
      const row = {
        studentId: st.student_ID,
        name: st.kind === 'Irregular' ? `${formatName(st)} (Irregular)` : formatName(st),
      };
      subjects.forEach((s) => {
        const existing = gradeLookup[`${st.student_ID}_${s.subject_ID}`];
        row[`subj_${s.subject_ID}`] = existing !== undefined ? existing : '';
      });
      const added = sheet.addRow(row);

      // grey out subjects this student is not enrolled in (irregulars only)
      subjects.forEach((s, i) => {
        if (!st.allowed.has(s.subject_ID)) {
          added.getCell(3 + i).fill = GREY_FILL;
        }
      });
    });

    sheet.getColumn('studentId').font = { color: { argb: 'FF888888' } };
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
}

// POST /grades/import (multipart/form-data: file, sectionId, curriculumId, aysId)
async function importGrades(req, res) {
  const { sectionId, curriculumId, aysId } = req.body;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  if (!sectionId || !curriculumId || !aysId) {
    return res.status(400).json({ message: 'sectionId, curriculumId, and aysId are required' });
  }

  const conn = await pool.getConnection();
  try {
    const sectionRecordId = await getSectionRecordId(conn, sectionId, aysId);
    if (!sectionRecordId) {
      return res.status(404).json({ message: 'Section/year record not found' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.worksheets[0];

    const subjects = await getSubjectsForCurriculum(conn, curriculumId);
    const subjectByCode = Object.fromEntries(subjects.map((s) => [s.subject_code, s.subject_ID]));

    const headerRow = sheet.getRow(1).values;

    // templates used to be keyed by LRN; refuse them rather than mis-match students
    if (String(headerRow[1] ?? '').trim() !== ID_HEADER) {
      return res.status(400).json({
        message: 'This file uses an outdated template. Please download a new template and try again.',
      });
    }

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

    const roster = await getRoster(conn, sectionRecordId, subjects);
    const studentById = new Map(roster.map((s) => [s.student_ID, s]));

    const errors = [];
    const gradeRows = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rawId = row.getCell(1).value;
      if (rawId === null || rawId === undefined || String(rawId).trim() === '') return;

      const studentId = Number(rawId);
      const student = studentById.get(studentId);
      if (!student) {
        errors.push(`Row ${rowNumber}: Student ID ${rawId} is not enrolled in any class of this section`);
        return;
      }

      for (const [colIndex, subjectId] of Object.entries(columnSubjectMap)) {
        const value = row.getCell(Number(colIndex)).value;
        if (value === null || value === undefined || value === '') continue;

        if (!student.allowed.has(subjectId)) {
          errors.push(
            `Row ${rowNumber}, ${headerRow[colIndex]}: ${formatName(student)} is not enrolled in this subject`
          );
          continue;
        }

        const gradeValue = Number(value);
        if (Number.isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
          errors.push(`Row ${rowNumber}, ${headerRow[colIndex]}: invalid grade value "${value}"`);
          continue;
        }

        gradeRows.push([gradeValue, studentId, subjectId, sectionRecordId]);
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
      `INSERT INTO grade_table (grade_value, student_ID, subject_ID, section_record_ID)
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
}

// GET /grades/studCurriculumRecord?studentId=
// Terms in which the student has a record (regular or irregular)
async function getStudCurriculumRecord(req, res) {
  const { studentId } = req.query;
  if (!studentId) return res.status(400).json({ message: 'studentId is required' });

  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT ays.AYS_ID, ay.AY_Name, sem.semester_name
       FROM student_year_record_table syr
       LEFT JOIN section_year_record_table sec_yr ON syr.section_record_ID = sec_yr.section_record_ID
       JOIN academic_year_semester_table ays
         ON ays.AYS_ID = COALESCE(syr.AYS_ID, sec_yr.AYS_ID)
       JOIN academic_year_table ay ON ays.AY_ID = ay.AY_ID
       JOIN semester_table sem ON ays.semester_ID = sem.semester_ID
       WHERE syr.student_ID = ?
       ORDER BY ay.AY_Name DESC, sem.semester_name DESC`,
      [studentId]
    );
    res.json(
      rows.map((r) => ({
        id: r.AYS_ID,
        label: `${r.AY_Name} - ${r.semester_name}`,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch academic year options' });
  }
}

// GET /grades/report?studentId=&aysId=
// All grades the student earned in the term, across every section they took classes in
async function getStudentGradeReport(req, res) {
  const { studentId, aysId } = req.query;
  if (!studentId || !aysId) {
    return res.status(400).json({ message: 'studentId and aysId are required' });
  }

  try {
    const [[termRecord]] = await pool.query(
      `SELECT syr.classification, sec.section_Name
       FROM student_year_record_table syr
       LEFT JOIN section_year_record_table sec_yr ON syr.section_record_ID = sec_yr.section_record_ID
       LEFT JOIN section_table sec ON sec_yr.section_ID = sec.section_ID
       WHERE syr.student_ID = ? AND syr.AYS_ID = ?`,
      [studentId, aysId]
    );

    if (!termRecord) {
      return res.json({ report: [], sectionName: '—' });
    }

    const [rows] = await pool.query(
      `SELECT
         g.subject_ID,
         s.subject_Name,
         s.units,
         g.grade_value,
         sec.section_Name,
         f.f_Name AS instructor_fName,
         f.l_Name AS instructor_lName
       FROM grade_table g
       JOIN section_year_record_table sy ON sy.section_record_ID = g.section_record_ID
       JOIN subject_table s ON g.subject_ID = s.subject_ID
       LEFT JOIN section_table sec ON sec.section_ID = sy.section_ID
       LEFT JOIN (
         SELECT section_record_ID, subject_ID, MIN(faculty_ID) AS faculty_ID
         FROM faculty_year_record_table
         WHERE subject_ID IS NOT NULL AND section_record_ID IS NOT NULL
         GROUP BY section_record_ID, subject_ID
       ) fyr ON fyr.subject_ID = g.subject_ID AND fyr.section_record_ID = g.section_record_ID
       LEFT JOIN faculty_table f ON f.faculty_ID = fyr.faculty_ID
       WHERE g.student_ID = ? AND sy.AYS_ID = ?
       ORDER BY s.subject_Name`,
      [studentId, aysId]
    );

    const report = rows.map((r) => ({
      id: r.subject_ID,
      subjectName: r.subject_Name,
      units: r.units,
      section: r.section_Name ?? '—',
      instructor: r.instructor_fName ? `${r.instructor_fName} ${r.instructor_lName}` : 'Unassigned',
      grade: r.grade_value,
    }));

    const sectionName =
      termRecord.classification === 'Irregular' ? 'Irregular' : termRecord.section_Name ?? '—';

    res.json({ report, sectionName, classification: termRecord.classification });
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