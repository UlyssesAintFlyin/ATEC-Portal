import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const API_URL = process.env.REACT_APP_API_URL;
const STATIC_URL = API_URL.replace(/\/api\/?$/, "");

function makeEmptyPage() {
  return {
    localKey: `new-${Date.now()}-${Math.random()}`,
    carousel_ID: null,
    title: "",
    description: "",
    imageFile: null,
    existingImagePath: null,
  };
}

function CarouselConfig() {
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageErrors, setPageErrors] = useState({}); // { localKey: "message" }

  // Snackbar replaces the old full-width global Alert so messages no longer
  // push the layout around when they appear/disappear.
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = (severity, message) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = (_event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const [deleteTarget, setDeleteTarget] = useState(null); // page object pending deletion
  const [deleting, setDeleting] = useState(false);

  // Load existing carousel pages on mount
  useEffect(() => {
    async function fetchPages() {
      try {
        const res = await fetch(`${API_URL}/carousel`);
        if (!res.ok) throw new Error("Failed to load carousel pages");
        const data = await res.json();

        setPages(
          data.map((row) => ({
            localKey: `db-${row.carousel_ID}`,
            carousel_ID: row.carousel_ID,
            title: row.carousel_title,
            description: row.carousel_description,
            imageFile: null,
            existingImagePath: row.carousel_image,
          })),
        );
      } catch (err) {
        console.error(err);
        showMessage("error", "Could not load existing carousel pages.");
      } finally {
        setLoadingPages(false);
      }
    }
    fetchPages();
  }, []);

  const updatePage = (localKey, field, value) => {
    setPages((prev) =>
      prev.map((p) => (p.localKey === localKey ? { ...p, [field]: value } : p)),
    );
  };

  const handleAddPage = () => {
    setPages((prev) => [...prev, makeEmptyPage()]);
  };

  const handleImageChange = (localKey, e) => {
    const file = e.target.files[0];
    if (file) updatePage(localKey, "imageFile", file);
  };

  const requestDelete = (page) => {
    setDeleteTarget(page);
  };

  const cancelDelete = () => {
    if (deleting) return; // don't allow closing mid-request
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    // Not yet saved to the DB — just remove it locally, no API call needed
    if (!deleteTarget.carousel_ID) {
      setPages((prev) =>
        prev.filter((p) => p.localKey !== deleteTarget.localKey),
      );
      setDeleteTarget(null);
      return;
    }

    const token = localStorage.getItem("token");
    setDeleting(true);
    try {
      const res = await fetch(
        `${API_URL}/carousel/${deleteTarget.carousel_ID}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete carousel page");
      }
      setPages((prev) =>
        prev.filter((p) => p.localKey !== deleteTarget.localKey),
      );
      setDeleteTarget(null);
      showMessage("success", "Carousel page deleted.");
    } catch (err) {
      console.error(err);
      showMessage("error", err.message || "Failed to delete carousel page.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveAll = async () => {
    setPageErrors({});

    const token = localStorage.getItem("token");
    if (!token) {
      showMessage(
        "error",
        "You must be logged in as an admin to save changes.",
      );
      return;
    }

    // basic validation pass first, so we don't fire requests for obviously bad entries
    const errors = {};
    pages.forEach((p) => {
      if (!p.title.trim() || !p.description.trim()) {
        errors[p.localKey] = "Title and description are required.";
      }
    });
    if (Object.keys(errors).length > 0) {
      setPageErrors(errors);
      showMessage("error", "Fix the highlighted pages before saving.");
      return;
    }

    setSaving(true);

    const results = await Promise.allSettled(
      pages.map(async (page) => {
        const formData = new FormData();
        formData.append("caoursel_title", page.title);
        formData.append("caoursel_description", page.description);
        if (page.imageFile) formData.append("image", page.imageFile);

        const isUpdate = Boolean(page.carousel_ID);
        const url = isUpdate
          ? `${API_URL}/carousel/${page.carousel_ID}`
          : `${API_URL}/carousel`;

        const res = await fetch(url, {
          method: isUpdate ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.message || data.error?.formErrors?.join(", ") || "Save failed",
          );
        }
        return { localKey: page.localKey, saved: data };
      }),
    );

    // reconcile local state with what actually got saved
    const newErrors = {};
    let successCount = 0;

    setPages((prev) =>
      prev.map((page, i) => {
        const result = results[i];
        if (result.status === "fulfilled") {
          successCount += 1;
          const { saved } = result.value;
          return {
            ...page,
            carousel_ID: saved.carousel_ID,
            existingImagePath: saved.carousel_image,
            imageFile: null,
          };
        } else {
          newErrors[page.localKey] = result.reason?.message || "Save failed";
          return page;
        }
      }),
    );

    setPageErrors(newErrors);
    setSaving(false);

    if (Object.keys(newErrors).length === 0) {
      showMessage("success", `All ${successCount} page(s) saved successfully.`);
    } else {
      showMessage(
        "error",
        `${successCount} page(s) saved, ${Object.keys(newErrors).length} failed. See details below.`,
      );
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#BAC5D1",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#E8EDF2",
          minHeight: "100vh",
          width: { xs: "100%", sm: "600px", md: "1200px" },
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingBottom: "40px",
        }}
      >
        <Typography
          sx={{
            color: "#242c54",
            fontWeight: "bold",
            fontSize: { xs: "22px", md: "35px" },
            textAlign: "center",
            marginTop: { xs: "10px", sm: "12px", md: "15px" },
          }}
        >
          Carousel Configuration
        </Typography>
        <Box sx={{ maxWidth: { xs: "300px", md: "500px" } }}>
          <Typography
            variant="body1"
            sx={{
              color: "#242c54",
              fontSize: { xs: "12px", md: "15px" },
              textAlign: "center",
            }}
          >
            Customize your website carousel by adding and removing pages to the
            component
          </Typography>
        </Box>

        {loadingPages ? (
          <Box sx={{ mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          pages.map((page) => (
            <Box
              key={page.localKey}
              className="carousel-config-container"
              sx={{
                minWidth: "90%",
                backgroundColor: "#515880",
                border: "5px solid #242C54",
                borderRadius: "5px",
                marginTop: { xs: "10px", sm: "12px", md: "15px" },
                display: "flex",
                flexDirection: { xs: "column", sm: "column", md: "row" },
                alignItems: { xs: "center", md: "flex-start" },
                padding: "10px 0",
              }}
            >
              <Box
                sx={{
                  width: { xs: "90%", md: "50%" },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  gap: 3,
                  alignItems: "center",
                  marginTop: { xs: 3, md: "6px" },
                }}
              >
                <Box sx={{ width: "90%" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#E8EDF2",
                      marginBottom: { xs: "5px", md: "10px" },
                      fontSize: { xs: "18px", md: "25px" },
                    }}
                  >
                    Carousel Page Title
                  </Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    sx={{ backgroundColor: "#E8EDF2" }}
                    placeholder="Enter the title of the carousel page"
                    value={page.title}
                    onChange={(e) =>
                      updatePage(page.localKey, "title", e.target.value)
                    }
                  />
                </Box>
                <Box sx={{ width: "90%" }}>
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 4 }}>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#E8EDF2",
                          marginBottom: { xs: "5px", md: "10px" },
                          fontSize: { xs: "18px", md: "25px" },
                        }}
                      >
                        Carousel Photo
                      </Typography>
                      <Button
                        variant="contained"
                        component="label"
                        sx={{ backgroundColor: "#E8EDF2", color: "#242C54" }}
                      >
                        {page.imageFile
                          ? page.imageFile.name
                          : page.existingImagePath
                            ? "Change Image"
                            : "Upload Image"}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => handleImageChange(page.localKey, e)}
                        />
                      </Button>
                      {(page.existingImagePath || page.imageFile) && (
                        <Box
                          component="img"
                          src={
                            page.imageFile
                              ? URL.createObjectURL(page.imageFile)
                              : `${STATIC_URL}${page.existingImagePath}`
                          }
                          alt="Preview"
                          sx={{
                            display: "block",
                            width: "150px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            marginTop: "8px",
                          }}
                        />
                      )}
                    </Box>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "#E8EDF2",
                          marginBottom: { xs: "5px", md: "10px" },
                          fontSize: { xs: "18px", md: "25px" },
                        }}
                      >
                        Delete Page
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: "#542424", color: "#E8EDF2" }}
                        onClick={() => requestDelete(page)}
                      >
                        Remove Page
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  width: { xs: "90%", md: "50%" },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  gap: 3,
                  alignItems: "center",
                  marginTop: { xs: "25px", md: "6px" },
                }}
              >
                <Box sx={{ width: "90%" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#E8EDF2",
                      marginBottom: { xs: "5px", md: "10px" },
                      fontSize: { xs: "18px", md: "25px" },
                    }}
                  >
                    Carousel Description
                  </Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={7}
                    sx={{ backgroundColor: "#E8EDF2" }}
                    placeholder="Enter the description of the carousel page"
                    value={page.description}
                    onChange={(e) =>
                      updatePage(page.localKey, "description", e.target.value)
                    }
                  />
                </Box>
              </Box>

              {pageErrors[page.localKey] && (
                <Box sx={{ width: "90%", pb: 1 }}>
                  <Alert severity="error" sx={{ py: 0 }}>
                    {pageErrors[page.localKey]}
                  </Alert>
                </Box>
              )}
            </Box>
          ))
        )}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPage}
          sx={{
            marginTop: "20px",
            color: "#E8EDF2",
            backgroundColor: "#242C54",
            borderRadius: "5px",
            "&:hover": {
              backgroundColor: "#515880",
              transform: "scale(1.05)",
            },
          }}
        >
          Add New Page
        </Button>

        <Button
          variant="contained"
          disabled={saving || pages.length === 0}
          onClick={handleSaveAll}
          sx={{
            marginTop: "15px",
            color: "#E8EDF2",
            backgroundColor: "#2E7D32",
            borderRadius: "5px",
            "&:hover": { backgroundColor: "#4C9A52" },
          }}
        >
          {saving ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={cancelDelete}>
        <DialogTitle>Delete this carousel page?</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteTarget?.carousel_ID
              ? "This will permanently remove the page and its record from the database. This can't be undone."
              : "This page hasn't been saved yet — it'll just be removed from the form."}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CarouselConfig;
