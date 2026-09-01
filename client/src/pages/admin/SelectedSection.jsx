import React, { useState } from "react";
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
import { useNavigate, useParams } from "react-router-dom";

export default function SelectedSection() {
  const navigate = useNavigate();
  const{sectionId} = useParams();
  const [rows, setRows] = useState([
    { 
      id: 1, 
      studentName: "Gojo Satoru", 
      age: 17, 
      gender: "Male", 
      program: "TechPro - ICT" 
    },
    { id: 2, 
      studentName: "Coleen Santos", 
      age: 16, 
      gender: "Female", 
      program: "TechPro - ICT" 
    },
    { id: 3, 
      studentName: "Nelson Mandela", 
      age: 18, 
      gender: "Male", 
      program: "TechPro - ICT" 
    },
    { id: 4, 
      studentName: "Tony Stark", 
      age: 19, 
      gender: "Male", 
      program: "TechPro - ICT" },
    { id: 5, 
      studentName: "Itaru Hashida", 
      age: 18, 
      gender: "Male", 
      program: "TechPro - ICT" },
    { id: 6, 
      studentName: "Michelle Jones", 
      age: 17, 
      gender: "Female", 
      program: "TechPro - ICT" },
    { id: 7, 
      studentName: "Naomi Payton", 
      age: 17, 
      gender: "Female", 
      program: "TechPro - ICT" },
  ]);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, minWidth: 60 },
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
            onClick={() => navigate(`/admin/section/thisSection/${params.row.id}`)}
            sx={{ fontSize: { xs: "12px", sm: "15px", md: "15px" }, width: { xs: "80px", sm: "120px", md: "100px" } }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => navigate(`/admin/section/thisSection/thisStudent/editGrade`)}
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
  const [newStudent, setNewStudent] = useState({ studentName: "", age: "", gender: "", program: "" });

  const handleAdd = () => {
    const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows([...rows, { id: nextId, ...newStudent }]);
    setOpen(false);
    setNewStudent({ studentName: "", age: "", gender: "", program: "TechPro - ICT" });{/*Will default value based on section track - Backend lol*/}
  };

  // Track selected rows from Table (Supposedly)
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
            Grade 11 - Commitment
          </Typography>
          <Box sx={{ display: "flex", gap: 2, marginRight: { xs: "20px", sm: "30px", md: "50px" } }}>
            <Button variant="contained" color="primary" onClick={() => navigate(`/admin/sections/${sectionId}}/addStudent`)}>
              Add Student
            </Button>
            <Button variant="contained" color="error" onClick={handleRemoveSelected} disabled={selectedIds.length === 0}>
              Remove Selected
            </Button>
          </Box>
        </Box>

        {/* Table */}
        <Box sx={{ marginLeft: { xs: "20px", md: "50px" }, marginRight: { xs: "20px", md: "50px" }, height: { xs: "600px", md: "500px" } }}>
          <Table rows={rows} columns={columns} onSelectionChange={(ids) => setSelectedIds(ids)} />
        </Box>
      </Box>

      {/* Add Student Dialog */}
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
      </Dialog>
    </Box>
  );
}
