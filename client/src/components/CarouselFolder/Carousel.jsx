import React, { useEffect, useState } from "react";
import Carousel from "react-material-ui-carousel";
import { Box, Typography, CircularProgress } from "@mui/material";
import Item from "./Item";

const API_BASE = "http://localhost:5000"; // move to an env var when deploying

function CarouselComponent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCarouselPages() {
      try {
        const res = await fetch(`${API_BASE}/api/carousel`);
        if (!res.ok) throw new Error("Failed to load carousel pages");
        const data = await res.json();

        const mapped = data.map((page) => ({
          name: page.caoursel_title,
          description: page.caoursel_description,
          image: page.carousel_image ? `${API_BASE}${page.carousel_image}` : undefined,
        }));

        setItems(mapped);
      } catch (err) {
        console.error(err);
        setError("Could not load carousel content.");
      } finally {
        setLoading(false);
      }
    }

    fetchCarouselPages();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: { xs: 300, sm: 500, md: 600 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || items.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: { xs: 300, sm: 500, md: 600 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          {error || "No carousel pages have been added yet."}
        </Typography>
      </Box>
    );
  }

  return (
    <Carousel
      animation="slide"
      autoPlay={true}
      interval={4000}
      duration={900}
      stopAutoPlayOnHover={true}
      cycleNavigation={true}
      indicators={true}
      navButtonsAlwaysVisible={true}
      navButtonsProps={{
        style: {
          backgroundColor: "#242C54",
        },
      }}
      sx={{ width: "100%", height: { xs: 300, sm: 500, md: 600 } }}
    >
      {items.map((item, i) => (
        <Item key={i} item={item} />
      ))}
    </Carousel>
  );
}

export default CarouselComponent;