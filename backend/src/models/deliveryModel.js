const mongoose = require('mongoose');

// Create a counter schema for auto-incrementing delivery IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

const deliverySchema = new mongoose.Schema({
  deliveryId: {
    type: Number,
    unique: true,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  trackingNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: String,
    address: String,
    phone: String,
    email: String
  },
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  deliveryDate: Date,
  actualDeliveryDate: Date,
  notes: String
}, {
  timestamps: true
});

// Create indexes
deliverySchema.index({ deliveryId: 1 }, { unique: true });
deliverySchema.index({ orderId: 1 }, { unique: true });
deliverySchema.index({ trackingNumber: 1 }, { unique: true });

// Pre-save middleware to auto-increment deliveryId
deliverySchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'deliveryId',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.deliveryId = counter.seq;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Delivery', deliverySchema);
