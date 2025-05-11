const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Get all employees
router.get('/', employeeController.getAllEmployees);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Create new employee
router.post('/', employeeController.createEmployee);

// Update employee
router.put('/:id', employeeController.updateEmployee);

// Delete employee
router.delete('/:id', employeeController.deleteEmployee);

// Send credentials
router.post('/:id/send-credentials', employeeController.sendCredentials);

// Manage leave requests
router.get('/leave', employeeController.getLeaveRequests);
router.post('/leave', employeeController.createLeaveRequest);
router.put('/leave/:id', employeeController.updateLeaveRequest);

// Attendance routes
router.get('/attendance', employeeController.getAllAttendance);
router.get('/attendance/:employeeId', employeeController.getEmployeeAttendance);
router.post('/attendance', employeeController.recordAttendance);

// Send credentials to all employees
router.post('/send-all-credentials', employeeController.sendAllCredentials);

// Route for sending credentials to last 2 employees
router.post('/send-last-two-credentials', employeeController.sendLastTwoCredentials);

module.exports = router; 