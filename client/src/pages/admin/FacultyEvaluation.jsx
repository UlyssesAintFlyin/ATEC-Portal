import React, { useState, useEffect, useCallback } from "react";
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
import { StandardTable } from "../../components/StandardTable";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../components/AppSnackbar";

const API_URL = process.env.REACT_APP_API_URL;

export default function FacultyEvaluation() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const [showErrors, setShowErrors] = useState(false);

  const [rows, setRows] = useState([]);

  const fetchFaculty = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/faculty/getAllFaculties`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error("Error loading faculty:", err);
      snackbar.error("Failed to load faculty list");
    }
  }, [snackbar]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  // Adding Student Dialog State
  const [open, setOpen] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    f_Name: "",
    l_Name: "",
    m_Name: "",
    birthdate: "",
    gender: "",
    email: "",
    contact_Number: "",
    address: "",
  });

  const handleAdd = async () => {
    if (
      !newFaculty.f_Name ||
      !newFaculty.l_Name ||
      !newFaculty.email ||
      !newFaculty.contact_Number ||
      !newFaculty.address
    ) {
      setShowErrors(true);
      snackbar.warning("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/faculty/createFaculty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newFaculty,
          birthdate: newFaculty.birthdate || null,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed: ${res.status}`);
      }
      snackbar.success(
        `${newFaculty.f_Name} successfully added to the faculty!`,
      );

      handleClose();
      setNewFaculty({
        f_Name: "",
        l_Name: "",
        m_Name: "",
        birthdate: "",
        gender: "",
        email: "",
        contact_Number: "",
        address: "",
      });
    } catch (err) {
      console.error(err);
      snackbar.error(err.message || "Failed to add the faculty");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setShowErrors(false);
  };

  const maxBirthdate = new Date();
  maxBirthdate.setFullYear(maxBirthdate.getFullYear() - 20);

  const maxBirthdateString = maxBirthdate.toISOString().split("T")[0];

  const columns = [
    {
      field: "facultyName",
      headerName: "Faculty Name",
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
    { field: "gender", headerName: "Gender", flex: 0.5, minWidth: 100 },
    { field: "position", headerName: "Position", flex: 0.5, minWidth: 120 },
    { field: "status", headerName: "Status", flex: 0.5, minWidth: 120 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="inherit"
            onClick={() =>
              navigate(`/admin/facultyEvaluation/editFaculty/${params.row.id}`)
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
              navigate(`/admin/facultyEvaluation/evaluation/${params.row.id}`)
            }
            sx={{
              ml: 1,
              fontSize: { xs: "12px", sm: "15px", md: "15px" },
              width: { xs: "80px", sm: "120px", md: "100px" },
            }}
          >
            Evaluation
          </Button>
        </>
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
            marginBottom: {xs:"10px", sm:"15px", md:"30px"},
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
              Faculty Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                marginLeft: { xs: 0, md: "50px" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Manage faculty evaluations and their respective information.
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
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpen(true)}
                sx={{
                  fontSize: { xs: "12px", sm: "14px", md: "16px" },
                  padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                  color: "#E8EDF2",
                  backgroundColor: "#3B4788",
                }}
              >
                Add Faculty
              </Button>
            </Box>
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
          {/*Table Component*/}
          <StandardTable
            rows={rows}
            columns={columns}
            fileName="faculty-masterlist"
            printFields={["facultyName", "position", "status"]}
          />
        </Box>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Faculty</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="First Name"
            fullWidth
            value={newFaculty.f_Name}
            required
            error={showErrors && !newFaculty.f_Name}
            helperText={
              showErrors && !newFaculty.f_Name ? "First name is required" : ""
            }
            onChange={(e) =>
              setNewFaculty({ ...newFaculty, f_Name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Middle Name"
            fullWidth
            value={newFaculty.m_Name}
            onChange={(e) =>
              setNewFaculty({ ...newFaculty, m_Name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            value={newFaculty.l_Name}
            required
            error={showErrors && !newFaculty.l_Name}
            helperText={
              showErrors && !newFaculty.l_Name ? "Last name is required" : ""
            }
            onChange={(e) =>
              setNewFaculty({ ...newFaculty, l_Name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Birthdate"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newFaculty.birthdate}
            required
            error={showErrors && !newFaculty.birthdate}
            helperText={
              showErrors && !newFaculty.birthdate
                ? "Birthdate is required"
                : "Faculty must be at least 20 years old"
            }
            inputProps={{
              max: maxBirthdateString,
            }}
            onChange={(e) =>
              setNewFaculty({
                ...newFaculty,
                birthdate: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={newFaculty.email}
            required
            error={showErrors && !newFaculty.email}
            helperText={
              showErrors && !newFaculty.email ? "Email is required" : ""
            }
            onChange={(e) =>
              setNewFaculty({ ...newFaculty, email: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Contact Number"
            fullWidth
            value={newFaculty.contact_Number}
            required
            error={showErrors && !newFaculty.contact_Number}
            helperText={
              showErrors && !newFaculty.contact_Number
                ? "Contact Number is required"
                : ""
            }
            onChange={(e) =>
              setNewFaculty({ ...newFaculty, contact_Number: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            value={newFaculty.address}
            onChange={(e) =>
              setNewFaculty({ ...newFaculty, address: e.target.value })
            }
          />
          <Autocomplete
            options={["Male", "Female"]}
            value={newFaculty.gender}
            onChange={(event, newValue) =>
              setNewFaculty({ ...newFaculty, gender: newValue })
            }
            renderInput={(params) => (
              <TextField {...params} margin="dense" label="Gender" fullWidth />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
