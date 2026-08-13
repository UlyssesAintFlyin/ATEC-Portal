import { AppBar, Toolbar, Typography, Divider } from "@mui/material";

export const Footer = () => {
  return (
    <AppBar
      position="static"
      sx={{bgcolor: "#181C33", marginTop: "auto" }}
    >
      <Toolbar
        style={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          padding: "20px",
          gap: "5px",
        }}
      >
        <div>
          <img src="/resources/ATECLogo.svg" alt="Logo" width="50" />
        </div>

        <Divider
          sx={{
            width: "100%",
            bgcolor: "#fff",
            opacity: 0.3,
            margin: "1px 0",
          }}
        />

        <Typography variant="body2" sx={{ color: "#fff" }}>
          ATEC Technological College
        </Typography>

        <Typography variant="body2" sx={{ color: "#fff" }}>
          JIH Building Cagayan Valley Rd. Sta. Rita Guiguinto Bulacan,
          Philippines (044) 306. 1404
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "#fff", marginBottom: "10px" }}
        >
          &copy; 2023 by ATEC Technological College
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
