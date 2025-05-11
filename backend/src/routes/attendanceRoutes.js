const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { tempAuth } = require('../middleware/tempAuth');

// Employee attendance routes
router.post('/employee/attendance', tempAuth, attendanceController.createAttendance);
router.get('/employee/attendance', tempAuth, attendanceController.getEmployeeAttendance);
router.put('/employee/attendance/:id', tempAuth, attendanceController.updateAttendance);
router.delete('/employee/attendance/:id', tempAuth, attendanceController.deleteAttendance);

// Admin attendance routes
router.get('/admin/attendance', tempAuth, attendanceController.getAllAttendance);

module.exports = router;