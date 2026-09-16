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
  Snackbar,
  Alert,
} from "@mui/material";
import { Table } from "../../components/Table";
import { Link, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function TermConfig() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    fetch(`${API_URL}/admin/loadAcademicYear`)
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch((err) => console.error(err));
  }, []);

  const [open, setOpen] = useState(false);
  const [newTerm, setTerm] = useState({ term: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleAddRecords = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/addAcademicYear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTerm),
      });

      if (!response.ok) {
        throw new Error("Failed to add term");
      }

      await response.json();

      const reload = await fetch(`${API_URL}/admin/loadAcademicYear`);
      const updatedData = await reload.json();
      setRows(updatedData);
      setOpen(false);
      setTerm({ term: "" });
    } catch (err) {
      console.error("Error adding term:", err);
    }
  };

  const [selectedIds, setSelectedIds] = useState([]);

  const columns = [{ field: "AY_Name", headerName: "Term", flex: 1.5 }];

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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography
              sx={{
                color: "#242c54",
                fontWeight: "bold",
                fontSize: { xs: "16px", md: "35px" },
                textAlign: "left",
                marginLeft: { xs: "20px", md: "50px" },
              }}
            >
              Term Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                textAlign: "left",
                marginLeft: { xs: "20px", md: "50px" },
              }}
            >
              Choose and manage Academic Term.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              marginRight: { xs: "20px", sm: "30px", md: "50px" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                gap: 2,
                marginTop: { xs: "10px", md: "0" },
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
                Add Term
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
            fullWidth
            value={newTerm.term}
            onChange={(e) => setTerm({ ...newTerm, term: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddRecords} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
