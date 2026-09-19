import React, { useState, useEffect, useRef } from "react";
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
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

import { Table } from "../../components/Table";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function SectionSubject() {
  const navigate = useNavigate();
  const { sectionName } = useParams();
  const location = useLocation();
  const sectionId = location.state?.section_ID;

  const [currentAYS_ID, setCurrentAYS_ID] = useState(null);

  const [adviserList, setAdviserList] = useState([]);
  const [currentAdviser, setCurrentAdviser] = useState(null);
  const [pendingAdviser, setPendingAdviser] = useState(null);

  const [curriculumList, setCurriculumList] = useState([]);
  const [currentCurriculum, setCurrentCurriculum] = useState(null);
  const [pendingCurriculum, setPendingCurriculum] = useState(null);

  const [teacherList, setTeacherList] = useState([]);
  const [pendingTeachers, setPendingTeachers] = useState({});
  const [currentTeachers, setCurrentTeachers] = useState({});

  const [openDialog, setOpenDialog] = useState(false);
  const [subjectId, setSubjectId] = useState(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });
  const [importErrors, setImportErrors] = useState([]);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/systemSettings`);
        const data = await res.json();
        setCurrentAYS_ID(data.enrollment_AYS_ID);
      } catch (err) {
        console.error("Error loading system settings:", err);
      }
    };
    fetchSystemSettings();
  }, []);

  useEffect(() => {
    if (!sectionId) return;
    const fetchSectionAdvisers = async () => {
      try {
        const res = await fetch(
          `${API_URL}/admin/faculty/getSectionAdvisers?sectionId=${sectionId}`,
        );
        const data = await res.json();
        setAdviserList(data.facultyOptions);
        setCurrentAdviser(data.currentAdviser);
        setPendingAdviser(data.currentAdviser);
      } catch (err) {
        console.error("Error loading advisers:", err);
      }
    };
    fetchSectionAdvisers();
  }, [sectionId]);

  useEffect(() => {
    if (!sectionId) return;
    const fetchCurriculums = async () => {
      try {
        const res = await fetch(
          `${API_URL}/admin/curriculum/listBySection?sectionId=${sectionId}`,
        );
        const data = await res.json();
        setCurriculumList(data.curriculumOptions);
        const current =
          data.curriculumOptions.find(
            (c) => c.id === data.currentCurriculumId,
          ) || null;
        setCurrentCurriculum(current);
        setPendingCurriculum(current);
      } catch (err) {
        console.error("Error loading curriculums:", err);
      }
    };
    fetchCurriculums();
  }, [sectionId]);

  const handleOpenDialog = (subjectId) => {
    setSubjectId(subjectId);
    setOpenDialog(true);
  };

  useEffect(() => {
    if (!openDialog || !subjectId) return;
    const fetchTeachers = async () => {
      try {
        const res = await fetch(
          `${API_URL}/admin/faculty/getTeachersBySubject?subjectId=${subjectId}&sectionId=${sectionId}&aysId=${currentAYS_ID}`,
        );
        const data = await res.json();
        setTeacherList(data.teacherOptions);
        setCurrentTeachers((prev) => ({
          ...prev,
          [subjectId]: data.currentTeacher,
        }));
        setPendingTeachers((prev) => ({
          ...prev,
          [subjectId]: data.currentTeacher,
        }));
      } catch (err) {
        console.error("Error loading teachers:", err);
      }
    };
    fetchTeachers();
  }, [openDialog, subjectId, sectionId, currentAYS_ID]);

  const handleAdviserChange = (newValue) => setPendingAdviser(newValue);
  const handleCurriculumChange = (newValue) => setPendingCurriculum(newValue);
  const handleTeacherChange = (subjectId, newValue) => {
    setPendingTeachers((prev) => ({
      ...prev,
      [subjectId]: newValue,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const requests = [
        fetch(`${API_URL}/admin/faculty/assignAdviser`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId,
            facultyId: pendingAdviser ? pendingAdviser.id : null,
          }),
        }),
        fetch(`${API_URL}/admin/curriculum/updateSectionCurriculum`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId,
            curriculumId: pendingCurriculum ? pendingCurriculum.id : null,
          }),
        }),
        ...Object.entries(pendingTeachers).map(([subjId, teacher]) =>
          fetch(`${API_URL}/admin/faculty/assignTeacherToSubject`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subjectId: subjId,
              sectionId,
              aysId: currentAYS_ID,
              teacherId: teacher ? teacher.id : null,
            }),
          }),
        ),
      ];

      await Promise.all(requests);

      setCurrentAdviser(pendingAdviser);
      setCurrentCurriculum(pendingCurriculum);
      setCurrentTeachers(pendingTeachers);
      setOpenDialog(false);
    } catch (err) {
      console.error("Error saving changes:", err);
    }
  };

  const handleGetTemplate = async () => {
    if (!currentCurriculum || !sectionId || !currentAYS_ID) return;
    setTemplateLoading(true);
    try {
      const params = new URLSearchParams({
        sectionId,
        curriculumId: currentCurriculum.id,
        aysId: currentAYS_ID,
      });
      const res = await fetch(`${API_URL}/grades/template?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to generate template");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grade_template_${sectionName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading template:", err);
      setSnackbar({ open: true, severity: "error", message: err.message });
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleImportClick = () => {
    if (!currentCurriculum || !sectionId || !currentAYS_ID) return;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sectionId", sectionId);
      formData.append("curriculumId", currentCurriculum.id);
      formData.append("aysId", currentAYS_ID);

      const res = await fetch(`${API_URL}/grades/import`, {
        method: "POST",
        body: formData,
      });
      const body = await res.json();

      if (res.status === 422 && Array.isArray(body.errors)) {
        setImportErrors(body.errors);
        setErrorDialogOpen(true);
        return;
      }
      if (!res.ok) {
        throw new Error(body.message || "Import failed");
      }

      setSnackbar({ open: true, severity: "success", message: body.message });
    } catch (err) {
      console.error("Error importing grades:", err);
      setSnackbar({ open: true, severity: "error", message: err.message });
    } finally {
      setImporting(false);
    }
  };

  const gradesDisabled = !pendingCurriculum;

  const columns = [
    { field: "subject", headerName: "Subject Name", flex: 1, minWidth: 150 },
    {
      field: "subject_code",
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
          sx={{ fontSize: "15px", width: "100px" }}
          onClick={() => handleOpenDialog(params.row.id)}
        >
          Edit
        </Button>
      ),
    },
  ];

  useEffect(() => {
    if (!currentCurriculum) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/curricula/${currentCurriculum.id}`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        setRows(
          data.subjects.map((s) => ({
            id: s.subject_ID,
            subject: s.subject_Name,
            subject_code: s.subject_code,
            units: s.units,
          })),
        );
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load curriculum subjects");
      } finally {
        setLoading(false);
      }
    })();
  }, [currentCurriculum]);

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
              justifyContent: {xs:"center", md:"flex-end"},
              alignItems: "center",
              flexDirection: "row",
              flexWrap: "wrap",
              maxWidth: { xs: "300px", md: "700px" },
              gap: 2,
              marginTop: { xs: "10px", md: "0" },
              marginRight: { xs: "20px", sm: "30px", md: "50px" },
              marginLeft: { xs: "20px", sm: "30px", md: "50px" },
            }}
          >
            <Button
              variant="contained"
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#245442",
              }}
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>

            <Button
              variant="contained"
              disabled={gradesDisabled || importing}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#242C54",
              }}
              onClick={handleImportClick}
            >
              {importing ? (
                <CircularProgress size={20} sx={{ color: "#E8EDF2" }} />
              ) : (
                "Import Grades"
              )}
            </Button>
            <input
              type="file"
              accept=".xlsx"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileSelected}
            />

            <Button
              variant="contained"
              disabled={gradesDisabled || templateLoading}
              sx={{
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
                color: "#E8EDF2",
                backgroundColor: "#482454",
              }}
              onClick={handleGetTemplate}
            >
              {templateLoading ? (
                <CircularProgress size={20} sx={{ color: "#E8EDF2" }} />
              ) : (
                "Get Template"
              )}
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
              options={curriculumList || []}
              getOptionLabel={(option) => option?.name ?? ""}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              value={pendingCurriculum}
              onChange={(event, newValue) => handleCurriculumChange(newValue)}
              renderInput={(params) => <TextField {...params} />}
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
              options={adviserList || []}
              getOptionLabel={(option) => option?.name ?? ""}
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              value={pendingAdviser}
              onChange={(event, newValue) => handleAdviserChange(newValue)}
              renderInput={(params) => <TextField {...params} />}
              fullWidth
              sx={{ backgroundColor: "#E8EDF2" }}
            />
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Assign Teacher</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={teacherList || []}
            getOptionLabel={(option) => option?.name ?? ""}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            value={pendingTeachers[subjectId] || null}
            onChange={(event, newValue) => {
              handleTeacherChange(subjectId, newValue);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Choose Teacher" />
            )}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveChanges}
          >
            Save Teacher
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Import Failed — Fix These Rows</DialogTitle>
        <DialogContent>
          {importErrors.map((msg, i) => (
            <Typography key={i} variant="body2" sx={{ mb: 1 }}>
              {msg}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
