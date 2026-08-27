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
  ListItemText,
  Box,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AdminHeader = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  function getInitials(name) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

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
            width: { xs: 28, md: 50 },
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
                fontSize: { xs: 1, md: "13px" },
                color: "#e8edf2",
                display: { xs: "none", md: "block" },
              }}
            >
              <b>Administration of ATEC Technological College</b>
            </Typography>
          </Box>
        </Box>

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
          to="/admin"
        >
          Home
        </Button>

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
          {/*add real profile photos, you'd just pass src={user.photoUrl} to the same Avatar*/}

          <List>
            <ListItem button component={Link} to="/admin/sections" onClick={toggleDrawer(false)}>
              <ListItemText primary="Student Grades" />
            </ListItem>
            <ListItem button component={Link} to="/admin/facultyEvaluation" onClick={toggleDrawer(false)}>
              <ListItemText primary="Faculty Evaluation" />
            </ListItem>
            <ListItem button component={Link} to="/admin/enrollmentList" onClick={toggleDrawer(false)}>
              <ListItemText primary="Enrollment" />
            </ListItem>
            <ListItem button component={Link} to="/admin/systemSettings" onClick={toggleDrawer(false)}>
              <ListItemText primary="Settings Configuration" />
            </ListItem>
          </List>

          <Box sx={{ p: 2, mt: "auto" }}>
            {user ? (
              <Button sx={{backgroundColor: "#542425", color: "#E8EDF2"}}
                variant="contained"
                fullWidth
                component={Link}
                to="/signin"
                onClick={() => {
                  logout();
                  toggleDrawer(false)();
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
    </AppBar>
  );
};
