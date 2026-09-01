require('dotenv').config(); //Loads variables from .env
const express = require('express'); //web framework
const cors = require('cors'); //cross‑origin requests
const authRoutes = require('./routes/authRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes'); //imported function
const adminRoutes = require('./routes/adminRoutes');
const app = express(); //Creates the Express application instance.

app.use(cors()); // lock down `origin` when deployed to Hostinger
app.use(express.json()); //Parses incoming JSON request

app.use('/api/auth', authRoutes); //organizes api routes
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/grades', gradeRoutes);
// app.use('/api/evaluation', evaluationRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong' });
}); //Sends a 500 Internal Server Error

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AXIOM server running on port ${PORT}`);
}); //Reads the port from .env and starts the server