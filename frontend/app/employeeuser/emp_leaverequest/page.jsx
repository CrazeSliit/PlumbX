'use client';
import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Stack,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { 
    CalendarToday, 
    PendingActions, 
    CheckCircle, 
    Cancel,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Warning
} from '@mui/icons-material';

const EmpLeaveRequest = () => {
    const router = useRouter();
    const [leaveData, setLeaveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        leaveType: 'casual',
        reason: '',
        status: 'pending'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);

    const fetchLeaveData = async () => {
        try {
            setLoading(true);
            console.log("Fetching leave requests...");
            
            const response = await fetch('/api/leave/employee/leaverequests', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            console.log("Response status:", response.status);
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Leave data:", data);
            
            if (data.success) {
                setLeaveData(data.data || []);
            } else {
                setError(data.message || 'Failed to fetch leave data');
            }
        } catch (error) {
            console.error('Error fetching leave data:', error);
            setError(`Failed to fetch leave data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);
        
        try {
            console.log("Submitting leave request with data:", formData);
            
            const response = await fetch('/api/leave/employee/leaverequests', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            console.log("Submit response status:", response.status);
            
            const data = await response.json();
            console.log("Submit response data:", data);
            
            if (data.success) {
                setSuccess('Leave request submitted successfully');
                // Reset form
                setFormData({
                    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    leaveType: 'casual',
                    reason: '',
                    status: 'pending'
                });
                // Refresh leave data
                fetchLeaveData();
            } else {
                setError(data.message || 'Failed to submit leave request');
            }
        } catch (error) {
            console.error('Error submitting leave request:', error);
            setError(`Failed to submit leave request: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDelete = async (leaveId) => {
        try {
            console.log("Deleting leave request with ID:", leaveId);
            
            const response = await fetch(`/api/leave/employee/leaverequests/${leaveId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            console.log("Delete response status:", response.status);
            
            const data = await response.json();
            console.log("Delete response data:", data);
            
            if (data.success) {
                setSuccess('Leave request deleted successfully');
                // Refresh leave data instead of filtering locally
                fetchLeaveData();
            } else {
                setError(data.message || 'Failed to delete leave request');
            }
        } catch (error) {
            console.error('Error deleting leave request:', error);
            setError(`Failed to delete leave request: ${error.message}`);
        }
        setDeleteDialogOpen(false);
        setSelectedLeave(null);
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'approved':
                return <Chip icon={<CheckCircle />} label="Approved" color="success" size="small" />;
            case 'rejected':
                return <Chip icon={<Cancel />} label="Rejected" color="error" size="small" />;
            case 'pending':
                return <Chip icon={<PendingActions />} label="Pending" color="warning" size="small" />;
            default:
                return null;
        }
    };

    const getLeaveTypeLabel = (type) => {
        switch (type) {
            case 'casual':
                return 'Casual Leave';
            case 'sick':
                return 'Sick Leave';
            case 'annual':
                return 'Annual Leave';
            case 'unpaid':
                return 'Unpaid Leave';
            default:
                return type;
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Leave Management
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Leave Request Form */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Request Leave
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        min: new Date(Date.now() + 86400000).toISOString().split('T')[0]
                                    }}
                                    required
                                    error={new Date(formData.startDate) <= new Date()}
                                    helperText={new Date(formData.startDate) <= new Date() ? 
                                        "Start date must be after today" : ""}
                                />
                                <TextField
                                    fullWidth
                                    label="End Date"
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    required
                                    error={new Date(formData.endDate) < new Date(formData.startDate)}
                                    helperText={new Date(formData.endDate) < new Date(formData.startDate) ? 
                                        "End date must be after start date" : ""}
                                />
                                <FormControl fullWidth required>
                                    <InputLabel>Leave Type</InputLabel>
                                    <Select
                                        name="leaveType"
                                        value={formData.leaveType}
                                        onChange={handleChange}
                                        label="Leave Type"
                                    >
                                        <MenuItem value="casual">Casual Leave</MenuItem>
                                        <MenuItem value="sick">Sick Leave</MenuItem>
                                        <MenuItem value="annual">Annual Leave</MenuItem>
                                        <MenuItem value="unpaid">Unpaid Leave</MenuItem>
                                    </Select>
                                </FormControl>
                                <TextField
                                    fullWidth
                                    label="Reason"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    multiline
                                    rows={3}
                                    required
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <PendingActions />}
                                    disabled={submitting || new Date(formData.endDate) < new Date(formData.startDate)}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Leave Request'}
                                </Button>
                            </Stack>
                        </form>
                    </Paper>
                </Grid>

                {/* Leave History */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Leave History
                        </Typography>
                        {loading ? (
                            <Box display="flex" justifyContent="center" my={4}>
                                <CircularProgress />
                            </Box>
                        ) : leaveData.length === 0 ? (
                            <Alert severity="info" sx={{ my: 2 }}>
                                No leave requests found
                            </Alert>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Start Date</TableCell>
                                            <TableCell>End Date</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Reason</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {leaveData.map((record) => (
                                            <TableRow key={record._id}>
                                                <TableCell>
                                                    {new Date(record.startDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(record.endDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {getLeaveTypeLabel(record.leaveType)}
                                                </TableCell>
                                                <TableCell>
                                                    {record.reason}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusChip(record.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1}>
                                                        {record.status === 'pending' && (
                                                            <>
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => {
                                                                        setFormData({
                                                                            startDate: new Date(record.startDate).toISOString().split('T')[0],
                                                                            endDate: new Date(record.endDate).toISOString().split('T')[0],
                                                                            leaveType: record.leaveType,
                                                                            reason: record.reason,
                                                                            status: 'pending'
                                                                        });
                                                                    }}
                                                                    title="Edit"
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => {
                                                                        setSelectedLeave(record);
                                                                        setDeleteDialogOpen(true);
                                                                    }}
                                                                    title="Delete"
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Warning color="warning" />
                        <Typography>
                            Are you sure you want to delete this leave request?
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={() => handleDelete(selectedLeave?._id)} 
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EmpLeaveRequest; 