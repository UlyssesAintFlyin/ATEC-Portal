const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const gradeController = require('../controllers/gradeController');

router.get('/template', gradeController.getGradeTemplate);
router.post('/import', upload.single('file'), gradeController.importGrades);
router.get('/recordList', gradeController.getStudCurriculumRecord)
router.get('/studReport', gradeController.getStudentGradeReport)

module.exports = router;