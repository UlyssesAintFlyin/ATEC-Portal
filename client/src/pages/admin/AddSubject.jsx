import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material";
import { EditableTable } from "../../components/EditableTable";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function AddSubject() {
  const navigate = useNavigate();
  const { id } = useParams(); // curriculum_ID

  const [curriculumName, setCurriculumName] = useState("");
  const [rows, setRows] = useState([]);
  const [assignedIds, setAssignedIds] = useState([]); // subject_IDs already in this curriculum
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  // Add/Edit Subject Dialog State
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    subject_ID: null,
    subject_Name: "",
    subject_code: "",
    units: "",
  });

  const fetchAllSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/subjects`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      const mapped = data.map((s) => ({
        id: s.subject_ID,
        subject: s.subject_Name,
        subject_code: s.subject_code,
        units: s.units,
      }));
      setRows(mapped);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedSubjects = async () => {
    try {
      const res = await fetch(`${API_URL}/curricula/${id}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setCurriculumName(data.curriculum_Name);
      setAssignedIds(data.subjects.map((s) => s.subject_ID));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllSubjects();
    fetchAssignedSubjects();
  }, [id]);

  // Create or update a subject in the master list
  const handleSaveSubject = async () => {
    if (!subjectForm.subject_Name || !subjectForm.subject_code || subjectForm.units === "") {
      alert("Subject name, code, and units are all required");
      return;
    }
    try {
      const url = editMode
        ? `${API_URL}/subjects/${subjectForm.subject_ID}`
        : `${API_URL}/subjects`;
      const res = await fetch(url, {
        method: editMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject_Name: subjectForm.subject_Name,
          subject_code: subjectForm.subject_code,
          units: Number(subjectForm.units),
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      setOpen(false);
      setEditMode(false);
      setSubjectForm({ subject_ID: null, subject_Name: "", subject_code: "", units: "" });
      fetchAllSubjects();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${editMode ? "update" : "add"} subject`);
    }
  };

  const handleOpenEdit = () => {
    if (selectedIds.length !== 1) return;
    const row = rows.find((r) => r.id === selectedIds[0]);
    if (!row) return;
    setSubjectForm({
      subject_ID: row.id,
      subject_Name: row.subject,
      subject_code: row.subject_code,
      units: row.units,
    });
    setEditMode(true);
    setOpen(true);
  };

  // Delete subject(s) entirely from the master list
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm("Delete the selected subject(s) permanently? This removes them from every curriculum they're assigned to.")) {
      return;
    }
    try {
      await Promise.all(
        selectedIds.map((sid) =>
          fetch(`${API_URL}/subjects/${sid}`, { method: "DELETE" })
        )
      );
      setSelectedIds([]);
      fetchAllSubjects();
      fetchAssignedSubjects();
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected subjects");
    }
  };

  // Assign selected subjects to this curriculum (does not touch subject_table)
  const handleAssignSelected = async () => {
    const toAssign = selectedIds.filter((sid) => !assignedIds.includes(sid));
    if (toAssign.length === 0) {
      alert("Selected subject(s) are already assigned to this curriculum");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/curricula/${id}/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject_IDs: toAssign }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      setSelectedIds([]);
      fetchAssignedSubjects();
    } catch (err) {
      console.error(err);
      alert("Failed to assign subjects to curriculum");
    }
  };

  const columns = [
    { field: "subject", headerName: "Subjects", flex: 1 },
    { field: "subject_code", headerName: "Code", flex: 0.5 },
    { field: "units", headerName: "Units", flex: 0.3 },
    {
      field: "assigned",
      headerName: "Status",
      flex: 0.4,
      renderCell: (params) =>
        assignedIds.includes(params.row.id) ? (
          <Chip label="Assigned" color="success" size="small" />
        ) : (
          <Chip label="Not assigned" size="small" />
        ),
    },
  ];

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
          backgroundImage: "linear-gradient(180deg, #E8EDF2 30%, #55596d)",
          minHeight: "100vh",
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
                textAlign: { xs: "center", md: "left" },
                marginLeft: { xs: "20px", sm: "30px", md: "50px" },
              }}
            >
              Add Subjects{curriculumName ? ` — ${curriculumName}` : ""}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                textAlign: "left",
                marginLeft: { xs: "20px", sm: "30px", md: "50px" },
              }}
            >
              Manage subjects and assign them to this curriculum.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 2,
              marginTop: { xs: "10px", md: "0" },
              marginRight: { xs: "20px", sm: "30px", md: "50px" },
              marginLeft: { xs: "20px", sm: "30px", md: "50px" },
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                setEditMode(false);
                setSubjectForm({ subject_ID: null, subject_Name: "", subject_code: "", units: "" });
                setOpen(true);
              }}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#245442",
              }}
            >
              Add Subject
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenEdit}
              disabled={selectedIds.length !== 1}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#1c2e49",
              }}
            >
              Edit Selected
            </Button>
            <Button
              variant="contained"
              onClick={handleDeleteSelected}
              disabled={selectedIds.length === 0}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#54242b",
              }}
            >
              Delete Selected
            </Button>
            <Button
              variant="contained"
              onClick={handleAssignSelected}
              disabled={selectedIds.length === 0}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#544424",
              }}
            >
              Assign to Curriculum
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            marginLeft: { xs: "20px", md: "50px" },
            marginRight: { xs: "20px", md: "50px" },
            marginBottom: { xs: "20px", md: "50px" },
            height: { xs: "580px", md: "540px" },
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {error && (
            <Typography color="error" sx={{ marginBottom: "10px" }}>
              {error}
            </Typography>
          )}
          <EditableTable
            rows={rows}
            columns={columns}
            loading={loading}
            onSelectionModelChange={(newSelection) => setSelectedIds(newSelection)}
          />
        </Box>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>{editMode ? "Edit Subject" : "Add New Subject"}</DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: "320px",
            }}
          >
            <TextField
              margin="dense"
              label="Subject Name"
              fullWidth
              value={subjectForm.subject_Name}
              onChange={(e) =>
                setSubjectForm({ ...subjectForm, subject_Name: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Subject Code"
              fullWidth
              value={subjectForm.subject_code}
              onChange={(e) =>
                setSubjectForm({ ...subjectForm, subject_code: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Units"
              type="number"
              fullWidth
              value={subjectForm.units}
              onChange={(e) =>
                setSubjectForm({ ...subjectForm, units: e.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSubject} variant="contained">
              {editMode ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}