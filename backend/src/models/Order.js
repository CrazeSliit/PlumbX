const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    items: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        size: { type: String },
        quantity: { type: Number, required: true },
        image: { type: String }
    }],
    totalAmount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'on delivering', 'completed', 'cancelled'],
        default: 'pending'
    },
    // Driver details
    driver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Driver' 
    },
    driverName: { type: String },
    driverPhone: { type: String },
    driverVehicle: { type: String },
    assignedDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema); 