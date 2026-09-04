const pool = require('../config/db');

const getSystemSettings = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                ss.enrollment_settings_value,
                enroll_ay.AY_Name         AS enrollment_AY_Name,
                enroll_sem.semester_name  AS enrollment_semester_name,

                ss.evaluation_settings_value,
                eval_ay.AY_Name           AS evaluation_AY_Name,
                eval_sem.semester_name    AS evaluation_semester_name

            FROM system_settings_table ss
            LEFT JOIN academic_year_semester_table enroll_ays ON ss.enrollment_AYS_ID = enroll_ays.AYS_ID
            LEFT JOIN academic_year_table enroll_ay ON enroll_ays.AY_ID = enroll_ay.AY_ID
            LEFT JOIN semester_table enroll_sem ON enroll_ays.semester_ID = enroll_sem.semester_ID

            LEFT JOIN academic_year_semester_table eval_ays ON ss.evaluation_AYS_ID = eval_ays.AYS_ID
            LEFT JOIN academic_year_table eval_ay ON eval_ays.AY_ID = eval_ay.AY_ID
            LEFT JOIN semester_table eval_sem ON eval_ays.semester_ID = eval_sem.semester_ID

            ORDER BY ss.system_settings_ID DESC
            LIMIT 1
        `);

        res.json(rows[0] || {
            enrollment_settings_value: false,
            evaluation_settings_value: false
        });

    } catch (error) {
        console.error('System settings fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch system settings', error: error.message });
    }
};

module.exports = { getSystemSettings };