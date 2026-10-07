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

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Helper function for formatting term selection labels
 * Normalizes year and semester inputs into "A.Y. [Year] — [Semester]" format
 */
export const formatTermOptionLabel = (term) => {
  if (!term) return "";
  if (typeof term === "string") return term;

  const year = term.AY_Name || term.academic_Year || term.year || "";
  const sem =
    term.semester_name ||
    term.semester ||
    term.semester_Name ||
    term.sem_Name ||
    term.term ||
    "";

  if (year && sem) {
    const formattedYear = year.startsWith("A.Y.") ? year : `A.Y. ${year}`;
    return `${formattedYear} — ${sem}`;
  }

  if (year) return year.startsWith("A.Y.") ? year : `A.Y. ${year}`;
  return sem;
};

export default function CurriculumConfig() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTerm, setSelectedTerm] = useState(null);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newCurriculum, setNewCurriculum] = useState({
    curriculum_ID: null,
    curriculum_Name: "",
    department: "",
    AYS_ID: null,
  });

  const [initialAYS_ID, setInitialAYS_ID] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignAYS_ID, setAssignAYS_ID] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [academicYearSemesters, setAcademicYearSemesters] = useState([]);

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
      const currentAysId = data.AYS_ID ?? data.AY_ID;
      setSelectedTerm({
        id: currentAysId,
        AYS_ID: currentAysId,
        label: formatTermOptionLabel(data),
      });
      setInitialAYS_ID(currentAysId);
    } catch (err) {
      console.error("Error fetching current academic year:", err);
      setSelectedTerm(null);
      setRows([]);
    }
  };

  const fetchAcademicYearSemesters = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/loadAcademicYearSemesters`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      setAcademicYearSemesters(
        data.map((t) => ({
          ...t,
          id: t.AYS_ID ?? t.id,
          AYS_ID: t.AYS_ID ?? t.id,
          label: formatTermOptionLabel(t),
        }))
      );
    } catch (err) {
      console.error("Error loading academic year semesters:", err);
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
        id: c.curriculum_record_ID,
        curriculum_ID: c.curriculum_ID,
        AYS_ID: c.AYS_ID,
        curriculum: c.curriculum_Name,
        department: c.department,
        term: formatTermOptionLabel(c),
      }));
      setRows(mapped);
      setError(null);
    } catch (err) {
      console.error("Error fetching curricula:", err);
      setError("Failed to load curricula");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurriculum = async () => {
    const targetAYS_ID = initialAYS_ID || newCurriculum.AYS_ID || selectedTerm?.id;

    if (!newCurriculum.curriculum_Name?.trim() || (!editMode && !targetAYS_ID)) {
      alert(
        editMode
          ? "Curriculum name is required"
          : "Curriculum name and term are required"
      );
      return;
    }
    try {
      const url = editMode
        ? `${API_URL}/curricula/${newCurriculum.curriculum_ID}`
        : `${API_URL}/curricula`;
      const body = editMode
        ? {
          curriculum_Name: newCurriculum.curriculum_Name.trim(),
          department: newCurriculum.department,
        }
        : {
          curriculum_Name: newCurriculum.curriculum_Name.trim(),
          department: newCurriculum.department,
          AYS_ID: targetAYS_ID,
        };

      const res = await fetch(url, {
        method: editMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Request failed with status ${res.status}`);
      }

      setOpen(false);
      setEditMode(false);
      setNewCurriculum({
        curriculum_ID: null,
        curriculum_Name: "",
        department: "",
        AYS_ID: null,
      });
      setInitialAYS_ID(selectedTerm?.id ?? null);
      if (selectedTerm) fetchCurricula(selectedTerm.id);
    } catch (err) {
      console.error(err);
      alert(err.message || `Failed to ${editMode ? "update" : "add"} curriculum`);
    }
  };

  const handleAssignToTerm = async () => {
    if (selectedIds.length !== 1) {
      alert("Please select exactly one curriculum row to migrate.");
      return;
    }

    if (!assignAYS_ID) {
      alert("Please select a target term / semester from the dropdown.");
      return;
    }

    const selectedRow = rows.find((r) => String(r.id) === String(selectedIds[0]));
    if (!selectedRow) {
      alert("Selected curriculum row could not be found.");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/curricula/${selectedRow.curriculum_ID}/terms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ AYS_ID: assignAYS_ID }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          alert(data.message || "This curriculum is already assigned to the selected term.");
          return;
        }
        throw new Error(data.message || `Request failed with status ${res.status}`);
      }

      alert("Curriculum successfully assigned to the new term!");
      setAssignOpen(false);
      setAssignAYS_ID(null);
      if (selectedTerm) fetchCurricula(selectedTerm.id);
    } catch (err) {
      console.error("Migration error:", err);
      alert(err.message || "Failed to assign curriculum to term");
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.length !== 1) return;
    const row = rows.find((r) => String(r.id) === String(selectedIds[0]));
    if (!row) return;

    try {
      const res = await fetch(
        `${API_URL}/curricula/${row.curriculum_ID}/terms/${row.AYS_ID}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Request failed: ${res.status}`);
      }

      setSelectedIds([]);
      if (selectedTerm) fetchCurricula(selectedTerm.id);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to unassign curriculum from term");
    }
  };

  useEffect(() => {
    fetchCurrentAY();
    fetchAcademicYearSemesters();
  }, []);

  useEffect(() => {
    if (selectedTerm) {
      fetchCurricula(selectedTerm.id);
      setInitialAYS_ID(selectedTerm.id);
    } else {
      setRows([]);
    }
  }, [selectedTerm]);

  const handleOpenEdit = () => {
    if (selectedIds.length !== 1) return;
    const row = rows.find((r) => String(r.id) === String(selectedIds[0]));
    if (!row) return;

    setNewCurriculum({
      curriculum_ID: row.curriculum_ID,
      curriculum_Name: row.curriculum,
      department: row.department,
      AYS_ID: row.AYS_ID,
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
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="inherit"
          onClick={() =>
            navigate(
              `/admin/systemSettings/curriculumConfig/curriculum/${params.row.curriculum_ID}`
            )
          }
          sx={{
            marginLeft: "10px",
            fontSize: { xs: "12px", sm: "15px", md: "15px" },
            width: { xs: "80px", sm: "120px", md: "100px" },
          }}
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
              Curriculum Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                marginLeft: { xs: 0, md: "50px" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Manage your curricula here.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
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
                const currentAysId = selectedTerm?.id ?? initialAYS_ID ?? null;
                setNewCurriculum({
                  curriculum_ID: null,
                  curriculum_Name: "",
                  department: "",
                  AYS_ID: currentAysId,
                });
                setInitialAYS_ID(currentAysId);
                setOpen(true);
              }}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                color: "#E8EDF2",
                backgroundColor: "#245442",
                maxHeight: "40px",
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
              onClick={() => {
                setAssignAYS_ID(null);
                setAssignOpen(true);
              }}
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

      {/* MIGRATE / ASSIGN TO TERM DIALOG */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)}>
        <DialogTitle>Migrate / Assign Curriculum to Term</DialogTitle>
        <DialogContent sx={{ minWidth: "320px", pt: 2 }}>
          <Autocomplete
            options={academicYearSemesters}
            getOptionLabel={(option) => formatTermOptionLabel(option)}
            value={
              academicYearSemesters.find(
                (t) => String(t.AYS_ID ?? t.id) === String(assignAYS_ID)
              ) || null
            }
            isOptionEqualToValue={(o, v) =>
              String(o.AYS_ID ?? o.id) === String(v?.AYS_ID ?? v?.id)
            }
            onChange={(e, value) =>
              setAssignAYS_ID(value?.AYS_ID ?? value?.id ?? null)
            }
            renderInput={(params) => (
              <TextField {...params} label="Target Term / Semester" size="small" />
            )}
            sx={{ width: 280, marginTop: "8px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignToTerm} variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD / EDIT CURRICULUM DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editMode ? "Edit Curriculum" : "Add New Curriculum"}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: 1,
          }}
        >
          <TextField
            margin="dense"
            label="Curriculum Name"
            fullWidth
            value={newCurriculum.curriculum_Name || ""}
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
              getOptionLabel={(option) => formatTermOptionLabel(option)}
              value={
                academicYearSemesters.find(
                  (t) =>
                    String(t.AYS_ID ?? t.id) ===
                    String(newCurriculum.AYS_ID || initialAYS_ID || selectedTerm?.id)
                ) || null
              }
              isOptionEqualToValue={(option, value) =>
                String(option.AYS_ID ?? option.id) === String(value?.AYS_ID ?? value?.id)
              }
              onChange={(e, value) => {
                const selectedId = value?.AYS_ID ?? value?.id ?? null;
                setInitialAYS_ID(selectedId);
                setNewCurriculum((prev) => ({
                  ...prev,
                  AYS_ID: selectedId,
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Term / Academic Year" fullWidth />
              )}
              fullWidth
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
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField {...params} label="Department" fullWidth />
            )}
            fullWidth
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