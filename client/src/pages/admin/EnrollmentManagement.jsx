import React from "react";
import { Typography, Box, Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Table } from "../../components/Table";
import { Link, useNavigate } from "react-router-dom";

export default function EnrollmentManagement() {
    const navigate = useNavigate();
  //Array for table column
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, minWidth: 60 },
    { field: "studentName", headerName: "Student Name", flex: 0.5 },
    { field: "age", headerName: "Age", type: "number", flex: 1 },
    { field: "gender", headerName: "Gender", flex: 1 },
    { field: "program", headerName: "Program", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="inherit"
          onClick={() =>
            navigate(`/admin/enrollmentList/enrollmentRecord/${params.row.id}`)
          }
        >
          View Record
        </Button>
      ),
    },
  ];

  const rows = [
    {
      id: 1,
      studentName: "Sakura Matou",
      age: 17,
      gender: "Female",
      program: "Grade 12 STEM",
    },
    {
      id: 2,
      studentName: "Rudeus Greyrat",
      age: 19,
      gender: "Male",
      program: "BSIT",
    },
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
            List of Enrollees
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
            marginLeft: { xs: "20px", md: "50px" },
            marginRight: { xs: "20px", md: "50px" },
            height: { xs: "600px", md: "500px" },
            maxWidth:  "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/*Table Component*/}
          <Table rows={rows} columns={columns} />
        </Box>
      </Box>
    </Box>
  );
}
