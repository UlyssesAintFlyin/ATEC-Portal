const express = require('express');
const router = express.Router();
const curriculumController = require('../controllers/curriculumController');

router.get('/', curriculumController.getAllCurricula);
router.get('/:id', curriculumController.getCurriculumById);
router.post('/', curriculumController.createCurriculum);
router.put('/:id', curriculumController.updateCurriculum);
router.delete('/:id', curriculumController.deleteCurriculum);

router.post('/:id/subjects', curriculumController.addSubjectsToCurriculum);
router.delete('/:id/subjects/:subjectId', curriculumController.removeSubjectFromCurriculum);

module.exports = router;