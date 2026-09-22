const pool = require('../config/db');

const RATING_MAP = {
    'Strongly Disagree': 1,
    'Disagree': 2,
    'Neutral': 3,
    'Agree': 4,
    'Strongly Agree': 5
};

// GET /api/evaluation/faculty/:studentId
// Returns only the professors actually teaching this student's section
// for the currently active evaluation AYS_ID
const getFacultyList = async (req, res) => {
    try {
        const { studentId } = req.params;

        const [settingsRows] = await pool.query(
            `SELECT evaluation_AYS_ID FROM system_settings_table WHERE system_settings_ID = 1`
        );
        const AYS_ID = settingsRows.length > 0 ? settingsRows[0].evaluation_AYS_ID : null;

        if (!AYS_ID) {
            return res.status(400).json({ message: 'Evaluation period is not currently configured.' });
        }

        const [rows] = await pool.query(
            `SELECT f.faculty_ID, f.f_Name, f.l_Name, e.evaluation_ID,
                GROUP_CONCAT(DISTINCT s.subject_Name SEPARATOR ', ') AS subjects
             FROM student_year_record_table syr
             JOIN section_year_record_table sec ON syr.section_record_ID = sec.section_record_ID
             JOIN faculty_year_record_table fyr ON fyr.section_record_ID = sec.section_record_ID
             JOIN faculty_table f ON fyr.faculty_ID = f.faculty_ID
             LEFT JOIN subject_table s ON fyr.subject_ID = s.subject_ID
             JOIN evaluation_table e ON e.faculty_ID = f.faculty_ID AND e.AYS_ID = sec.AYS_ID
             WHERE syr.student_ID = ? AND sec.AYS_ID = ?
             GROUP BY f.faculty_ID, f.f_Name, f.l_Name, e.evaluation_ID`,
            [studentId, AYS_ID]
        );

        res.json({ faculty: rows });
    } catch (error) {
        console.error('Get faculty error:', error);
        res.status(500).json({
            message: 'Failed to load faculty list',
            error: error.message
        });
    }
};

const getQuestions = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM evaluation_category_table');
        const [questions] = await pool.query('SELECT * FROM question_table');

        const result = categories.map(cat => ({
            category_ID: cat.category_ID,
            category_Name: cat.category_Name,
            questions: questions.filter(q => q.category_ID === cat.category_ID)
        }));

        res.json({ sections: result });
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ message: 'Failed to load questions', error: error.message });
    }
};

const submitEvaluation = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { evaluationId, studentId, answers } = req.body;

        if (!evaluationId || !studentId || !answers || Object.keys(answers).length === 0) {
            connection.release();
            return res.status(400).json({ message: 'Missing evaluation data.' });
        }

        const [existing] = await connection.query(
            'SELECT answer_ID FROM eval_answer_table WHERE evaluation_ID = ? AND student_ID = ? LIMIT 1',
            [evaluationId, studentId]
        );

        if (existing.length > 0) {
            connection.release();
            return res.status(409).json({ message: 'You have already evaluated this faculty member.' });
        }

        await connection.beginTransaction();

        for (const [questionId, choiceText] of Object.entries(answers)) {
            const ratingValue = RATING_MAP[choiceText];
            if (!ratingValue) continue;

            await connection.query(
                'INSERT INTO eval_answer_table (question_ID, evaluation_ID, student_ID, rating_value) VALUES (?, ?, ?, ?)',
                [questionId, evaluationId, studentId, ratingValue]
            );
        }

        const [questionRows] = await connection.query('SELECT question_ID, category_ID FROM question_table');
        const categoryMap = {};
        questionRows.forEach(q => {
            categoryMap[q.question_ID] = q.category_ID;
        });

        const categoryTotals = {};
        for (const [questionId, choiceText] of Object.entries(answers)) {
            const ratingValue = RATING_MAP[choiceText];
            const categoryId = categoryMap[questionId];
            if (!ratingValue || !categoryId) continue;

            if (!categoryTotals[categoryId]) {
                categoryTotals[categoryId] = { sum: 0, count: 0 };
            }
            categoryTotals[categoryId].sum += ratingValue;
            categoryTotals[categoryId].count += 1;
        }

        for (const [categoryId, { sum, count }] of Object.entries(categoryTotals)) {
            const mean = sum / count;
            await connection.query(
                'INSERT INTO student_evaluation_table (category_Mean, category_ID, evaluation_ID, student_ID) VALUES (?, ?, ?, ?)',
                [mean, categoryId, evaluationId, studentId]
            );
        }

        await connection.commit();
        connection.release();

        res.status(201).json({ message: 'Evaluation submitted successfully!' });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error('Submit evaluation error:', error);
        res.status(500).json({ message: 'Failed to submit evaluation', error: error.message });
    }
};

const getAllFacultySummaries = async (req, res) => {
    try {
        const [settingsRows] = await pool.query(
            'SELECT evaluation_AYS_ID FROM system_settings_table WHERE system_settings_ID = 1'
        );
        const AYS_ID = settingsRows.length > 0 ? settingsRows[0].evaluation_AYS_ID : null;

        if (!AYS_ID) {
            return res.status(400).json({ message: 'Evaluation period is not currently configured.' });
        }

        const [rows] = await pool.query(
            `SELECT f.faculty_ID, f.f_Name, f.l_Name, f.position,
                    AVG(se.category_Mean) AS overallScore
             FROM faculty_table f
             JOIN evaluation_table e ON e.faculty_ID = f.faculty_ID AND e.AYS_ID = ?
             LEFT JOIN student_evaluation_table se ON se.evaluation_ID = e.evaluation_ID
             GROUP BY f.faculty_ID, f.f_Name, f.l_Name, f.position`,
            [AYS_ID]
        );

        const faculty = rows.map(row => ({
            faculty_ID: row.faculty_ID,
            f_Name: row.f_Name,
            l_Name: row.l_Name,
            position: row.position,
            overallScore: row.overallScore ? Number(row.overallScore.toFixed(2)) : 0
        }));

        res.json({ faculty });

    } catch (error) {
        console.error('Get all faculty summaries error:', error);
        res.status(500).json({ message: 'Failed to load faculty summaries', error: error.message });
    }
};



const getFacultySummary = async (req, res) => {
    try {
        const { facultyId } = req.params;

        const [facultyRows] = await pool.query(
            'SELECT faculty_ID, f_Name, l_Name, position FROM faculty_table WHERE faculty_ID = ?',
            [facultyId]
        );

        if (facultyRows.length === 0) {
            return res.status(404).json({ message: 'Faculty not found.' });
        }

        const [settingsRows] = await pool.query(
            'SELECT evaluation_AYS_ID FROM system_settings_table WHERE system_settings_ID = 1'
        );
        const AYS_ID = settingsRows.length > 0 ? settingsRows[0].evaluation_AYS_ID : null;

        const [categoryRows] = await pool.query(
            `SELECT cat.category_ID, cat.category_Name, AVG(se.category_Mean) AS avgScore
             FROM student_evaluation_table se
             JOIN evaluation_category_table cat ON se.category_ID = cat.category_ID
             JOIN evaluation_table e ON se.evaluation_ID = e.evaluation_ID
             WHERE e.faculty_ID = ? AND e.AYS_ID = ?
             GROUP BY cat.category_ID, cat.category_Name`,
            [facultyId, AYS_ID]
        );

        const categories = categoryRows.map(row => ({
            category_ID: row.category_ID,
            category_Name: row.category_Name,
            avgScore: row.avgScore ? Number(row.avgScore.toFixed(2)) : 0
        }));

        const overall = categories.length > 0
            ? Number((categories.reduce((sum, c) => sum + c.avgScore, 0) / categories.length).toFixed(2))
            : 0;

        res.json({
            faculty: facultyRows[0],
            overall,
            categories
        });

    } catch (error) {
        console.error('Get faculty summary error:', error);
        res.status(500).json({ message: 'Failed to load evaluation summary', error: error.message });
    }
};

module.exports = { getFacultyList, getQuestions, submitEvaluation, getAllFacultySummaries, getFacultySummary };