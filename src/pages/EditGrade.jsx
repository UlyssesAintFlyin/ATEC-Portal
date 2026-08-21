
import React, { useState } from "react";
import {
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions   ,
} from "@mui/material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Table } from "../components/Table";

function EditGrade() {
    //Array for dropdown
    const choices = [
        { label: "Academic Year 2024–2026 – 1st Semester", id: 1 },
        { label: "Academic Year 2024–2026 – 2nd Semester", id: 2 },
    ];

    //Array for table column
    const columns = [
        { field: "id", headerName: "ID", flex: 0.5, minWidth: 60 },
        { field: "subjectName", headerName: "Subject Name", flex: 1, minWidth: 160 },
        { field: "instructor", headerName: "Instructor", flex: 1, minWidth: 140 },
        { field: "grade", headerName: "Final Grade", type: "number", flex: 0.7, minWidth: 110 },
    ];

    //Array for table records
    // ✔ Correct way
    const [rows, setRows] = useState([
        { id: 1, subjectName: "General Mathematics", instructor: "Carlo Dimasili", grade: 98.00 },
        { id: 2, subjectName: "English Literary", instructor: "Jhepoy Labangon", grade: 99.00 },
        { id: 3, subjectName: "Basic Calculus", instructor: "Jenny Javier", grade: 97.00 },
        { id: 4, subjectName: "Earth and Life Science", instructor: "Erving Santos", grade: 99.00 },
        { id: 5, subjectName: "Purposive Communication", instructor: "Catherine Lasos", grade: 99.00 },
    ]);

    const [open, setOpen] = useState(false);
    const [newGrade, setNewGrade] = useState({ subjectName: "", grade: ""});

    const handleAdd = () => {
        const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
        setRows([...rows, { id: nextId, ...newGrade }]);
        setOpen(false);
        setNewGrade({ subjectName: "", grade: ""}); {/*Will default value based on section track - Backend lol*/ }
    };

    // Track selected rows from Table (Supposedly)
    const [selectedIds, setSelectedIds] = useState([]);

    const handleRemoveSelected = () => {
        setRows(rows.filter((r) => !selectedIds.includes(r.id)));
        setSelectedIds([]);
    };
    return (
        <Box
            sx={{
                backgroundColor: "#BAC5D1",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
            }}
        >
            <Box
                sx={{
                    backgroundColor: "#E8EDF2",
                    height: "100%",
                    width: { xs: "100%", sm: "600px", md: "1200px" },
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                }}
            >
                <Typography
                    variant="h2"
                    sx={{
                        color: "#242c54",
                        fontWeight: "bold",
                        marginTop: "20px",
                        marginBottom: "20px",
                        fontSize: { xs: "28px", md: "35px" },
                        textAlign: "center",
                    }}
                >
                    Grade Report
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        width: "100%",
                        marginBottom: "30px",
                        gap: 2,
                    }}
                >
                    {/*Final Grade Component*/}
                    <Box
                        className="final-grade-box"
                        sx={{
                            backgroundColor: "#58629E",
                            color: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            justifyContent: "center",
                            padding: "10px",
                            borderRadius: "5px",
                            width: { xs: "100px", md: "150px" },
                            marginLeft: { xs: "20px", md: "50px" },
                        }}
                    >
                        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
                            Final Grade
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: { xs: "20px", md: "30px" },
                                    lineHeight: 1,
                                }}
                            >
                                98
                            </Typography>
                            <Typography variant="body2">over 100</Typography>
                        </Box>
                    </Box>
                    {/*Dropdwon Component*/}
                    <Autocomplete
                        disablePortal
                        options={choices}
                        sx={{
                            width: { xs: "150px", md: "300px" },
                            marginRight: { xs: "20px", md: "50px" },
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Academic Year" />
                        )}
                    />
                     <Box sx={{ display: "flex", gap: 2, mr: { xs: "20px", sm: "30px", md: "50px" },}}>
                        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                            Add Grade
                        </Button>
                    </Box>
                </Box>

                <Box
                    sx={{
                        marginLeft: { xs: "20px", md: "50px" },
                        marginRight: { xs: "20px", md: "50px" },
                        height: { xs: "600px", md: "420px" },
                        minWidth: 0,
                    }}
                >
                    {/*Table Component*/}
                    <Table rows={rows} columns={columns} />
                </Box>
                {/*Add Grade Dialog*/}
                <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogTitle>Add Grade</DialogTitle>
                    <DialogContent>
                        <Autocomplete
                            options={[
                                "General Mathematics",
                                "Enlish Literacy"
                            ]}
                            value={newGrade.subjectName}
                            onChange={(event, newValue) =>
                                setNewGrade({ ...newGrade, subjectName: newValue })
                            }
                            renderInput={(params) => (
                                <TextField {...params} margin="dense" label="Subject" fullWidth />
                            )}
                        />
                        <TextField
                            margin="dense"
                            label="Grade"
                            fullWidth value={newGrade.grade}
                            onChange={(e) => setNewGrade({ ...newGrade, grade: e.target.value })}
                        />
                    
                        
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleAdd} variant="contained">Add</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}

export default EditGrade;
