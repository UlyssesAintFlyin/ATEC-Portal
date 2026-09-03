const express = require('express');
const router = express.Router();
const { loadAcademicYear } = require('../controllers/adminController');  
const { addAcademicYear } = require('../controllers/adminController');
const { removeAcademicYears } = require('../controllers/adminController');
const { loadEnrollees } = require('../controllers/adminController');
const { loadValidatedEnrollees } = require('../controllers/adminController');
const { setAY } = require('../controllers/adminController');
const { setSemester } = require('../controllers/adminController');
const { toggleEvaluation } = require('../controllers/adminController');
const { toggleEnrollment } = require('../controllers/adminController');
const { getSystemSettings } = require('../controllers/adminController');

router.get('/loadAcademicYear', loadAcademicYear); //this pulls in the loadAcademicYear function
router.post('/addAcademicYear', addAcademicYear); //this pulls in the addAcademicYear function
router.delete('/removeAcademicYears', removeAcademicYears); //this pulls in the removeAcademicYears function
router.get('/loadEnrollees', loadEnrollees); //this pulls in the loadEnrollees function
router.get('/loadValidatedEnrollees', loadValidatedEnrollees); //this pulls in the loadValidatedEnrollees function
router.put('/setAY', setAY); //this pulls in the setAY function
router.get('/setSemester', setSemester); //this pulls in the setSemester function
router.put('/setSemester', setSemester); //this pulls in the setSemester function
router.put('/toggleEvaluation', toggleEvaluation); //this pulls in the toggleEvaluation function
router.put('/toggleEnrollment', toggleEnrollment); //this pulls in the toggleEnrollment function
router.get('/systemSettings', getSystemSettings); //this pulls in the getSystemSettings function
//calls adminController during an API request   

module.exports = router;