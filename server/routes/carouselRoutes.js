const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = require("../middleware/uploadMiddleware");
const {
  getAllCarouselPages,
  getCarouselPageById,
  createCarouselPage,
  updateCarouselPage,
  deleteCarouselPage,
} = require("../controllers/carouselController");

const { verifyToken, requireRole } = require("../middleware/auth");

// Wraps upload.single("image") so Multer errors (file too large, wrong
// file type) return a clean 400 instead of crashing to a generic 500.
function handleImageUpload(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Image is too large. Max size is 10MB." });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      // e.g. the fileFilter's "Only JPEG, PNG, or WEBP images are allowed" error
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}

router.get("/", getAllCarouselPages);
router.get("/:id", getCarouselPageById);

router.post(
  "/",
  verifyToken,
  requireRole("Admin"),
  handleImageUpload,
  createCarouselPage
);
router.put(
  "/:id",
  verifyToken,
  requireRole("Admin"),
  handleImageUpload,
  updateCarouselPage
);
router.delete("/:id", verifyToken, requireRole("Admin"), deleteCarouselPage);

module.exports = router;