import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  function getInitials(name) {
    if (!name) return "?";
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const handleOpenPwModal = () => {
    setPwError("");
    setPwSuccess("");
    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPwOpen(true);
  };

  const handleClosePwModal = () => {
    setPwOpen(false);
  };

  const handleSubmitPasswordChange = async () => {
    setPwError("");
    setPwSuccess("");

    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError("Please fill out all password fields.");
      return;
    }

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New password and confirm password do not match.");
      return;
    }

    try {
      // Fixed: Backticks used for template literal interpolation
      const response = await fetch(`${API_URL}/admin/changePassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || user?.student_ID || user?.faculty_ID,
          role: user?.role,
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
          confirmPassword: pwForm.confirmPassword,
        }),
      });

      // Fixed: Safe JSON parsing
      const contentType = response.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`);
      }

      setPwSuccess("Password changed successfully!");
      setTimeout(() => {
        handleClosePwModal();
      }, 1500);
    } catch (err) {
      setPwError(err.message || "Network error. Please try again.");
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "#242C54",
        backgroundImage: "linear-gradient(180deg, #242C54 25%, #171B2E 75%)",
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2 }, minWidth: 0 }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>

        <Box
          component="img"
          src="/resources/ATECLogo.svg"
          alt="Logo"
          sx={{
            width: { xs: 40, md: 50 },
            height: "auto",
          }}
        />

        <Box
          sx={{
            flexGrow: 1,
            ml: "10px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontFamily: '"Alfa Slab One", serif',
              fontSize: { xs: "1.3rem", md: "3rem" },
              fontWeight: 400,
              backgroundImage: "linear-gradient(180deg, #DBDFF1, #515880)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "0.01em",
            }}
          >
            AXIOM
          </Typography>
          <Box
            sx={{
              width: { xs: "10px", md: "200px" },
              height: "auto",
              paddingLeft: { xs: 0, md: "12px" },
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: "10px", md: "13px" },
                color: "#e8edf2",
                display: { xs: "none", md: "block" },
              }}
            >
              <b>Student Portal of ATEC Technological College</b>
            </Typography>
          </Box>
        </Box>

        {location.pathname === "/" && (
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 0, sm: 2, md: 3 },
              ml: { xs: 1, sm: 2, md: 3 },
              mr: { xs: 1, sm: 2, md: 3 },
            }}
          >
            <Button
              color="inherit"
              sx={{
                fontSize: { xs: "10px", sm: "12px", md: "15px" },
                textTransform: "none",
              }}
              onClick={() => {
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              About
            </Button>
            <Button
              color="inherit"
              sx={{
                fontSize: { xs: "10px", sm: "12px", md: "15px" },
                textTransform: "none",
              }}
              onClick={() => {
                document
                  .getElementById("offers")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Offers
            </Button>
            <Button
              color="inherit"
              sx={{
                fontSize: { xs: "10px", sm: "12px", md: "15px" },
                textTransform: "none",
              }}
              onClick={() => {
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: "smooth",
                });
              }}
            >
              Contact
            </Button>
          </Box>
        )}

        {["/grades", "/enrollment", "/evaluation"].includes(
          location.pathname,
        ) && (
          <Button
            color="inherit"
            sx={{
              fontSize: { xs: "10px", sm: "12px", md: "15px" },
              textTransform: "none",
              minWidth: "auto",
              ml: { xs: 1, sm: 2, md: 3 },
              mr: { xs: 1, sm: 2, md: 3 },
              p: 0.5,
            }}
            component={Link}
            to="/"
          >
            Home
          </Button>
        )}

        <Box
          component="img"
          src="/resources/BulsuLogo.svg"
          alt="Logo"
          sx={{
            width: { xs: 28, sm: 44, md: 50 },
            height: "auto",
          }}
        />
      </Toolbar>

      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Avatar
              sx={{
                width: 70,
                height: 70,
                mx: "auto",
                mb: 1,
                bgcolor: "#242C54",
                fontSize: "1.5rem",
              }}
            >
              {getInitials(user?.name)}
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {user ? user.name : "Guest"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user ? user.role : "Not signed in"}
            </Typography>
          </Box>

          <List>
            {!user && (
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/enrollment"
                  onClick={toggleDrawer(false)}
                >
                  <ListItemText primary="Enrollment" />
                </ListItemButton>
              </ListItem>
            )}
            {user?.role === "Student" && (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/evaluation"
                    onClick={toggleDrawer(false)}
                  >
                    <ListItemText primary="Evaluation" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    to="/grades"
                    onClick={toggleDrawer(false)}
                  >
                    <ListItemText primary="Grades" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
            {(user?.role === "Teacher" || user?.role === "Faculty") && (
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to="/evaluationFaculty"
                  onClick={toggleDrawer(false)}
                >
                  <ListItemText primary="Evaluation" />
                </ListItemButton>
              </ListItem>
            )}
            {(user?.role === "Student" ||
              user?.role === "Teacher" ||
              user?.role === "Faculty") && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setOpen(false);
                    handleOpenPwModal();
                  }}
                >
                  <ListItemText primary="Change Password" />
                </ListItemButton>
              </ListItem>
            )}
          </List>

          <Box sx={{ p: 2, mt: "auto" }}>
            {user ? (
              <Button
                sx={{ backgroundColor: "#542425", color: "#E8EDF2" }}
                variant="contained"
                fullWidth
                component={Link}
                to="/signin"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                Sign Out
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/signin"
                onClick={toggleDrawer(false)}
              >
                Sign-In
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>

      <Dialog open={pwOpen} onClose={handleClosePwModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: "#242C54", fontWeight: "bold" }}>
          Change Password
        </DialogTitle>
        <DialogContent>
          {pwError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {pwError}
            </Alert>
          )}
          {pwSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {pwSuccess}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="Current Password"
            type="password"
            name="currentPassword"
            fullWidth
            value={pwForm.currentPassword}
            onChange={handlePwChange}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            name="newPassword"
            fullWidth
            value={pwForm.newPassword}
            onChange={handlePwChange}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            fullWidth
            value={pwForm.confirmPassword}
            onChange={handlePwChange}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClosePwModal} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPasswordChange}
            variant="contained"
            sx={{ bgcolor: "#242C54", "&:hover": { bgcolor: "#171B2E" } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};