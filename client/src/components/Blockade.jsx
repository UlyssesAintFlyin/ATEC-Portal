import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Blockade({ greeting, userName, messageDetail, statusDetail }) {
  const displayGreeting = greeting || `Pleasant day, ${userName}!`;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          maxWidth: { xs: 300, md: 500 },
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
            marginBottom: "30px",
          }}
        />
        <Typography
          variant="h3"
          color="primary"
          sx={{
            fontWeight: "bold",
            mb: 2,
            color: "#542424",
            marginBottom: "40px",
            fontSize: { xs: "1.5rem", md: "2.8rem" },
          }}
        >
          {statusDetail}
        </Typography>
        <Typography variant="h5" gutterBottom sx={{ color: "#242c54", marginBottom: "10px" }}>
          {displayGreeting}
        </Typography>

        <Typography variant="body1" gutterBottom sx={{ marginBottom: "30px" }}>
          {messageDetail}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ marginBottom: "50px" }}>
          Please return at a different time and wait for further announcements!
        </Typography>
      </Paper>
    </Box>
  );
}

export default Blockade;
