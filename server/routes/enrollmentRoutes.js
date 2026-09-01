const express = require('express');
const router = express.Router();
const { createEnrollment } = require('../controllers/enrollmentControllerK');

router.post('/', createEnrollment);

module.exports = router;