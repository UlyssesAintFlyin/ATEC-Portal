const pool = require('../config/db');
const ExcelJS = require('exceljs');
const crypto = require('crypto');

const generateEnrollmentCode = async () => {
    const currentYear = new Date().getFullYear();
    let code;
    let exists = true;

    while (exists) {
        const randomNum = Math.floor(Math.random() * 100000);
        const padded = String(randomNum).padStart(5, '0');
        code = `ATEC-${currentYear}-${padded}`;

        const [rows] = await pool.query(
            'SELECT enrollment_ID FROM enrollment_table WHERE enrollment_code = ?',
            [code]
        );
        exists = rows.length > 0;
    }

    return code;
};

const createEnrollment = async (req, res) => {
    try {
        const { studentDetails, studentType, programTerm } = req.body;

        if (!studentDetails.birthdate || isNaN(Date.parse(studentDetails.birthdate))) {
            return res.status(400).json({ message: 'Invalid or missing birthdate.' });
        }
        if (!studentDetails.email || !studentDetails.firstName || !studentDetails.lastName) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }
        if (studentType === 'college' && !programTerm.term) {
            return res.status(400).json({ message: 'Please select a term.' });
        }
        if (studentType === 'seniorHigh' && !programTerm.gradeLevel) {
            return res.status(400).json({ message: 'Please select a grade level.' });
        }

        // Pull the currently active AYS_ID from system settings,
        // set by the admin via setAY/setSemester
        const [settingsRows] = await pool.query(
            `SELECT enrollment_AYS_ID FROM system_settings_table WHERE system_settings_ID = 1`
        );

        const AYS_ID = settingsRows.length > 0 ? settingsRows[0].enrollment_AYS_ID : null;

        if (!AYS_ID) {
            return res.status(400).json({ message: 'Enrollment period is not currently configured. Please contact the registrar.' });
        }

        const sql = `
            INSERT INTO enrollment_table
            (f_Name, m_Name, l_Name, gender, age, contact_Number, email, address,
             father_Name, father_Contact, mother_Name, mother_Contact,
             guardian_Name, guardian_Contact,
             birthdate, transferring_from, AYS_ID,
             student_type, term, year_level, grade_level, track, program)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            studentDetails.firstName,
            studentDetails.middleName,
            studentDetails.lastName,
            studentDetails.gender,
            studentDetails.age || null,
            studentDetails.contact,
            studentDetails.email,
            studentDetails.homeAddress,
            studentDetails.fathersName,
            studentDetails.fathersContact,
            studentDetails.mothersName,
            studentDetails.mothersContact,
            studentDetails.guardiansName,
            studentDetails.guardiansContact,
            studentDetails.birthdate,
            studentDetails.prevSchool,
            AYS_ID,
            studentType,
            studentType === 'college' ? programTerm.term : null,
            studentType === 'college' ? programTerm.year : null,
            studentType === 'seniorHigh' ? programTerm.gradeLevel : null,
            studentType === 'seniorHigh' ? programTerm.track : null,
            studentType === 'college' ? programTerm.program : null
        ];

        const [result] = await pool.query(sql, values);

        const enrollmentCode = await generateEnrollmentCode();

        await pool.query(
            'UPDATE enrollment_table SET enrollment_code = ? WHERE enrollment_ID = ?',
            [enrollmentCode, result.insertId]
        );

        res.status(201).json({
            message: 'Enrollment submitted successfully!',
            enrollmentId: result.insertId,
            enrollmentCode: enrollmentCode
        });

    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({
            message: 'Failed to save enrollment',
            error: error.message
        });
    }
};

const getEnrollmentStatus = async (req, res) => {
    try {
        const { code } = req.params;

        const [rows] = await pool.query(
            'SELECT enrollment_code, f_Name, l_Name, status, created_at FROM enrollment_table WHERE enrollment_code = ?',
            [code]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No enrollment found with that code.' });
        }

        res.json({ enrollment: rows[0] });

    } catch (error) {
        console.error('Status lookup error:', error);
        res.status(500).json({ message: 'Failed to check status', error: error.message });
    }
};

const GENDERS = ['Male', 'Female'];
const STUDENT_TYPES = ['seniorHigh', 'college'];
const TERMS = ['1st Semester', '2nd Semester'];
const IMPORTED_ACCOUNT_TYPE_ID = null; 

const COLUMNS = [
  { header: 'First Name',        field: 'f_Name',            required: true,  width: 18 },
  { header: 'Middle Name',       field: 'm_Name',            width: 18 },
  { header: 'Last Name',         field: 'l_Name',            required: true,  width: 18 },
  { header: 'Gender',            field: 'gender',            width: 12, list: GENDERS },
  { header: 'Birthdate',         field: 'birthdate',         width: 14, date: true },
  { header: 'Contact Number',    field: 'contact_Number',    required: true,  width: 18, text: true },
  { header: 'Email',             field: 'email',             required: true,  width: 28 },
  { header: 'Address',           field: 'address',           required: true,  width: 36 },
  { header: 'Father Name',       field: 'father_Name',       width: 22 },
  { header: 'Father Contact',    field: 'father_Contact',    width: 18, text: true },
  { header: 'Mother Name',       field: 'mother_Name',       width: 22 },
  { header: 'Mother Contact',    field: 'mother_Contact',    width: 18, text: true },
  { header: 'Guardian Name',     field: 'guardian_Name',     width: 22 },
  { header: 'Guardian Contact',  field: 'guardian_Contact',  width: 18, text: true },
  { header: 'Student Type',      field: 'student_type',      required: true,  width: 16, list: STUDENT_TYPES },
  { header: 'Grade Level',       field: 'Grade_level',       width: 14 },
  { header: 'Year Level',        field: 'year_level',        width: 14 },
  { header: 'Track',             field: 'track',             width: 18 },
  { header: 'Program',           field: 'program',           width: 24 },
  { header: 'Term',              field: 'term',              width: 14, list: TERMS },
  { header: 'Transferring From', field: 'transferring_from', width: 26 },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function resolveAYS(conn, ayId) {
  const [rows] = await conn.query(
    `SELECT AYS_ID FROM academic_year_semester_table WHERE AY_ID = ? ORDER BY AYS_ID`,
    [ayId]
  );
  return rows.length ? rows[0].AYS_ID : null;
}

function cellText(cell) {
  let v = cell.value;
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === 'object') {
    if (v.richText) v = v.richText.map((r) => r.text).join('');
    else if (v.text !== undefined) v = v.text;
    else if (v.result !== undefined) v = v.result;
  }
  return String(v).trim();
}

function parseBirthdate(text) {
  if (!text) return { value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return { error: 'use YYYY-MM-DD' };
  const d = new Date(text);
  if (Number.isNaN(d.getTime()) || d > new Date()) return { error: 'invalid date' };
  return { value: text };
}

function computeAge(isoDate) {
  if (!isoDate) return null;
  const b = new Date(isoDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

async function getEnrolleeTemplate(req, res) {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Enrollees');

    sheet.columns = COLUMNS.map((c) => ({
      header: c.header + (c.required ? ' *' : ''),
      key: c.field,
      width: c.width,
    }));
    sheet.getRow(1).font = { bold: true };

    
    COLUMNS.forEach((c, i) => {
      const col = sheet.getColumn(i + 1);
      if (c.text) col.numFmt = '@';
      if (c.date) col.numFmt = 'yyyy-mm-dd';
    });

   
    for (let r = 2; r <= 500; r++) {
      COLUMNS.forEach((c, i) => {
        if (!c.list) return;
        sheet.getCell(r, i + 1).dataValidation = {
          type: 'list',
          allowBlank: !c.required,
          formulae: [`"${c.list.join(',')}"`],
        };
      });
    }

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=enrollee_template.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate template' });
  }
}


async function importEnrollees(req, res) {
  const { ayId } = req.body;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  if (!ayId) return res.status(400).json({ message: 'ayId is required' });

  const conn = await pool.getConnection();
  try {
    const aysId = await resolveAYS(conn, ayId);
    if (!aysId) return res.status(404).json({ message: 'Academic year not found' });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) return res.status(400).json({ message: 'File has no worksheet' });

   
    const colIndex = {};
    sheet.getRow(1).eachCell((cell, col) => {
      const h = cellText(cell).replace(/\s*\*$/, '').toLowerCase();
      colIndex[h] = col;
    });
    const missing = COLUMNS.filter((c) => c.required && !colIndex[c.header.toLowerCase()]);
    if (missing.length) {
      return res.status(400).json({
        message: `Missing required column(s): ${missing.map((c) => c.header).join(', ')}. Please re-download the template.`,
      });
    }

    
    const [existing] = await conn.query(
      `SELECT LOWER(email) AS email FROM enrollment_table
       WHERE AYS_ID = ? AND status <> 'Rejected'`,
      [aysId]
    );
    const seenEmails = new Set(existing.map((e) => e.email));

    const errors = [];
    const records = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const data = {};
      COLUMNS.forEach((c) => {
        const idx = colIndex[c.header.toLowerCase()];
        data[c.field] = idx ? cellText(row.getCell(idx)) : '';
      });

      
      if (Object.values(data).every((v) => v === '')) return;

      const rowErrors = [];
      COLUMNS.forEach((c) => {
        if (c.required && !data[c.field]) rowErrors.push(`${c.header} is required`);
      });

      if (data.email && !EMAIL_RE.test(data.email)) rowErrors.push('invalid email');
      if (data.student_type && !STUDENT_TYPES.includes(data.student_type)) {
        rowErrors.push(`Student Type must be one of: ${STUDENT_TYPES.join(', ')}`);
      }

      const bd = parseBirthdate(data.birthdate);
      if (bd.error) rowErrors.push(`Birthdate: ${bd.error}`);

      const emailKey = data.email.toLowerCase();
      if (data.email && seenEmails.has(emailKey)) {
        rowErrors.push(`email ${data.email} already has an enrollment for this term (or appears twice in the file)`);
      }

      if (rowErrors.length) {
        errors.push(`Row ${rowNumber}: ${rowErrors.join('; ')}`);
        return;
      }
      seenEmails.add(emailKey);

      const orNull = (v) => (v === '' ? null : v);
      records.push([
        data.f_Name, orNull(data.m_Name), data.l_Name, orNull(data.gender),
        computeAge(bd.value), data.contact_Number, data.email, data.address,
        orNull(data.father_Name), orNull(data.father_Contact),
        orNull(data.mother_Name), orNull(data.mother_Contact),
        orNull(data.guardian_Name), orNull(data.guardian_Contact),
        bd.value, orNull(data.transferring_from), IMPORTED_ACCOUNT_TYPE_ID, aysId,
        orNull(data.Grade_level), data.student_type, orNull(data.term),
        orNull(data.year_level), orNull(data.track), orNull(data.program),
        generateEnrollmentCode(),
      ]);
    });

    if (errors.length > 0) {
      return res.status(422).json({ message: 'Validation failed', errors });
    }
    if (records.length === 0) {
      return res.status(400).json({ message: 'No enrollee rows found in file' });
    }

    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO enrollment_table
        (f_Name, m_Name, l_Name, gender, age, contact_Number, email, address,
         father_Name, father_Contact, mother_Name, mother_Contact,
         guardian_Name, guardian_Contact, birthdate, transferring_from,
         account_type_ID, AYS_ID, Grade_level, student_type, term,
         year_level, track, program, enrollment_code)
       VALUES ?`,
      [records]
    );
    await conn.commit();

    res.json({ message: `Imported ${records.length} enrollee(s) with Pending status` });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Failed to import enrollees' });
  } finally {
    conn.release();
  }
}

module.exports = { createEnrollment, getEnrollmentStatus, getEnrolleeTemplate, importEnrollees };