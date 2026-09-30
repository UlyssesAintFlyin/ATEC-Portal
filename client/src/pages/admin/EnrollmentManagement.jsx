import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Table } from "../../components/Table";
import { Link, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function EnrollmentManagement() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAY, setSelectedAY] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });
  const [importErrors, setImportErrors] = useState([]);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const handleGetTemplate = async () => {
    try {
      const res = await fetch(`${API_URL}/enrollment/enrolleeTemplate`);
      if (!res.ok) throw new Error("Failed to download template");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "enrollee_template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setSnackbar({ open: true, severity: "error", message: err.message });
    }
  };

  const handleImportClick = () => {
    if (!selectedAY) return;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("ayId", selectedAY.id);

      const res = await fetch(`${API_URL}/enrollment/importEnrollees`, {
        method: "POST",
        body: formData,
      });
      const body = await res.json();

      if (res.status === 422 && Array.isArray(body.errors)) {
        setImportErrors(body.errors);
        setErrorDialogOpen(true);
        return;
      }
      if (!res.ok) throw new Error(body.message || "Import failed");

      setSnackbar({ open: true, severity: "success", message: body.message });
      fetchEnrollees(selectedAY.id); // refresh the table
    } catch (err) {
      setSnackbar({ open: true, severity: "error", message: err.message });
    } finally {
      setImporting(false);
    }
  };

  const fetchCurrentAY = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/currentAcademicYear`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
        setSelectedAY(null);
        setRows([]);
        return;
      }

      setSelectedAY({ id: data.AY_ID, AY_Name: data.AY_Name });
    } catch (err) {
      console.error(err);
      setSelectedAY(null);
      setRows([]);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/loadAcademicYear`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setAcademicYears(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEnrollees = async (ayId) => {
    setLoading(true);
    try {
      const url = ayId
        ? `${API_URL}/admin/loadEnrollees?ayId=${ayId}`
        : `${API_URL}/admin/loadEnrollees`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setRows(data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load enrollees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAY();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedAY) {
      fetchEnrollees(selectedAY.id);
    } else {
      setRows([]);
    }
    setSelectedIds([]); // clear stale selection when AY changes
  }, [selectedAY]);

  const columns = [
    { field: "enrollee", headerName: "Enrollee Name", flex: 1, minWidth: 150 },
    { field: "status", headerName: "Status", flex: 1, minWidth: 100 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="inherit"
          onClick={() =>
            navigate(`/admin/enrollmentList/enrollmentRecord/${params.row.id}`)
          }
          sx={{
            fontSize: { xs: "12px", sm: "15px", md: "15px" },
            width: { xs: "80px", sm: "120px", md: "100px" },
          }}
        >
          View Record
        </Button>
      ),
    },
  ];

  const handleRejectSelected = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/rejectEnrollees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) throw new Error("Failed to reject enrollees");

      setRows((prevRows) =>
        prevRows.filter((r) => !selectedIds.includes(r.id)),
      );
      setSelectedIds([]);
    } catch (err) {
      console.error("Error rejecting enrollees:", err);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#BAC5D1",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <Box
        sx={{
          backgroundColor: "#E8EDF2",
          height: "100%",
          width: { xs: "100%", sm: "600px", md: "1200px" },
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", md: "flex-end" },
            width: "100%",
            marginTop: "20px",
            marginBottom: "30px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
            }}
          >
            <Typography
              sx={{
                color: "#242c54",
                fontWeight: "bold",
                fontSize: { xs: "16px", md: "35px" },
                marginLeft: { xs: 0, md: "50px" },
              }}
            >
              Enrollment Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                marginLeft: { xs: 0, md: "50px" },
              }}
            >
              Here is a list of all enrollment records.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
              alignItems: "center",
              flexDirection: "row",
              flexWrap: "wrap",
              maxWidth: { xs: "300px", md: "700px" },
              gap: 2,
              marginTop: { xs: "10px", md: "0" },
              marginRight: { xs: "20px", sm: "30px", md: "50px" },
              marginLeft: { xs: "20px", sm: "30px", md: "50px" },
            }}
          >
            <Button
              variant="contained"
              disabled={!selectedAY || importing}
              onClick={handleImportClick}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#242C54",
              }}
            >
              {importing ? (
                <CircularProgress size={20} sx={{ color: "#E8EDF2" }} />
              ) : (
                "Import Enrollees"
              )}
            </Button>
            <input
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileSelected}
            />

            <Button
              variant="contained"
              onClick={handleGetTemplate}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#482454",
              }}
            >
              Get Template
            </Button>
            <Button
              sx={{
                fontSize: { xs: "12px", sm: "15px", md: "17px" },
                color: "#E8EDF2",
                backgroundColor: "#791818",
                borderRadius: "5px",
                "&:hover": {
                  backgroundColor: "#bc4949",
                  transform: "scale(1.05)",
                },
              }}
              onClick={handleRejectSelected}
            >
              Reject Selected
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            marginLeft: { xs: "20px", md: "50px" },
            marginRight: { xs: "20px", md: "50px" },
            height: { xs: "600px", md: "540px" },
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/*Table Component*/}
          <Table
            rows={rows}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            onSelectionModelChange={(newSelection) => {
              setSelectedIds(newSelection);
            }}
            selectionModel={selectedIds}
          />
        </Box>
      </Box>

      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Import Failed — Fix These Rows</DialogTitle>
        <DialogContent>
          {importErrors.map((msg, i) => (
            <Typography key={i} variant="body2" sx={{ mb: 1 }}>
              {msg}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
