import React from "react";
import { Typography, Box, Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { StandardTable } from "../../components/StandardTable";

function GradeReport() {
  //Array for dropdown
  const choices = [
    { label: "Academic Year 2024–2026 – 1st Semester", id: 1 },
    { label: "Academic Year 2024–2026 – 2nd Semester", id: 2 },
  ];

  //Array for table column
  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, minWidth: 60},
    {
      field: "subjectName",
      headerName: "Subject Name",
      flex: 1,
      minWidth: 160,
    },
    { field: "instructor", headerName: "Instructor", flex: 1, minWidth: 140 },
    {
      field: "grade",
      headerName: "Final Grade",
      type: "number",
      flex: 0.7,
      minWidth: 110,
      headerAlign: "center",
      align: "center",
    },
  ];

  //Array for table records
  const rows = [
    {
      id: 1,
      subjectName: "Genereal Mathematics",
      instructor: "Carlo Dimasili",
      grade: 98.0,
    },
    {
      id: 2,
      subjectName: "English Literary",
      instructor: "Jhepoy Labangon",
      grade: 99.0,
    },
    {
      id: 3,
      subjectName: "Basic Calculus",
      instructor: "Jenny Javier",
      grade: 97.0,
    },
    {
      id: 4,
      subjectName: "Eart and Life Science",
      instructor: "Erving Santos",
      grade: 99.0,
    },
    {
      id: 5,
      subjectName: "Purposive Communication",
      instructor: "Catherine Lasos",
      grade: 99.0,
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
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <Typography
            sx={{
              color: "#242c54",
              fontWeight: "bold",
              fontSize: { xs: "16px", md: "35px" },
              textAlign: { xs: "center", md: "left" },
              marginLeft: { xs: "0", md: "50px" },
            }}
          >
            Grade Report
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#242c54",
              fontSize: { xs: "12px", md: "16px" },
              textAlign: { xs: "center", md: "left" },
              marginLeft: { xs: "0", md: "50px" },
            }}
          >
            View your grade summary for the semester.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            marginBottom: "30px",
            gap: 2,
          }}
        >
          {/*Final Grade Component*/}
          <Box
            className="final-grade-box"
            sx={{
              backgroundColor: "#58629E",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              padding: "10px",
              borderRadius: "5px",
              width: { xs: "100px", md: "150px" },
              marginLeft: { xs: "20px", md: "50px" },
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
              Final Grade
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "20px", md: "30px" },
                  lineHeight: 1,
                }}
              >
                98
              </Typography>
              <Typography variant="body2">over 100</Typography>
            </Box>
          </Box>

          {/*Dropdwon Component*/}
          <Autocomplete
            disablePortal
            options={choices}
            sx={{
              width: { xs: "150px", md: "300px" },
              marginRight: { xs: "20px", md: "50px" },
            }}
            renderInput={(params) => (
              <TextField {...params} label="Academic Year" />
            )}
          />
        </Box>

        <Box
          sx={{
            marginLeft: { xs: "20px", md: "50px" },
            marginRight: { xs: "20px", md: "50px" },
            marginBottom: { xs: "20px", md: "50px" },
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/*Table Component*/}
          <StandardTable
            rows={rows}
            columns={columns}
            fileName="grade-report"
            printFields={["subjectName", "instructor", "grade"]}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default GradeReport;
