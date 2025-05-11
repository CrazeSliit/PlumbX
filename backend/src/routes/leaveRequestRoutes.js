const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveRequestController');
const { tempAuth } = require('../middleware/tempAuth');

// Employee leave routes
router.get('/employee/leaverequests', tempAuth, leaveController.getEmployeeLeaveRequests);
router.post('/employee/leaverequests', tempAuth, leaveController.createLeaveRequest);
router.put('/employee/leaverequests/:id', tempAuth, leaveController.updateLeaveRequest);
router.delete('/employee/leaverequests/:id', tempAuth, leaveController.deleteLeaveRequest);

// Admin routes for leave management
router.get('/admin/leaverequests', tempAuth, leaveController.getAllLeaveRequests);
router.put('/admin/leaverequests/:id/status', tempAuth, leaveController.updateLeaveRequestStatus);

module.exports = router; 