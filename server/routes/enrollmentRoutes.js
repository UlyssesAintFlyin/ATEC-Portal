const express = require('express');
const router = express.Router();
const { createEnrollment, getEnrollmentStatus } = require('../controllers/enrollmentController');

router.post('/', createEnrollment);
router.get('/status/:code', getEnrollmentStatus);

module.exports = router;