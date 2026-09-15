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
import { Table } from "../../components/Table";
import { Link, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function Sections() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [newSection, setNewSection] = useState({
    gradeLevel: null,
    sectionName: "",
    department: null,
  });

  const [selectedIds, setSelectedIds] = useState([]);

  // Confirmation dialog for deleting the selected sections
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [currentAYS_ID, setCurrentAYS_ID] = useState(null);

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/systemSettings`);
        const data = await res.json();
        setCurrentAYS_ID(data.enrollment_AYS_ID);
      } catch (err) {
        console.error("Error loading system settings:", err);
      }
    };
    fetchSystemSettings();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetch(
          `${API_URL}/admin/sections/loadSections?AYS_ID=${currentAYS_ID}`,
        );
        const data = await res.json();
        setRows(data);
      } catch (err) {
        console.error("Error loading sections:", err);
      }
    };
    if (currentAYS_ID) fetchSections();
  }, [currentAYS_ID]);

  const handleAdd = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/sections/addSection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSection),
      });
      const created = await res.json();
      setRows([...rows, created]); // append new section
      setOpen(false);
      setNewSection({ gradeLevel: "", sectionName: "", department: "" });
    } catch (err) {
      console.error("Error creating section:", err);
    }
  };

  const requestRemoveSelected = () => {
    if (selectedIds.length === 0) return;
    setConfirmDeleteOpen(true);
  };

  const cancelRemoveSelected = () => {
    if (deleting) return; // don't allow closing mid-request
    setConfirmDeleteOpen(false);
  };

  const confirmRemoveSelected = async () => {
    setDeleting(true);
    try {
      await fetch(`${API_URL}/admin/sections/deleteSections`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      setRows(rows.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      setConfirmDeleteOpen(false);
    } catch (err) {
      console.error("Error deleting sections:", err);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { field: "department", headerName: "Department", flex: 1, minWidth: 120 },
    {
      field: "gradeLevel",
      headerName: "Grade Level",
      flex: 0.5,
      minWidth: 100,
    },
    {
      field: "sectionName",
      headerName: "Section Name",
      flex: 1,
      minWidth: 120,
    },
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
            navigate(`/admin/sections/${params.row.sectionName}`, {
              state: {
                gradeLevel: params.row.gradeLevel,
                section_ID: params.row.id,
              },
            })
          }
          sx={{
            marginLeft: "10px",
            fontSize: { xs: "12px", sm: "15px", md: "15px" },
            width: { xs: "80px", sm: "120px", md: "100px" },
          }}
        >
          View
        </Button>
      ),
    },
  ];

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
              Sections Masterlist
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                marginLeft: { xs: 0, md: "50px" },
              }}
            >
              Manage the list of sections.
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
              color="primary"
              onClick={() => setOpen(true)}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#245442",
              }}
            >
              Add Section
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={requestRemoveSelected}
              disabled={selectedIds.length === 0}
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
            height: { xs: "600px", md: "500px" },
            minWidth: 0,
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
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Section</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={["Senior High School", "College"]}
            value={newSection.department}
            onChange={(event, newValue) =>
              setNewSection({
                ...newSection,
                department: newValue,
                gradeLevel: null,
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Department"
                fullWidth
              />
            )}
          />
          <Autocomplete
            options={
              newSection.department === "College"
                ? ["1st Year", "2nd Year", "3rd Year", "4th Year"]
                : ["Grade 11", "Grade 12"]
            }
            value={newSection.gradeLevel}
            onChange={(event, newValue) =>
              setNewSection({ ...newSection, gradeLevel: newValue })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Grade Level"
                fullWidth
              />
            )}
          />
          <TextField
            margin="dense"
            label="Section Name"
            fullWidth
            value={newSection.sectionName}
            onChange={(e) =>
              setNewSection({ ...newSection, sectionName: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation before deleting the selected sections */}
      <Dialog open={confirmDeleteOpen} onClose={cancelRemoveSelected}>
        <DialogTitle>
          Delete selected section{selectedIds.length !== 1 ? "s" : ""}?
        </DialogTitle>
        <DialogContent>
          <Typography>
            {`This will permanently remove ${selectedIds.length} section${
              selectedIds.length !== 1 ? "s" : ""
            } and can't be undone.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRemoveSelected} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={confirmRemoveSelected}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
