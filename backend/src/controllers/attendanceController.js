const mongoose = require('mongoose');
const Attendance = require('../models/attendanceModel');

// Create an attendance record
const createAttendance = async (req, res) => {
    try {
        const { date, status, notes } = req.body;
        
        // Use the authenticated user's ID from the tempAuth middleware
        const employeeId = req.user._id;

        // Format the date to exclude time part for proper uniqueness check
        const formattedDate = new Date(date);
        formattedDate.setUTCHours(0, 0, 0, 0);
        
        // Check if there's already a record for this date
        const existingRecord = await Attendance.findOne({ 
            employeeId, 
            date: { 
                $gte: formattedDate, 
                $lt: new Date(formattedDate.getTime() + 24 * 60 * 60 * 1000) 
            } 
        });

        if (existingRecord) {
            return res.status(400).json({
                success: false,
                message: 'Attendance record for this date already exists'
            });
        }

        const attendance = new Attendance({
            employeeId,
            date: formattedDate,
            status,
            notes,
            checkInTime: status === 'present' ? new Date() : null
        });

        await attendance.save();

        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: attendance
        });
    } catch (error) {
        console.error('Error creating attendance record:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to mark attendance'
        });
    }
};

// Get employee's attendance records
const getEmployeeAttendance = async (req, res) => {
    try {
        // Get authenticated user's ID from tempAuth middleware
        const employeeId = req.user._id;
        
        // Extract query parameters for filtering
        const { startDate, endDate, status } = req.query;
        const query = { employeeId };
        
        // Apply date range filter if provided
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }
        
        // Apply status filter if provided
        if (status) query.status = status;

        // Find attendance records matching the query
        const attendanceRecords = await Attendance.find(query)
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: attendanceRecords.length,
            data: attendanceRecords
        });
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance records'
        });
    }
};

// Update an existing attendance record
const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, date } = req.body;
        
        // Get authenticated user's ID
        const employeeId = req.user._id;
        
        // Find the attendance record and ensure it belongs to this employee
        const attendance = await Attendance.findOne({ 
            _id: id,
            employeeId
        });
        
        if (!attendance) {
            return res.status(404).json({ 
                success: false, 
                message: 'Attendance record not found' 
            });
        }
        
        // Update the record
        if (status) attendance.status = status;
        if (notes) attendance.notes = notes;
        if (date) {
            const formattedDate = new Date(date);
            formattedDate.setUTCHours(0, 0, 0, 0);
            attendance.date = formattedDate;
        }
        
        attendance.updatedAt = new Date();
        
        // If status changed to present and there was no check-in time, set it now
        if (status === 'present' && !attendance.checkInTime) {
            attendance.checkInTime = new Date();
        }
        
        await attendance.save();
        
        res.status(200).json({
            success: true,
            message: 'Attendance record updated successfully',
            data: attendance
        });
    } catch (error) {
        console.error('Error updating attendance record:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update attendance record'
        });
    }
};

// Delete an attendance record
const deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get authenticated user's ID
        const employeeId = req.user._id;
        
        // Find and ensure it belongs to this employee
        const attendance = await Attendance.findOne({ 
            _id: id,
            employeeId
        });
        
        if (!attendance) {
            return res.status(404).json({ 
                success: false, 
                message: 'Attendance record not found' 
            });
        }
        
        await Attendance.deleteOne({ _id: id });
        
        res.status(200).json({
            success: true,
            message: 'Attendance record deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting attendance record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete attendance record'
        });
    }
};

// Admin function to get all attendance records
const getAllAttendance = async (req, res) => {
    try {
        const { date, startDate, endDate, status, employeeId } = req.query;
        const query = {};
        
        // Apply filters if provided
        if (employeeId) query.employeeId = employeeId;
        if (status) query.status = status;
        
        // Handle date filtering
        if (date) {
            // If exact date is provided, filter for just that day
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);
            
            query.date = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        } else if (startDate || endDate) {
            // Otherwise use date range if provided
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }
        
        const attendanceRecords = await Attendance.find(query)
            .sort({ date: -1 })
            .populate('employeeId', 'fullName email position department');
        
        res.status(200).json({
            success: true,
            count: attendanceRecords.length,
            data: attendanceRecords
        });
    } catch (error) {
        console.error('Error fetching all attendance records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendance records'
        });
    }
};

module.exports = {
    createAttendance,
    getEmployeeAttendance,
    updateAttendance,
    deleteAttendance,
    getAllAttendance
};