'use client';
import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Stack,
    Alert,
    CircularProgress,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider
} from '@mui/material';
import {
    ExpandMore,
    CheckCircle,
    Cancel,
    PendingActions,
    CalendarToday,
    Person
} from '@mui/icons-material';

const LeaveHistoryPage = () => {
    const [employees, setEmployees] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    
    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // First fetch all leave requests 
                const response = await fetch('/api/admin/leaverequests', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    setLeaveRequests(data.data || []);
                    
                    // Create a unique list of employees from the leave requests
                    const uniqueEmployees = [...new Set(data.data.map(item => 
                        item.employeeId && typeof item.employeeId === 'object' 
                            ? item.employeeId._id 
                            : item.employeeId
                    ))];
                    
                    // Get details for each employee
                    // In a real app, you would fetch employee details here
                    // For now we'll use the data from the leave requests
                    const employeeList = uniqueEmployees.map(empId => {
                        const leaveReq = data.data.find(item => 
                            (item.employeeId && typeof item.employeeId === 'object' && item.employeeId._id === empId) || 
                            item.employeeId === empId
                        );
                        
                        return {
                            _id: empId,
                            name: leaveReq?.employeeId?.name || leaveReq?.employeeName || 'Employee',
                            email: leaveReq?.employeeId?.email || leaveReq?.employeeEmail || 'No Email',
                            department: leaveReq?.employeeId?.department || 'Unknown',
                            leaveBalance: leaveReq?.employeeId?.leaveBalance || {
                                casual: 12,
                                sick: 10,
                                annual: 20,
                                unpaid: 0
                            }
                        };
                    });
                    
                    setEmployees(employeeList);
                } else {
                    setError(data.message || 'Failed to fetch leave data');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(`Failed to fetch data: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);
    
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
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
        return diffDays;
    };
    
    const filterLeaveRequests = (empId) => {
        return leaveRequests.filter(item => {
            const employeeMatch = 
                (item.employeeId && typeof item.employeeId === 'object' && item.employeeId._id === empId) || 
                item.employeeId === empId;
                
            const yearMatch = filterYear === 'all' || 
                new Date(item.startDate).getFullYear().toString() === filterYear;
                
            const typeMatch = filterType === 'all' || item.leaveType === filterType;
            
            const statusMatch = filterStatus === 'all' || item.status === filterStatus;
            
            return employeeMatch && yearMatch && typeMatch && statusMatch;
        }).sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Sort by date descending
    };
    
    const calculateUsedLeave = (empId, type) => {
        if (type === 'all') return 0;
        
        return leaveRequests
            .filter(item => {
                const employeeMatch = 
                    (item.employeeId && typeof item.employeeId === 'object' && item.employeeId._id === empId) || 
                    item.employeeId === empId;
                    
                const typeMatch = item.leaveType === type;
                const statusMatch = item.status === 'approved';
                const yearMatch = new Date(item.startDate).getFullYear().toString() === filterYear;
                
                return employeeMatch && typeMatch && statusMatch && yearMatch;
            })
            .reduce((total, item) => {
                return total + calculateDuration(item.startDate, item.endDate);
            }, 0);
    };
    
    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Employee Leave History
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            label="Year"
                        >
                            <MenuItem value="all">All Years</MenuItem>
                            {years.map((year) => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Leave Type</InputLabel>
                        <Select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            label="Leave Type"
                        >
                            <MenuItem value="all">All Types</MenuItem>
                            <MenuItem value="casual">Casual Leave</MenuItem>
                            <MenuItem value="sick">Sick Leave</MenuItem>
                            <MenuItem value="annual">Annual Leave</MenuItem>
                            <MenuItem value="unpaid">Unpaid Leave</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="all">All Statuses</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            
            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : employees.length === 0 ? (
                <Alert severity="info">
                    No employee leave records found
                </Alert>
            ) : (
                <Stack spacing={3}>
                    {employees.map((employee) => {
                        const employeeLeaves = filterLeaveRequests(employee._id);
                        
                        if (employeeLeaves.length === 0) return null;
                        
                        return (
                            <Accordion key={employee._id} defaultExpanded={employees.length === 1}>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Stack direction="row" spacing={2} alignItems="center" width="100%">
                                        <Person />
                                        <Typography variant="h6">
                                            {employee.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                                            {employee.email} • {employee.department}
                                        </Typography>
                                        
                                        <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
                                            {filterYear !== 'all' && filterType !== 'all' && (
                                                <Chip 
                                                    label={`${calculateUsedLeave(employee._id, filterType)} days used`} 
                                                    color="primary" 
                                                    variant="outlined"
                                                />
                                            )}
                                            <Chip 
                                                label={`${employeeLeaves.length} requests`} 
                                                color="secondary" 
                                                variant="outlined"
                                            />
                                        </Box>
                                    </Stack>
                                </AccordionSummary>
                                <Divider />
                                <AccordionDetails>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Type</TableCell>
                                                    <TableCell>Start Date</TableCell>
                                                    <TableCell>End Date</TableCell>
                                                    <TableCell>Duration</TableCell>
                                                    <TableCell>Reason</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Comment</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {employeeLeaves.map((leave) => (
                                                    <TableRow key={leave._id}>
                                                        <TableCell>{getLeaveTypeLabel(leave.leaveType)}</TableCell>
                                                        <TableCell>{formatDate(leave.startDate)}</TableCell>
                                                        <TableCell>{formatDate(leave.endDate)}</TableCell>
                                                        <TableCell>{calculateDuration(leave.startDate, leave.endDate)} days</TableCell>
                                                        <TableCell>{leave.reason}</TableCell>
                                                        <TableCell>{getStatusChip(leave.status)}</TableCell>
                                                        <TableCell>{leave.comments || '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
};

export default LeaveHistoryPage; 