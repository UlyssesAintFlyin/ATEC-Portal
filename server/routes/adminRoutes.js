const express = require('express');
const router = express.Router();
const {
  loadAcademicYear,
  addAcademicYear,
  removeAcademicYears,
  loadEnrollees,
  loadValidatedEnrollees,
  setAY,
  setSemester,
  toggleEvaluation,
  toggleEnrollment,
  getSystemSettings,
  getCurrentAcademicYear,
  rejectEnrollees,
  getEnrolleeById,
  validateEnrollee,
  loadSections,
  createSection,
  deleteSections,
  loadStudentsBySection,
  convertEnrollees,
  getStudentById
} = require('../controllers/adminController');

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
router.get('/currentAcademicYear', getCurrentAcademicYear); //this pulls in the getCurrentAcademicYear function
router.post('/rejectEnrollees', rejectEnrollees); //this pulls in the rejectEnrollees function
router.get('/enrollees/:id', getEnrolleeById); //this pulls in the getEnrolleeById function
router.get('/enrollees/:id/validate', validateEnrollee); //this pulls in the validateEnrollee function
router.put('/enrollees/:id/validate', validateEnrollee); //this pulls in the validateEnrollee function
router.get('/sections/loadSections', loadSections); //this pulls in the loadSections function
router.post('/sections/addSection', createSection); //this pulls in the createSection function
router.delete('/sections/deleteSections', deleteSections); //this pulls in the deleteSections function 
router.get('/sections/:sectionId/students', loadStudentsBySection); //this pulls in the loadStudentsBySection function
router.post('/sections/convertEnrollees', convertEnrollees); //this pulls in the convertEnrollees function
router.get('/students/:id', getStudentById); //this pulls in the getStudentById function
//calls adminController during an API request   

module.exports = router;