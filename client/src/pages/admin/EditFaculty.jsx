import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from "@mui/material";
import { Table } from "../../components/Table";
import TextField from "@mui/material/TextField";
import { useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function EditFaculty() {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    f_Name: "",
    l_Name: "",
    m_Name: "",
    birthdate: "",
    gender: "",
    email: "",
  });

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch(`${API_URL}/faculty/getFacultyById/${id}`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        setFormData({
          f_Name: data.f_Name || "",
          l_Name: data.l_Name || "",
          m_Name: data.m_Name || "",
          birthdate: data.birthdate ? data.birthdate.split("T")[0] : "",
          gender: data.gender || "",
          email: data.email || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [id]);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/faculty/updateFaculty/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { field: "id", headerName: "Section ID", flex: 0, minWidth: 60 },
    { field: "gradeLevel", headerName: "Grade Level", flex: 0.5, minWidth: 60 },
    { field: "sectionName", headerName: "Section Name", flex: 1 },
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
          minHeight: "100%",
          width: { xs: "100%", sm: "600px", md: "1200px" },
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 3,
          pb: 4,
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
            Faculty Member's Information
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              marginRight: { xs: "20px", sm: "30px", md: "50px" },
            }}
          ></Box>
        </Box>
        {/* Personal information */}
        <Box
          sx={{
            backgroundColor: "#F3F9FF",
            width: "100%",
            minHeight: { xs: "auto", md: "340px" },
            borderRadius: "5px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            py: { xs: 3, md: 0 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              margin: "10px 20px -15px",
            }}
          >
            Personal Information
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField
              label="First Name"
              fullWidth
              value={formData.f_Name}
              onChange={handleChange("f_Name")}
            />
            <TextField
              label="Middle Name"
              fullWidth
              value={formData.m_Name}
              onChange={handleChange("m_Name")}
            />
            <TextField
              label="Surname"
              fullWidth
              value={formData.l_Name}
              onChange={handleChange("l_Name")}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField label="Age" type="number" fullWidth />
            <TextField label="Gender" fullWidth />
            <TextField
              label="Birthdate"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField label="Home Address" fullWidth />
          </Box>
        </Box>

        <Box
          sx={{
            backgroundColor: "#F3F9FF",
            width: "100%",
            minHeight: { xs: "auto", md: "180px" },
            borderRadius: "5px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            py: { xs: 3, md: 0 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              margin: "10px 20px -15px",
            }}
          >
            Contact Information
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField label="Email Adress" fullWidth />
            <TextField label="Contact Number" fullWidth />
          </Box>
        </Box>
        {/* Family information */}
        <Box
          sx={{
            backgroundColor: "#F3F9FF",
            width: "100%",
            minHeight: { xs: "auto", md: "180px" },
            borderRadius: "5px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            py: { xs: 3, md: 0 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              margin: "10px 20px -15px",
            }}
          >
            Incase of Emergency Contact Information
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField label="Emergency Contact's Name" fullWidth />
            <TextField label="Emergency Contact's Number" fullWidth />
          </Box>
        </Box>

        <Box
          sx={{
            backgroundColor: "#F3F9FF",
            width: "100%",
            minHeight: { xs: "auto", md: "180px" },
            borderRadius: "5px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            py: { xs: 3, md: 0 },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              margin: "10px 20px -15px",
            }}
          >
            Account Configuration
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField label="Employee ID " fullWidth />
            <TextField label="Password" fullWidth type="password" />
          </Box>
        </Box>

        <Box
          sx={{
            width: "100%",
            minHeight: { xs: "auto", md: "340px" },
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            py: { xs: 3, md: 0 },
          }}
        >
          <Button
            sx={{
              fontSize: { xs: "12px", sm: "15px", md: "17px" },
              color: "#E8EDF2", // light gray text
              backgroundColor: "#242C54",
              borderRadius: "5px",
              width: { xs: "150px", sm: "200px", md: "250px" },
              "&:hover": {
                backgroundColor: "#4f5d9e",
                transform: "scale(1.05)",
              },
            }}
            onClick={() => setOpen(true)}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
      {/*Saved Changes Dialog*/}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>
            Faculty information has been successfully changed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            variant="contained"
            color="primary"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
