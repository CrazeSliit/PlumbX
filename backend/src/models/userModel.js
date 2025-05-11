const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  role: {
    type: String,
    enum: ['admin', 'employee', 'customer', 'inventory', 'finance', 'delivery', 'empuser'],
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the matchPassword method to do a direct comparison
userSchema.methods.matchPassword = async function(enteredPassword) {
  return this.password === enteredPassword;
};

module.exports = mongoose.model('User', userSchema);