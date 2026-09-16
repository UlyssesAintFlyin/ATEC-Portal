import React, { useState, useEffect } from "react";
import { Typography, Box, Button, Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import { Table } from "../../components/Table";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function SectionSubject() {
  const navigate = useNavigate();
  const { sectionName } = useParams();
  const location = useLocation();
  const sectionId = location.state?.section_ID;

  const curriculumList = ["BSIT 2024", "BSIS 2025"];
  const adviserList = ["Dr. Alfred", "Dr. Rene"];

  const columns = [
    {
      field: "subjectName",
      headerName: "Subject Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "subjectcode",
      headerName: "Subject Code",
      flex: 0.5,
      minWidth: 100,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="inherit"
          onClick={() =>
            navigate(`/admin/section/${sectionName}/${params.row.id}`, {
              state: { sectionName: sectionName },
            })
          }
          sx={{
            fontSize: { xs: "12px", sm: "15px", md: "15px" },
            width: { xs: "80px", sm: "120px", md: "100px" },
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const rows = [
    { id: 1, subjectName: "Purposive Communication", subjectcode: "PCM-101" },
    {
      id: 2,
      subjectName: "Mathematics in the Modern World",
      subjectcode: "MATH-102",
    },
    { id: 3, subjectName: "Understanding the Self", subjectcode: "UTS-103" },
  ];

  return (
    <Box
      sx={{
        backgroundColor: "#BAC5D1",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
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
          height: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", md: "flex-end" },
            width: "100%",
            marginTop: "20px",
            marginBottom: "30px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
            }}
          >
            <Typography
              sx={{
                color: "#242c54",
                fontWeight: "bold",
                fontSize: { xs: "16px", md: "35px" },
                marginLeft: { xs: 0, md: "50px" },
              }}
            >
              Configure Instructors
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                marginLeft: { xs: 0, md: "50px" },
              }}
            >
              Manage the Instructors of the section <b>{sectionName}</b>
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              flexWrap: "wrap",
              maxWidth: { xs: "300px", md: "500px" },
              gap: 2,
              marginTop: { xs: "10px", md: "0" },
              marginRight: { xs: "20px", sm: "30px", md: "50px" },
              marginLeft: { xs: "20px", sm: "30px", md: "50px" },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#245442",
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            marginLeft: { xs: "20px", md: "50px" },
            marginRight: { xs: "20px", md: "50px" },
            height: { xs: "600px", md: "500px" },
          }}
        >
          <Table
            rows={rows}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            minHeight: "300px",
            marginTop: { xs: -4, md: "40px" },
            marginBottom: { xs: "20px", md: 0 },
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 3, md: 10 },
          }}
        >
          <Box
            sx={{
              backgroundColor: "#7B81A3",
              minHeight: { xs: "140px", md: "180px" },
              width: { xs: "300px", md: "400px" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "20px",
            }}
          >
            <Typography
              sx={{
                color: "#E8EDF2",
                fontWeight: "bold",
                fontSize: { xs: "16px", md: "20px" },
                whiteSpace: "normal",
              }}
            >
              Choose the curriculum that this section shall follow
            </Typography>

            <Autocomplete
              options={curriculumList}
              renderInput={(params) => (
                <TextField {...params} label="Choose Curriculum" />
              )}
              fullWidth
              sx={{ backgroundColor: "#E8EDF2" }}
            />
          </Box>

          <Box
            sx={{
              backgroundColor: "#7B81A3",
              minHeight: { xs: "140px", md: "180px" },
              width: { xs: "300px", md: "400px" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "20px",
            }}
          >
            <Typography
              sx={{
                color: "#E8EDF2",
                fontWeight: "bold",
                fontSize: { xs: "16px", md: "20px" },
                whiteSpace: "normal",
              }}
            >
              Choose an advisor for this Section <i>{sectionName}</i>
            </Typography>

            <Autocomplete
              options={adviserList}
              renderInput={(params) => (
                <TextField {...params} label="Choose Adviser" />
              )}
              fullWidth
              sx={{ backgroundColor: "#E8EDF2" }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
