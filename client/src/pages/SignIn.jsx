import React from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
} from "@mui/material";

function SignIn() {
  return (
    <Box sx={{ position: "relative", height: "100vh" }}>
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 2,
        }}
      >
        <Box
          component="img"
          src="/resources/ATECLogo.svg"
          alt="ATEC Logo"
          sx={{ width: { xs: 40, md: 50 }, height: "auto" }}
        />
        <Box
          component="img"
          src="/resources/BulsuLogo.svg"
          alt="BulSU Logo"
          sx={{ width: { xs: 40, md: 50 }, height: "auto" }}
        />
      </Box>

      <Grid container sx={{ height: "100%" }}>
        {/* Left side*/}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: "100%",
              backgroundImage: "url('/resources/signInBg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </Grid>

        {/* Right side */}
        <Grid
          item
          xs={12}
          md={6}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Paper elevation={6} sx={{ p: 4, width: "80%", maxWidth: 400 }}>
            <Box
              component="img"
              src="/resources/atec-word-logo.png"
              alt="ATEC"
              sx={{
                maxWidth: "300px",
                height: "auto",
                display: "block",
                mx: "auto", 
                mb: 2,
              }}
            />

            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
            />

            <Box sx={{ mt: 2 }}>
              <Button variant="contained" fullWidth sx={{ bgcolor: "#242C54" }}>
                Login
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Link href="/" underline="hover">
                Go back to Homepage
              </Link>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SignIn;
