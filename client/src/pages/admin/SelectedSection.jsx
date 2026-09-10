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
import { useNavigate, useParams, useLocation } from "react-router-dom";

export default function SelectedSection() {
  const navigate = useNavigate();
  const { sectionName } = useParams();
  const location = useLocation();
  const gradeLevel = location.state?.gradeLevel;
  const sectionId = location.state?.section_ID; // passed from Sections.jsx
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/sections/${sectionId}/students`);
        const data = await res.json();
        setRows(data);
      } catch (err) {
        console.error("Error loading students:", err);
      }
    };
    if (sectionId) fetchStudents();
  }, [sectionId]);


  const columns = [
    { field: "studentName", headerName: "Student Name", flex: 1 },
    { field: "age", headerName: "Age", type: "number", flex: 0.5 },
    { field: "gender", headerName: "Gender", flex: 0.5 },
    { field: "program", headerName: "Program", flex: 0.5 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="inherit"
            onClick={() =>
              navigate(`/admin/section/${sectionName}/${params.row.id}`, {
                state: { sectionName: sectionName},
              })
            }
            sx={{ fontSize: { xs: "12px", sm: "15px", md: "15px" }, width: { xs: "80px", sm: "120px", md: "100px" } }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => navigate(`/admin/section/${sectionName}/${params.row.id}/editGrade`)}
            sx={{ marginLeft: "10px", fontSize: { xs: "12px", sm: "15px", md: "15px" }, width: { xs: "80px", sm: "120px", md: "100px" } }}
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
    <Box sx={{ backgroundColor: "#BAC5D1", height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ backgroundColor: "#E8EDF2", height: "100%", width: { xs: "100%", sm: "600px", md: "1200px" }, margin: "0 auto", display: "flex", flexDirection: "column" }}>

        {/* Header with Add and Remove Button */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "20px", marginBottom: "30px" }}>
          <Typography sx={{ color: "#242c54", fontWeight: "bold", fontSize: { xs: "22px", md: "35px" }, marginLeft: { xs: "20px", sm: "30px", md: "50px" } }}>
            {gradeLevel} – {sectionName}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, marginRight: { xs: "20px", sm: "30px", md: "50px" } }}>
            <Button variant="contained" color="primary" 
            onClick={() => navigate(`/admin/sections/${sectionName}/addStudent`, {
              state: {section_ID: sectionId }
            })} >
              Add Student
            </Button>
            <Button variant="contained" color="error" onClick={handleRemoveSelected} disabled={selectedIds.length === 0}>
              Remove Selected
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ marginLeft: { xs: "20px", md: "50px" }, marginRight: { xs: "20px", md: "50px" }, height: { xs: "600px", md: "500px" } }}>
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
