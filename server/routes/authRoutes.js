const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { requestOtp, verifyOtpAndReset } = require('../controllers/authController');
router.post('/login', login); //this pulls in the login function
router.post('/forgot-password', requestOtp);
router.post('/verify-otp', verifyOtpAndReset);

module.exports = router;

//Makes this router available to index.js.


/*
use this like
const { verifyToken, requireRole } = require('../middleware/auth');
router.get('/', verifyToken, requireRole('Student'), gradeController.getGrades);*/