const express = require('express');
const router = express.Router();
const irregular = require('../controllers/irregularController');
 

router.get('/students', irregular.getIrregularStudents);                 
router.get('/:studentId/load', irregular.getStudentLoad);              
router.post('/:studentId/load', irregular.addStudentLoad);
router.put('/load/:id', irregular.updateLoadStatus);                    
router.put('/:studentId/classification', irregular.setIrregularClassification);
 
module.exports = router;