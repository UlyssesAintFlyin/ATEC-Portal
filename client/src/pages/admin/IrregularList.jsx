import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Button,
  Autocomplete,
  TextField,
} from "@mui/material";
import { Table } from "../../components/Table";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../components/AppSnackbar";

const API_URL = process.env.REACT_APP_API_URL;

async function request(path, options) {
  const res = await fetch(`${API_URL}${path}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      body.error || body.message || `Request failed (${res.status})`,
    );
  }
  return body;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

export default function Sections() {
  const navigate = useNavigate();
  const snackbar = useSnackbar();

  const [currentAYS_ID, setCurrentAYS_ID] = useState(null);
  const [students, setStudents] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentLoad, setCurrentLoad] = useState([]);
  const [openClasses, setOpenClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    request("/admin/systemSettings")
      .then((data) => setCurrentAYS_ID(data.enrollment_AYS_ID))
      .catch((err) => snackbar.error(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStudents = useCallback(async () => {
    if (!currentAYS_ID) return;
    try {
      const data = await request(
        `/admin/irregular/students?AYS_ID=${currentAYS_ID}`,
      );
      setStudents(
        data.map((s) => ({
          id: s.student_ID,
          stud_record_ID: s.stud_record_ID,
          studentName: s.studentName,
          age: s.age,
          gender: s.gender,
          program: s.program,
          yearLevel: s.year_level || "—",
          totalUnits: Number(s.totalUnits),
        })),
      );
    } catch (err) {
      snackbar.error(err.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAYS_ID]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const loadStudentLoad = useCallback(
    async (student) => {
      if (!student || !currentAYS_ID) return;
      try {
        const data = await request(
          `/admin/irregular/${student.id}/load?AYS_ID=${currentAYS_ID}`,
        );
        setCurrentLoad(
          data.currentLoad.map((r) => ({ id: r.enrollment_subject_ID, ...r })),
        );
        setOpenClasses(data.openClasses);
      } catch (err) {
        setCurrentLoad([]);
        setOpenClasses([]);
        snackbar.error(err.message);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentAYS_ID],
  );

  const handleSelect = async (student) => {
    setSelectedStudent(student);
    setSelectedClass(null);
    await loadStudentLoad(student);
  };

  const handleAddClass = async () => {
    if (!selectedStudent || !selectedClass) return;
    try {
      await request(`/admin/irregular/${selectedStudent.id}/load`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({
          AYS_ID: currentAYS_ID,
          section_record_ID: selectedClass.section_record_ID,
          subject_ID: selectedClass.subject_ID,
        }),
      });
      snackbar.success(`${selectedClass.subject_code} added to the load`);
      setSelectedClass(null);
      await Promise.all([loadStudentLoad(selectedStudent), fetchStudents()]);
    } catch (err) {
      snackbar.error(err.message);
    }
  };

  const handleDropClass = async (row) => {
    if (
      !window.confirm(
        `Drop ${row.subject_code} (${row.section_Name}) from this load?`,
      )
    )
      return;
    try {
      await request(`/admin/irregular/load/${row.id}`, {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify({ status: "Dropped" }),
      });
      snackbar.success(`${row.subject_code} dropped`);
      await Promise.all([loadStudentLoad(selectedStudent), fetchStudents()]);
    } catch (err) {
      snackbar.error(err.message);
    }
  };

  const studentColumns = [
    {
      field: "studentName",
      headerName: "Student Name",
      flex: 1.4,
      minWidth: 160,
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      flex: 0.4,
      minWidth: 60,
    },
    { field: "gender", headerName: "Gender", flex: 0.5, minWidth: 80 },
    { field: "program", headerName: "Program", flex: 0.5, minWidth: 90 },
    { field: "yearLevel", headerName: "Year Level", flex: 0.6, minWidth: 100 },
    {
      field: "totalUnits",
      headerName: "Units",
      type: "number",
      flex: 0.4,
      minWidth: 70,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1.6,
      minWidth: 330,
      sortable: false,
      renderCell: (params) => {
        const isSelected = selectedStudent?.id === params.row.id;
        return (
          <>
            <Button
              variant="contained"
              color={isSelected ? "success" : "primary"}
              onClick={() => handleSelect(params.row)}
              sx={{ fontSize: "14px", width: "120px" }}
            >
              {isSelected ? "Selected" : "Manage Load"}
            </Button>
            <Button
              variant="contained"
              color="inherit"
              onClick={() =>
                navigate(`/admin/section/Irregular/${params.row.id}`, {
                  state: { sectionName: "Irregular" },
                })
              }
              sx={{ marginLeft: "10px", fontSize: "14px", width: "80px" }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="inherit"
              onClick={() =>
                navigate(
                  `/admin/section/Irregular/${params.row.id}/gradeReport`,
                  {
                    state: {
                      sectionName: "Irregular",
                      studentName: params.row.studentName,
                    },
                  },
                )
              }
              sx={{ marginLeft: "10px", fontSize: "14px", width: "80px" }}
            >
              View
            </Button>
          </>
        );
      },
    },
  ];

  const loadColumns = [
    { field: "subject_code", headerName: "Code", flex: 0.7, minWidth: 90 },
    { field: "subject_Name", headerName: "Subject", flex: 2, minWidth: 180 },
    { field: "section_Name", headerName: "Section", flex: 0.8, minWidth: 100 },
    {
      field: "units",
      headerName: "Units",
      type: "number",
      flex: 0.4,
      minWidth: 70,
    },
    { field: "status", headerName: "Status", flex: 0.7, minWidth: 90 },
    {
      field: "action",
      headerName: "Action",
      flex: 0.6,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => handleDropClass(params.row)}
          sx={{ fontSize: "14px", width: "80px" }}
        >
          Drop
        </Button>
      ),
    },
  ];

  const loadUnits = currentLoad.reduce(
    (sum, r) => sum + Number(r.units || 0),
    0,
  );

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
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", md: "flex-end" },
            width: "100%",
            marginTop: "20px",
            marginBottom: { xs: "10px", sm: "15px", md: "30px" },
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
              Irregular Masterlist
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                marginLeft: { xs: 0, md: "50px" },
              }}
            >
              Manage the list of Irregular students.
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
              onClick={() => navigate(-1)}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#242c54",
              }}
            >
              Back to Sections
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
          <Table
            rows={students}
            columns={studentColumns}
            disableRowSelectionOnClick
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", md: "flex-end" },
            width: "100%",
            marginTop: "20px",
            marginBottom: { xs: "10px", sm: "15px", md: "30px" },
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
              Manage Student Load
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#242c54",
                fontSize: { xs: "12px", md: "16px" },
                marginLeft: { xs: 0, md: "50px" },
              }}
            >
              {selectedStudent
                ? `${selectedStudent.studentName} — ${currentLoad.length} class(es), ${loadUnits} units. Changes save immediately.`
                : 'Select "Manage Load" on a student above.'}
            </Typography>
          </Box>
          {selectedStudent && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginTop: { xs: "10px", md: "0" },
                marginRight: { xs: "20px", sm: "30px", md: "50px" },
                marginLeft: { xs: "20px", sm: "30px", md: "50px" },
              }}
            >
              <Autocomplete
                options={openClasses}
                value={selectedClass}
                onChange={(e, value) => setSelectedClass(value)}
                groupBy={(o) => `${o.gradeLevel} — ${o.section_Name}`}
                getOptionLabel={(o) =>
                  `${o.subject_code} - ${o.subject_Name} (${o.units} units)`
                }
                isOptionEqualToValue={(o, v) =>
                  o.section_record_ID === v.section_record_ID &&
                  o.subject_ID === v.subject_ID
                }
                renderOption={(props, o) => (
                  <li {...props} key={`${o.section_record_ID}-${o.subject_ID}`}>
                    {o.subject_code} - {o.subject_Name} ({o.units} units)
                  </li>
                )}
                noOptionsText="No open classes. Check that the sections have a curriculum."
                renderInput={(params) => (
                  <TextField {...params} label="Add a class" size="small" />
                )}
                sx={{ width: { xs: 260, md: 420 }, backgroundColor: "#fff" }}
              />
              <Button
                variant="contained"
                disabled={!selectedClass}
                onClick={handleAddClass}
                sx={{
                  fontSize: { xs: "12px", sm: "14px", md: "16px" },
                  padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                  color: "#E8EDF2",
                  backgroundColor: "#245442",
                }}
              >
                Add
              </Button>
            </Box>
          )}
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
          <Table
            rows={currentLoad}
            columns={loadColumns}
            disableRowSelectionOnClick
          />
        </Box>
      </Box>
    </Box>
  );
}