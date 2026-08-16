import React from "react";
import { Typography, Box, Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useParams } from "react-router-dom";

export default function EnrollmentRecord() {
  const { id } = useParams();
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
            Enrollee's Information
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              marginRight: { xs: "20px", sm: "30px", md: "50px" },
            }}
          >
            <Button
              sx={{
                fontSize: { xs: "12px", sm: "15px", md: "17px" },
                color: "#E8EDF2",
                backgroundColor: "#242C54",
                borderRadius: "5px",
                "&:hover": {
                  backgroundColor: "#4f5d9e",
                  transform: "scale(1.05)",
                },
              }}
            >
              Turn-off Enrollment
            </Button>
            <Button
              sx={{
                fontSize: { xs: "12px", sm: "15px", md: "17px" },
                color: "#E8EDF2",
                backgroundColor: "#791818",
                borderRadius: "5px",
                "&:hover": {
                  backgroundColor: "#bc4949",
                  transform: "scale(1.05)",
                },
              }}
            >
              Remove Selected
            </Button>
          </Box>
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

        <Box
          sx={{
            backgroundColor: "#F3F9FF",
            width: "100%",
            minHeight: { xs: "auto", md: "250px" },
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
            <TextField label="Father's Name" fullWidth />
            <TextField label="Father's Contact Number" fullWidth />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField label="Mother's Maiden Name" fullWidth />
            <TextField label="Mother's Contact Number" fullWidth />
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
            <TextField label="Transferring From" fullWidth />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
