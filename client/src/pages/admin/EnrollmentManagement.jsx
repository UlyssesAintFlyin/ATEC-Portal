import React, { useState, useEffect } from "react";
import { Typography, Box, Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Table } from "../../components/Table";
import { Link, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function EnrollmentManagement() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAY, setSelectedAY] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  const fetchCurrentAY = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/currentAcademicYear`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
        setSelectedAY(null);
        setRows([]);
        return;
      }

      setSelectedAY({ id: data.AY_ID, AY_Name: data.AY_Name });
    } catch (err) {
      console.error(err);
      setSelectedAY(null);
      setRows([]);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/loadAcademicYear`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setAcademicYears(data); // [{ id, AY_Name }, ...]
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEnrollees = async (ayId) => {
    setLoading(true);
    try {
      const url = ayId
        ? `${API_URL}/admin/loadEnrollees?ayId=${ayId}`
        : `${API_URL}/admin/loadEnrollees`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setRows(data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load enrollees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAY();
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedAY) {
      fetchEnrollees(selectedAY.id);
    } else {
      setRows([]);
    }
    setSelectedIds([]); // clear stale selection when AY changes
  }, [selectedAY]);

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

  const handleRejectSelected = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/rejectEnrollees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) throw new Error("Failed to reject enrollees");

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
                textAlign: { xs: "center", md: "left" },
                marginLeft: { xs: "0", md: "50px" },
              }}
            >
              Enrollment Management
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
              Here is a list of all enrollment records.
            </Typography>
          </Box>
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
            height: { xs: "600px", md: "540px" },
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
