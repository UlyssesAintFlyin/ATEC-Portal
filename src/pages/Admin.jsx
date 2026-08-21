import React from "react";
import { styled } from '@mui/material/styles';
import { Box, Typography, ButtonBase, Grid } from "@mui/material";
import {Link} from 'react-router-dom';

const images = [
  {
    url: '/resources/system-setting-img.jpg',
    title: 'System Settings',
    width: '33%',
    link: '/admin/gradeReport',
  },
  {
    url: '/resources/grades-img.jpg',
    title: 'Students Grades',
    width: '33%',
    link: '/admin/sections',
     
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
    width: '100% !important', 
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
    width: { xs: '90%', md: '60%' },
    maxWidth: 1200,
    mx: 'auto',
  }}
>
  {/* System Management Button */}
  <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
    <ImageButton
      component={Link}
      to={images[0].link}
      focusRipple
      sx={{
        flex: 1,
        width: '100%',
        height: { xs: 150, md: 416 }, // ✅ tall on desktop, equal on mobile
        position: 'relative',
      }}
    >
      <ImageSrc style={{ backgroundImage: `url(${images[0].url})` }} />
      <ImageBackdrop className="MuiImageBackdrop-root" />
      <Box sx={{ position: 'absolute', inset: 0, p: 1.5, color: '#fff' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>01</Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{images[0].title}</Typography>
      </Box>
    </ImageButton>
  </Grid>

  {/* Grades & Evaluation Button */}
  <Grid item xs={12} md={4}>
    <Grid container spacing={2} direction="column">
      {images.slice(1, 3).map((image, idx) => (
        <Grid item xs={12} key={image.title}>
          <ImageButton
            component={Link}
            to={image.link}
            focusRipple
            sx={{
              width: '100%',
              height: { xs: 150, md: 200 }, // ✅ equal height
              position: 'relative',
            }}
          >
            <ImageSrc style={{ backgroundImage: `url(${image.url})` }} />
            <ImageBackdrop className="MuiImageBackdrop-root" />
            <Box sx={{ position: 'absolute', inset: 0, p: 1.5, color: '#fff' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {`0${idx + 2}`} {/* numbering continues */}
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

  {/* Enrollment Button */}
  <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
    <ImageButton
      component={Link}
      to={images[3].link}
      focusRipple
      sx={{
        flex: 1,
        width: '100%',
        height: { xs: 150, md: 416 }, // ✅ tall on desktop
        position: 'relative',
      }}
    >
      <ImageSrc style={{ backgroundImage: `url(${images[3].url})` }} />
      <ImageBackdrop className="MuiImageBackdrop-root" />
      <Box sx={{ position: 'absolute', inset: 0, p: 1.5, color: '#fff' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>04</Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{images[3].title}</Typography>
      </Box>
    </ImageButton>
  </Grid>
</Grid>




    </>
  );
}

export default Admin    