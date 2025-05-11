const mongoose = require('mongoose');

// Connection state
let isConnected = false;
let connectionState = 0;

// Connect to MongoDB
const connectDB = async () => {
  if (isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  try {
    // Get connection string from environment variables (with fallback)
    const MONGODB_URI = process.env.MONGO_DB || "mongodb://localhost:27017/hardware_store";
    
    console.log('Attempting to connect to MongoDB...');
    
    // Set connection options to prevent connection closing
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      keepAlive: true,
      keepAliveInitialDelay: 300000, // 5 minutes
      family: 4 // Use IPv4, skip trying IPv6
    });

    isConnected = true;
    connectionState = mongoose.connection.readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Listen for connection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
      connectionState = mongoose.connection.readyState;
      // Try to reconnect
      setTimeout(connectDB, 5000);
    });

    mongoose.connection.on('error', (err) => {
      console.log(`MongoDB connection error: ${err}`);
      isConnected = false;
      connectionState = mongoose.connection.readyState;
      // Try to reconnect
      setTimeout(connectDB, 5000);
    });
    
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
      isConnected = true;
      connectionState = mongoose.connection.readyState;
    });
    
    // Return connection
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    isConnected = false;
    connectionState = 0;
    
    // Instead of exiting, schedule a reconnection attempt
    console.log('Scheduling reconnection attempt in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Get connection status
const getConnectionStatus = () => {
  return {
    isConnected: mongoose.connection.readyState === 1,
    connectionState: mongoose.connection.readyState
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  };
};

module.exports = { connectDB, getConnectionStatus }; 