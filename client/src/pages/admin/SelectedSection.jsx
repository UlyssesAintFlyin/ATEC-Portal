import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
} from "@mui/material";
import { Table } from "../../components/Table";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function SelectedSection() {
  const navigate = useNavigate();
  const { sectionName } = useParams();
  const location = useLocation();
  const gradeLevel = location.state?.gradeLevel;
  const sectionId = location.state?.section_ID; // passed from Sections.jsx
  const [rows, setRows] = useState([]);
  const [currentAYS_ID, setCurrentAYS_ID] = useState(null);

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/systemSettings`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();

        setCurrentAYS_ID(data.enrollment_AYS_ID);
      } catch (err) {
        console.error("Error loading system settings:", err);
        setCurrentAYS_ID(null);
      }
    };

    fetchSystemSettings();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `${API_URL}/admin/sections/${sectionId}/students?AYS_ID=${currentAYS_ID}`,
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        setRows(data);
      } catch (err) {
        console.error("Error loading students:", err);
        setRows([]);
      }
    };

    if (sectionId && currentAYS_ID) {
      fetchStudents();
    } else {
      setRows([]);
    }
  }, [sectionId, currentAYS_ID]);

  const columns = [
    {
      field: "studentName",
      headerName: "Student Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      flex: 0.5,
      minWidth: 80,
    },
    { field: "gender", headerName: "Gender", flex: 0.5, minWidth: 80 },
    { field: "program", headerName: "Program", flex: 0.5, minWidth: 100 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="inherit"
            onClick={() =>
              navigate(`/admin/section/${sectionName}/${params.row.id}`, {
                state: { sectionName: sectionName },
              })
            }
            sx={{
              fontSize: { xs: "12px", sm: "15px", md: "15px" },
              width: { xs: "80px", sm: "120px", md: "100px" },
            }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="inherit"
            onClick={() =>
              navigate(
                `/admin/section/${sectionName}/${params.row.id}/editGrade`,
              )
            }
            sx={{
              marginLeft: "10px",
              fontSize: { xs: "12px", sm: "15px", md: "15px" },
              width: { xs: "80px", sm: "120px", md: "100px" },
            }}
          >
            View
          </Button>
        </>
      ),
    },
  ];

  // Adding Student Dialog State
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleRemoveSelected = () => {
    setRows(rows.filter((r) => !selectedIds.includes(r.id)));
    setSelectedIds([]);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#BAC5D1",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
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
        }}
      >
        {/* Header with Add and Remove Button */}
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
              {gradeLevel} &mdash; {sectionName}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                marginLeft: { xs: 0, md: "50px" },
              }}
            >
              Manage the students of section {sectionName}.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              flexWrap: "wrap",
              maxWidth: {xs: "300px", md: "500px"},
              gap: 2,
              marginTop: { xs: "10px", md: "0" },
              marginRight: { xs: "20px", sm: "30px", md: "50px" },
              marginLeft: { xs: "20px", sm: "30px", md: "50px" },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                navigate(`/admin/sections/${sectionName}/addStudent`, {
                  state: { section_ID: sectionId },
                })
              }
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#245442",
              }}
            >
              Add Student
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRemoveSelected}
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
            <Button
              variant="contained"
              color="primary"
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#7B81A3",
              }}
              onClick={() =>
                navigate(`/admin/sections/${sectionName}/SectionSubject`, {
                  state: { section_ID: sectionId },
                })
              }
            >
              Configure Subjects
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#242C54",
              }}
            >
              Migrate Selected
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <Box
          sx={{
            marginLeft: { xs: "20px", md: "50px" },
            marginRight: { xs: "20px", md: "50px" },
            height: { xs: "600px", md: "500px" },
          }}
        >
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

      {/* Add Student Dialog 
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Student Name"
            fullWidth value={newStudent.studentName}
            onChange={(e) => setNewStudent({ ...newStudent, studentName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Age" type="number"
            fullWidth value={newStudent.age}
            onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
          />
          <Autocomplete
            options={[
              "Male",
              "Female"
            ]}
            value={newStudent.gender}
            onChange={(event, newValue) =>
              setNewStudent({ ...newStudent, gender: newValue })
            }
            renderInput={(params) => (
              <TextField {...params} margin="dense" label="Gender" fullWidth />
            )}
          />
          <Autocomplete
            options={[
              "TechPro - ICT",
              "TechPro - Industrial Technology",
              "TechPro - Hospitality and Tourism",
              "Academic - STEM",
              "Academic - ABM",
              "Academic - ASSH",
              "College - DIT",
              "College - DRT",
              "College - DHT",
            ]}
            value={newStudent.program}
            onChange={(event, newValue) =>
              setNewStudent({ ...newStudent, program: newValue })
            }
            renderInput={(params) => (
              <TextField {...params} margin="dense" label="Program" fullWidth />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">Add</Button>
        </DialogActions>
      </Dialog> */}
    </Box>
  );
}
