const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB cap
});
const { createEnrollment, getEnrollmentStatus, getEnrolleeTemplate, importEnrollees } = require('../controllers/enrollmentController');

router.get('/', createEnrollment);
router.post('/', createEnrollment);
router.get('/status/:code', getEnrollmentStatus);
router.get('/enrolleeTemplate', getEnrolleeTemplate);
router.post('/importEnrollees', upload.single('file'), importEnrollees);


module.exports = router;