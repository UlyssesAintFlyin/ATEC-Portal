const express = require('express');
const router = express.Router();
const { getSystemSettings } = require('../controllers/systemSettingsController');
const { getBilling } = require('../controllers/adminController');

router.get('/', getSystemSettings);
router.get('/billing', getBilling);

module.exports = router;