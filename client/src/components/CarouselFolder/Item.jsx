import React from "react";
import { Paper, Button, Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

function Item(props) {
  return (
    <Paper
      sx={{
        height: { xs: 300, sm: 500, md: 600 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {props.item.image && (
        <img
          src={props.item.image}
          alt={props.item.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      )}

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: { xs: "90%", md: "40%" },
          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          width: "70%",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#fff",
          textAlign: "center",
          textShadow: "0px 2px 4px rgba(0,0,0,0.6)",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: 13, sm: 20, md: 24 },
            color: "#fff",
            fontWeight: "bold",
            marginBottom: 1,
          }}
        >
          {props.item.name}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#fff",
            fontSize: { xs: 9, sm: 14, md: 16 },
            marginBottom: 1,
          }}
        >
          {props.item.description}
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#242C54",
            color: "#fff",
            "&:hover": { backgroundColor: "#474f78" },
            fontSize: { xs: "10px", sm: "12px", md: "14px" }, 
            padding: { xs: "4px 8px", sm: "6px 12px", md: "8px 16px" },
          }}
          component={Link}
          to="/enrollment"
        >
          Enroll Now!
        </Button>
      </Box>
    </Paper>
  );
}

export default Item;
