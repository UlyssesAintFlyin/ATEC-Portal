const pool = require('../config/db');

const createEnrollment = async (req, res) => {
    try {
        const { studentDetails, studentType, programTerm } = req.body;

        const [ayRows] = await pool.query(
            'SELECT AY_ID FROM academic_year_table WHERE AY_Name = ?',
            ['2025-2026']
        );
        const AY_ID = ayRows.length > 0 ? ayRows[0].AY_ID : null;

        const sql = `
            INSERT INTO enrollment_table
            (f_Name, m_Name, l_Name, gender, age, contact_Number, email, address,
             father_Name, father_Contact, mother_Name, mother_Contact,
             guardian_Name, guardian_Contact,
             birthdate, transferring_from, AY_ID,
             student_type, term, year_level, track, program
             )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            studentDetails.firstName,
            studentDetails.middleName,
            studentDetails.lastName,
            studentDetails.gender,
            studentDetails.age,
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
            AY_ID,
            studentType,
            programTerm.term,
            programTerm.year,
            programTerm.track,
            programTerm.program,
            
        ];

        const [result] = await pool.query(sql, values);

        res.status(201).json({
            message: 'Enrollment submitted successfully!',
            enrollmentId: result.insertId
        });

    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({
            message: 'Failed to save enrollment',
            error: error.message
        });
    }
};

module.exports = { createEnrollment };