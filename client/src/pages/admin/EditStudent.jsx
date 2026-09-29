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
import { useParams, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const emptyStudent = {
  f_Name: "",
  m_Name: "",
  l_Name: "",
  age: "",
  gender: "",
  birthdate: "",
  address: "",
  email: "",
  contact_Number: "",
  father_Name: "",
  father_Contact: "",
  mother_Name: "",
  mother_Contact: "",
  guardian_Name: "",
  guardian_Contact: "",
  department: "",
  program: "",
  lrn: "",
  password: "",
};

export default function EditStudent() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState(emptyStudent);
  const [currentAYS_ID, setCurrentAYS_ID] = useState("");
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/systemSettings`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        setCurrentAYS_ID(data.enrollment_AYS_ID);
      } catch (err) {
        console.error("Error loading system settings:", err);
        setCurrentAYS_ID("");
      }
    };

    fetchSystemSettings();
  }, []);

  useEffect(() => {
    if (!currentAYS_ID) return;

    fetch(`${API_URL}/admin/students/${studentId}?AYS_ID=${currentAYS_ID}`)
      .then((res) => res.json())
      .then((data) => {
        const cleaned = Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, v ?? ""]),
        );
        setStudent({ ...emptyStudent, ...cleaned });
      })
      .catch((err) => console.error("Error loading student:", err));
  }, [student.department, currentAYS_ID]);

  useEffect(() => {
    if (student && student.department && currentAYS_ID) {
      fetch(
        `${API_URL}/admin/sections/byDepartment?department=${student.department}&AYS_ID=${currentAYS_ID}`,
      )
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          setSections(data);
        })
        .catch((err) => console.error("Error loading sections:", err));
    }
  }, [student, currentAYS_ID]);

  const formatDateLocal = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    // Use local year, month, day
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/students/${studentId}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...student,
          birthdate: formatDateLocal(student?.birthdate),
          AYS_ID: currentAYS_ID,
        }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const updated = await res.json();
      setOpen(true);
    } catch (err) {
      console.error("Error saving student:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
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
            Student's Information
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
              value={student.f_Name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Middle Name"
              value={student.m_Name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Surname"
              value={student.l_Name}
              onChange={handleChange}
              fullWidth
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
              value={student.age}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Gender"
              value={student.gender}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Birthdate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formatDateLocal(student.birthdate)}
              onChange={handleChange}
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
            <TextField
              label="Home Address"
              value={student.address}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          <Divider
            variant="middle"
            sx={{
              borderColor: "#242c54",
            }}
          />

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
              label="Email Adress"
              value={student.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Contact Number"
              value={student.contact_Number}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          <Divider
            variant="middle"
            sx={{
              borderColor: "#242c54",
            }}
          />

          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              ml: "20px",
            }}
          >
            Family Information
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
              label="Father's Name"
              value={student.father_Name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Father's Contact Number"
              value={student?.father_Contact ?? ""}
              onChange={handleChange}
              fullWidth
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
              label="Mother's Maiden Name"
              value={student.mother_Name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Mother's Contact Number"
              value={student.mother_Contact}
              onChange={handleChange}
              fullWidth
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
              label="Guardian's Name"
              value={student.guardian_Name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Guardian's Contact Number"
              value={student.guardian_Contact}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          <Divider
            variant="middle"
            sx={{
              borderColor: "#242c54",
            }}
          />

          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              ml: "20px",
            }}
          >
            Program Information
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
              boxSizing: "border-box",
            }}
          >
            <TextField
              label="Department"
              value={student.department}
              inputProps={{ readOnly: true }}
              fullWidth
              sx={{ flex: 1 }}
            />
            <TextField
              label="Course/Track"
              value={student.program}
              inputProps={{ readOnly: true }}
              fullWidth
              sx={{ flex: 1 }}
            />
            <Autocomplete
              options={sections}
              getOptionLabel={(option) =>
                `${option.gradeLevel} - ${option.section_Name}`
              }
              value={
                sections.find((sec) => sec.section_ID === student.section_ID) ||
                null
              }
              isOptionEqualToValue={(option, value) =>
                option.section_ID === value.section_ID
              }
              onChange={(e, value) => {
                if (value) {
                  setStudent((prev) => ({
                    ...prev,
                    section_ID: value.section_ID,
                    gradeLevel: value.gradeLevel,
                    section_Name: value.section_Name,
                  }));
                }
              }}
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Year Level & Section"
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "56px",
                    },
                  }}
                />
              )}
            />
          </Box>

          <Divider
            variant="middle"
            sx={{
              borderColor: "#242c54",
            }}
          />

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
              mb: "40px"
            }}
          >
            <TextField
              label="Learner's Reference Number"
              value={student.lrn}
              onChange={(e) =>
                setStudent({ ...(student || {}), lrn: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Password"
              value={student.password}
              onChange={(e) =>
                setStudent({ ...(student || {}), password: e.target.value })
              }
              fullWidth
              type="password"
            />
          </Box>

        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mr: { xs: "20px", sm: "30px", md: "85px" },
          mb: { xs: "20px", sm: "30px", md: "50px" },
        }}
      >
        <Button
          sx={{
            fontSize: { xs: "12px", sm: "15px", md: "17px" },
            color: "#E8EDF2",
            backgroundColor: "#791818",
            borderRadius: "5px",
            mr: { xs: "20px", sm: "30px", md: "50px" },
            width: { xs: "150px", sm: "200px", md: "250px" },
            "&:hover": {
              backgroundColor: "#bc4949",
              transform: "scale(1.05)",
            },
          }}
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
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
          onClick={() => {
            handleSave();
          }}
        >
          Save Changes
        </Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Success</DialogTitle>
          <DialogContent>
            <Typography>
              Student information has been successfully changed.
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
    </Box>
  );
}
