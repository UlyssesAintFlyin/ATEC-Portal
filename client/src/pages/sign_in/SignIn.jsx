import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      login(data.token); // stores token + decodes user into context

      // Redirect based on role
      switch (data.user.role) {
        case "Admin":
          navigate("/admin");
          break;
        default:
          navigate("/"); // Student & Teacher land on home
      }
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

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
          <Paper
            elevation={6}
            sx={{
              p: 4,
              width: "80%",
              maxWidth: 400,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Box
              component="img"
              src="/resources/atec-word-logo.png"
              alt="ATEC"
              sx={{
                maxWidth: { xs: "200px", md: "300px" },
                height: "auto",
                display: "block",
                mx: "auto",
                mb: 2,
              }}
            />
            <Box component="form" onSubmit={handleSubmit} noValidate>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <Box sx={{ mt: 2 }}>
                <Button
                  type="sumbit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ bgcolor: "#242C54" }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </Box>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Link href="/" underline="hover">
                  Go back to Homepage
                </Link>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SignIn;
