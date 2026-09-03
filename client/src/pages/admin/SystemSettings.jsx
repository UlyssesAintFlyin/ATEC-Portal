import React, { useState, useEffect } from "react";
import {
    Typography,
    Box,
    Switch,
    Autocomplete,
    TextField,
    FormControlLabel,
    Button
} from "@mui/material";
import { Table } from "../../components/Table";
import { useNavigate } from "react-router-dom";

export default function SystemSettings() {
    const navigate = useNavigate();



    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState("");

    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/admin/setSemester");
                const data = await response.json();
                setSemesters(data.semesters.map(s => s.name));
                setSelectedSemester(data.selected);
            } catch (err) {
                console.error("Error fetching semesters:", err);
            }
        };
        fetchSemesters();
    }, []);

    const [evaluationEnabled, setEvaluationEnabled] = useState(false);
    const [enrollmentEnabled, setEnrollmentEnabled] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/admin/systemSettings");
                const data = await response.json();

                // ✅ Use correct column names
                setEvaluationEnabled(data.evaluation_settings_value === 1);
                setEnrollmentEnabled(data.enrollment_settings_value === 1);
            } catch (err) {
                console.error("Error fetching settings:", err);
            }
        };
        fetchSettings();
    }, []);


    return (
        <Box sx={{ backgroundColor: "#BAC5D1", height: "100vh", display: "flex", flexDirection: "column" }}>
            <Box sx={{ backgroundColor: "#E8EDF2", height: "100%", width: { xs: "100%", sm: "600px", md: "1000px" }, margin: "0 auto", display: "flex", flexDirection: "column" }}>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "20px", marginBottom: "30px" }}>
                    <Typography sx={{ color: "#242c54", fontWeight: "bold", fontSize: { xs: "30px", md: "35px" }, marginX: ' auto' }}>
                        System Settings
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", marginTop: "10px", marginBottom: "30px" }}>
                    <Typography sx={{ color: "#242c54", fontWeight: "bold", fontSize: "25px", marginLeft: { xs: "20px", sm: "30px", md: "50px" } }}>
                        Select Semester
                    </Typography>
                    <Autocomplete
                        options={semesters}
                        value={selectedSemester}
                        onChange={async (event, newValue) => {
                            setSelectedSemester(newValue);
                            const semester_ID = newValue === "1st Semester" ? 1 : 2;

                            await fetch("http://localhost:5000/api/admin/setSemester", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ semester_ID }),
                            });
                        }}
                        sx={{
                            width: { xs: 150, sm: 250, md: 400 },
                            marginLeft: { xs: "28px", sm: "38px", md: "58px" }
                        }}
                        renderInput={(params) => (
                            <TextField {...params} size="medium" />
                        )}
                    />
                    <Typography sx={{ color: "#242c54", fontWeight: "bold", fontSize: "22px", marginLeft: { xs: "28px", sm: "38px", md: "58px" } }}>
                        Configure Evaluation
                    </Typography>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={evaluationEnabled}
                                onChange={async (e) => {
                                    const newValue = e.target.checked;
                                    setEvaluationEnabled(newValue);
                                    await fetch("http://localhost:5000/api/admin/toggleEvaluation", {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ enabled: newValue }),
                                    });
                                }}
                            />
                        }
                        label="Turn On Evaluation"
                        sx={{ color: "#242c54", fontWeight: "bold", fontSize: { xs: "9px", md: "22px" }, marginLeft: { xs: "28px", sm: "38px", md: "58px" } }}
                    />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between", marginTop: "10px", marginBottom: "30px" }}>
                    <Typography sx={{ color: "#242c54", fontWeight: "bold", fontSize: '22px', marginLeft: { xs: "28px", sm: "38px", md: "58px" } }}>
                        Configure Enrollement
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={enrollmentEnabled}
                                onChange={async (e) => {
                                    const newValue = e.target.checked;
                                    setEnrollmentEnabled(newValue);
                                    await fetch("http://localhost:5000/api/admin/toggleEnrollment", {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ enabled: newValue }),
                                    });
                                }}
                            />
                        }
                        label="Turn On Enrollment"
                        sx={{ color: "#242c54", fontWeight: "bold", fontSize: { xs: "9px", md: "22px" }, marginLeft: { xs: "28px", sm: "38px", md: "58px" } }}
                    />
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        ml: { xs: "20px", sm: "30px", md: "85px" },
                        mr: { xs: "20px", sm: "30px", md: "85px" },
                        mb: { xs: "20px", sm: "30px", md: "50px" },
                        gap: '1'
                    }}
                >
                    {/* Left button */}
                    <Button
                        sx={{
                            fontSize: { xs: "12px", sm: "15px", md: "17px" },
                            color: "#E8EDF2",
                            backgroundColor: "#242C54",
                            borderRadius: "5px",
                            height: { xs: "40px", sm: "50px", md: "60px" },
                            width: { xs: "150px", sm: "200px", md: "250px" },
                            "&:hover": {
                                backgroundColor: "#4f5d9e",
                                transform: "scale(1.05)",
                            },
                        }}
                        onClick={() => navigate(`./curriculumConfig`)}
                    >
                        Configure Curriculum
                    </Button>

                    {/* Right button */}
                    <Button
                        sx={{
                            fontSize: { xs: "12px", sm: "15px", md: "17px" },
                            color: "#E8EDF2", // light gray text
                            backgroundColor: "#242C54",
                            borderRadius: "5px",
                            height: { xs: "40px", sm: "50px", md: "60px" },
                            width: { xs: "150px", sm: "200px", md: "250px" },
                            "&:hover": {
                                backgroundColor: "#4f5d9e",
                                transform: "scale(1.05)",
                            },
                        }}
                        onClick={() => navigate(`./termConfig`)}
                    >
                        Configure A.Y. Term
                    </Button>

                    <Button
                        sx={{
                            fontSize: { xs: "12px", sm: "15px", md: "17px" },
                            color: "#E8EDF2", // light gray text
                            backgroundColor: "#242C54",
                            borderRadius: "5px",
                            height: { xs: "40px", sm: "50px", md: "60px" },
                            width: { xs: "150px", sm: "200px", md: "250px" },
                            "&:hover": {
                                backgroundColor: "#4f5d9e",
                                transform: "scale(1.05)",
                            },
                        }}
                        onClick={() => navigate(`./carouselConfig`)}
                    >
                        Configure Carousel
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
