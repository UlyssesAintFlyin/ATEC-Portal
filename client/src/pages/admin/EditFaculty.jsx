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
  Divider,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

// Helper function to safely convert ISO date strings to YYYY-MM-DD without timezone shifts
const formatDate = (rawDate) => {
  if (!rawDate) return "";

  // If already a simple YYYY-MM-DD string, return it as-is
  if (typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return rawDate;
  }

  // Parse ISO timestamps using local date getters
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function EditFaculty() {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    f_Name: "",
    l_Name: "",
    m_Name: "",
    birthdate: "",
    gender: "",
    email: "",
    age: "",
    address: "",
    contact_Number: "",
    position: "",
    status: "",
    faculty_ID: "",
    password: "",
    emergency_Name: "",
    emergency_Number: "",
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
          birthdate: formatDate(data.birthdate),
          gender: data.gender || "",
          email: data.email || "",
          age: data.age ?? "",
          address: data.address || "",
          contact_Number: data.contact_Number || "",
          position: data.position || "",
          status: data.status || "",
          faculty_ID: data.faculty_ID || "",
          password: data.password || "",
          emergency_Name: data.emergency_Name || "",
          emergency_Number: data.emergency_Number || "",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [id]);

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
            }}
          >
            Faculty Member's Information
          </Typography>
        </Box>

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
              value={formData.f_Name ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, f_Name: e.target.value })
              }
            />
            <TextField
              label="Middle Name"
              fullWidth
              value={formData.m_Name ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, m_Name: e.target.value })
              }
            />
            <TextField
              label="Surname"
              fullWidth
              value={formData.l_Name ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, l_Name: e.target.value })
              }
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
            <TextField
              label="Age"
              type="number"
              fullWidth
              value={formData.age ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({
                  ...formData,
                  age: val === "" ? "" : Number(val),
                });
              }}
              InputProps={{ inputProps: { min: 0 } }}
            />
            <TextField
              label="Gender"
              fullWidth
              value={formData.gender ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            />
            <TextField
              label="Birthdate"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.birthdate ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, birthdate: e.target.value })
              }
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
            <TextField
              label="Home Address"
              fullWidth
              value={formData.address ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </Box>

          <Divider variant="middle" sx={{ borderColor: "#242c54" }} />

          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              ml: "20px",
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
            <TextField
              label="Email Address"
              fullWidth
              value={formData.email ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <TextField
              label="Contact Number"
              fullWidth
              value={formData.contact_Number ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, contact_Number: e.target.value })
              }
            />
          </Box>

          <Divider variant="middle" sx={{ borderColor: "#242c54" }} />

          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              ml: "20px",
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
            <TextField
              label="Emergency Contact's Name"
              fullWidth
              value={formData.emergency_Name ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, emergency_Name: e.target.value })
              }
            />
            <TextField
              label="Emergency Contact's Number"
              fullWidth
              value={formData.emergency_Number ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, emergency_Number: e.target.value })
              }
            />
          </Box>

          <Divider variant="middle" sx={{ borderColor: "#242c54" }} />

          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              ml: "20px",
            }}
          >
            Affiliation Status
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
              alignItems: "stretch",
            }}
          >
            <Autocomplete
              options={[
                "Teacher",
                "Academic Head",
                "Discipline Officer",
                "IT Administrator",
                "Admin",
              ]}
              fullWidth
              value={formData.position || null}
              onChange={(event, newValue) =>
                setFormData({ ...formData, position: newValue })
              }
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField {...params} label="Position" fullWidth size="medium" />
              )}
            />

            <Autocomplete
              options={["Active", "Inactive", "On Leave", "Resigned"]}
              fullWidth
              value={formData.status ?? null}
              onChange={(event, newValue) =>
                setFormData({ ...formData, status: newValue ?? "" })
              }
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField {...params} label="Status" fullWidth size="medium" />
              )}
            />
          </Box>

          <Divider variant="middle" sx={{ borderColor: "#242c54" }} />

          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              ml: "20px",
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
              mb: "40px",
            }}
          >
            <TextField
              label="Employee ID"
              fullWidth
              value={formData.faculty_ID ?? ""}
              inputProps={{ readOnly: true }}
            />
            <TextField
              label="Password"
              fullWidth
              type="password"
              value={formData.password ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </Box>
        </Box>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            py: { xs: 3, md: 0 },
          }}
        >
          <Button
            sx={{
              fontSize: { xs: "12px", sm: "15px", md: "17px" },
              color: "#E8EDF2",
              backgroundColor: "#242C54",
              borderRadius: "5px",
              width: { xs: "150px", sm: "200px", md: "250px" },
              "&:hover": {
                backgroundColor: "#4f5d9e",
                transform: "scale(1.05)",
              },
            }}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {/* Success Dialog */}
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