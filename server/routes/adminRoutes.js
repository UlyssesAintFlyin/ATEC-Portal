const express = require('express');
const router = express.Router();
const { loadAcademicYear } = require('../controllers/adminController');  
const { addAcademicYear } = require('../controllers/adminController');
const { removeAcademicYears } = require('../controllers/adminController');

router.get('/loadAcademicYear', loadAcademicYear); //this pulls in the loadAcademicYear function
router.post('/addAcademicYear', addAcademicYear); //this pulls in the addAcademicYear function
router.delete('/removeAcademicYears', removeAcademicYears); //this pulls in the removeAcademicYears function
//calls adminController during an API request   

module.exports = router;