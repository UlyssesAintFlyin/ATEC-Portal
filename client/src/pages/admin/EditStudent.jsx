import React, { useState, useEffect, useRef } from "react";
import {
  Typography,
  Box,
  Button,
  Autocomplete,
  Divider,
  TextField,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "../../components/AppSnackbar";

const API_URL = process.env.REACT_APP_API_URL;

const NAME_RE = /^[A-Za-zÀ-ÿ\s.'-]+$/;
const PH_PHONE_RE = /^(09|\+639)\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LRN_RE = /^\d{12}$/;

const calculateAge = (birthdate) => {
  if (!birthdate) return "";
  const [y, m, d] = birthdate.split("-").map(Number);
  if (!y || !m || !d) return "";
  
  const formatDateLocal = (dateStr) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  };

  const today = new Date();
  let age = today.getFullYear() - y;
  const hadBirthdayThisYear =
    today.getMonth() + 1 > m ||
    (today.getMonth() + 1 === m && today.getDate() >= d);
  if (!hadBirthdayThisYear) age--;

  return age < 0 ? "" : age;
};

const validateName = (value, label, required) => {
  const v = value.trim();
  if (!v) return required ? `${label} is required` : "";
  if (v.length < 2) return `${label} must be at least 2 characters`;
  if (v.length > 50) return `${label} must be 50 characters or fewer`;
  if (!NAME_RE.test(v))
    return `${label} may only contain letters, spaces, . ' and -`;
  return "";
};

const validatePhone = (value, label, required) => {
  const v = value.trim();
  if (!v) return required ? `${label} is required` : "";
  if (!PH_PHONE_RE.test(v)) return "Use format 09XXXXXXXXX or +639XXXXXXXXX";
  return "";
};

const validate = (s) => {
  const e = {};

  e.f_Name = validateName(s.f_Name, "First name", true);
  e.m_Name = validateName(s.m_Name, "Middle name", false);
  e.l_Name = validateName(s.l_Name, "Surname", true);

  if (!s.birthdate) {
    e.birthdate = "Birthdate is required";
  } else {
    const d = new Date(s.birthdate);
    const age = calculateAge(s.birthdate);
    if (Number.isNaN(d.getTime())) e.birthdate = "Invalid date";
    else if (d > new Date()) e.birthdate = "Birthdate cannot be in the future";
    else if (age < 10 || age > 100)
      e.birthdate = "Student must be between 10 and 100 years old";
  }

  if (!s.address.trim()) e.address = "Home address is required";
  else if (s.address.trim().length < 5)
    e.address = "Address must be at least 5 characters";

  if (!s.email.trim()) e.email = "Email address is required";
  else if (!EMAIL_RE.test(s.email.trim()))
    e.email = "Enter a valid email (e.g. name@example.com)";
  e.contact_Number = validatePhone(s.contact_Number, "Contact number", true);

  const pairs = [
    ["father_Name", "father_Contact", "Father's"],
    ["mother_Name", "mother_Contact", "Mother's"],
    ["guardian_Name", "guardian_Contact", "Guardian's"],
  ];
  let hasCompletePair = false;
  pairs.forEach(([nameKey, contactKey, label]) => {
    const hasName = s[nameKey].trim() !== "";
    const hasContact = s[contactKey].trim() !== "";

    e[nameKey] = validateName(s[nameKey], `${label} name`, false);
    e[contactKey] = validatePhone(s[contactKey], `${label} contact`, false);

    if (hasName && !hasContact && !e[contactKey])
      e[contactKey] = `${label} contact number is required`;
    if (hasContact && !hasName && !e[nameKey])
      e[nameKey] = `${label} name is required`;

    if (hasName && hasContact && !e[nameKey] && !e[contactKey])
      hasCompletePair = true;
  });
  if (!hasCompletePair) {
    pairs.forEach(([nameKey]) => {
      if (!e[nameKey]) e[nameKey] = "Provide at least one parent or guardian";
    });
  }

  if (!s.section_ID) e.section_ID = "Year level & section is required";

  if (!s.lrn.trim()) e.lrn = "LRN is required";
  else if (!LRN_RE.test(s.lrn.trim())) e.lrn = "LRN must be exactly 12 digits";

  if (!s.password) e.password = "Password is required";
  else if (s.password.length < 8)
    e.password = "Password must be at least 8 characters";

  Object.keys(e).forEach((k) => !e[k] && delete e[k]);
  return e;
};

const rowSx = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  gap: 4,
  margin: "0 20px",
};
const sectionTitleSx = {
  color: "#242C54",
  fontWeight: "bold",
  fontSize: "30px",
  ml: "20px",
};
const dividerSx = { borderColor: "#242c54" };

export default function EditStudent() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [currentAYS_ID, setCurrentAYS_ID] = useState("");
  const [sections, setSections] = useState([]);
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState({
    f_Name: "",
    m_Name: "",
    l_Name: "",
    birthdate: "",
    gender: "",
    email: "",
    age: "",
    address: "",
    contact_Number: "",
    father_Name: "",
    father_Contact: "",
    mother_Name: "",
    mother_Contact: "",
    guardian_Name: "",
    guardian_Contact: "",
    department: "",
    program: "",
    lrn: "",
    password: "",
    student_ID: "",
    section_ID: "",
  });
  const snackbar = useSnackbar();
  const snackbarRef = useRef(snackbar);
  useEffect(() => {
    snackbarRef.current = snackbar;
  }, [snackbar]);

  const errors = validate(student);
  const age = calculateAge(student.birthdate);

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/systemSettings`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        setCurrentAYS_ID(data.enrollment_AYS_ID);
      } catch (err) {
        console.error("Error loading system settings:", err);
        setCurrentAYS_ID("");
      }
    };

    fetchSystemSettings();
  }, []);

  useEffect(() => {
    if (!currentAYS_ID || !studentId) return;

    const fetchStudent = async () => {
      try {
        const res = await fetch(
          `${API_URL}/admin/students/${studentId}?AYS_ID=${currentAYS_ID}`,
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();

        setStudent({
          f_Name: data.f_Name || "",
          m_Name: data.m_Name || "",
          l_Name: data.l_Name || "",
          birthdate: formatDateLocal(data.birthdate),
          gender: data.gender || "",
          email: data.email || "",
          address: data.address || "",
          contact_Number: data.contact_Number || "",
          father_Name: data.father_Name || "",
          father_Contact: data.father_Contact || "",
          mother_Name: data.mother_Name || "",
          mother_Contact: data.mother_Contact || "",
          guardian_Name: data.guardian_Name || "",
          guardian_Contact: data.guardian_Contact || "",
          department: data.department || "",
          program: data.program || "",
          lrn: data.lrn || "",
          password: data.password || "",
          student_ID: data.student_ID || "",
          section_ID: data.section_ID || "",
        });
      } catch (err) {
        console.error("Error loading student:", err);
        snackbarRef.current.error("Failed to load student information");
      }
    };

    fetchStudent();
  }, [studentId, currentAYS_ID]);

  useEffect(() => {
    if (!student.department || !currentAYS_ID) return;

    fetch(
      `${API_URL}/admin/sections/byDepartment?department=${student.department}&AYS_ID=${currentAYS_ID}`,
    )
      .then((res) => res.json())
      .then((data) => setSections(data))
      .catch((err) => console.error("Error loading sections:", err));
  }, [student.department, currentAYS_ID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // Props shared by every TextField: value, handlers, error + helper text
  const fieldProps = (name, hint) => {
    const showError = !!(touched[name] && errors[name]);
    return {
      name,
      value: student[name],
      onChange: handleChange,
      onBlur: handleBlur,
      error: showError,
      helperText: showError ? errors[name] : hint || " ", // " " keeps layout from jumping
      fullWidth: true,
    };
  };

  const handleSave = async () => {
    // Mark every field as touched so all errors show up
    const allTouched = Object.keys(student).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {},
    );
    setTouched(allTouched);

    if (Object.keys(errors).length > 0) {
      snackbar.error("Please fix the highlighted fields before saving");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...student,
        f_Name: student.f_Name.trim(),
        m_Name: student.m_Name.trim(),
        l_Name: student.l_Name.trim(),
        email: student.email.trim(),
        address: student.address.trim(),
        lrn: student.lrn.trim(),
        age,                                 
        birthdate: formatDateLocal(student.birthdate),
        AYS_ID: currentAYS_ID,
      };

      const res = await fetch(`${API_URL}/admin/students/${studentId}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      snackbar.success("Student information saved successfully");

      // Go back to the (selected) section page that lists this student
      const targetSection = sections.find(
        (sec) => sec.section_ID === student.section_ID,
      );
      if (targetSection) {
        navigate(`/admin/sections/${targetSection.section_Name}`, {
          state: {
            gradeLevel: targetSection.gradeLevel,
            section_ID: targetSection.section_ID,
          },
        });
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error("Error saving student:", err);
      snackbar.error(err.message || "Failed to save student information");
    } finally {
      setSaving(false);
    }
  };

  const sectionError = !!(touched.section_ID && errors.section_ID);

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
          minHeight: "100%",
          width: { xs: "100%", sm: "600px", md: "1200px" },
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: 3,
          pb: 4,
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
          }}
        >
          <Typography
            sx={{
              color: "#242c54",
              fontWeight: "bold",
              fontSize: { xs: "22px", md: "35px" },
              textAlign: "center",
            }}
          >
            Student's Information
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: "#F3F9FF",
            width: "100%",
            minHeight: { xs: "auto", md: "340px" },
            borderRadius: "5px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            py: { xs: 3, md: 0 },
          }}
        >
          <Typography
            variant="h6"
            sx={{ ...sectionTitleSx, margin: "10px 20px -15px" }}
          >
            Personal Information
          </Typography>

          <Box sx={rowSx}>
            <TextField label="First Name" required {...fieldProps("f_Name")} />
            <TextField
              label="Middle Name"
              {...fieldProps("m_Name", "Optional")}
            />
            <TextField label="Surname" required {...fieldProps("l_Name")} />
          </Box>

          <Box sx={rowSx}>
            <TextField
              label="Age"
              value={age}
              InputProps={{ readOnly: true }}
              helperText="Calculated from birthdate"
              fullWidth
            />
            <TextField label="Gender" required {...fieldProps("gender")} />
            <TextField
              label="Birthdate"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: new Date().toISOString().split("T")[0] }}
              {...fieldProps("birthdate")}
            />
          </Box>

          <Box sx={{ ...rowSx, flexDirection: "row" }}>
            <TextField
              label="Home Address"
              required
              {...fieldProps("address")}
            />
          </Box>

          <Divider variant="middle" sx={dividerSx} />

          <Typography variant="h6" sx={sectionTitleSx}>
            Contact Information
          </Typography>

          <Box sx={rowSx}>
            <TextField
              label="Email Address"
              type="email"
              required
              {...fieldProps("email", "e.g. name@example.com")}
            />
            <TextField
              label="Contact Number"
              required
              inputProps={{ inputMode: "tel", maxLength: 13 }}
              {...fieldProps("contact_Number", "e.g. 09XXXXXXXXX")}
            />
          </Box>

          <Divider variant="middle" sx={dividerSx} />

          <Typography variant="h6" sx={sectionTitleSx}>
            Family Information
          </Typography>

          <Box sx={rowSx}>
            <TextField label="Father's Name" {...fieldProps("father_Name")} />
            <TextField
              label="Father's Contact Number"
              inputProps={{ inputMode: "tel", maxLength: 13 }}
              {...fieldProps("father_Contact", "e.g. 09XXXXXXXXX")}
            />
          </Box>
          <Box sx={rowSx}>
            <TextField
              label="Mother's Maiden Name"
              {...fieldProps("mother_Name")}
            />
            <TextField
              label="Mother's Contact Number"
              inputProps={{ inputMode: "tel", maxLength: 13 }}
              {...fieldProps("mother_Contact", "e.g. 09XXXXXXXXX")}
            />
          </Box>
          <Box sx={rowSx}>
            <TextField
              label="Guardian's Name"
              {...fieldProps("guardian_Name")}
            />
            <TextField
              label="Guardian's Contact Number"
              inputProps={{ inputMode: "tel", maxLength: 13 }}
              {...fieldProps("guardian_Contact", "e.g. 09XXXXXXXXX")}
            />
          </Box>

          <Divider variant="middle" sx={dividerSx} />

          <Typography variant="h6" sx={sectionTitleSx}>
            Program Information
          </Typography>

          <Box sx={rowSx}>
            <TextField
              label="Department"
              name="department"
              value={student.department}
              inputProps={{ readOnly: true }}
              fullWidth
              sx={{ flex: 1 }}
            />
            <TextField
              label="Course/Track"
              name="program"
              value={student.program}
              inputProps={{ readOnly: true }}
              fullWidth
              sx={{ flex: 1 }}
            />
            <Autocomplete
              options={sections}
              getOptionLabel={(option) =>
                `${option.gradeLevel} - ${option.section_Name}`
              }
              value={
                sections.find((sec) => sec.section_ID === student.section_ID) ||
                null
              }
              isOptionEqualToValue={(option, value) =>
                option.section_ID === value.section_ID
              }
              onChange={(e, value) => {
                setStudent((prev) => ({
                  ...prev,
                  section_ID: value ? value.section_ID : "",
                }));
                setTouched((prev) => ({ ...prev, section_ID: true }));
              }}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, section_ID: true }))
              }
              fullWidth
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Year Level & Section"
                  required
                  error={sectionError}
                  helperText={sectionError ? errors.section_ID : " "}
                  fullWidth
                />
              )}
            />
          </Box>

          <Divider variant="middle" sx={dividerSx} />

          <Typography variant="h6" sx={sectionTitleSx}>
            Account Configuration
          </Typography>
          <Box sx={{ ...rowSx, mb: "40px" }}>
            <TextField
              label="Learner's Reference Number"
              required
              inputProps={{ inputMode: "numeric", maxLength: 12 }}
              {...fieldProps("lrn", "12-digit LRN")}
            />
            <TextField
              label="Password"
              type="password"
              required
              {...fieldProps("password", "At least 8 characters")}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mr: { xs: "20px", sm: "30px", md: "85px" },
          mb: { xs: "20px", sm: "30px", md: "50px" },
        }}
      >
        <Button
          sx={{
            fontSize: { xs: "12px", sm: "15px", md: "17px" },
            color: "#E8EDF2",
            backgroundColor: "#791818",
            borderRadius: "5px",
            mr: { xs: "20px", sm: "30px", md: "50px" },
            width: { xs: "150px", sm: "200px", md: "250px" },
            "&:hover": {
              backgroundColor: "#bc4949",
            },
          }}
          onClick={() => navigate(-1)}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          sx={{
            fontSize: { xs: "12px", sm: "15px", md: "17px" },
            color: "#E8EDF2",
            backgroundColor: "#242C54",
            borderRadius: "5px",
            width: { xs: "150px", sm: "200px", md: "250px" },
            "&:hover": {
              backgroundColor: "#4f5d9e",
            },
            "&.Mui-disabled": { color: "#E8EDF2", opacity: 0.6 },
          }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
    </Box>
  );
}
