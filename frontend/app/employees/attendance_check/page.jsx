"use client";

import { useState, useEffect } from "react";
import { FaUserCheck, FaClock, FaCalendarAlt, FaSearch, FaDownload, FaFileCsv, FaFilter } from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";

export default function AttendanceCheck() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeesData, setEmployeesData] = useState({});
  const [employeeFilter, setEmployeeFilter] = useState('all');

  // Fetch employees data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/admin/employees');
        
        if (!response.ok) {
          console.error(`Error fetching employees: ${response.status}`);
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Convert array to object with _id as key for faster lookups
          const employeesMap = {};
          data.data.forEach(employee => {
            employeesMap[employee._id] = {
              name: employee.fullName,
              email: employee.email,
              department: employee.department,
              position: employee.position
            };
          });
          setEmployeesData(employeesMap);
        }
      } catch (err) {
        console.error('Error fetching employees data:', err);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/attendance');
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Enhance attendance data with employee names from our local cache
          const enhancedData = data.data.map(record => {
            // Extract employee id properly
            let employeeId = null;
            
            if (record.employee) {
              if (typeof record.employee === 'object' && record.employee !== null) {
                // If employee is an object with _id field
                employeeId = record.employee._id;
              } else if (typeof record.employee === 'string') {
                // If employee is directly the ID string
                employeeId = record.employee;
              }
            }
            
            return {
              ...record,
              employeeId, // Store the extracted ID for easier access
              employeeInfo: employeeId ? employeesData[employeeId] || null : null
            };
          });
          
          setAttendanceData(enhancedData);
          setFilteredData(enhancedData);
        } else {
          throw new Error(data.message || 'Failed to fetch attendance data');
        }
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch attendance data if we have employee data
    if (Object.keys(employeesData).length > 0) {
      fetchAttendanceData();
    }
  }, [employeesData]);

  // Filter data based on search term and filters
  useEffect(() => {
    if (!attendanceData.length) return;
    
    let filtered = [...attendanceData];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const employeeName = getEmployeeName(item);
        return employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    // Filter by specific employee
    if (employeeFilter !== 'all') {
      filtered = filtered.filter(item => {
        return item.employeeId === employeeFilter;
      });
    }
    
    // Filter by date range
    if (dateFilter.startDate) {
      const startDate = new Date(dateFilter.startDate);
      filtered = filtered.filter(item => new Date(item.date) >= startDate);
    }
    
    if (dateFilter.endDate) {
      const endDate = new Date(dateFilter.endDate);
      // Set time to end of day
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter(item => new Date(item.date) <= endDate);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    setFilteredData(filtered);
  }, [searchTerm, attendanceData, dateFilter, statusFilter, employeeFilter]);

  // Get employee name from employee object
  const getEmployeeName = (item) => {
    // Use the extracted employeeId if available
    if (item.employeeId && employeesData[item.employeeId]) {
      return employeesData[item.employeeId].name;
    }
    
    // Fallback to the old method
    if (item.employeeInfo) {
      return item.employeeInfo.name;
    }
    
    if (!item.employee) {
      // If no employee data at all, show record ID instead of just "Unknown"
      return `Record ID: ${item._id || "N/A"}`;
    }
    
    if (typeof item.employee === 'object') {
      const name = item.employee.name || item.employee.fullName || item.employee.email;
      if (name) return name;
      
      // If employee object exists but no name info, show employee ID
      return `Employee ID: ${item.employee._id || "Unknown"}`;
    }
    
    // If employee is just a string (likely an ID), show it
    return `Employee ID: ${item.employee}`;
  };

  // Generate CSV content
  const generateCsvContent = (data) => {
    // CSV header row
    const headers = ["Employee Name/ID", "Position", "Date", "Status", "Notes", "Record ID"];
    
    // Convert data to CSV rows
    const csvRows = data.map((item) => {
      // Get employee details using extracted ID
      const employeeInfo = item.employeeId ? employeesData[item.employeeId] || {} : {};
      
      return [
        getEmployeeName(item),
        employeeInfo.position || '-',
        new Date(item.date).toLocaleDateString(),
        item.status,
        item.notes || '',
        item._id || '' // Include record ID in CSV for reference
      ].join(",");
    });
    
    // Combine header and rows
    return [headers.join(","), ...csvRows].join("\n");
  };
  
  // Handle CSV download
  const handleDownloadCsv = () => {
    try {
      setIsDownloading(true);
      
      const csvContent = generateCsvContent(filteredData);
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.setAttribute("download", `attendance_data_${date}.csv`);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      setIsDownloading(false);
      alert("Failed to download CSV file. Please try again.");
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter({ startDate: '', endDate: '' });
    setStatusFilter('all');
    setEmployeeFilter('all');
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'half-day':
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <IoMdCheckmarkCircleOutline className="mr-1 self-center" />;
      case 'absent':
        return <MdOutlineCancel className="mr-1 self-center" />;
      case 'half-day':
      case 'late':
        return <FaClock className="mr-1 self-center" />;
      case 'leave':
        return <FaCalendarAlt className="mr-1 self-center" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#fdc501] p-4 md:p-6 flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-black flex items-center gap-2">
              <FaUserCheck className="inline-block" /> Employee Attendance
            </h1>
            <p className="text-black mt-2 flex items-center gap-2">
              <FaCalendarAlt className="inline-block" /> 
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={handleDownloadCsv}
            disabled={isDownloading || loading || !filteredData.length}
            className={`mt-3 md:mt-0 flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all ${
              isDownloading || loading || !filteredData.length ? "opacity-70 cursor-not-allowed" : "hover:shadow-md"
            }`}
          >
            {isDownloading ? (
              <>
                <FaDownload className="animate-pulse" /> Downloading...
              </>
            ) : (
              <>
                <FaFileCsv /> Download CSV
              </>
            )}
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by employee name..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
          
            
            
            {/* Date Range Filter */}
            <div className="flex flex-col md:flex-row gap-2">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                  value={dateFilter.startDate}
                  onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Status</label>
              <select
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="leave">Leave</option>
              </select>
            </div>
            
            {/* Reset Filters Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-1"
              >
                <FaFilter /> Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fdc501]"></div>
            <p className="ml-3 text-lg text-gray-600">Loading attendance data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
              <MdOutlineCancel className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#fdc501] text-black rounded-lg hover:bg-yellow-400"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt /> Date
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => {
                    // Use the extracted ID
                    const employeeInfo = item.employeeId ? employeesData[item.employeeId] || {} : {};
                    const employeeName = getEmployeeName(item);
                    
                    return (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {employeeName}
                            {/* Show record ID as supplementary info if it's not already shown in the name */}
                            {!employeeName.includes(item._id) && 
                              <div className="text-xs text-gray-500 mt-1">ID: {item._id}</div>
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{new Date(item.date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}
                          >
                            {getStatusIcon(item.status)}
                            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900 max-w-xs truncate">{item.notes || "-"}</div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No matching attendance records found
                    </td>
                  </tr>
                )}
              </tbody> 
            </table>
          </div>
        )}
      </div>
    </div>
  );
}