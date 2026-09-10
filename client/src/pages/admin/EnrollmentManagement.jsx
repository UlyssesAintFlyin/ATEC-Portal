import React, { useState, useEffect } from "react";
import { Typography, Box, Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Table } from "../../components/Table";
import { Link, useNavigate } from "react-router-dom";

export default function EnrollmentManagement() {
  const navigate = useNavigate();



  const [rows, setRows] = useState([]);


  useEffect(() => {
    fetch("http://localhost:5000/api/admin/loadEnrollees")
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch((err) => console.error(err));
  }, []);

  const columns = [
    { field: "enrollee", headerName: "Enrollee Name", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
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
  const [selectedIds, setSelectedIds] = useState([]);

  const handleRejectSelected = async () => {
    console.log("Rejecting IDs from frontend:", selectedIds); // Debug
    try {
      const response = await fetch("http://localhost:5000/api/admin/rejectEnrollees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }), // must be { ids: [...] }
      });

      if (!response.ok) throw new Error("Failed to reject enrollees");

      const result = await response.json();
      setRows((prevRows) => prevRows.filter((r) => !selectedIds.includes(r.id)));
      setSelectedIds([]);
    } catch (err) {
      console.error("Error rejecting enrollees:", err);
    }
  };






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
              onClick={() => navigate("/admin/systemSettings")}
            >
              Configure Enrollment
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
              onClick={handleRejectSelected}
            >
              Reject Selected
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            marginLeft: { xs: "20px", md: "50px" },
            marginRight: { xs: "20px", md: "50px" },
            height: { xs: "600px", md: "500px" },
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/*Table Component*/}
          <Table
            rows={rows}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            onSelectionModelChange={(newSelection) => {
              setSelectedIds(newSelection);
            }}
            selectionModel={selectedIds}
          />
        </Box>
      </Box>
    </Box>
  );
}
