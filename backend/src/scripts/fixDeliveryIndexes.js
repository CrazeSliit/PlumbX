const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Drop the problematic index
    await mongoose.connection.collection('deliveries').dropIndex('orderNumber_1');
    console.log('Dropped orderNumber index');

    // Create new indexes
    await mongoose.connection.collection('deliveries').createIndex({ deliveryId: 1 }, { unique: true });
    await mongoose.connection.collection('deliveries').createIndex({ orderId: 1 }, { unique: true });
    await mongoose.connection.collection('deliveries').createIndex({ trackingNumber: 1 }, { unique: true });
    console.log('Created new indexes');

    console.log('Index fix completed successfully');
  } catch (error) {
    console.error('Error fixing indexes:', error);
  } finally {
    await mongoose.connection.close();
  }
}

fixIndexes(); 