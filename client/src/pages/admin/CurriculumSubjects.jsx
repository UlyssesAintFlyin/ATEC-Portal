import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
} from "@mui/material";

import { EditableTable } from "../../components/EditableTable";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

export default function CurriculumSubjects() {
  const navigate = useNavigate();
  const { id } = useParams(); 

  const [curriculumName, setCurriculumName] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track selected rows from Table
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchCurriculumSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/curricula/${id}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();

      setCurriculumName(data.curriculum_Name);
      setRows(
        data.subjects.map((s) => ({
          id: s.subject_ID,
          subject: s.subject_Name,
          subject_code: s.subject_code,
          units: s.units,
        }))
      );
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load curriculum subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculumSubjects();
  }, [id]);

  const handleRemoveSelected = async () => {
    if (selectedIds.length !== 1) return;
    const subjectIdToRemove = selectedIds[0];
    try {
      const res = await fetch(
        `${API_URL}/curricula/${id}/subjects/${subjectIdToRemove}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      setSelectedIds([]);
      fetchCurriculumSubjects();
    } catch (err) {
      console.error(err);
      alert("Failed to remove subject from curriculum");
    }
  };

  const columns = [
    { field: "subject", headerName: "Subjects", flex: 1 },
    { field: "subject_code", headerName: "Code", flex: 0.5 },
    { field: "units", headerName: "Units", flex: 0.3 },
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
          backgroundImage: "linear-gradient(180deg, #E8EDF2 70%, #55596d)",
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
                textAlign: "left",
                marginLeft: { xs: "20px", sm: "30px", md: "50px" },
              }}
            >
              {curriculumName || "Curriculum Subjects"}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                textAlign: "left",
                marginLeft: { xs: "20px", sm: "30px", md: "50px" },
              }}
            >
              These are the subjects under the selected curriculum.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 2,
              marginTop: { xs: "10px", md: "0" },
              marginRight: { xs: "20px", sm: "30px", md: "50px" },
              marginLeft: { xs: "20px", sm: "30px", md: "50px" },
            }}
          >
            <Button
              variant="contained"
              onClick={() => navigate(`./addSubject`)}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#245442",
              }}
            >
              Add Sub To Curriculum
            </Button>
            <Button
              variant="contained"
              onClick={handleRemoveSelected}
              disabled={selectedIds.length !== 1}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#54242b",
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
            marginBottom: { xs: "20px", md: "50px" },
            height: { xs: "580px", md: "540px" },
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {error && (
            <Typography color="error" sx={{ marginBottom: "10px" }}>
              {error}
            </Typography>
          )}
          <EditableTable
            rows={rows}
            columns={columns}
            loading={loading}
            onSelectionModelChange={(newSelection) => setSelectedIds(newSelection)}
          />
        </Box>
      </Box>
    </Box>
  );
}