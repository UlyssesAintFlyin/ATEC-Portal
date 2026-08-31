const express = require("express");
const router = express.Router();
const { loadEnrollee } = require("../controllers/enrollmentController");

// Example: GET /api/enrollees
router.get("/enrollees", loadEnrollee);

module.exports = router;