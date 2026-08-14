import React from "react";
import { Header } from '../components/Header';
import { styled } from '@mui/material/styles';
import { Box, Typography, ButtonBase, Grid } from "@mui/material";


const images = [
  {
    url: '/resources/grades-img.jpg',
    title: 'Grading',
    width: '33%',
  },
  {
    url: '/resources/evaluation-img.jpg',
    title: 'Faculty Evaluation',
    width: '30%',
  },
  {
    url: '/resources/enrollment-img.jpg',
    title: 'Camera',
    width: '30%',
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
      <Typography 
        variant="h4" 
        align="center" 
        sx={{ mt: 2, width: '60%', fontWeight: 'bold', backgroundColor: '#4B5694', color: 'white', padding: 2, borderRadius: 1, marginX: 'auto' }}
      >
        Manage Academic Terms
      </Typography>

      <Grid 
        container 
        spacing={2} 
        sx={{ 
          marginTop: 1, 
          marginBottom: 5,
          minWidth: 300, 
          width: '60%', 
          marginX: 'auto',       
          minHeight: '75vh',      
          alignItems: 'stretch',  
          justifyContent: 'center',
        }}
      >

        <Grid item xs={6} container direction="column" spacing={2}>
          {images.slice(0, 2).map((image, idx) => (
            <Grid item key={image.title} sx={{ flex: 1 }}>
              <ImageButton
                focusRipple
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                }}
              >
                <ImageSrc style={{ backgroundImage: `url(${image.url})` }} />
                <ImageBackdrop className="MuiImageBackdrop-root" />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: 2,
                    color: '#fff',
                  }}
                >
                  <Typography  variant="h6" align="left"  sx={{ fontWeight: 'bold' }}>
                    {`0${idx + 1}`} 
                  </Typography>
                  <Typography variant="subtitle1" align="left" sx={{ fontWeight: 'bold' }}>
                    {image.title} 
                  </Typography>
                </Box>
              </ImageButton>
            </Grid>
          ))}
        </Grid>

        <Grid item xs={6} sx={{ display: 'flex' }}>
          <ImageButton
            focusRipple
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
            }}
          >
            <ImageSrc style={{ backgroundImage: `url(${images[2].url})` }} />
            <ImageBackdrop className="MuiImageBackdrop-root" />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 2,
                color: '#fff',
              }}
            >
              <Typography  variant="h6" align="left"  sx={{ fontWeight: 'bold' }}>
                03
              </Typography>
              <Typography variant="subtitle1" align="left" sx={{ fontWeight: 'bold' }}>
                {images[2].title}
              </Typography>
            </Box>
          </ImageButton>
        </Grid>
      </Grid>
    </>

  );
}
export default Admin    