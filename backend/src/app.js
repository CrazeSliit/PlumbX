const express = require('express');
const userRoutes = require('./routes/userRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api', attendanceRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.url} - Route not found`);
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

module.exports = app; 