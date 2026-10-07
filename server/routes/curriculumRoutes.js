const express = require('express');
const router = express.Router();
const curriculumController = require('../controllers/curriculumController');

router.get('/', curriculumController.getAllCurricula);
router.get('/:id', curriculumController.getCurriculumById);
router.post('/', curriculumController.createCurriculum);
router.put('/:id', curriculumController.updateCurriculum);

router.post('/:id/terms', curriculumController.assignCurriculumToTerm);
router.delete('/:id/terms/:aysId', curriculumController.removeCurriculumFromTerm);

router.post('/:id/subjects', curriculumController.addSubjectsToCurriculum);
router.delete('/:id/subjects/:subjectId', curriculumController.removeSubjectFromCurriculum);

module.exports = router;