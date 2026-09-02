const fs = require("fs");
const path = require("path");
const pool = require("../config/db"); // adjust to your actual mysql2 pool module
const {
  createCarouselSchema,
  updateCarouselSchema,
} = require("./carouselValidation");

// helper: remove an old uploaded image from disk (used on update/delete)
function deleteImageFile(imagePath) {
  if (!imagePath) return;
  const fullPath = path.join(__dirname, "..", imagePath);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("Failed to delete image file:", err);
    }
  });
}

// GET /api/carousel
async function getAllCarouselPages(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM carousel_table ORDER BY created_at ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch carousel pages" });
  }
}

// GET /api/carousel/:id
async function getCarouselPageById(req, res) {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query(
      "SELECT * FROM carousel_table WHERE carousel_ID = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Carousel page not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch carousel page" });
  }
}

// POST /api/carousel  (multipart/form-data, field name: "image")
async function createCarouselPage(req, res) {
  const parsed = createCarouselSchema.safeParse(req.body);
  if (!parsed.success) {
    if (req.file) deleteImageFile(`/uploads/carousel/${req.file.filename}`);
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { caoursel_title, caoursel_description } = parsed.data;
  const imagePath = req.file ? `/uploads/carousel/${req.file.filename}` : null;

  try {
    const [result] = await pool.query(
      `INSERT INTO carousel_table (caoursel_title, caoursel_description, carousel_image)
       VALUES (?, ?, ?)`,
      [caoursel_title, caoursel_description, imagePath]
    );

    const [rows] = await pool.query(
      "SELECT * FROM carousel_table WHERE carousel_ID = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    if (req.file) deleteImageFile(imagePath);
    res.status(500).json({ error: "Failed to create carousel page" });
  }
}

// PUT /api/carousel/:id  (multipart/form-data, field name: "image", optional)
async function updateCarouselPage(req, res) {
  const id = Number(req.params.id);
  const parsed = updateCarouselSchema.safeParse(req.body);
  if (!parsed.success) {
    if (req.file) deleteImageFile(`/uploads/carousel/${req.file.filename}`);
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const [existingRows] = await pool.query(
      "SELECT * FROM carousel_table WHERE carousel_ID = ?",
      [id]
    );
    if (existingRows.length === 0) {
      if (req.file) deleteImageFile(`/uploads/carousel/${req.file.filename}`);
      return res.status(404).json({ error: "Carousel page not found" });
    }
    const existing = existingRows[0];

    // build the SET clause dynamically from whatever fields were sent
    const fields = { ...parsed.data };
    if (req.file) {
      fields.carousel_image = `/uploads/carousel/${req.file.filename}`;
    }

    const setKeys = Object.keys(fields);
    if (setKeys.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const setClause = setKeys.map((key) => `${key} = ?`).join(", ");
    const values = setKeys.map((key) => fields[key]);

    await pool.query(
      `UPDATE carousel_table SET ${setClause} WHERE carousel_ID = ?`,
      [...values, id]
    );

    if (req.file) {
      deleteImageFile(existing.carousel_image); // clean up the old file
    }

    const [updatedRows] = await pool.query(
      "SELECT * FROM carousel_table WHERE carousel_ID = ?",
      [id]
    );
    res.json(updatedRows[0]);
  } catch (err) {
    console.error(err);
    if (req.file) deleteImageFile(`/uploads/carousel/${req.file.filename}`);
    res.status(500).json({ error: "Failed to update carousel page" });
  }
}

// DELETE /api/carousel/:id
async function deleteCarouselPage(req, res) {
  try {
    const id = Number(req.params.id);
    const [existingRows] = await pool.query(
      "SELECT * FROM carousel_table WHERE carousel_ID = ?",
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ error: "Carousel page not found" });
    }

    await pool.query("DELETE FROM carousel_table WHERE carousel_ID = ?", [id]);
    deleteImageFile(existingRows[0].carousel_image);
    res.json({ message: "Carousel page deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete carousel page" });
  }
}

module.exports = {
  getAllCarouselPages,
  getCarouselPageById,
  createCarouselPage,
  updateCarouselPage,
  deleteCarouselPage,
};