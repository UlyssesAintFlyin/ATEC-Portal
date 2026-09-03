
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
  Autocomplete
} from "@mui/material";


import { Table } from "../../components/Table";
import { Link, useNavigate } from "react-router-dom";
export default function TermConfig() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/loadAcademicYear")
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch((err) => console.error(err));
  }, []);

  const [open, setOpen] = useState(false);
  const [newTerm, setTerm] = useState({ term: "" });

  const handleAddRecords = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/addAcademicYear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTerm),
      });

      if (!response.ok) {
        throw new Error("Failed to add term");
      }

      await response.json();

      const reload = await fetch("http://localhost:5000/api/admin/loadAcademicYear");
      const updatedData = await reload.json();
      setRows(updatedData);
      setOpen(false);
      setTerm({ term: "" });
    } catch (err) {
      console.error("Error adding term:", err);
    }
  };



  const [selectedIds, setSelectedIds] = useState([]);


const handleSetAY = async () => {
  try {
    const ayId = parseInt(selectedIds[0], 10); // ensure integer

    const response = await fetch("http://localhost:5000/api/admin/setAY", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ AY_ID: ayId }),
    });

    if (!response.ok) {
      throw new Error("Failed to set academic year");
    }

    const result = await response.json();
  } catch (err) {
    console.error("Error setting academic year:", err);
  }
};



  const handleRemoveSelected = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/removeAcademicYears", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove terms");
      }

      const result = await response.json();


      setRows((prevRows) => prevRows.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error("Error removing terms:", err);
    }
  };


  const columns = [

    { field: "AY_Name", headerName: "Term", flex: 1.5 },

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
            Term Management
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
                Add Term
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSetAY}
                disabled={selectedIds.length !== 1}
              >
                Set Selected
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleRemoveSelected}
                disabled={selectedIds.length === 0}
              >
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
        <DialogTitle>Add New Academic Year</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Term"
            fullWidth value={newTerm.term}
            onChange={(e) => setTerm({ ...newTerm, term: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddRecords} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
