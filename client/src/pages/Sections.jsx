
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
export default function Sections() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([
    {
      id: 1,
      gradeLevel: "Grade 11",
      sectionName: "Commitment",
    },

  ]);


  // Adding Student Dialog State
  const [open, setOpen] = useState(false);
  const [newSection, setNewSection] = useState({ gradeLevel: "", sectionName: "" });

  const handleAdd = () => {
    const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows([...rows, { id: nextId, ...newSection }]);
    setOpen(false);
    setNewSection({ gradeLevel: "", sectionName: "" });
  };

  // Track selected rows from Table (Supposedly)
  const [selectedIds, setSelectedIds] = useState([]);

  const handleRemoveSelected = () => {
    setRows(rows.filter((r) => !selectedIds.includes(r.id)));
    setSelectedIds([]);
  };

  const columns = [
    { field: "id", headerName: "Section ID", flex: 0, minWidth: 60 },
    { field: "gradeLevel", headerName: "Grade Level", flex: 0.5, minWidth: 60 },
    { field: "sectionName", headerName: "Section Name", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="inherit"
          onClick={() => navigate(`/admin/sections/${params.row.id}`)}
          sx={{ marginLeft: "10px", fontSize: { xs: "12px", sm: "15px", md: "15px", }, width: { xs: "80px", sm: "120px", md: "100px" } }}
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
            Sections
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
                Add Section
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
        <DialogTitle>Add New Section</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={[
              "Grade 11",
              "Grade 12",
              "College - DIT",
              "College - DRT",
              "College - DHT",
            ]}
            value={newSection.gradeLevel}
            onChange={(event, newValue) =>
              setNewSection({ ...newSection, gradeLevel: newValue })
            }
            renderInput={(params) => (
              <TextField {...params} margin="dense" label="Grade Level" fullWidth />
            )}
          />
          <TextField
            margin="dense"
            label="Section Name"
            fullWidth value={newSection.sectionName}
            onChange={(e) => setNewSection({ ...newSection, sectionName: e.target.value })}
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
