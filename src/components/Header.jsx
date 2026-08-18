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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const toggleDrawer = (state) => () => {
    setOpen(state);
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
              <b>Student Portal of ATEC Technological College</b>
            </Typography>
          </Box>
        </Box>

        {location.pathname === "/" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 0.5, sm: 2, md: 3 },
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
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" });
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
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Box
              component="img"
              src="/resources/profile-placeholder.png"
              alt="Profile"
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                mb: 1,
              }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Ivan Manalad
            </Typography>
            <Typography variant="body2" color="text.secondary">
              BST - 3D2B
            </Typography>
          </Box>

          <List>
            <ListItem
              button
              component={Link}
              to="/enrollment"
              onClick={toggleDrawer(false)}
            >
              <ListItemText primary="Enrollment" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/evaluation"
              onClick={toggleDrawer(false)}
            >
              <ListItemText primary="Evaluation" />
            </ListItem>
            <ListItem
              button
              component={Link}
              to="/grades"
              onClick={toggleDrawer(false)}
            >
              <ListItemText primary="Grades" />
            </ListItem>
          </List>

          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              sx={{color: "#E8EDF2", backgroundColor: "#242C54"}}
              fullWidth
              onClick={toggleDrawer(false)}
              component={Link}
              to="/signin"
            >
              Sign-In
            </Button>
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
};
