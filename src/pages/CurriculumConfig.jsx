
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
  Autocomplete
} from "@mui/material";


import { Table } from "../components/Table";
import { Link, useNavigate } from "react-router-dom";
export default function CurriculumConfig() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([
    {
      id: 1,
      curriculum: "Grade 12 STEM 1st Semester",
    },
    {
      id: 2,
      curriculum: "Grade 12 ABM 1st Semester",
    },
  ]);


  // Adding Student Dialog State
  const [open, setOpen] = useState(false);
  const [newCurriculum, setCurriculum] = useState({ curriculum: ""});

  const handleAdd = () => {
    const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows([...rows, { id: nextId, ...newCurriculum }]);
    setOpen(false);
    setCurriculum({ curriculum: ""});
  };

  // Track selected rows from Table (Supposedly)
  const [selectedIds, setSelectedIds] = useState([]);

  const handleRemoveSelected = () => {
    setRows(rows.filter((r) => !selectedIds.includes(r.id)));
    setSelectedIds([]);
  };

  const columns = [

    { field: "curriculum", headerName: "Curriculum", flex: 1.5 },
    {
      field: "action",
      headerName: "Action",
      flex: 0.5,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="inherit"
          onClick={() => navigate(`./curriculum-:id`)}
          sx={{ marginLeft: "10px", fontSize: { xs: "12px", sm: "15px", md: "15px", }, width: { xs: "80px", sm: "120px", md: "100px" } }}
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
            Curriculum Management
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              marginRight: { xs: "20px", sm: "30px", md: "50px" },
            }}
          >
            <Box sx={{ display: "flex", gap: 2, marginRight: { xs: "20px", sm: "30px", md: "50px" } }}>
              <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                Add Curriculum
              </Button>
              <Button variant="contained" color="error" onClick={handleRemoveSelected} disabled={selectedIds.length === 0}>
                Remove Selected
              </Button>
            </Box>
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
        <DialogTitle>Add New Curriculum</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Curriculum"
            fullWidth value={newCurriculum.curriculum}
            onChange={(e) => setCurriculum({ ...newCurriculum, curriculum: e.target.value })}
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
