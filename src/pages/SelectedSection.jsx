import React from "react";
import { Typography, Box, Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Table } from "../components/Table";
import { Link, useNavigate } from "react-router-dom";
import {Header} from '../components/AdminHeader';
export default function SelectedSection() {
    const navigate = useNavigate();
   

    const columns = [
    { field: "id", headerName: "ID", flex: 0.5, minWidth: 60 },
    { field: "studentName", headerName: "Student Name", flex: 1 },
    { field: "age", headerName: "Age", type: "number", flex: 0.5 },
    { field: "gender", headerName: "Gender", flex: 0.5 },
    { field: "program", headerName: "Program", flex: 0.5},
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <><Button
          variant="contained"
          color="inherit"
          onClick={() => navigate(`/${params.row.id}`)}
          sx={{ fontSize: { xs: "12px", sm: "15px", md: "15px" }, width: { xs: "80px", sm: "120px", md: "100px" } }}
        >
          Edit
        </Button><Button
          variant="contained"
          color="inherit"
          onClick={() => navigate(`/${params.row.id}`)}
          sx={{ marginLeft: "10px", fontSize: { xs: "12px", sm: "15px", md: "15px" ,} ,width: { xs: "80px", sm: "120px", md: "100px" }}}
        >
            View
          </Button></>
      ),

    },
    
  ];

  const rows = [
    {
      id: 1,
      studentName: "Gojo Satoru",
      age: 17,
      gender: "Male",
      program: "TechPro - ICT",
    },
    {
      id: 2,
      studentName: "Coleen Santos",
      age: 16,
      gender: "Female",
      program: "TechPro - ICT",
    },
    {
      id: 3,
      studentName: "Nelson Mandela",
      age: 18,
      gender: "Male",
      program: "TechPro - ICT",
    },
    {
      id: 4,
      studentName: "Tony Stark",
      age: 19,
      gender: "Male",
      program: "TechPro - ICT",
    },
    {
      id: 5,
      studentName: "Itaru Hashida",
      age: 18,
      gender: "Male",
      program: "TechPro - ICT",
    },
    {
      id: 6,
      studentName: "Michelle Jones",
      age: 17,
      gender: "Female",
      program: "TechPro - ICT",
    },
    {
      id: 7,
      studentName: "Naomi Payton",
      age: 17,
      gender: "Female",
      program: "TechPro - ICT",
    }

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
            Grade 11 - Commitment
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

        <Box
          sx={{
            marginLeft: { xs: "20px", md: "50px" },
            marginRight: { xs: "20px", md: "50px" },
            height: { xs: "600px", md: "500px" },
            minWidth: 0,
          }}
        >
          {/*Table Component*/}
          <Table rows={rows} columns={columns} />
        </Box>
      </Box>
    </Box>
  );
}
