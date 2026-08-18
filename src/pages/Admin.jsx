import React from "react";
import { Header } from '../components/Header';
import { styled } from '@mui/material/styles';
import { Box, Typography, ButtonBase, Grid } from "@mui/material";
import {Link} from 'react-router-dom';

const images = [
  {
    url: '/resources/grades-img.jpg',
    title: 'Configure Academic Year',
    width: '33%',
    link: '/admin/gradeReport',
  },
  {
    url: '/resources/grades-img.jpg',
    title: 'Grading',
    width: '33%',
    link: '/admin/gradeReport',
     
  },
  {
    url: '/resources/grades-img.jpg',
    title: 'Configure Subjects',
    width: '33%',
    link: '/admin/gradeReport',
  },
  {
    url: '/resources/evaluation-img.jpg',
    title: 'Faculty Evaluation',
    width: '30%',
    link: '/admin/facultyEvaluation',
  },
  {
    url: '/resources/enrollment-img.jpg',
    title: 'Enrollment',
    width: '30%',
    link: '/admin/enrollmentList',
  },
];

const ImageButton = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  height: 250,
  [theme.breakpoints.down('sm')]: {
    width: '100% !important', // Overrides inline-style
    height: 100,
  },
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    }
  },
}));

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center 40%',
});

const Image = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
}));

const ImageBackdrop = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: 'rgba(75, 86, 148, 0.5)', 
  transition: 'opacity 0.3s ease',
})

const Overlay = styled('span')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  color: '#fff',
}));


function Admin() {
  return (
    <>

  <Grid
    container
    spacing={2}
    sx={{
      mt: 2,
      mb: 4,
      width: { xs: '90%', md: '75%' },
      maxWidth: 1200,
      mx: 'auto',
    }}
  >
    {/* Left side: 2x2 grid */}
    <Grid item xs={12} md={8}>
      <Grid container spacing={2}>
        {images.slice(0, 4).map((image, idx) => (
          <Grid item xs={12} md={6} key={image.title}>
            <ImageButton
              component={Link}
              to={image.link}
              focusRipple
              style={{
                width: '100%',
                height: 200,   // ✅ fixed equal height
                position: 'relative',
              }}
            >
              <ImageSrc style={{ backgroundImage: `url(${image.url})` }} />
              <ImageBackdrop className="MuiImageBackdrop-root" />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 1.5,
                  color: '#fff',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {`0${idx + 1}`}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {image.title}
                </Typography>
              </Box>
            </ImageButton>
          </Grid>
        ))}
      </Grid>
    </Grid>

    {/* Right side: tall button */}
    <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
      <ImageButton
        component={Link}
        to={images[4].link}
        focusRipple
        sx={{
          flex: 1,
          width: '100%',
          height: { xs: 200, md: 416 }, // ✅ 200px small buttons, 416px tall on desktop
          position: 'relative',
        }}
      >
        <ImageSrc style={{ backgroundImage: `url(${images[4].url})` }} />
        <ImageBackdrop className="MuiImageBackdrop-root" />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 1.5,
            color: '#fff',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            05
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {images[4].title}
          </Typography>
        </Box>
      </ImageButton>
    </Grid>
  </Grid>



    </>
  );
}

export default Admin    