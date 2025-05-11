"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaCalendarAlt, FaCheck, FaTimes, FaEye } from "react-icons/fa";

export default function LeaveManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leave requests from the backend
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        console.log('Fetching leave requests...');
        
        const response = await fetch('/api/leave/admin/leaverequests', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Leave requests data:', data);
        
        if (data.success) {
          setLeaveRequests(data.data || []);
        } else {
          throw new Error(data.message || 'Failed to fetch leave requests');
        }
      } catch (err) {
        console.error('Error fetching leave requests:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  // Get employee name from employeeId
  const getEmployeeName = (request) => {
    if (!request.employeeId) return "Unknown";
    
    if (typeof request.employeeId === 'object') {
      return request.employeeId.fullName || request.employeeId.email || "Unknown";
    }
    
    return request.employeeId;
  };

  // Get reviewer name
  const getReviewerName = (request) => {
    if (!request.reviewedBy) return "-";
    
    if (typeof request.reviewedBy === 'object') {
      return request.reviewedBy.fullName || request.reviewedBy.email || "-";
    }
    
    return request.reviewedBy;
  };

  // Filter function for search
  const filteredRequests = leaveRequests.filter((request) => {
    const employeeName = getEmployeeName(request).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return employeeName.includes(searchLower) ||
           (request.leaveType || '').toLowerCase().includes(searchLower) ||
           (request.reason || '').toLowerCase().includes(searchLower);
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Handle approve/reject actions
  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await fetch(`/api/leave/admin/leaverequests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status,
          comments: `Status updated to ${status} on ${new Date().toISOString()}` 
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local state to reflect the change
        setLeaveRequests((prevRequests) =>
          prevRequests.map((request) =>
            request._id === id ? { ...request, status } : request
          )
        );
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating leave request status:', err);
      alert(`Failed to update status: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#fdc501] p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-black flex items-center gap-2">
            <FaCalendarAlt className="inline-block" /> Leave Management
          </h1>
          <p className="text-black mt-2">
            Manage employee leave requests
          </p>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white border-b">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by employee name, leave type, or reason..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc501]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#fdc501] border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading leave requests...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-8 text-center text-red-500">
            <p>Error: {error}</p>
            <button 
              className="mt-2 px-4 py-2 bg-[#fdc501] text-black rounded hover:bg-[#fdc501]/80"
              onClick={() => window.location.reload()}
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
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviewed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {getEmployeeName(request)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{formatDate(request.startDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{formatDate(request.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 capitalize">{request.leaveType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{request.reason}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(request.status)}`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{getReviewerName(request)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button 
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                                onClick={() => handleStatusUpdate(request._id, 'approved')}
                              >
                                <FaCheck />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                                onClick={() => handleStatusUpdate(request._id, 'rejected')}
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No matching leave requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Footer */}
        {!loading && !error && (
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 justify-between">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <FaCheck className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-black">Approved</p>
                  <p className="font-semibold text-black">{leaveRequests.filter(r => r.status === "approved").length}</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                  <FaCalendarAlt className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-black">Pending</p>
                  <p className="font-semibold text-black">{leaveRequests.filter(r => r.status === "pending").length}</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                  <FaTimes className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-black">Rejected</p>
                  <p className="font-semibold text-black">{leaveRequests.filter(r => r.status === "rejected").length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}