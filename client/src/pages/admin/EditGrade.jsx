import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Typography, Box, TextField, Autocomplete } from "@mui/material";
import { StandardTable } from "../../components/StandardTable";

const API_URL = process.env.REACT_APP_API_URL;

function EditGrade() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sectionName = location.state?.sectionName;
  const studentName = location.state?.studentName; 

  const [aysOptions, setAysOptions] = useState([]);
  const [selectedAYS, setSelectedAYS] = useState(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5, minWidth: 60 },
    { field: "subjectName", headerName: "Subject Name", flex: 1, minWidth: 160 },
    { field: "instructor", headerName: "Instructor", flex: 1, minWidth: 140 },
    {
      field: "grade", headerName: "Final Grade", type: "number",
      flex: 0.7, minWidth: 110, headerAlign: "center", align: "center",
    },
  ];

  useEffect(() => {
    if (!studentId) return;
    const fetchOptions = async () => {
      try {
        const res = await fetch(`${API_URL}/grades/recordList?studentId=${studentId}`);
        const data = await res.json();
        setAysOptions(data);
        if (data.length > 0) setSelectedAYS(data[0]);
      } catch (err) {
        console.error("Error loading AYS options:", err);
      }
    };
    fetchOptions();
  }, [studentId]);

  useEffect(() => {
    if (!studentId || !selectedAYS) {
      setRows([]);
      return;
    }
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/grades/studReport?studentId=${studentId}&aysId=${selectedAYS.id}`
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        setRows(data.report);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load grade report");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [studentId, selectedAYS]);

  const handleAYSChange = (newValue) => setSelectedAYS(newValue);

  const finalGrade =
    rows.length > 0
      ? (rows.reduce((sum, r) => sum + Number(r.grade), 0) / rows.length).toFixed(1)
      : null;

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
            justifyContent: "flex-start",
            gap: 1,
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <Typography
            variant="h2"
            sx={{ color: "#242c54", fontWeight: "bold", fontSize: { xs: "28px", md: "35px" }, textAlign: "center" }}
          >
            Grade Report
          </Typography>
          <Typography
            variant="h3"
            sx={{ color: "#242c54", fontSize: { xs: "20px", md: "27px" }, textAlign: "center" }}
          >
            {studentName ?? "—"}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#242c54", fontWeight: "bold", fontSize: { xs: "12", md: "17" }, textAlign: "center" }}
          >
            {sectionName}.
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
              width: "150px",
              marginLeft: { xs: "20px", md: "50px" },
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
              Final Grade
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography
                variant="h1"
                sx={{ fontWeight: "bold", fontSize: { xs: "20px", md: "30px" }, lineHeight: 1 }}
              >
                {finalGrade ?? "—"}
              </Typography>
              <Typography variant="body2">over 100</Typography>
            </Box>
          </Box>

          <Autocomplete
            options={aysOptions}
            getOptionLabel={(option) => option?.label ?? ""}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            value={selectedAYS}
            sx={{ width: { xs: "150px", md: "300px" }, marginRight: { xs: "20px", md: "50px" } }}
            onChange={(event, newValue) => handleAYSChange(newValue)}
            renderInput={(params) => <TextField {...params} label="Academic Year" />}
          />
        </Box>

        <Box
          sx={{
            marginLeft: { xs: "20px", md: "50px" },
            marginRight: { xs: "20px", md: "50px" },
            height: { xs: "600px", md: "420px" },
            minWidth: 0,
          }}
        >
          <StandardTable
            rows={rows}
            columns={columns}
            fileName="grade-report"
            printFields={["subjectName", "instructor", "grade"]}
            loading={loading}
          />
        </Box>

        <Box sx={{ display: "flex", minHeight: { xs: "100", md: "200px" } }}></Box>
      </Box>
    </Box>
  );
}

export default EditGrade;