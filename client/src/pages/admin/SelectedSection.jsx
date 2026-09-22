import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Table } from "../../components/Table";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function SelectedSection() {
  const navigate = useNavigate();
  const { sectionName } = useParams();
  const location = useLocation();
  const gradeLevel = location.state?.gradeLevel;
  const sectionId = location.state?.section_ID; // passed from Sections.jsx
  const [rows, setRows] = useState([]);
  const [currentAYS_ID, setCurrentAYS_ID] = useState(null);
  const [openTransfer, setOpenTransfer] = useState(false);

  const [sectionOptions, setSectionOptions] = useState([]);
  const [aysOptions, setAYSOptions] = useState([]);

  const [currentSection, setCurrentSection] = useState(null);
  const [currentAYS, setCurrentAYS] = useState(null);

  const [targetSection, setTargetSection] = useState(null);
  const [targetAYS, setTargetAYS] = useState(null);

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
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `${API_URL}/admin/sections/${sectionId}/students?AYS_ID=${currentAYS_ID}`,
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        setRows(data);
      } catch (err) {
        console.error("Error loading students:", err);
        setRows([]);
      }
    };

    if (sectionId && currentAYS_ID) {
      fetchStudents();
    } else {
      setRows([]);
    }
  }, [sectionId, currentAYS_ID]);

  const columns = [
    {
      field: "studentName",
      headerName: "Student Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      flex: 0.5,
      minWidth: 80,
    },
    { field: "gender", headerName: "Gender", flex: 0.5, minWidth: 80 },
    { field: "program", headerName: "Program", flex: 0.5, minWidth: 100 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <>
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
          <Button
            variant="contained"
            color="inherit"
            onClick={() =>
              navigate(
                `/admin/section/${sectionName}/${params.row.id}/gradeReport`, {
                state: { sectionName: sectionName, studentName: params.row.studentName },
              })
            }
            sx={{
              marginLeft: "10px",
              fontSize: { xs: "12px", sm: "15px", md: "15px" },
              width: { xs: "80px", sm: "120px", md: "100px" },
            }}
          >
            View
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (!openTransfer) return;

    const loadTransferData = async () => {
      try {
        const [sectionsRes, aysRes] = await Promise.all([
          fetch(`${API_URL}/admin/sections/options`),
          fetch(`${API_URL}/admin/academicYearSemester/options`)
        ]);

        const sections = await sectionsRes.json();
        const ays = await aysRes.json();

        setSectionOptions(sections);
        setAYSOptions(ays);

        const matchedSection = sections.find(
          (s) => Number(s.section_ID) === Number(sectionId)
        );

        const matchedAYS = ays.find(
          (a) => Number(a.AYS_ID) === Number(currentAYS_ID)
        );

        setTargetSection(matchedSection || null);
        setTargetAYS(matchedAYS || null);

      } catch (err) {
        console.error(err);
      }
    };

    loadTransferData();
  }, [openTransfer, sectionId, currentAYS_ID]);



  const handleTransfer = async () => {
    try {
      await fetch(
        `${API_URL}/admin/sections/transferSection`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceSectionId: sectionId,
            sourceAYS_ID: currentAYS_ID,
            targetSectionId: targetSection.section_ID,
            targetAYS_ID: targetAYS.AYS_ID,
          }),
        }
      );

      setOpenTransfer(false);
    } catch (err) {
      console.error(err);
    }
  };
  // Adding Student Dialog State
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const handleRemoveSelected = () => {
    setRows(rows.filter((r) => !selectedIds.includes(r.id)));
    setSelectedIds([]);
  };

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
        {/* Header with Add and Remove Button */}
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
              {gradeLevel} &mdash; {sectionName}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                marginLeft: { xs: 0, md: "50px" },
              }}
            >
              Manage the students of section {sectionName}.
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
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
              onClick={() =>
                navigate(`/admin/sections/${sectionName}/addStudent`, {
                  state: { section_ID: sectionId },
                })
              }
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#245442",
              }}
            >
              Add Student
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRemoveSelected}
              disabled={selectedIds.length === 0}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#54242b",
              }}
            >
              Remove Selected
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#242c54",
              }}
              onClick={() =>
                navigate(`/admin/sections/${sectionName}/SectionSubject`, {
                  state: { section_ID: sectionId },
                })
              }
            >
              Grading
            </Button>
          </Box>
        </Box>

        {/* Table */}
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
            onSelectionModelChange={(newSelection) => {
              setSelectedIds(newSelection);
            }}
            selectionModel={selectedIds}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            width: "100%",
            minHeight: "200px",
            marginTop: { xs: -3, md: "80px" },
            marginBottom: "40px",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: "50%",
              minHeight: "120px",
              backgroundColor: "#242C54",
              justifyContent: "center",
              alignItems: "flex-start",
              borderRadius: "10px"
            }}
          >
            <Box
              sx={{
                margin: "20px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "15px", md: "25px" },
                  textAlign: "center",
                  color: "#E8EDF2",
                }}
              >
                Migrate the following selected students to a different school year or
                semester.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenTransfer(true)}
                sx={{
                  fontSize: { xs: "12px", sm: "14px", md: "16px" },
                  padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                  mt: "30px",
                  color: "#242C54",
                  backgroundColor: "#E8EDF2",
                }}
              >
                Migrate Students
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={openTransfer}
        onClose={() => setOpenTransfer(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Transfer Section Data
        </DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 1,
          }}
        >
          <Autocomplete
            options={sectionOptions}
            value={targetSection}
            onChange={(e, value) => setTargetSection(value)}
            isOptionEqualToValue={(option, value) =>
              option.section_ID === value.section_ID
            }
            getOptionLabel={(option) =>
              option?.section_Name || ""
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Section"
              />
            )}
          />

          <Autocomplete
            options={aysOptions}
            value={targetAYS}
            onChange={(e, value) => setTargetAYS(value)}
            isOptionEqualToValue={(option, value) =>
              option.AYS_ID === value.AYS_ID
            }
            getOptionLabel={(option) =>
              option
                ? `${option.AY_Name} • ${option.semester_name}`
                : ""
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Academic Year & Semester"
              />
            )}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenTransfer(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={!targetSection || !targetAYS}
            onClick={handleTransfer}
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
