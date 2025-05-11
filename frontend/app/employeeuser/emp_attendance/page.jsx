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
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress
} from '@mui/material';
import { 
    CalendarToday, 
    CheckCircle, 
    Cancel, 
    Edit as EditIcon,
    Delete as DeleteIcon,
    AccessTime,
    Refresh as RefreshIcon
} from '@mui/icons-material';

// Debug logging
const logError = (message, error) => {
    console.error(message, error);
    if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
    }
};

const EmpAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        reason: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

    const refreshAttendanceData = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Fetching attendance data...');
            const response = await fetch('/api/attendance/employee/attendance');
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error: ${response.status} - ${errorText}`);
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Attendance data received:', data);
            
            if (data.success) {
                setAttendanceData(data.data || []);
            } else {
                setDebugInfo(JSON.stringify(data, null, 2));
                throw new Error(data.message || 'Failed to fetch attendance data');
            }
        } catch (error) {
            logError('Error fetching attendance data:', error);
            setError(error.message || 'Failed to fetch attendance data');
            setDebugInfo(error.toString());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshAttendanceData();
    }, []);

    useEffect(() => {
        if (attendanceData.length > 0 && !editMode) {
            if (isDateAlreadyMarked(currentDate)) {
                setError('Attendance for today has already been marked. You can edit the existing record.');
            }
        }
    }, [attendanceData, currentDate, editMode]);

    const resetForm = () => {
        setFormData({
            date: currentDate,
            status: 'present',
            reason: ''
        });
        setEditMode(false);
        setCurrentId(null);
        setError('');
    };

    const isDateAlreadyMarked = (date) => {
        const formattedDate = new Date(date).toISOString().split('T')[0];
        return attendanceData.some(record => {
            const recordDate = new Date(record.date).toISOString().split('T')[0];
            return recordDate === formattedDate && 
                  (!editMode || (editMode && record._id !== currentId));
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!editMode && isDateAlreadyMarked(formData.date)) {
            setError('Attendance for this date has already been marked. You can edit the existing record instead.');
            return;
        }
        
        setSubmitting(true);
        
        try {
            console.log('Submitting attendance data:', formData);
            
            const apiUrl = editMode 
                ? `/api/attendance/employee/attendance/${currentId}`
                : '/api/attendance/employee/attendance';
            const method = editMode ? 'PUT' : 'POST';
            
            // Format the data according to the model requirements
            const formattedData = {
                ...formData,
                status: formData.status.charAt(0).toUpperCase() + formData.status.slice(1).toLowerCase() // Capitalize first letter
            };
            
            const body = editMode 
                ? { ...formattedData, id: currentId }
                : formattedData;
                
            const response = await fetch(apiUrl, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error: ${response.status} - ${errorText}`);
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                setSuccess(`Attendance ${editMode ? 'updated' : 'marked'} successfully`);
                resetForm();
                refreshAttendanceData();
            } else {
                setDebugInfo(JSON.stringify(data, null, 2));
                throw new Error(data.message || `Failed to ${editMode ? 'update' : 'mark'} attendance`);
            }
        } catch (error) {
            logError(`Error ${editMode ? 'updating' : 'submitting'} attendance:`, error);
            setError(error.message || `Failed to ${editMode ? 'update' : 'submit'} attendance`);
            setDebugInfo(error.toString());
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
        
        if (name === 'date') {
            setError('');
            if (!editMode && isDateAlreadyMarked(value)) {
                setError('Attendance for this date has already been marked. Please choose a different date or edit the existing record.');
            }
        }
    };

    const handleEdit = (record) => {
        setFormData({
            date: new Date(record.date).toISOString().split('T')[0],
            status: record.status,
            reason: record.notes || ''
        });
        setEditMode(true);
        setCurrentId(record._id);
        setError('');
    };

    const handleCancelEdit = () => {
        resetForm();
    };

    const handleDeleteClick = (record) => {
        setRecordToDelete(record);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!recordToDelete) return;
        
        setSubmitting(true);
        try {
            console.log('Deleting attendance record:', recordToDelete._id);
            
            const response = await fetch(`/api/attendance/employee/attendance/${recordToDelete._id}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API Error: ${response.status} - ${errorText}`);
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Delete response:', data);
            
            if (data.success) {
                setSuccess('Attendance record deleted successfully');
                refreshAttendanceData();
            } else {
                setDebugInfo(JSON.stringify(data, null, 2));
                throw new Error(data.message || 'Failed to delete attendance record');
            }
        } catch (error) {
            logError('Error deleting attendance:', error);
            setError(error.message || 'Failed to delete attendance record');
            setDebugInfo(error.toString());
        } finally {
            setSubmitting(false);
            setDeleteConfirmOpen(false);
            setRecordToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setRecordToDelete(null);
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'present':
                return <Chip 
                    icon={<CheckCircle />} 
                    label="Present"
                    color="success"
                    size="small"
                />;
            case 'absent':
                return <Chip 
                    icon={<Cancel />}
                    label="Absent" 
                    color="error"
                    size="small"
                />;
            case 'late':
                return <Chip 
                    icon={<AccessTime />} 
                    label="Late"
                    color="warning"
                    size="small"
                />;
            default:
                return <Chip 
                    label={status || 'Unknown'} 
                    size="small"
                />;
        }
    };

    const isSelectedRow = (recordId) => {
        return editMode && currentId === recordId;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Attendance Management
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                    {debugInfo && (
                        <Box mt={1} p={1} bgcolor="rgba(0,0,0,0.03)" borderRadius={1} fontSize="0.8rem" fontFamily="monospace" overflow="auto">
                            <Typography variant="caption" display="block">Debug Info:</Typography>
                            {debugInfo}
                        </Box>
                    )}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="medium" gutterBottom>
                            {editMode ? 'Edit Attendance' : 'Mark Attendance'}
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={2}>
                                {editMode ? (
                                    <TextField
                                        label="Date"
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        required
                                    />
                                ) : (
                                    <TextField
                                        label="Date"
                                        value={new Date(currentDate).toLocaleDateString()}
                                        InputProps={{ readOnly: true }}
                                        fullWidth
                                        helperText="Attendance is recorded for today's date"
                                    />
                                )}
                                <FormControl fullWidth required>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        label="Status"
                                    >
                                        <MenuItem value="present">Present</MenuItem>
                                        <MenuItem value="absent">Absent</MenuItem>
                                        <MenuItem value="late">Late</MenuItem>
                                    </Select>
                                </FormControl>
                                {formData.status !== 'present' && (
                                    <TextField
                                        label="Reason"
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        multiline
                                        rows={3}
                                        required={formData.status !== 'present'}
                                    />
                                )}
                                <Box display="flex" gap={2}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : editMode ? (
                                            'Update Attendance'
                                        ) : (
                                            'Mark Attendance'
                                        )}
                                    </Button>
                                    {editMode && (
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={handleCancelEdit}
                                            fullWidth
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </Box>
                            </Stack>
                        </form>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="medium">
                                Attendance History
                            </Typography>
                            <Button 
                                startIcon={<RefreshIcon />} 
                                onClick={refreshAttendanceData}
                                disabled={loading}
                            >
                                Refresh
                            </Button>
                        </Box>
                        
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Reason</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {attendanceData.length > 0 ? (
                                            attendanceData.map((record) => (
                                                <TableRow 
                                                    key={record._id}
                                                    sx={{
                                                        backgroundColor: isSelectedRow(record._id) ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                                                    }}
                                                >
                                                    <TableCell>
                                                        {new Date(record.date).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusChip(record.status)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {record.notes || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1}>
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => handleEdit(record)}
                                                                disabled={submitting}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDeleteClick(record)}
                                                                disabled={submitting}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center">
                                                    No attendance records found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Dialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this attendance record? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error" 
                        disabled={submitting}
                    >
                        {submitting ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EmpAttendance;