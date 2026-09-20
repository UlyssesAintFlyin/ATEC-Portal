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
  Autocomplete,
} from "@mui/material";

import { EditableTable } from "../../components/EditableTable";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL; // adjust to your server's base URL

export default function CurriculumConfig() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [academicYears, setAcademicYears] = useState([]);

  const [selectedTerm, setSelectedTerm] = useState(null);

  const fetchCurrentAY = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/currentAcademicYear`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
        setSelectedTerm(null);
        setRows([]);
        return;
      }
      setSelectedTerm({
        id: data.AY_ID,
        label: `${data.AY_Name} — ${data.semester_name}`,
      });
    } catch (err) {
      console.error(err);
      setSelectedTerm(null);
      setRows([]);
    }
  };

  // Adding Curriculum Dialog State
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newCurriculum, setNewCurriculum] = useState({
    curriculum_ID: null,
    curriculum_Name: "",
    department: "",
  });

  const [initialAYS_ID, setInitialAYS_ID] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignAYS_ID, setAssignAYS_ID] = useState(null);

  // Track selected rows from Table
  const [selectedIds, setSelectedIds] = useState([]);

  const [academicYearSemesters, setAcademicYearSemesters] = useState([]);

  const fetchAcademicYearSemesters = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/loadAcademicYear`); // was currentAcademicYear
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setAcademicYearSemesters(
        data.map((t) => ({
          id: t.AYS_ID,
          label: `${t.AY_Name} — ${t.semester_name}`,
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };
  
  const fetchCurricula = async (aysId) => {
    setLoading(true);
    try {
      const url = aysId
        ? `${API_URL}/curricula?AYS_ID=${aysId}`
        : `${API_URL}/curricula`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      if (!data || data.length === 0) {
        setRows([]);
        setError(null);
        return;
      }

      const mapped = data.map((c) => ({
        id: c.curriculum_record_ID, // row identity = the term-assignment, not the curriculum
        curriculum_ID: c.curriculum_ID,
        AYS_ID: c.AYS_ID,
        curriculum: c.curriculum_Name,
        department: c.department,
        term: `${c.AY_Name} — ${c.semester_name}`,
      }));
      setRows(mapped);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load curricula");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurriculum = async () => {
    if (!newCurriculum.curriculum_Name || (!editMode && !initialAYS_ID)) {
      alert(
        editMode
          ? "Curriculum name is required"
          : "Curriculum name and term are required",
      );
      return;
    }
    try {
      const url = editMode
        ? `${API_URL}/curricula/${newCurriculum.curriculum_ID}`
        : `${API_URL}/curricula`;
      const body = editMode
        ? {
            curriculum_Name: newCurriculum.curriculum_Name,
            department: newCurriculum.department,
          }
        : {
            curriculum_Name: newCurriculum.curriculum_Name,
            department: newCurriculum.department,
            AYS_ID: initialAYS_ID,
          };

      const res = await fetch(url, {
        method: editMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      setOpen(false);
      setEditMode(false);
      setNewCurriculum({
        curriculum_ID: null,
        curriculum_Name: "",
        department: "",
      });
      setInitialAYS_ID(null);
      if (selectedTerm) fetchCurricula(selectedTerm.id);
    } catch (err) {
      console.error(err);
      alert(`Failed to ${editMode ? "update" : "add"} curriculum`);
    }
  };

  const handleAssignToTerm = async () => {
    if (selectedIds.length !== 1 || !assignAYS_ID) return;
    try {
      const res = await fetch(`${API_URL}/curricula/${selectedIds[0]}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ AYS_ID: assignAYS_ID }),
      });
      if (!res.ok) {
        if (res.status === 409) return alert("Already assigned to this term");
        throw new Error(`Request failed: ${res.status}`);
      }
      setAssignOpen(false);
      setAssignAYS_ID(null);
      if (selectedTerm) fetchCurricula(selectedTerm.id);
    } catch (err) {
      console.error(err);
      alert("Failed to assign curriculum to term");
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.length !== 1) return;
    const row = rows.find((r) => r.id === selectedIds[0]);
    if (!row) return;
    try {
      const res = await fetch(
        `${API_URL}/curricula/${row.curriculum_ID}/terms/${row.AYS_ID}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      setSelectedIds([]);
      if (selectedTerm) fetchCurricula(selectedTerm.id);
    } catch (err) {
      console.error(err);
      alert("Failed to unassign curriculum from term");
    }
  };

  useEffect(() => {
    fetchCurrentAY();
    fetchAcademicYearSemesters();
  }, []);

  useEffect(() => {
  if (selectedTerm) {
    fetchCurricula(selectedTerm.id);
  } else {
    setRows([]);
  }
}, [selectedTerm]);

  const handleOpenEdit = () => {
    if (selectedIds.length !== 1) return;
    const row = rows.find((r) => r.id === selectedIds[0]);
    if (!row) return;
    setNewCurriculum({
      curriculum_ID: row.curriculum_ID, // was row.id
      curriculum_Name: row.curriculum,
      department: row.department,
    });
    setEditMode(true);
    setOpen(true);
  };

  const columns = [
    { field: "curriculum", headerName: "Curriculum", flex: 0.6, minWidth: 180 },
    { field: "term", headerName: "Term", flex: 0.4, minWidth: 120 },
    { field: "department", headerName: "Department", flex: 0.6, minWidth: 120 },
    {
      field: "action",
      headerName: "Action",
      flex: 0.5, minWidth: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="inherit"
          onClick={() =>
            navigate(
              `/admin/systemSettings/curriculumConfig/curriculum/${params.row.curriculum_ID}`, // params.row.id
            )
          }
          sx={
            {
              /* unchanged */
            }
          }
        >
          Open
        </Button>
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
          backgroundColor: "#E8EDF2",
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
            alignItems: { xs: "center", md: "flex-start" },
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
              Curriculum Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                marginLeft: { xs: 0, md: "50px" },
              }}
            >
              Manage your curricula here.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: {xs:"center", md:"flex-end"},
              alignItems: "center",
              flexDirection: "row",
              flexWrap: "wrap",
              maxWidth: { xs: "300px", md: "500px" },
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
                setNewCurriculum({
                  curriculum_ID: null,
                  curriculum_Name: "",
                  department: "",
                });
                setInitialAYS_ID(selectedTerm?.id ?? null);
                setOpen(true);
              }}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                color: "#E8EDF2",
                backgroundColor: "#245442",
              }}
            >
              Add Curriculum
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenEdit}
              disabled={selectedIds.length !== 1}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                color: "#E8EDF2",
                backgroundColor: "#544424",
              }}
            >
              Edit Selected
            </Button>
            <Button
              variant="contained"
              onClick={handleRemoveSelected}
              disabled={selectedIds.length !== 1}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                color: "#E8EDF2",
                backgroundColor: "#54242b",
              }}
            >
              Remove Selected
            </Button>

            <Button
              variant="contained"
              onClick={() => setAssignOpen(true)}
              disabled={selectedIds.length !== 1}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                color: "#E8EDF2",
                backgroundColor: "#1c2e49",
              }}
            >
              Migrate
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
            onSelectionModelChange={(newSelection) =>
              setSelectedIds(newSelection)
            }
          />
        </Box>
      </Box>

      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)}>
        <DialogTitle>Assign Curriculum to Term</DialogTitle>
        <DialogContent sx={{ minWidth: "320px" }}>
          <Autocomplete
            options={academicYearSemesters} // [{ id: AYS_ID, label: "2025-2026 — 1st Semester" }, ...]
            getOptionLabel={(o) => o.label || ""}
            value={
              academicYearSemesters.find((t) => t.id === assignAYS_ID) || null
            }
            isOptionEqualToValue={(o, v) => o.id === v.id}
            onChange={(e, value) => setAssignAYS_ID(value?.id ?? null)}
            renderInput={(params) => (
              <TextField {...params} label="Term" size="small" />
            )}
            sx={{ width: 220, marginTop: "8px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignToTerm} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {editMode ? "Edit Curriculum" : "Add New Curriculum"}
        </DialogTitle>
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
            label="Curriculum Name"
            fullWidth
            value={newCurriculum.curriculum_Name}
            onChange={(e) =>
              setNewCurriculum({
                ...newCurriculum,
                curriculum_Name: e.target.value,
              })
            }
          />
          {!editMode && (
            <Autocomplete
              options={academicYearSemesters}
              getOptionLabel={(option) => option.label || ""}
              value={
                academicYearSemesters.find((t) => t.id === initialAYS_ID) ||
                null
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(e, value) => setInitialAYS_ID(value?.id ?? null)}
              renderInput={(params) => (
                <TextField {...params} label="Term" size="small" />
              )}
              sx={{
                width: 220,
                marginLeft: { xs: "0", md: "50px" },
                marginTop: "8px",
              }}
            />
          )}

          <Autocomplete
            options={["College", "Senior High School"]}
            value={newCurriculum.department || null}
            onChange={(e, value) =>
              setNewCurriculum((prev) => ({
                ...prev,
                department: value ?? "Not Assigned",
              }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Department" size="small" />
            )}
            sx={{
              width: 220,
              marginLeft: { xs: "0", md: "50px" },
              marginTop: "8px",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveCurriculum} variant="contained">
            {editMode ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
