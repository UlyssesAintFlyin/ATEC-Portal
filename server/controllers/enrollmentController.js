const pool = require('../config/db');

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

module.exports = { createEnrollment, getEnrollmentStatus };