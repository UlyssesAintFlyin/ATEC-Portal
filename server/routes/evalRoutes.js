const express = require('express');
const router = express.Router();
const {
    getFacultyList,
    getQuestions,
    submitEvaluation,
    getAllFacultySummaries,
    getFacultySummary
} = require('../controllers/evaluationController');

router.get('/faculty', getFacultyList);
router.get('/questions', getQuestions);
router.post('/submit', submitEvaluation);
router.get('/summary', getAllFacultySummaries);
router.get('/summary/:facultyId', getFacultySummary);

module.exports = router;