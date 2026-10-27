import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Button,
  Autocomplete,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "../../components/AppSnackbar";
import { useAuth } from "../../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL;

// Helper function to safely convert ISO date strings to YYYY-MM-DD without timezone shifts
const formatDate = (rawDate) => {
  if (!rawDate) return "";

  // If already a simple YYYY-MM-DD string, return it as-is
  if (typeof rawDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    return rawDate;
  }

  // Parse ISO timestamps using local date getters
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function EditFaculty() {
  const { user } = useAuth();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    f_Name: "",
    l_Name: "",
    m_Name: "",
    birthdate: "",
    gender: "",
    email: "",
    age: "",
    address: "",
    contact_Number: "",
    position: "",
    status: "",
    faculty_ID: "",
    password: "",
    emergency_Name: "",
    emergency_Number: "",
    account_type_ID: 2,
    role: "Teacher",
  });

  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");

  const snackbar = useSnackbar();
  const navigate = useNavigate();

  const calculateAge = (birthdate) => {
    if (!birthdate) return "";
    const [y, m, d] = birthdate.split("-").map(Number);
    if (!y || !m || !d) return "";
    const today = new Date();
    let age = today.getFullYear() - y;
    const hadBirthday =
      today.getMonth() + 1 > m ||
      (today.getMonth() + 1 === m && today.getDate() >= d);
    if (!hadBirthday) age--;
    return age;
  };
  const requiredFields = {
    f_Name: "First name",
    l_Name: "Surname",
    birthdate: "Birthdate",
    gender: "Gender",
    address: "Home address",
    email: "Email address",
    contact_Number: "Contact number",
    emergency_Name: "Emergency contact's name",
    emergency_Number: "Emergency contact's number",
    position: "Position",
    status: "Status",
  };

  const [showErrors, setShowErrors] = useState(false);

  const age = calculateAge(formData.birthdate);

  const getErrors = () => {
    const errs = {};
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!String(formData[field] ?? "").trim()) {
        errs[field] = `${label} is required`;
      }
    });
    if (formData.birthdate) {
      if (age < 0) errs.birthdate = "Birthdate can't be in the future";
      else if (age < 20)
        errs.birthdate = "Faculty must be at least 20 years old";
    }
    return errs;
  };

  const errors = showErrors ? getErrors() : {};
  const fieldProps = (field) => ({
    error: Boolean(errors[field]),
    helperText: errors[field] || "",
  });

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch(`${API_URL}/faculty/getFacultyById/${id}`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();

        const accountTypeId = data.account_type_ID ?? data.account_type_id ?? 2;

        setFormData({
          f_Name: data.f_Name || "",
          l_Name: data.l_Name || "",
          m_Name: data.m_Name || "",
          birthdate: formatDate(data.birthdate),
          gender: data.gender || "",
          email: data.email || "",
          age: data.age ?? "",
          address: data.address || "",
          contact_Number: data.contact_Number || "",
          position: data.position || "",
          status: data.status || "",
          faculty_ID: data.faculty_ID || "",
          password: data.password || "",
          emergency_Name: data.emergency_Name || "",
          emergency_Number: data.emergency_Number || "",
          account_type_ID: accountTypeId,
          role: Number(accountTypeId) === 3 ? "Admin" : "Teacher",
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchFaculty();
  }, [id]);

  const handleOpenAuth = () => {
    if (Object.keys(getErrors()).length > 0) {
      setShowErrors(true);
      snackbar.warning("Please fix the highlighted fields.");
      return;
    }
    setAdminPassword("");
    setAdminPasswordError("");
    setOpenAuthDialog(true);
  };
  
  const handleConfirmSave = async () => {
    if (!adminPassword.trim()) {
      setAdminPasswordError("Admin password is required");
      return;
    }

    if (!user?.id) {
      snackbar.error("Current admin session not found.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/faculty/updateFaculty/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age,
          adminPassword,
          admin_ID: user?.id,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setAdminPasswordError("Invalid admin password.");
          return;
        }
        throw new Error(
          errBody.error || errBody.message || `Request failed: ${res.status}`
        );
      }

      setOpenAuthDialog(false);
      snackbar.success("Faculty information saved successfully");
      navigate("/admin/facultyEvaluation");
    } catch (err) {
      console.error(err);
      snackbar.error(err.message || "Failed to save faculty information");
    }
  };

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
            Faculty Member's Information
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
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              margin: "10px 20px -15px",
            }}
          >
            Personal Information
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField
              label="First Name"
              fullWidth
              value={formData.f_Name ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, f_Name: e.target.value })
              }
              {...fieldProps("f_Name")}
            />
            <TextField
              label="Middle Name"
              fullWidth
              value={formData.m_Name ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, m_Name: e.target.value })
              }
            />
            <TextField
              label="Surname"
              fullWidth
              value={formData.l_Name ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, l_Name: e.target.value })
              }
              {...fieldProps("l_Name")}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField
              label="Birthdate"
              type="date"
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: formatDate(new Date()) }}
              value={formData.birthdate ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, birthdate: e.target.value })
              }
              {...fieldProps("birthdate")}
            />
            <TextField
              label="Age"
              fullWidth
              value={age}
              InputProps={{ readOnly: true }}
              helperText="Calculated from birthdate"
            />
            <TextField
              label="Gender"
              fullWidth
              value={formData.gender ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              {...fieldProps("gender")}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField
              label="Home Address"
              fullWidth
              value={formData.address ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              {...fieldProps("address")}
            />
          </Box>

          <Divider variant="middle" sx={{ borderColor: "#242c54" }} />

          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              ml: "20px",
            }}
          >
            Contact Information
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField
              label="Email Address"
              fullWidth
              value={formData.email ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              {...fieldProps("email")}
            />
            <TextField
              label="Contact Number"
              fullWidth
              value={formData.contact_Number ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, contact_Number: e.target.value })
              }
              {...fieldProps("contact_number")}
            />
          </Box>

          <Divider variant="middle" sx={{ borderColor: "#242c54" }} />

          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              ml: "20px",
            }}
          >
            Incase of Emergency Contact Information
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
            }}
          >
            <TextField
              label="Emergency Contact's Name"
              fullWidth
              value={formData.emergency_Name ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, emergency_Name: e.target.value })
              }
              {...fieldProps("emergency_Name")}
            />
            <TextField
              label="Emergency Contact's Number"
              fullWidth
              value={formData.emergency_Number ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, emergency_Number: e.target.value })
              }
              {...fieldProps("emergency_Number")}
            />
          </Box>

          <Divider variant="middle" sx={{ borderColor: "#242c54" }} />

          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              ml: "20px",
            }}
          >
            Affiliation Status
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
              alignItems: "stretch",
            }}
          >
            <Autocomplete
              options={[
                "Teacher",
                "Academic Head",
                "Discipline Officer",
                "IT Administrator",
                "Admin",
              ]}
              fullWidth
              value={formData.position || null}
              onChange={(event, newValue) =>
                setFormData({ ...formData, position: newValue })
              }
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Position"
                  required
                  fullWidth
                  size="medium"
                  {...fieldProps("position")}
                />
              )}
            />

            <Autocomplete
              options={["Active", "Inactive", "On Leave", "Resigned"]}
              fullWidth
              value={formData.status ?? null}
              onChange={(event, newValue) =>
                setFormData({ ...formData, status: newValue ?? "" })
              }
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Status"
                  fullWidth
                  size="medium"
                  {...fieldProps("status")}
                />
              )}
            />

            <Autocomplete
              options={[
                { label: "Teacher", id: 2 },
                { label: "Admin", id: 3 },
              ]}
              fullWidth
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.label
              }
              value={
                [
                  { label: "Teacher", id: 2 },
                  { label: "Admin", id: 3 },
                ].find((opt) => opt.id === Number(formData.account_type_ID)) || null
              }
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  account_type_ID: newValue ? newValue.id : 2,
                  role: newValue ? newValue.label : "Teacher",
                });
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Role"
                  fullWidth
                  size="medium"
                  {...fieldProps("role")}
                />
              )}
            />
          </Box>

          <Divider variant="middle" sx={{ borderColor: "#242c54" }} />

          <Typography
            variant="h6"
            sx={{
              color: "#242C54",
              fontWeight: "bold",
              fontSize: "30px",
              ml: "20px",
            }}
          >
            Account Configuration
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              margin: "0 20px",
              mb: "40px",
            }}
          >
            <TextField
              label="Employee ID"
              fullWidth
              value={formData.faculty_ID ?? ""}
              inputProps={{ readOnly: true }}
            />
            <TextField
              label="Password"
              fullWidth
              type="password"
              value={formData.password ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              disabled={
                Number(formData.account_type_ID) === 3 &&
                String(formData.faculty_ID) !== String(user?.id)
              }
            />
          </Box>
        </Box>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            py: { xs: 3, md: 0 },
          }}
        >
          <Button
            sx={{
              fontSize: { xs: "12px", sm: "15px", md: "17px" },
              color: "#E8EDF2",
              backgroundColor: "#242C54",
              borderRadius: "5px",
              width: { xs: "150px", sm: "200px", md: "250px" },
              "&:hover": {
                backgroundColor: "#4f5d9e",
                transform: "scale(1.05)",
              },
            }}
            onClick={handleOpenAuth}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Dialog
        open={openAuthDialog}
        onClose={() => setOpenAuthDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#242C54" }}>
          Admin Authentication Required
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please enter your admin password to confirm saving changes.
          </Typography>
          <TextField
            autoFocus
            label="Admin Password"
            type="password"
            fullWidth
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            error={Boolean(adminPasswordError)}
            helperText={adminPasswordError}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAuthDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSave}
            variant="contained"
            sx={{ backgroundColor: "#242C54" }}
          >
            Confirm & Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}