const express = require('express');
const router = express.Router();
const { getSystemSettings } = require('../controllers/systemSettingsController');

router.get('/', getSystemSettings);

module.exports = router;