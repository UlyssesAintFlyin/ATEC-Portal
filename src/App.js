import './App.css';
import React from 'react';
import { Box, Typography, Button } from "@mui/material";
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import CarouselComponent from './components/CarouselFolder/Carousel';


function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="app-main">
        <CarouselComponent />
        <Box className="divider-bar" />

        <Box className="about-section" id="about">
          <Box className="about-text">
            <Typography variant="h4" className="about-title">
              About ATEC Technological College
            </Typography>

            <Typography variant="body1" className="about-paragraph">
              Founded in 1998, ATEC Technological College (ATEC) is a non-profit, non-stock,
              and non-denominational institution of learning committed to providing quality education.
              The organization aims to produce globally competitive students in their chosen field of industry.
              The organization extends reasonable enrollment and other fees abiding by Philippine Government Laws
              and Regulations. ATEC provides full and/or partial scholarship, training and assessment to qualified
              and deserving students.
            </Typography>
            <Typography variant="body1" className="about-paragraph">
              ATEC offers Strands, Vocational and Technical Educational Programmes such as Science, Technology
              and Mathematics (STEM), Business and Entreprenueurship (BE), Arst, Social Sciences, and Humanities 
              (ASSH), Home Economics (HE), Information and Communication Technology (ICT), Industrial Arts 
              (IA) and other short courses such Visual Graphics and Design (VGD), Bookkeeping, Welding, 
              Massage Therapy, Beauty Care, Fork Lift, Dressmaking etc.
            </Typography>
            <Typography variant="body1" className="about-paragraph">
              Accredited by government institutions - Department of Education (DepEd),
              The Technical Education and Skills Development Authority (TESDA) and Department of Social
              Welfare and Development (DSWD), ATEC became the avenue for aspiring students to obtain
              their diploma and certificates for NCII and/or NCIII
            </Typography>
          </Box>

          <Box className="about-image-wrap">
            <Box
              component="img"
              src="/resources/images.jpg"
              alt="ATEC"
              className="about-image"
            />
          </Box>
        </Box>

        <Box className="advocate-section">
          <Typography variant="body1" className="advocate-eyebrow">
            Globally Competitive
          </Typography>
          <Typography variant="h4" className="advocate-title" >
            Be an ATEC Advocate
          </Typography>
          <Box className="advocate-text">
            <Typography variant="body1" className="advocate-paragraph">
              ATEC Technological College has always been considered as one of the well-known
              Academic-Industry in Bulacan and aims to be a school of choice in Region III. ATEC
              graduates are globally competitive and are continuously raising ATEC's Flag not only here
              in the Philippines, but also worldwide.
            </Typography>
            <Typography variant="body1" className="advocate-paragraph-last">
              Begin your journey with ATEC and be prepared to be a competitive student, globally!
            </Typography>
            <Button className="enroll-button">
              Enroll Now
            </Button>
          </Box>
        </Box>

        <Box className="studentLife-section">
          <Typography variant="h4" className="studentLife-title">
            Student Life
          </Typography>

          <Box className="studentLife-items">
            <Box className="studentLife-item">
              <Box className="studentLife-image-wrap">
                <Box component="img" src="/resources/image1.jpg" alt="ATEC" className="studentLife-image" />
              </Box>
              <Typography variant="body1" className="studentLife-item-title">
                This is the title.
              </Typography>
              <Typography variant="body1" className="studentLife-item-description">
                This is where the text shall go which shall serve as the description of the image at the side.
              </Typography>
            </Box>

            <Box className="studentLife-item">
              <Box className="studentLife-image-wrap">
                <Box component="img" src="/resources/image1.jpg" alt="ATEC" className="studentLife-image" />
              </Box>
              <Typography variant="body1" className="studentLife-item-title">
                This is the title.
              </Typography>
              <Typography variant="body1" className="studentLife-item-description">
                This is where the text shall go which shall serve as the description of the image at the side.
              </Typography>
            </Box>

            <Box className="studentLife-item">
              <Box className="studentLife-image-wrap">
                <Box component="img" src="/resources/image1.jpg" alt="ATEC" className="studentLife-image" />
              </Box>
              <Typography variant="body1" className="studentLife-item-title">
                This is the title.
              </Typography>
              <Typography variant="body1" className="studentLife-item-description">
                This is where the text shall go which shall serve as the description of the image at the side.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="program-section" id="offers">
          <Box component="img" src="/resources/image1.jpg" className="bg-image-wrapper" />
          <Box className="bg-image-overlay">
            <Typography variant="h4" className="program-title">
              Programs Offered
            </Typography>
            <Box className="program-items">
              <Box className="atec-logo-wrap">
                <Box component="img" src="/resources/ATECLogo.svg" alt="ATEC Logo" className="atec-logo" />
              </Box>
              <Box className="program-item-wrapper">
                <Box className="program-item">
                  <Typography variant="body1" className="program-item-title">
                    Academic Strand
                  </Typography>
                  <Box className="program-item-description">
                    <ul>
                      <li>Science, Technology, Engineering, and Mathematics (STEM)</li>
                      <li>Business and Entrepreneurship</li>
                      <li>Arts, Social Sciences, and Humanities</li>
                    </ul>
                  </Box>
                </Box>
                <Box className="program-item">
                  <Typography variant="body1" className="program-item-title">
                    TechPro
                  </Typography>
                  <Box className="program-item-description">
                    <ul>
                      <li>Information, Communication, and Technology (ICT)</li>
                      <li>Industrial Technology</li>
                      <li>Hospitality Tourism</li>
                    </ul>
                  </Box>
                </Box>
                <Box className="program-item">
                  <Typography variant="body1" className="program-item-title">
                    College
                  </Typography>
                  <Box className="program-item-description">
                    <ul>
                      <li>Information Technology</li>
                      <li>Hospitality Technology</li>
                      <li>Restaurant Technology</li>
                    </ul>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="pmvgo-section" id="contact">
          <Typography variant="h4" className='pmvgo-title'>
            ATEC Vision, Mission and Core values
          </Typography>
          <Box className="pmvgo-items">
            <Box className="pmvgo-item">
              <Typography variant="h4" className='pvgo-item-title'>
                Vision
              </Typography>
              <Typography variant="body1" className='pvgo-item-descrip'>
                ATEC Technological College is a non-stock and non-profit institution that provides quality
                education producing globally competitive workers through competency-based training employing
                moral values for the holistic transformation of individuals enabling them to seize the
                opportunity to manage their own business.
              </Typography>
            </Box>
            <Box className="pmvgo-item">
              <Typography variant="h4" className='pvgo-item-title'>
                Mission
              </Typography>
              <Typography variant="body1" className='pvgo-item-descrip'>
                ATEC Technological College aims to become one of the leading technological institutions
                offering industry-driven courses and producing highly skilled and morally upright
                individuals who create an impact to the society and contribute to the nation's progress.
              </Typography>
            </Box>
            <Box className="pmvgo-item-core">
              <Typography variant="h4" className='pvgo-item-title-core'>
                Core Values
              </Typography>
              <Box className='pvgo-item-descrip-core'>
                <ul>
                  <li><b>A</b> - Attitude </li>
                  <li><b>T</b> - Teamwork </li>
                  <li><b>E</b> - Emopowerment </li>
                  <li><b>C</b> - Christ Centered </li>
                </ul>
              </Box>
            </Box>
          </Box>
        </Box>

      </main>
      <Footer/>
    </div>
  );
}

export default App;