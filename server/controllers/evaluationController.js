const pool = require('../config/db');

const RATING_MAP = {
    'Strongly Disagree': 1,
    'Disagree': 2,
    'Neutral': 3,
    'Agree': 4,
    'Strongly Agree': 5
};

// GET /api/evaluation/faculty
// Returns faculty members, but only their evaluation_table row for the
// currently active AYS_ID (from system_settings_table.evaluation_AYS_ID)
const getFacultyList = async (req, res) => {
    try {
        const [settingsRows] = await pool.query(
            `SELECT evaluation_AYS_ID FROM system_settings_table WHERE system_settings_ID = 1`
        );

        const AYS_ID = settingsRows.length > 0 ? settingsRows[0].evaluation_AYS_ID : null;

        if (!AYS_ID) {
            return res.status(400).json({ message: 'Evaluation period is not currently configured.' });
        }

        const [rows] = await pool.query(
            `SELECT e.evaluation_ID, f.faculty_ID, f.f_Name, f.l_Name
             FROM evaluation_table e
             JOIN faculty_table f ON e.faculty_ID = f.faculty_ID
             WHERE e.AYS_ID = ?`,
            [AYS_ID]
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

module.exports = { getFacultyList, getQuestions, submitEvaluation };