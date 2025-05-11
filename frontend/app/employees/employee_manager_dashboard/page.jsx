'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { employeeRoutes } from '../routes';
import { FaUserAlt, FaUserCheck, FaUserTimes, FaUserClock, FaUsers, FaUserPlus, FaCalendarAlt, FaSearch, FaDownload, FaChartBar, FaInfoCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function EmployeeDashboard() {
        const [animateUI, setAnimateUI] = useState(false);
        const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('employees');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Data states
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
        const [dashboardStats, setDashboardStats] = useState({
            totalEmployees: 0,
            absentToday: 0,
            pendingLeaves: 0,
            departmentStats: {},
            leaveStatus: []
        });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
        
    // Fetch all data
        useEffect(() => {
        const fetchAllData = async () => {
                setLoading(true);
                setError(null);
                
                try {
                // Fetch employees
                    const employeesResponse = await fetch('/api/admin/employees');
                if (!employeesResponse.ok) throw new Error('Failed to fetch employees');
                    const employeesData = await employeesResponse.json();
                setEmployees(employeesData.data || []);
                    
                // Fetch today's attendance
                const today = new Date().toISOString().split('T')[0];
                    const attendanceResponse = await fetch(`/api/admin/attendance?date=${today}`);
                if (!attendanceResponse.ok) throw new Error('Failed to fetch attendance');
                const attendanceData = await attendanceResponse.json();
                setAttendance(attendanceData.data || []);

                // Fetch leave requests
                const leaveResponse = await fetch('/api/leave/admin/leaverequests');
                if (!leaveResponse.ok) throw new Error('Failed to fetch leave requests');
                const leaveData = await leaveResponse.json();
                setLeaveRequests(leaveData.data || []);
                    
                    // Calculate statistics
                const departmentStats = calculateDepartmentStats(employeesData.data);
                const leaveStatus = calculateLeaveStatus(leaveData.data);

                    setDashboardStats({
                    totalEmployees: employeesData.data?.length || 0,
                    absentToday: attendanceData.data?.filter(r => r.status === 'absent').length || 0,
                    pendingLeaves: leaveData.data?.length || 0,
                    departmentStats,
                    leaveStatus
                });

                // Trigger animation
                setTimeout(() => setAnimateUI(true), 300);
                } catch (err) {
                    console.error('Error fetching dashboard data:', err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            
        fetchAllData();
        }, []);

    // Helper functions for statistics
    const calculateDepartmentStats = (employees) => {
        const stats = {};
        employees?.forEach(emp => {
            stats[emp.department] = (stats[emp.department] || 0) + 1;
        });
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    };

    const calculateLeaveDistribution = (leaves) => {
        const stats = {};
        leaves?.forEach(leave => {
            stats[leave.type] = (stats[leave.type] || 0) + 1;
        });
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    };

    const calculateLeaveStatus = (leaves) => {
        const stats = {
            pending: 0,
            approved: 0,
            rejected: 0
        };
        leaves?.forEach(leave => {
            stats[leave.status] = (stats[leave.status] || 0) + 1;
        });
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    };

    // Filter functions
    const filteredEmployees = employees.filter(emp => 
        emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAttendance = attendance.filter(record => 
        record.employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredLeaveRequests = leaveRequests.filter(request => 
        request.employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination functions
    const totalPages = Math.ceil(
        activeTab === 'employees' ? filteredEmployees.length / itemsPerPage :
        activeTab === 'attendance' ? filteredAttendance.length / itemsPerPage :
        filteredLeaveRequests.length / itemsPerPage
    );

    const currentData = activeTab === 'employees' ? filteredEmployees :
                       activeTab === 'attendance' ? filteredAttendance :
                       filteredLeaveRequests;

    const paginatedData = currentData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Export functions
    const exportToCSV = (data, filename) => {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Chart colors
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
        
        if (loading) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#fdc501]"></div>
                    <p className="ml-3 text-xl text-gray-700">Loading dashboard data...</p>
                </div>
            );
        }
        
       
        return (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                {/* Welcome Banner */}
                                <div className={`bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-[#fdc501] transform transition-all duration-500 ${animateUI ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                    <h1 className="text-2xl font-bold text-gray-800">Welcome to Employee Management</h1>
                                    <p className="text-gray-600 mt-1">Here's an overview of your organization's employee data and activities.</p>
                                </div>
                                
                                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className={`bg-white p-6 rounded-lg shadow-md transform transition-all duration-500 ${animateUI ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="flex items-center">
                            <FaUsers className="text-3xl text-[#fdc501] mr-4" />
                            <div>
                                <p className="text-gray-600">Total Employees</p>
                                <p className="text-2xl font-bold">{dashboardStats.totalEmployees}</p>
                            </div>
                        </div>
                    </div>
                    <div className={`bg-white p-6 rounded-lg shadow-md transform transition-all duration-500 ${animateUI ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="flex items-center">
                            <FaUserTimes className="text-3xl text-red-500 mr-4" />
                            <div>
                                <p className="text-gray-600">Absent Today</p>
                                <p className="text-2xl font-bold">{dashboardStats.absentToday}</p>
                            </div>
                        </div>
                    </div>
                    <div className={`bg-white p-6 rounded-lg shadow-md transform transition-all duration-500 ${animateUI ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="flex items-center">
                            <FaCalendarAlt className="text-3xl text-blue-500 mr-4" />
                            <div>
                                <p className="text-gray-600">Pending Leaves</p>
                                <p className="text-2xl font-bold">{dashboardStats.pendingLeaves}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Department Distribution */}
                    <div className={`bg-white p-6 rounded-lg shadow-md transform transition-all duration-500 ${animateUI ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Department Distribution</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dashboardStats.departmentStats}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {dashboardStats.departmentStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Leave Requests Status */}
                    <div className={`bg-white p-6 rounded-lg shadow-md transform transition-all duration-500 ${animateUI ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Leave Requests Status</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboardStats.leaveStatus}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#fdc501">
                                        {dashboardStats.leaveStatus.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={
                                                    entry.name === 'approved' ? '#00C49F' :
                                                    entry.name === 'pending' ? '#FFBB28' :
                                                    '#FF8042'
                                                } 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Search and Export Controls */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                            />
                            <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => exportToCSV(currentData, `${activeTab}_export.csv`)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#fdc501] text-black rounded-lg hover:bg-yellow-400"
                            >
                                <FaDownload />
                                <span>Export</span>
                            </button>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setActiveTab('employees')}
                                    className={`px-4 py-2 rounded-lg ${activeTab === 'employees' ? 'bg-[#fdc501] text-black' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Employees
                                </button>
                                <button
                                    onClick={() => setActiveTab('attendance')}
                                    className={`px-4 py-2 rounded-lg ${activeTab === 'attendance' ? 'bg-[#fdc501] text-black' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Attendance
                                </button>
                                <button
                                    onClick={() => setActiveTab('leaves')}
                                    className={`px-4 py-2 rounded-lg ${activeTab === 'leaves' ? 'bg-[#fdc501] text-black' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    Leave Requests
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tables */}
                    {activeTab === 'employees' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedData.map((employee) => (
                                        <tr key={employee._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee._id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{employee.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{employee.department}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{employee.position}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    employee.status === 'Active' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {employee.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedData.map((record) => (
                                        <tr key={record._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record._id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{record.employee?.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    record.status === 'present' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{record.notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'leaves' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedData.map((request) => (
                                        <tr key={request._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request._id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.employee?.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{request.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(request.startDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(request.endDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    request.status === 'approved' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : request.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length} entries
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-lg bg-gray-100 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-lg bg-gray-100 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                                {/* Quick Access Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        {employeeRoutes.map((route, index) => (
                                                <Link
                                                        key={route.path}
                                                        href={route.path}
                                                        className={`block p-6 bg-white rounded-lg border border-gray-200 shadow-md 
                                                                  transition-all duration-300
                                                                  hover:border-[#fdc501] hover:scale-105 hover:shadow-lg hover:rotate-1
                                                                  transform ${animateUI ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                                                        style={{ transitionDelay: `${600 + index * 100}ms` }}
                                                >
                                                        <div className="flex items-center mb-4">
                                                                <route.icon className="text-2xl text-[#fdc501] mr-3 transform transition-transform hover:scale-125 hover:rotate-12" />
                                                                <h2 className="text-xl font-bold text-gray-800">{route.label}</h2>
                                                        </div>
                                                        <p className="text-gray-600">Manage and view {route.label.toLowerCase()} details</p>
                                                </Link>
                                        ))}
                                </div>
                        </main>
                </div>
        );
}