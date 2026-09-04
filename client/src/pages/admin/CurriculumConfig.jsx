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

const API_URL = "http://localhost:5000/api"; // adjust to your server's base URL

export default function CurriculumConfig() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [academicYears, setAcademicYears] = useState([]);

  const [selectedAY, setSelectedAY] = useState(null);

  const fetchCurrentAY = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/currentAcademicYear`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
        // No active AY or no curricula yet
        setSelectedAY(null);
        setRows([]); // explicitly clear the table
        return;
      }

      setSelectedAY({ id: data.AY_ID, AY_Name: data.AY_Name });
    } catch (err) {
      console.error(err);
      // optional: you can still decide whether to show all curricula or none
      setSelectedAY(null);
      setRows([]);
    }
  };

  // Adding Curriculum Dialog State
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newCurriculum, setNewCurriculum] = useState({
    curriculum_ID: null,
    curriculum_Name: "",
    AY_ID: null,
  });

  // Track selected rows from Table
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchCurricula = async (ayId) => {
    setLoading(true);
    try {
      const url = ayId
        ? `${API_URL}/curricula?AY_ID=${ayId}`
        : `${API_URL}/curricula`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      if (!data || data.length === 0) {
        setRows([]); // no curricula for this AY
        setError(null);
        return;
      }

      const mapped = data.map((c) => ({
        id: c.curriculum_ID,
        curriculum: c.curriculum_Name,
        AY_Name: c.AY_Name,
        AY_ID: c.AY_ID,
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

  const fetchAcademicYears = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/loadAcademicYear`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setAcademicYears(data); // [{ id, AY_Name }, ...]
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCurriculum = async () => {
    if (!newCurriculum.curriculum_Name || !newCurriculum.AY_ID) {
      alert("Curriculum name and academic year are required");
      return;
    }
    try {
      const url = editMode
        ? `${API_URL}/curricula/${newCurriculum.curriculum_ID}`
        : `${API_URL}/curricula`;
      const res = await fetch(url, {
        method: editMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curriculum_Name: newCurriculum.curriculum_Name,
          AY_ID: newCurriculum.AY_ID,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      setOpen(false);
      setEditMode(false);
      setNewCurriculum({
        curriculum_ID: null,
        curriculum_Name: "",
        AY_ID: null,
      });
      if (selectedAY) fetchCurricula(selectedAY.id);
    } catch (err) {
      console.error(err);
      alert(`Failed to ${editMode ? "update" : "add"} curriculum`);
    }
  };

  const handleRemoveSelected = async () => {
    if (selectedIds.length !== 1) return;
    const idToDelete = selectedIds[0];
    try {
      const res = await fetch(`${API_URL}/curricula/${idToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      setSelectedIds([]);
      // Refresh only the active AY
      if (selectedAY) {
        fetchCurricula(selectedAY.id);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete curriculum");
    }
  };

  useEffect(() => {
    fetchCurrentAY();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedAY) {
      fetchCurricula(selectedAY.id);
    } else {
      setRows([]); // no AY selected → no rows
    }
  }, [selectedAY]);

  const handleOpenEdit = () => {
    if (selectedIds.length !== 1) return;
    const row = rows.find((r) => r.id === selectedIds[0]);
    if (!row) return;
    setNewCurriculum({
      curriculum_ID: row.id,
      curriculum_Name: row.curriculum,
      AY_ID: row.AY_ID,
    });
    setEditMode(true);
    setOpen(true);
  };

  const columns = [
    { field: "curriculum", headerName: "Curriculum", flex: 0.6 },
    { field: "AY_Name", headerName: "Academic Year", flex: 0.4 },
    {
      field: "action",
      headerName: "Action",
      flex: 0.5,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="inherit"
          onClick={() =>
            navigate(
              `/admin/systemSettings/curriculumConfig/curriculum/${params.row.id}`,
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
                textAlign: { xs: "center", md: "left" },
                marginLeft: { xs: "0", md: "50px" },
              }}
            >
              Curriculum Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                textAlign: { xs: "center", md: "left" },
                marginLeft: { xs: "0", md: "50px" },
              }}
            >
              Manage your curricula here.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
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
                  AY_ID: selectedAY?.id ?? null,
                });
                setOpen(true);
              }}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
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
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#1c2e49",
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
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#54242b",
              }}
            >
              Remove Selected
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
          <Autocomplete
            options={academicYears}
            getOptionLabel={(option) => option.AY_Name || ""}
            value={
              academicYears.find((ay) => ay.id === newCurriculum.AY_ID) || null
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(e, value) =>
              setNewCurriculum((prev) => ({
                ...prev,
                AY_ID: value?.id ?? null,
              }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Academic Year" size="small" />
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
