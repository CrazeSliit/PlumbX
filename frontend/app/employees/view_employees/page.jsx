'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaEdit, FaTrash, FaPlus, FaEnvelope, FaTimes } from 'react-icons/fa';
import { PDFDownloadLink } from '@react-pdf/renderer';
import EmployeePDF from './EmployeePDF';

export default function ViewEmployees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [sendingToLastTwo, setSendingToLastTwo] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [positionFilter, setPositionFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        department: '',
        position: '',
        salary: '',
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch('/api/employees');
            if (response.ok) {
                const data = await response.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                const response = await fetch(`/api/employees/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    setEmployees(employees.filter(emp => emp._id !== id));
                }
            } catch (error) {
                console.error('Error deleting employee:', error);
            }
        }
    };

    const handleEdit = (id) => {
        const employee = employees.find(emp => emp._id === id);
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                fullName: employee.fullName,
                email: employee.email,
                password: '', // Don't show current password
                department: employee.department,
                position: employee.position,
                salary: employee.salary,
            });
            setShowEditModal(true);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/employees/${editingEmployee._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const updatedEmployee = await response.json();
                setEmployees(employees.map(emp => 
                    emp._id === updatedEmployee._id ? updatedEmployee : emp
                ));
                setShowEditModal(false);
                setEditingEmployee(null);
                alert('Employee updated successfully!');
            } else {
                const error = await response.json();
                alert(`Failed to update employee: ${error.message}`);
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            alert('Failed to update employee. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSendToAll = async () => {
        if (window.confirm('Are you sure you want to send credentials to all employees?')) {
            setSendingEmail(true);
            try {
                const response = await fetch('/api/employees/send-all-credentials', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        senderEmail: 'chamudithakyt21@gmail.com',
                        senderPassword: 'ebus wxss akvk bhvf'
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('Credentials sent to all employees successfully!');
                } else {
                    console.error('Email sending failed:', data);
                    alert(`Failed to send credentials: ${data.message || 'Unknown error occurred'}`);
                }
            } catch (error) {
                console.error('Error sending credentials:', error);
                alert('Failed to send credentials. Please check your internet connection and try again.');
            } finally {
                setSendingEmail(false);
            }
        }
    };

    const handleSendToLastTwo = async () => {
        if (window.confirm('Are you sure you want to send credentials to the last 2 employees?')) {
            setSendingToLastTwo(true);
            try {
                const response = await fetch('/api/employees/send-last-two-credentials', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        senderEmail: 'chamudithakyt21@gmail.com',
                        senderPassword: 'ebus wxss akvk bhvf'
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('Credentials sent to last 2 employees successfully!');
                } else {
                    console.error('Email sending failed:', data);
                    alert(`Failed to send credentials: ${data.message || 'Unknown error occurred'}`);
                }
            } catch (error) {
                console.error('Error sending credentials:', error);
                alert('Failed to send credentials. Please check your internet connection and try again.');
            } finally {
                setSendingToLastTwo(false);
            }
        }
    };

    // Filter and sort employees
    const filteredEmployees = employees
        .filter(employee => {
            const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                employee.employeeId.toString().includes(searchTerm);
            const matchesPosition = positionFilter === 'all' || employee.position === positionFilter;
            return matchesSearch && matchesPosition;
        })
        .sort((a, b) => {
            if (sortOrder === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
        });

    // Get unique positions for filter dropdown
    const positions = [...new Set(employees.map(emp => emp.position))];

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={handleSendToLastTwo}
                        disabled={sendingToLastTwo}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
                    >
                        {sendingToLastTwo ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <>
                                <FaEnvelope className="text-sm" />
                                <span>Send to Last 2</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleSendToAll}
                        disabled={sendingEmail}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
                    >
                        {sendingEmail ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <>
                                <FaEnvelope className="text-sm" />
                                <span>Send to All</span>
                            </>
                        )}
                    </button>
                    <PDFDownloadLink
                        document={<EmployeePDF employees={filteredEmployees} />}
                        fileName="employee-list.pdf"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                        {({ blob, url, loading, error }) =>
                            loading ? 'Generating PDF...' : 'Download PDF'
                        }
                    </PDFDownloadLink>
                    <Link
                        href="/employees/add_employee"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                        <FaPlus className="text-sm" />
                        <span>Add Employee</span>
                    </Link>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        value={positionFilter}
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Positions</option>
                        {positions.map(position => (
                            <option key={position} value={position}>{position}</option>
                        ))}
                    </select>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Employee Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-6 py-3 text-left">Employee ID</th>
                            <th className="px-6 py-3 text-left">Name</th>
                            <th className="px-6 py-3 text-left">Department</th>
                            <th className="px-6 py-3 text-left">Position</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEmployees.map((employee) => (
                            <tr key={employee._id} className="border-b">
                                <td className="px-6 py-4">{employee.employeeId}</td>
                                <td className="px-6 py-4">{employee.fullName}</td>
                                <td className="px-6 py-4">{employee.department}</td>
                                <td className="px-6 py-4">{employee.position}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        employee.status === 'Active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {employee.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(employee._id)}
                                            className="text-blue-500 hover:text-blue-700"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(employee._id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Edit Employee</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Position</label>
                                <input
                                    type="text"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Salary</label>
                                <input
                                    type="number"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}