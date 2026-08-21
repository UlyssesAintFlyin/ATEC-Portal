import React, {useState} from "react";
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
import { Table } from "../components/Table";
import { Link, useNavigate } from "react-router-dom";

export default function FacultyEvaluation() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([
    {
      id: 1,
      facultyName: "Albert Einstein",
      age: 50,
      gender: "Male",
      position: "Academic Head",
    },
    {
      id: 2,
      facultyName: "Maria Montessori",
      age: 29,
      gender: "Female",
      position: "Teacher",
    },
    {
      id: 3,
      facultyName: "Bobby Lopez",
      age: 39,
      gender: "Male",
      position: "Teacher",
    },
    {
      id: 4,
      facultyName: "Belno Light",
      age: 24,
      gender: "Female",
      position: "Teacher",
    },
    {
      id: 5,
      facultyName: "Jose Rizal",
      age: 23,
      gender: "Male",
      position: "Teacher",
    },
    {
      id: 6,
      facultyName: "Pedro Ramirez Cruz",
      age: 42,
      gender: "Male",
      position: "Academic Head",
    },
    {
      id: 7,
      facultyName: "Osamu Dazai",
      age: 32,
      gender: "Male",
      position: "Teacher",
    }

  ]);
  // Adding Student Dialog State
      const [open, setOpen] = useState(false);
      const [newFaculty, setNewFaculty] = useState({ facultyName: "", age: "", gender: "", position: "" });
    
      const handleAdd = () => {
        const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
        setRows([...rows, { id: nextId, ...newFaculty }]);
        setOpen(false);
        setNewFaculty({ facultyName: "", age: "", gender: "", position: "" });
      };
    
      // Track selected rows from Table (Supposedly)
      const [selectedIds, setSelectedIds] = useState([]);
    
      const handleRemoveSelected = () => {
        setRows(rows.filter((r) => !selectedIds.includes(r.id)));
        setSelectedIds([]);
      };
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, minWidth: 60 },
    { field: "facultyName", headerName: "Faculty Name", flex: 1 },
    { field: "age", headerName: "Age", type: "number", flex: 0.5 },
    { field: "gender", headerName: "Gender", flex: 0.5 },
    { field: "position", headerName: "Position", flex: 0.5},
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <><Button
          variant="contained"
          color="inherit"
          onClick={() => navigate(`/admin/facultyEvaluation/editFaculty/${params.row.id}`)}
          sx={{ fontSize: { xs: "12px", sm: "15px", md: "15px" }, width: { xs: "80px", sm: "120px", md: "100px" } }}
        >
          Edit
        </Button><Button
          variant="contained"
          color="inherit"
          onClick={() => navigate(`/${params.row.id}`)}
          sx={{ marginLeft: "10px", fontSize: { xs: "12px", sm: "15px", md: "15px" ,} ,width: { xs: "80px", sm: "120px", md: "100px" }}}
        >
            Evaluation
          </Button></>
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
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            marginTop: "20px",
            marginBottom: "30px",
          }}
        >
          <Typography
            sx={{
              color: "#242c54",
              fontWeight: "bold",
              fontSize: { xs: "22px", md: "35px" },
              textAlign: "center",
              marginLeft: { xs: "20px", sm: "30px", md: "50px" },
            }}
          >
            Faculty
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              marginRight: { xs: "20px", sm: "30px", md: "50px" },
            }}
          >
            <Box sx={{ display: "flex", gap: 2, }}>
              <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                Add Faculty
              </Button>
              <Button variant="contained" color="error" onClick={handleRemoveSelected} disabled={selectedIds.length === 0}>
                Remove Selected
              </Button>
            </Box>
            <Button
              sx={{
                fontSize: { xs: "12px", sm: "15px", md: "17px" },
                color: "#E8EDF2",
                backgroundColor: "#242C54",
                borderRadius: "5px",
                "&:hover": {
                  backgroundColor: "#4f5d9e",
                  transform: "scale(1.05)",
                },
              }}
            >
              Configure Evaluation
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
          <Table rows={rows} columns={columns} />
        </Box>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
              <DialogTitle>Add New Faculty</DialogTitle>
              <DialogContent>
                <TextField 
                margin="dense" 
                label="Faculty Name" 
                fullWidth value={newFaculty.facultyName} 
                onChange={(e) => setNewFaculty({ ...newFaculty, facultyName: e.target.value })} 
                />
                <TextField 
                margin="dense" 
                label="Age" type="number" 
                fullWidth value={newFaculty.age} 
                onChange={(e) => setNewFaculty({ ...newFaculty, age: e.target.value })} 
                />
                <Autocomplete
                  options={[
                    "Male",
                    "Female"
                  ]}
                  value={newFaculty.gender}
                  onChange={(event, newValue) =>
                    setNewFaculty({ ...newFaculty, gender: newValue })
                  }
                  renderInput={(params) => (
                    <TextField {...params} margin="dense" label="Gender" fullWidth />
                  )}
                />
                <Autocomplete
                  options={[
                    "Teacher",
                    "Academic Head",
                    "Department Head",
                    "Program Head"
                  ]}
                  value={newFaculty.position}
                  onChange={(event, newValue) =>
                    setNewFaculty({ ...newFaculty, position: newValue })
                  }
                  renderInput={(params) => (
                    <TextField {...params} margin="dense" label="Position" fullWidth />
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
