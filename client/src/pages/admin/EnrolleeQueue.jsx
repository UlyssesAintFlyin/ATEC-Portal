import React, { useState, useEffect } from "react";
import { Typography, Box, Button } from "@mui/material";
import { Table } from "../../components/Table";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function EnrolleeQueue() {
  const navigate = useNavigate();
  const { sectionName } = useParams();
  const location = useLocation();
  const sectionId = location.state?.section_ID;

  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentAYS, setCurrentAYS] = useState(null); // { AYS_ID, AY_ID, AY_Name }

  useEffect(() => {
    const fetchCurrentAY = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/currentAcademicYear`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();

        if (!data || Object.keys(data).length === 0) {
          setCurrentAYS(null);
          setRows([]);
          return;
        }

        setCurrentAYS(data);
      } catch (err) {
        setCurrentAYS(null);
        setRows([]);
      }
    };

    fetchCurrentAY();
  }, []);
  
  const [currentAYS_ID, setCurrentAYS_ID] = useState(null);

useEffect(() => {
  const fetchSystemSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/systemSettings`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      setCurrentAYS_ID(data.enrollment_AYS_ID);
    } catch (err) {
      console.error("Error loading system settings:", err);
      setCurrentAYS_ID(null);
    }
  };

  fetchSystemSettings();
}, []);

useEffect(() => {
  const fetchValidatedEnrollees = async () => {
    try {
      const url = currentAYS_ID
        ? `${API_URL}/admin/loadValidatedEnrollees?aysId=${currentAYS_ID}&sectionId=${sectionId}`
        : `${API_URL}/admin/loadValidatedEnrollees`;
      const res = await fetch(url);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error("Error loading validated enrollees:", err);
      setRows([]);
    }
    setSelectedIds([]);
  };

  if (currentAYS_ID && sectionId) {
    fetchValidatedEnrollees();
  } else {
    setRows([]);
    setSelectedIds([]);
  }
}, [currentAYS_ID, sectionId]);


  const columns = [
    { field: "enrollee", headerName: "Enrollee Name", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
  ];

  const handleTransfer = async () => {
    if (!currentAYS_ID) return; 
    try {
      const res = await fetch(`${API_URL}/admin/sections/convertEnrollees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId,
          enrolleeIds: selectedIds,
          AYS_ID: currentAYS_ID,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRows(rows.filter((r) => !selectedIds.includes(r.id)));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error("Error transferring enrollees:", err);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#BAC5D1", height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ backgroundColor: "#E8EDF2", height: "100vh", width: { xs: "100%", sm: "600px", md: "1200px" }, margin: "0 auto", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "20px", marginBottom: "30px" }}>
          <Box>
            <Typography sx={{ color: "#242c54", fontWeight: "bold", fontSize: { xs: "22px", md: "35px" }, marginLeft: { xs: "20px", sm: "30px", md: "50px" } }}>
              Enrollee Queue
            </Typography>
            {currentAYS && (
              <Typography variant="body2" sx={{ color: "#242c54", marginLeft: { xs: "20px", sm: "30px", md: "50px" } }}>
                Academic Year: {currentAYS.AY_Name}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 2, marginRight: { xs: "20px", sm: "30px", md: "50px" } }}>
            <Button variant="contained" color="primary"
              onClick={handleTransfer} disabled={selectedIds.length === 0 || !currentAYS_ID}>
              Add Student to {sectionName}
            </Button>
          </Box>
        </Box>
        <Box sx={{ marginLeft: { xs: "20px", md: "50px" }, marginRight: { xs: "20px", md: "50px" }, height: { xs: "600px", md: "500px" }, maxWidth: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Table
            rows={rows}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            onSelectionModelChange={(newSelection) => setSelectedIds(newSelection)}
            selectionModel={selectedIds}
          />
        </Box>
      </Box>
    </Box>
  );
}