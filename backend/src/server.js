require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const driverRoutes = require('./routes/driverRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const { connectDB, getConnectionStatus } = require('./config/database');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
connectDB();

// API Routes
app.get('/api/status', (req, res) => {
  const { isConnected, connectionState } = getConnectionStatus();
  
  let statusMessage;
  switch(connectionState) {
    case 0:
      statusMessage = 'Disconnected';
      break;
    case 1:
      statusMessage = 'Connected';
      break;
    case 2:
      statusMessage = 'Connecting';
      break;
    case 3:
      statusMessage = 'Disconnecting';
      break;
    default:
      statusMessage = 'Unknown';
  }
  
  res.json({
    status: isConnected ? 'success' : 'error',
    message: `MongoDB is ${statusMessage}`,
    connectionState
  });
});

// Import route files
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const financeRoutes = require('./routes/financeRoutes');
const leaveRequestRoutes = require('./routes/leaveRequestRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/leave', leaveRequestRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/drivers', driverRoutes);

// Import attendance controller directly for troubleshooting
const attendanceController = require('./controllers/attendanceController');
const { tempAuth } = require('./middleware/tempAuth');

// Admin attendance route
app.get('/api/admin/attendance', tempAuth, attendanceController.getAllAttendance);

// 404 handler
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.url} - Route not found`);
  res.status(404).json({ 
    status: 'error',
    message: 'API endpoint not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  // Try the default port first
  const PORT = process.env.PORT || 5000;
  
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Attendance API endpoints:`);
      console.log(`- GET /api/admin/attendance`);
    });
    
    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is already in use, trying port ${PORT + 1}`);
        // Try a different port
        const newServer = app.listen(PORT + 1, () => {
          console.log(`Server running on port ${PORT + 1}`);
        });
        
        newServer.on('error', (err) => {
          console.error(`Error starting server: ${err.message}`);
          process.exit(1);
        });
      } else {
        console.error(`Error starting server: ${err.message}`);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Don't exit the process, just log the error
  console.log('Unhandled rejection, but server will continue running');
}); 