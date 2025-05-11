const Driver = require('../models/Driver');

// Generate new driver ID
const generateDriverId = async () => {
    const lastDriver = await Driver.findOne().sort({ driverId: -1 });
    if (!lastDriver) return "D001";
    const lastNumber = parseInt(lastDriver.driverId.slice(1));
    return `D${(lastNumber + 1).toString().padStart(3, '0')}`;
};

exports.getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find().sort({ createdAt: -1 });
        res.json({
            status: 'success',
            data: drivers
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.createDriver = async (req, res) => {
    try {
        const driverId = await generateDriverId();
        
        // Validate required fields
        const requiredFields = ['fullName', 'contactNumber', 'vehicleId', 'drivingLicense', 'vehicleLicense'];
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    status: 'error',
                    message: `${field} is required`
                });
            }
        }

        // Create new driver with generated ID
        const driver = new Driver({
            driverId,
            fullName: req.body.fullName,
            contactNumber: req.body.contactNumber,
            vehicleId: req.body.vehicleId,
            drivingLicense: req.body.drivingLicense,
            vehicleLicense: req.body.vehicleLicense,
            image: req.body.image || '/myImages/default-driver.png'
        });

        await driver.save();

        res.status(201).json({
            status: 'success',
            message: 'Driver created successfully',
            data: driver
        });
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Error creating driver'
        });
    }
};

exports.updateDriver = async (req, res) => {
    try {
        const driver = await Driver.findOneAndUpdate(
            { driverId: req.params.id },
            req.body,
            { new: true }
        );
        if (!driver) {
            return res.status(404).json({
                status: 'error',
                message: 'Driver not found'
            });
        }
        res.json({
            status: 'success',
            data: driver
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.deleteDriver = async (req, res) => {
    try {
        const driver = await Driver.findOneAndDelete({ driverId: req.params.id });
        if (!driver) {
            return res.status(404).json({
                status: 'error',
                message: 'Driver not found'
            });
        }
        res.json({
            status: 'success',
            message: 'Driver deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
