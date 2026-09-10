import React, { useState, useEffect } from "react";
import { Typography, Box, Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function EnrollmentRecord() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enrollee, setEnrollee] = useState(null);

 useEffect(() => {
    fetch(`http://localhost:5000/api/admin/enrollees/${id}`)
      .then((res) => res.json())
      .then((data) => {
     
        if (data.status === "Validated") {
          navigate(`/admin/enrollmentList`);
        } else {
          setEnrollee(data);
        }
      })
      .catch((err) => console.error("Error loading enrollee:", err));
  }, [id, navigate]);

  

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
                backgroundColor: "#242C54",
                borderRadius: "5px",
                "&:hover": {
                  backgroundColor: "#4f5d9e",
                  transform: "scale(1.05)",
                },
              }}
              onClick={() => {
                fetch(`http://localhost:5000/api/admin/enrollees/${id}/validate`, {
                  method: "PUT",
                })
                  .then((res) => res.json())
                  .then((data) => {
                    console.log("Enrollee validated:", data);
                    setEnrollee((prev) => ({ ...prev, status: "Accepted" } ));
                    navigate(`/admin/enrollmentList`)
                  })
                  .catch((err) => console.error("Error validating enrollee:", err));
              }}
            >
              Validate Enrollment
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
            <TextField
              label="First Name"
              value={enrollee?.f_Name || ""}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Middle Name"
              value={enrollee?.m_Name || ""}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Surname"
              value={enrollee?.l_Name || ""}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
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
              value={enrollee?.age || ""}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Gender"
              value={enrollee?.gender || ""}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Birthdate"
              value={formatDateLocal(enrollee?.birthdate)}
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
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
              value={enrollee?.address || ""}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
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
              fullWidth
              value={enrollee?.email || ""}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Contact Number"
              fullWidth
              value={enrollee?.contact_Number || ""}
              InputProps={{
                readOnly: true,
              }}
            />
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
            <TextField
              label="Father's Name"
              fullWidth
              value={enrollee?.father_Name || ""}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Father's Contact Number"
              fullWidth
              value={enrollee?.father_Contact || ""}
              InputProps={{
                readOnly: true,
              }}
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
              fullWidth
              value={enrollee?.mother_Name || ""}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Mother's Contact Number"
              fullWidth
              value={enrollee?.mother_Contact || ""}
              InputProps={{
                readOnly: true,
              }}
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
            <TextField
              label="Program"
              fullWidth
              value={enrollee?.program || ""}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Program"
              fullWidth
              value={enrollee?.program || ""}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Transferring From"
              fullWidth
              value={enrollee?.transferring_from || ""}
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
