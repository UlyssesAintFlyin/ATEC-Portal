const express = require('express');
const router = express.Router();
const { getFacultyList, getQuestions, submitEvaluation } = require('../controllers/evaluationController');

router.get('/faculty', getFacultyList);
router.get('/questions', getQuestions);
router.post('/submit', submitEvaluation);

module.exports = router;