const pool = require('../config/db');

const createEnrollment = async (req, res) => {
    try {
        const { studentDetails, studentType, programTerm } = req.body;

        if (!studentDetails.birthdate || isNaN(Date.parse(studentDetails.birthdate))) {
            return res.status(400).json({ message: 'Invalid or missing birthdate.' });
        }
        if (!studentDetails.email || !studentDetails.firstName || !studentDetails.lastName) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }
        if (!programTerm.term) {
            return res.status(400).json({ message: 'Please select a term.' });
        }

        // Look up AYS_ID by joining academic_year_table + semester_table
        // through the academic_year_semester_table junction
        const [aysRows] = await pool.query(
        `SELECT ays.AYS_ID 
         FROM academic_year_semester_table ays 
         JOIN academic_year_table ay 
         ON ays.AY_ID = ay.AY_ID 
         JOIN semester_table sem 
         ON ays.semester_ID = sem.semester_ID 
         WHERE ay.AY_Name = ? 
         AND sem.semester_name = ?`,    
        ['A.Y. 2025-2026', programTerm.term]
        );

        const AYS_ID = aysRows.length > 0 ? aysRows[0].AYS_ID : null;
        const sql = `
            INSERT INTO enrollment_table
            (f_Name, m_Name, l_Name, gender, age, contact_Number, email, address,
             father_Name, father_Contact, mother_Name, mother_Contact,
             guardian_Name, guardian_Contact,
             birthdate, transferring_from, AYS_ID,
             student_type, term, year_level, track, program)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            programTerm.term,
            programTerm.year,
            programTerm.track,
            programTerm.program
        ];

        const [result] = await pool.query(sql, values);

        const currentYear = new Date().getFullYear();
        const paddedId = String(result.insertId).padStart(5, '0');
        const enrollmentCode = `ATEC-${currentYear}-${paddedId}`;

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

module.exports = { createEnrollment, getEnrollmentStatus };