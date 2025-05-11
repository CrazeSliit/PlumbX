const mongoose = require('mongoose');
const LeaveRequest = require('../models/leaveRequestModel');

// Create a new leave request
const createLeaveRequest = async (req, res) => {
    try {
        const { startDate, endDate, leaveType, reason } = req.body;
        
        // Use the authenticated user's ID
        const employeeId = req.user._id;

        const leaveRequest = new LeaveRequest({
            employeeId,
            startDate,
            endDate,
            leaveType,
            reason,
            status: 'pending'
        });

        await leaveRequest.save();

        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully',
            data: leaveRequest
        });
    } catch (error) {
        console.error('Error creating leave request:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit leave request'
        });
    }
};

// Get all leave requests for a specific employee
const getEmployeeLeaveRequests = async (req, res) => {
    try {
        const employeeId = req.user._id;

        const leaveRequests = await LeaveRequest.find({ employeeId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: leaveRequests
        });
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leave requests'
        });
    }
};

// Update an existing leave request
const updateLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate, leaveType, reason } = req.body;
        
        const employeeId = req.user._id;
        
        const leaveRequest = await LeaveRequest.findOne({ 
            _id: id,
            employeeId
        });
        
        if (!leaveRequest) {
            return res.status(404).json({ 
                success: false, 
                message: 'Leave request not found' 
            });
        }
        
        if (leaveRequest.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only pending leave requests can be updated' 
            });
        }
        
        leaveRequest.startDate = startDate || leaveRequest.startDate;
        leaveRequest.endDate = endDate || leaveRequest.endDate;
        leaveRequest.leaveType = leaveType || leaveRequest.leaveType;
        leaveRequest.reason = reason || leaveRequest.reason;
        
        await leaveRequest.save();
        
        res.status(200).json({
            success: true,
            message: 'Leave request updated successfully',
            data: leaveRequest
        });
    } catch (error) {
        console.error('Error updating leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update leave request'
        });
    }
};

// Delete a leave request
const deleteLeaveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const employeeId = req.user._id;
        
        const leaveRequest = await LeaveRequest.findOne({ 
            _id: id,
            employeeId
        });
        
        if (!leaveRequest) {
            return res.status(404).json({ 
                success: false, 
                message: 'Leave request not found' 
            });
        }
        
        if (leaveRequest.status !== 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Only pending leave requests can be deleted' 
            });
        }
        
        await LeaveRequest.deleteOne({ _id: id });
        
        res.status(200).json({
            success: true,
            message: 'Leave request deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting leave request:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete leave request'
        });
    }
};

// Get all leave requests (for admin)
const getAllLeaveRequests = async (req, res) => {
    try {
        console.log('Fetching all leave requests...');
        
        const leaveRequests = await LeaveRequest.find()
            .populate({
                path: 'employeeId',
                select: 'fullName email position department',
                model: 'Employee'
            })
            .populate({
                path: 'reviewedBy',
                select: 'fullName email',
                model: 'Employee'
            })
            .sort({ createdAt: -1 });
        
        console.log('Found leave requests:', leaveRequests.length);
        
        res.status(200).json({
            success: true,
            data: leaveRequests
        });
    } catch (error) {
        console.error('Error fetching all leave requests:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch leave requests'
        });
    }
};

// Update leave request status (approve/reject)
const updateLeaveRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comments } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Status must be either approved or rejected' 
            });
        }
        
        const leaveRequest = await LeaveRequest.findById(id);
        if (!leaveRequest) {
            return res.status(404).json({ 
                success: false, 
                message: 'Leave request not found' 
            });
        }
        
        leaveRequest.status = status;
        leaveRequest.comments = comments;
        leaveRequest.reviewedBy = req.user._id;
        leaveRequest.reviewedAt = new Date();
        
        await leaveRequest.save();
        
        res.status(200).json({
            success: true,
            message: `Leave request ${status} successfully`,
            data: leaveRequest
        });
    } catch (error) {
        console.error('Error updating leave request status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update leave request status'
        });
    }
};

module.exports = {
    createLeaveRequest,
    getEmployeeLeaveRequests,
    updateLeaveRequest,
    deleteLeaveRequest,
    getAllLeaveRequests,
    updateLeaveRequestStatus
}; 