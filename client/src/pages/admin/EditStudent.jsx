import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL; 

export default function EditStudent() {
  const { studentId } = useParams();
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState(null);
  
  console.log("Student ID from params:", studentId);
  useEffect(() => {
    fetch(`${API_URL}/admin/students/${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setStudent(data);
      })
      .catch((err) => console.error("Error loading student:", err));
  }, [studentId]);
  console.log("Student data:", student);
  const handleSave = () => {
    // Backend logic to save changes for the student with the given ID
    setOpen(false);
    console.log("Changes saved for student ID:", studentId);
  };
  
   const formatDateLocal = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    // Use local year, month, day
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
              marginLeft: { xs: "20px", sm: "30px", md: "50px" },
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
          >
          </Box>
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
              value={student ? student.f_Name : ''}
              onChange={(e) => setStudent({ ...student, f_Name: e.target.value })}
              fullWidth
            />
            <TextField 
            label="Middle Name"
              value={student ? student.m_Name : ''}
              onChange={(e) => setStudent({ ...student, m_Name: e.target.value })}
              fullWidth />
            <TextField label="Surname"
              value={student ? student.l_Name : ''}
              onChange={(e) => setStudent({ ...student, l_Name: e.target.value })}
              fullWidth />
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
            <TextField 
            label="Gender" 
            value={student ? student.gender : ''}
            fullWidth />
            <TextField
              label="Birthdate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formatDateLocal(student?.birthdate)}
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
            value={student ? student.address : ''}
            onChange={(e) => setStudent({ ...student, address: e.target.value })}
            fullWidth />
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
            <TextField 
            label="Email Adress" 
            value={student ? student.email : ''}
            fullWidth />
            <TextField 
            label="Contact Number" 
            value={student ? student.contact_Number : ''}
            fullWidth />
          </Box>
        </Box>
        {/* Family information */}
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
            value={student ? student.father_Name : ''}
            fullWidth />
            <TextField 
            label="Father's Contact Number" 
            value={student ? student.father_Contact : ''}
            fullWidth />
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
            value={student ? student.mother_Name : ''}
            fullWidth />
            <TextField 
            label="Mother's Contact Number" 
            value={student ? student.mother_Contact : ''}
            fullWidth />
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
            value={student ? student.guardian_Name : ''}
            fullWidth />
            <TextField 
            label="Guardian's Contact Number" 
            value={student ? student.guardian_Contact : ''}
            fullWidth />
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
            Program Information
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField label="Program" fullWidth />
            <TextField label="Program Type" fullWidth />
            <TextField label="Section" fullWidth />
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
            <TextField label="Student ID (LRN)" fullWidth />
            <TextField label="Password" fullWidth type="password" />
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mr: { xs: "20px", sm: "30px", md: "85px" }, mb: { xs: "20px", sm: "30px", md: "50px" } }}>
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
          onClick={() => setOpen(true)}
        >
          Save Changes
        </Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Success</DialogTitle>
          <DialogContent>
            <Typography>Student information has been successfully changed.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} variant="contained" color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
