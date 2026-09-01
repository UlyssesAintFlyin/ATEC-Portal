import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete
} from "@mui/material";
import { Table } from "../../components/Table";
import TextField from "@mui/material/TextField";
import { useParams } from "react-router-dom";

export default function EditFaculty() {
  const { id } = useParams();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState(false);
  const [rows, setRows] = useState([
    {
      id: 1,
      gradeLevel: "Grade 11",
      sectionName: "Commitment",
    },

  ]);
  const handleSave = () => {
    // Backend logic to save changes for the faculty member with the given ID
    setOpen(false);
    console.log("Changes saved for faculty ID:", id);
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
            <TextField label="First Name" fullWidth />
            <TextField label="Middle Name" fullWidth />
            <TextField label="Surname" fullWidth />
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

        <Box sx={{
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
            Department Information
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
            <TextField label="Department" fullWidth size="medium" />

            <Autocomplete
              options={[
                "Oral Communication",
                "Reading and Writing",
                "General Mathematics",
                "Earth and Life Science",
                "Physical Science",
                "Contemporary Arts",
                "Media and Information Literacy",
                "21st Century Literature",
                "Understanding Culture, Society, and Politics",
                "Physical Education and Health",
                "Personal Development",
                "Introduction to Philosophy of the Human Person",
              ]}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label="Subject" fullWidth size="medium" />
              )}
            />

            <Autocomplete
              options={[
                "11 - Commitment",
                "12 - Compassion",
                "11 - Integrity",
                "12 - Intelligence",
              ]}
              fullWidth
              renderInput={(params) => (
                <TextField {...params} label="Advisory Section" fullWidth size="medium" />
              )}
            />
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
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          ml: { xs: "20px", sm: "30px", md: "85px" },
          mb: 1,
        }}
      >
        <Typography
          sx={{
            color: "#242C54",
            fontWeight: "bold",
            fontSize: { xs: "16px", md: "20px" },
          }}
        >
          Sections under Instructor:
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between", 
          alignItems: "center",
          ml: { xs: "20px", sm: "30px", md: "85px" },
          mr: { xs: "20px", sm: "30px", md: "85px" },
          mb: { xs: "20px", sm: "30px", md: "50px" },
        }}
      >
        {/* Left button */}
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
          onClick={() => setConfig(true)}
        >
          Configure Sections
        </Button>

        {/* Right button */}
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
      {/*Saved Changes Dialog*/}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>Faculty information has been successfully changed.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={config} onClose={() => setConfig(false)} maxWidth="sm" fullWidth >
        <DialogTitle>Choose Section Under Instructor</DialogTitle>
        <DialogContent
          sx={{
            height: "400px",
            overflowY: "auto",
          }}
        >
          <Table rows={rows} columns={columns} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfig(false)} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
