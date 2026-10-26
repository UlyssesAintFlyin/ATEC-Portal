const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { login, requestOtp, verifyOtpAndReset, verifyMaster } = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/auth');

const verifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/login', login);
router.post('/forgot-password', requestOtp);
router.post('/verify-otp', verifyOtpAndReset);
router.post('/verify-master', verifyToken, requireRole('Admin'), verifyLimiter, verifyMaster);

module.exports = router;