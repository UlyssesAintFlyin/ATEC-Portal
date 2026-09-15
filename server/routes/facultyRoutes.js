const express = require('express');
const router = express.Router();
const {
    getAllFaculties,
    getFacultyById,
    createFaculty,
    updateFaculty,
} = require('../controllers/facultyController');

router.get('/getAllFaculties', getAllFaculties);
router.get('/getFacultyById/:id', getFacultyById);
router.post('/createFaculty', createFaculty);
router.put('/updateFaculty/:id', updateFaculty);

module.exports = router;