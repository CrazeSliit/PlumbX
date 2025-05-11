const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    driverId: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    vehicleId: {
        type: String,
        required: true
    },
    drivingLicense: {
        type: String,
        required: true
    },
    vehicleLicense: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: '/myImages/default-driver.png'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);
