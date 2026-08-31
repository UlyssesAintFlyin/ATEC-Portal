import React, { useState, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import { Table } from "../components/Table";
import { useNavigate } from "react-router-dom";

export default function EnrolleeQueue() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/enrollment/enrollees") 
      .then((res) => res.json())
      .then((data) => setRows(data))
      .catch((err) => console.error(err));
  }, []);

  const columns = [
    { field: "enrollee", headerName: "Enrollee Name", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
  ];

  const handleRemoveSelected = () => {
    setRows(rows.filter((r) => !selectedIds.includes(r.id)));
    setSelectedIds([]);
  };

  return (
    <Box sx={{ backgroundColor: "#BAC5D1", height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ backgroundColor: "#E8EDF2", height: "100%", width: { xs: "100%", sm: "600px", md: "1200px" }, margin: "0 auto", display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "20px", marginBottom: "30px" }}>
          <Typography sx={{ color: "#242c54", fontWeight: "bold", fontSize: { xs: "22px", md: "35px" }, marginLeft: { xs: "20px", sm: "30px", md: "50px" } }}>
            Enrollee List
          </Typography>
        </Box>
        <Box sx={{ marginLeft: { xs: "20px", md: "50px" }, marginRight: { xs: "20px", md: "50px" }, height: { xs: "600px", md: "500px" } }}>
          <Table rows={rows} columns={columns} onSelectionChange={(ids) => setSelectedIds(ids)} />
        </Box>
      </Box>
    </Box>
  );
}