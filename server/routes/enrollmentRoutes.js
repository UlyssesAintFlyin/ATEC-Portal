const express = require('express');
const router = express.Router();
const { createEnrollment, getEnrollmentStatus } = require('../controllers/enrollmentController');

router.get('/', createEnrollment);
router.post('/', createEnrollment);
router.get('/status/:code', getEnrollmentStatus);


module.exports = router;