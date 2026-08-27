const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

router.post('/login', login); //this pulls in the login function 
//calls authController during an API request

module.exports = router;
//Makes this router available to index.js.


/*
use this like
const { verifyToken, requireRole } = require('../middleware/auth');
router.get('/', verifyToken, requireRole('Student'), gradeController.getGrades);*/