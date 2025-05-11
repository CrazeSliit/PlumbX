const { sendEmployeeCredentials } = require('../services/emailService');
const Employee = require('../models/employeeModel');
const User = require('../models/userModel');

// @desc    Send employee credentials
// @route   POST /api/email/send-credentials/:id
// @access  Private/Admin
exports.sendEmployeeCredentials = async (req, res) => {
    try {
        console.log('Received request to send credentials for employee ID:', req.params.id);

        // Find employee
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            console.error('Employee not found:', req.params.id);
            return res.status(404).json({ 
                success: false,
                message: 'Employee not found',
                error: 'Employee ID is invalid or employee has been deleted'
            });
        }

        console.log('Found employee:', employee.email);

        // Find user account
        const user = await User.findOne({ email: employee.email });
        if (!user) {
            console.error('User account not found for employee:', employee.email);
            return res.status(404).json({ 
                success: false,
                message: 'User account not found',
                error: 'No user account exists for this employee'
            });
        }

        console.log('Found user account for:', employee.email);

        // Send credentials
        const result = await sendEmployeeCredentials(employee, user);
        
        if (result.success) {
            console.log('Successfully sent credentials to:', employee.email);
            res.status(200).json({ 
                success: true,
                message: 'Credentials sent successfully',
                info: result.info
            });
        } else {
            console.error('Email sending failed:', result.error);
            res.status(500).json({ 
                success: false,
                message: 'Failed to send credentials',
                error: result.error,
                details: result.details
            });
        }
    } catch (error) {
        console.error('Error in sendEmployeeCredentials controller:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to send credentials',
            error: error.message,
            details: error
        });
    }
}; 