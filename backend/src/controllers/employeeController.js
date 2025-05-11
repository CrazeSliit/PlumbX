const Employee = require('../models/employeeModel');
const User = require('../models/userModel');
const Attendance = require('../models/attendanceModel');
const { createTransporter, verifyTransporter } = require('../config/emailConfig');
const nodemailer = require('nodemailer');
const LeaveRequest = require('../models/leaveRequestModel');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
exports.createEmployee = async (req, res) => {
  try {
    // Find the highest current employeeId
    const highestEmployee = await Employee.findOne().sort('-employeeId');
    const nextEmployeeId = highestEmployee ? highestEmployee.employeeId + 1 : 1;
    
    // Create employee with the next ID and role
    const employee = new Employee({
      ...req.body,
      employeeId: nextEmployeeId,
      role: 'empuser' // Set role to empuser for the employee record
    });
    
    const newEmployee = await employee.save();
    
    // Create a user account for this employee
    const userExists = await User.findOne({ email: req.body.email });
    
    if (!userExists) {
      // Create new user with employee info
      await User.create({
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
        role: 'empuser' // Use empuser role specifically as requested
      });
    }
    
    res.status(201).json(newEmployee);
  } catch (error) {
    // Check if it's a duplicate email error
    if (error.code === 11000 && error.keyPattern.email) {
      return res.status(400).json({ 
        message: 'An employee with this email already exists' 
      });
    }
    
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance records
// @route   GET /api/employee/attendance
// @access  Private
exports.getAllAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
            .populate('employeeId', 'fullName employeeId')
            .sort({ date: -1, checkIn: -1 });
        
        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance records',
            error: error.message
        });
    }
};

// @desc    Get attendance for a specific employee
// @route   GET /api/employee/attendance/:employeeId
// @access  Private
exports.getEmployeeAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ employeeId: req.params.employeeId })
            .sort({ date: -1, checkIn: -1 });
        
        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error('Error fetching employee attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employee attendance',
            error: error.message
        });
    }
};

// @desc    Record attendance
// @route   POST /api/employee/attendance
// @access  Private
exports.recordAttendance = async (req, res) => {
    try {
        const { employeeId, checkIn, checkOut, status, notes } = req.body;

        const attendance = new Attendance({
            employeeId,
            checkIn,
            checkOut,
            status,
            notes
        });

        await attendance.save();

        res.status(201).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error('Error recording attendance:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording attendance',
            error: error.message
        });
    }
};

// @desc    Get all leave requests
// @route   GET /api/employee/leave
// @access  Private
exports.getLeaveRequests = async (req, res) => {
    try {
        const leaveRequests = await LeaveRequest.find()
            .populate('employeeId', 'fullName employeeId email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: leaveRequests
        });
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave requests',
            error: error.message
        });
    }
};

// @desc    Create leave request
// @route   POST /api/employee/leave
// @access  Private
exports.createLeaveRequest = async (req, res) => {
    try {
        const { employeeId, startDate, endDate, reason, type } = req.body;

        const leaveRequest = new LeaveRequest({
            employeeId,
            startDate,
            endDate,
            reason,
            type,
            status: 'pending'
        });

        await leaveRequest.save();

        res.status(201).json({
            success: true,
            data: leaveRequest
        });
    } catch (error) {
        console.error('Error creating leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating leave request',
            error: error.message
        });
    }
};

// @desc    Update leave request status
// @route   PUT /api/employee/leave/:id
// @access  Private/Admin
exports.updateLeaveRequest = async (req, res) => {
    try {
        const { status, comments } = req.body;

        const leaveRequest = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            { 
                status,
                comments,
                updatedAt: Date.now()
            },
            { new: true }
        ).populate('employeeId', 'fullName employeeId email');

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        res.status(200).json({
            success: true,
            data: leaveRequest
        });
    } catch (error) {
        console.error('Error updating leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating leave request',
            error: error.message
        });
    }
};

// @desc    Send employee credentials
// @route   POST /api/employees/:id/send-credentials
// @access  Private/Admin
exports.sendCredentials = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const user = await User.findOne({ email: employee.email });
        if (!user) {
            return res.status(404).json({ message: 'User account not found' });
        }

        const transporter = createTransporter();
        const isVerified = await verifyTransporter(transporter);
        
        if (!isVerified) {
            return res.status(500).json({ message: 'Email server configuration error' });
        }

        const mailOptions = {
            from: 'chamudithakyt21@gmail.com',
            to: employee.email,
            subject: 'Your Employee Portal Credentials',
            html: `
                <h1>Welcome to the Employee Portal</h1>
                <p>Dear ${employee.fullName},</p>
                <p>Here are your login credentials for the Employee Portal:</p>
                <ul>
                    <li><strong>Employee ID:</strong> ${employee.employeeId}</li>
                    <li><strong>Email:</strong> ${employee.email}</li>
                    <li><strong>Password:</strong> ${user.password}</li>
                </ul>
                <p>Please login at: <a href="${process.env.FRONTEND_URL}/login">Employee Portal Login</a></p>
                <p>For security reasons, please change your password after your first login.</p>
                <p>Best regards,<br>HR Department</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Credentials sent successfully' });
    } catch (error) {
        console.error('Error sending credentials:', error);
        res.status(500).json({ message: 'Failed to send credentials' });
    }
};

// Send credentials to all employees
exports.sendAllCredentials = async (req, res) => {
    try {
        const { senderEmail, senderPassword } = req.body;

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: senderEmail,
                pass: senderPassword
            }
        });

        // Verify transporter
        await transporter.verify();
        console.log('SMTP server is ready to send messages');

        // Get all employees and their user accounts
        const employees = await Employee.find();
        const results = [];

        for (const employee of employees) {
            try {
                const user = await User.findOne({ email: employee.email });
                if (!user) {
                    results.push({
                        employeeId: employee.employeeId,
                        email: employee.email,
                        success: false,
                        error: 'User account not found'
                    });
                    continue;
                }

                const mailOptions = {
                    from: `"HR Department" <${senderEmail}>`,
                    to: employee.email,
                    subject: 'Your Employee Portal Credentials',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h1 style="color: #333; text-align: center;">Welcome to the Employee Portal</h1>
                            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <p>Dear ${employee.fullName},</p>
                                <p>Here are your login credentials for the Employee Portal:</p>
                                <ul style="list-style: none; padding: 0;">
                                    <li style="margin: 10px 0;"><strong>Employee ID:</strong> ${employee.employeeId}</li>
                                    <li style="margin: 10px 0;"><strong>Email:</strong> ${employee.email}</li>
                                    <li style="margin: 10px 0;"><strong>Password:</strong> ${user.password}</li>
                                </ul>
                                <p style="margin-top: 20px;">Please login at: <a href="http://localhost:3000/login" style="color: #007bff; text-decoration: none;">Employee Portal Login</a></p>
                                <p style="color: #dc3545; margin-top: 20px;">For security reasons, please change your password after your first login.</p>
                            </div>
                            <p style="text-align: center; color: #666;">Best regards,<br>HR Department</p>
                        </div>
                    `
                };

                const info = await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${employee.email}:`, info.response);
                
                results.push({
                    employeeId: employee.employeeId,
                    email: employee.email,
                    success: true,
                    info: info.response
                });
            } catch (error) {
                console.error(`Error sending email to ${employee.email}:`, error);
                results.push({
                    employeeId: employee.employeeId,
                    email: employee.email,
                    success: false,
                    error: error.message
                });
            }
        }

        // Count successful and failed sends
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        res.status(200).json({
            success: true,
            message: `Sent ${successful} emails successfully, ${failed} failed`,
            results
        });
    } catch (error) {
        console.error('Error in sendAllCredentials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send credentials',
            error: error.message
        });
    }
};

// Send credentials to last 2 employees
exports.sendLastTwoCredentials = async (req, res) => {
    try {
        const { senderEmail, senderPassword } = req.body;

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: senderEmail,
                pass: senderPassword
            }
        });

        // Verify transporter
        await transporter.verify();
        console.log('SMTP server is ready to send messages');

        // Get last 2 employees sorted by creation date
        const employees = await Employee.find()
            .sort({ createdAt: -1 })
            .limit(2);

        const results = [];

        for (const employee of employees) {
            try {
                const user = await User.findOne({ email: employee.email });
                if (!user) {
                    results.push({
                        employeeId: employee.employeeId,
                        email: employee.email,
                        success: false,
                        error: 'User account not found'
                    });
                    continue;
                }

                const mailOptions = {
                    from: `"HR Department" <${senderEmail}>`,
                    to: employee.email,
                    subject: 'Your Employee Portal Credentials',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h1 style="color: #333; text-align: center;">Welcome to the Employee Portal</h1>
                            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <p>Dear ${employee.fullName},</p>
                                <p>Here are your login credentials for the Employee Portal:</p>
                                <ul style="list-style: none; padding: 0;">
                                    <li style="margin: 10px 0;"><strong>Employee ID:</strong> ${employee.employeeId}</li>
                                    <li style="margin: 10px 0;"><strong>Email:</strong> ${employee.email}</li>
                                    <li style="margin: 10px 0;"><strong>Password:</strong> ${user.password}</li>
                                </ul>
                                <p style="margin-top: 20px;">Please login at: <a href="http://localhost:3000/login" style="color: #007bff; text-decoration: none;">Employee Portal Login</a></p>
                                <p style="color: #dc3545; margin-top: 20px;">For security reasons, please change your password after your first login.</p>
                            </div>
                            <p style="text-align: center; color: #666;">Best regards,<br>HR Department</p>
                        </div>
                    `
                };

                const info = await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${employee.email}:`, info.response);
                
                results.push({
                    employeeId: employee.employeeId,
                    email: employee.email,
                    success: true,
                    info: info.response
                });
            } catch (error) {
                console.error(`Error sending email to ${employee.email}:`, error);
                results.push({
                    employeeId: employee.employeeId,
                    email: employee.email,
                    success: false,
                    error: error.message
                });
            }
        }

        // Count successful and failed sends
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        res.status(200).json({
            success: true,
            message: `Sent ${successful} emails successfully, ${failed} failed`,
            results
        });
    } catch (error) {
        console.error('Error in sendLastTwoCredentials:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send credentials',
            error: error.message
        });
    }
}; 