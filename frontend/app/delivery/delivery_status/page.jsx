'use client'
import { useState, useEffect, useRef } from 'react'
import { Toast } from 'primereact/toast'
import axios from 'axios'

export default function DeliveryStatus() {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useRef(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    const [editingTime, setEditingTime] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

    // Add new states for search and sort
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const [statusFilter, setStatusFilter] = useState('all'); // Add new state for status filter

    // Add new state for confirmation text
    const [confirmationText, setConfirmationText] = useState('');

    // Add state for counts
    const [counts, setCounts] = useState({
        total: 0,
        pending: 0,
        onDelivering: 0,
        completed: 0
    });

    // Function to show notification
    const showNotification = (message, type = 'info') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Fetch deliveries on component mount
    useEffect(() => {
        fetchDeliveries();
    }, []);

    // Function to fetch deliveries from the backend
    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            console.log('Fetching deliveries from backend...');
            const response = await axios.get('http://localhost:5000/api/orders');
            console.log('Response from backend:', response.data);
            
            if (response.data.status === 'success' && Array.isArray(response.data.data)) {
                const allOrders = response.data.data;
                
                // Filter orders to only include those with drivers assigned
                const ordersWithDrivers = allOrders.filter(order => 
                    order.driver && (order.status === 'on delivering' || order.status === 'completed')
                );
                
                // Calculate counts based on status
                const totalActiveDeliveries = allOrders.filter(order => 
                    order.status === 'pending' || order.status === 'on delivering'
                ).length;
                const pendingCount = allOrders.filter(order => order.status === 'pending').length;
                const onDeliveringCount = allOrders.filter(order => order.status === 'on delivering').length;
                const completedCount = allOrders.filter(order => order.status === 'completed').length;
                
                // Update counts state
                setCounts({
                    total: totalActiveDeliveries,
                    pending: pendingCount,
                    onDelivering: onDeliveringCount,
                    completed: completedCount
                });
                
                // Preserve the expanded state when updating deliveries
                setDeliveries(prevDeliveries => {
                    const expandedStates = new Map(prevDeliveries.map(delivery => [delivery._id, delivery.isExpanded]));
                    return ordersWithDrivers.map(order => ({
                        ...order,
                        isExpanded: expandedStates.get(order._id) || false
                    }));
                });

            } else {
                console.error('Invalid response format:', response.data);
                showNotification('Invalid response format from server', 'error');
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            showNotification(error.response?.data?.message || 'Failed to fetch deliveries', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Add this helper function for status badge styling
    const getStatusBadgeStyle = (status) => {
        switch(status) {
            case "pending":
                return "bg-red-100 text-red-800";
            case "completed":
                return "bg-green-100 text-green-700";
            case "on delivering":
                return "bg-[#fdc501]/10 text-[#fdc501]";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Update the filtered deliveries logic
    const filteredDeliveries = deliveries.filter(delivery => {
        const searchStr = searchTerm.toLowerCase();
        const matchesSearch = 
            delivery._id.toLowerCase().includes(searchStr) ||
            delivery.customerName.toLowerCase().includes(searchStr) ||
            (delivery.driverName && delivery.driverName.toLowerCase().includes(searchStr)) ||
            (delivery.driverVehicle && delivery.driverVehicle.toLowerCase().includes(searchStr));
        const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const handleStatusUpdate = async (orderId, newStatus) => {
        setPendingStatusUpdate({ orderId, newStatus });
        setShowConfirmDialog(true);
    }

    const confirmStatusUpdate = async () => {
        if (pendingStatusUpdate) {
            try {
                const response = await axios.put(`http://localhost:5000/api/orders/${pendingStatusUpdate.orderId}/status`, {
                    status: pendingStatusUpdate.newStatus
                });
                
                if (response.data.status === 'success') {
                    // Update the UI
                    setDeliveries(prevDeliveries => 
                        prevDeliveries.map(delivery => 
                            delivery._id === pendingStatusUpdate.orderId
                                ? { 
                                    ...delivery, 
                                    status: pendingStatusUpdate.newStatus,
                                    updatedAt: new Date().toISOString()
                                }
                                : delivery
                        )
                    );

                    showNotification('Order status updated successfully', 'success');
                } else {
                    showNotification(response.data.message || 'Failed to update order status', 'error');
                }
            } catch (error) {
                console.error('Error updating order status:', error);
                showNotification(error.response?.data?.message || 'Failed to update order status', 'error');
            }
        }
        setShowConfirmDialog(false);
        setPendingStatusUpdate(null);
    }

    const updateDeliveryTime = async (orderId, newTime) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
                expectedDeliveryTime: newTime
            });
            
            if (response.data.status === 'success') {
                showNotification('Delivery time updated successfully', 'success');
                // Refresh the deliveries list
                fetchDeliveries();
            } else {
                showNotification(response.data.message || 'Failed to update delivery time', 'error');
            }
        } catch (error) {
            console.error('Error updating delivery time:', error);
            showNotification(error.response?.data?.message || 'Failed to update delivery time', 'error');
        }
        setEditingTime(null);
    }

    const toggleExpand = (orderId) => {
        setDeliveries(deliveries.map(delivery => ({
            ...delivery,
            isExpanded: delivery._id === orderId ? !delivery.isExpanded : false
        })));
    }

    const getProgressPercentage = (status) => {
        switch (status) {
            case "pending": return 1;
            case "on delivering": return 50;
            case "completed": return 100;
            default: return 0;
        }
    }

    const getProgressBarColor = (status) => {
        return status === "completed" ? "bg-green-500" : "bg-[#fdc501]"
    }

    const getProgressPointColor = (status, point) => {
        const statusOrder = {
            "pending": 1,
            "on delivering": 2,
            "completed": 3
        };
        
        // Color logic based on current status and point
        if (status === "pending" && point === "pending") {
            return "bg-red-500";
        }
        
        if (statusOrder[status] >= statusOrder[point]) {
            return status === "completed" ? "bg-green-500" : "bg-[#fdc501]";
        }
        
        return "bg-gray-300";
    }

    const getStatusColor = (status) => {
        return status === "completed" ? "text-green-500" : "text-[#fdc501]";
    }

    const getBorderColor = (status) => {
        return status === "completed" ? "border-green-500" : "border-[#fdc501]";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
                    notification.type === 'error' ? 'bg-red-100 text-red-800' :
                    notification.type === 'success' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                }`}>
                    {notification.message}
                </div>
            )}
            {/* Enhanced Header with Stats */}
            <header className="bg-gradient-to-r from-[#fdc501] to-[#ffd747] shadow-lg">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white drop-shadow-md">Delivery Status</h1>
                            <p className="text-white/90 mt-2">Monitor and manage all delivery operations</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                                <p className="text-sm opacity-80">Total Jobs</p>
                                <p className="text-2xl font-bold">{counts.total}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                                <p className="text-sm opacity-80">Pending</p>
                                <p className="text-2xl font-bold">{counts.pending}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                                <p className="text-sm opacity-80">On Delivering</p>
                                <p className="text-2xl font-bold">{counts.onDelivering}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                                <p className="text-sm opacity-80">Completed</p>
                                <p className="text-2xl font-bold">{counts.completed}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Enhanced Search and Filters Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Search Input */}
                        <div className="relative col-span-1 md:col-span-2">
                            <label className="block text-gray-800 font-semibold mb-2">Search Deliveries</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by ID, customer, driver..."
                                    className="w-full px-4 py-3 pl-10 rounded-lg border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all outline-none text-gray-800"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-gray-800 font-semibold mb-2">Filter by Status</label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all outline-none appearance-none cursor-pointer bg-white text-gray-800"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="on delivering">On Delivering</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="block text-gray-800 font-semibold mb-2">Sort Order</label>
                            <select
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all outline-none appearance-none cursor-pointer bg-white text-gray-800"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fdc501]"></div>
                    </div>
                ) : (
                    /* Enhanced Deliveries List */
                    <div className="space-y-6">
                        {filteredDeliveries.length > 0 ? (
                            filteredDeliveries.map((delivery) => (
                                <div key={delivery._id} 
                                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                                    {/* Enhanced Delivery Header */}
                                    <div className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50"
                                        onClick={() => toggleExpand(delivery._id)}>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold text-gray-800">#{delivery._id}</span>
                                                <span className="text-sm text-gray-500">Order Date: {new Date(delivery.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[#fdc501] font-semibold">{delivery.customerName}</span>
                                                <span className="text-sm text-gray-500">{delivery.customerPhone}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeStyle(delivery.status)}`}>
                                                {delivery.status}
                                            </span>
                                            <span className="text-gray-400 transform transition-transform duration-200">
                                                {delivery.isExpanded ? '▼' : '▶'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Enhanced Expanded Content */}
                                    {delivery.isExpanded && (
                                        <div className="border-t border-gray-100 p-6 bg-gray-50">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Customer Details</h3>
                                                    <div className="space-y-2">
                                                        <p className="text-gray-800"><span className="font-medium">Name:</span> {delivery.customerName}</p>
                                                        <p className="text-gray-800"><span className="font-medium">Phone:</span> {delivery.customerPhone}</p>
                                                        <p className="text-gray-800"><span className="font-medium">Address:</span> {delivery.customerAddress}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Driver Details</h3>
                                                    <div className="space-y-2">
                                                        <p className="text-gray-800"><span className="font-medium">Name:</span> {delivery.driverName || 'Not assigned'}</p>
                                                        <p className="text-gray-800"><span className="font-medium">Vehicle ID:</span> {delivery.driverVehicle || 'Not assigned'}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                                    <h3 className="text-sm font-semibold text-gray-500 mb-2">Order Details</h3>
                                                    <div className="space-y-2">
                                                        <p className="text-gray-800"><span className="font-medium">Order Date:</span> {new Date(delivery.createdAt).toLocaleDateString()}</p>
                                                        <p className="text-gray-800"><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(delivery.status)}`}>{delivery.status}</span></p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Enhanced Order Items Table */}
                                            <div className="mb-6">
                                                <h3 className="text-sm font-semibold text-gray-500 mb-2">Order Items</h3>
                                                <div className="bg-white rounded-lg p-4 shadow-sm overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="border-b">
                                                                <th className="text-left py-2 font-medium text-gray-500">Item</th>
                                                                <th className="text-right py-2 font-medium text-gray-500">Quantity</th>
                                                                <th className="text-right py-2 font-medium text-gray-500">Price</th>
                                                                <th className="text-right py-2 font-medium text-gray-500">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {delivery.items.map((item, index) => (
                                                                <tr key={index} className="border-b hover:bg-gray-50">
                                                                    <td className="py-2">{item.name}</td>
                                                                    <td className="text-right">{item.quantity}</td>
                                                                    <td className="text-right">${item.price.toFixed(2)}</td>
                                                                    <td className="text-right">${(item.price * item.quantity).toFixed(2)}</td>
                                                                </tr>
                                                            ))}
                                                            <tr className="font-bold bg-gray-50">
                                                                <td colSpan="3" className="text-right py-2">Total Amount:</td>
                                                                <td className="text-right py-2">${delivery.totalAmount.toFixed(2)}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Enhanced Delivery Progress */}
                                            <div className="mb-6">
                                                <h3 className="text-sm font-semibold text-gray-500 mb-2">Delivery Progress</h3>
                                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                                    <div className="relative">
                                                        {/* Progress Bar */}
                                                        <div className="h-2 bg-gray-200 rounded-full mb-6">
                                                            <div 
                                                                style={{ width: `${getProgressPercentage(delivery.status)}%` }}
                                                                className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(delivery.status)}`}
                                                            ></div>
                                                        </div>
                                                        
                                                        {/* Progress Points */}
                                                        <div className="flex justify-between relative -mt-3">
                                                            <div className="flex flex-col items-center">
                                                                <div className={`w-3 h-3 rounded-full ${getProgressPointColor(delivery.status, "pending")} mb-1`}></div>
                                                                <span className={`text-xs font-medium ${getStatusColor(delivery.status)}`}>Pending</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <div className={`w-3 h-3 rounded-full ${getProgressPointColor(delivery.status, "on delivering")} mb-1`}></div>
                                                                <span className={`text-xs font-medium ${getStatusColor(delivery.status)}`}>On Delivering</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <div className={`w-3 h-3 rounded-full ${getProgressPointColor(delivery.status, "completed")} mb-1`}></div>
                                                                <span className={`text-xs font-medium ${getStatusColor(delivery.status)}`}>Completed</span>
                                                            </div>
                                                        </div>

                                                        {/* Current Status Badge */}
                                                        <div className="absolute -top-8 right-0">
                                                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-[#fdc501] bg-[#fdc501]/10">
                                                                {delivery.status}
                                                            </span>
                                                            <span className="ml-2 text-xs font-semibold text-[#fdc501]">
                                                                {getProgressPercentage(delivery.status)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Enhanced Status Update Section */}
                                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                                <h3 className="text-lg font-bold text-gray-800 mb-4">Update Status</h3>
                                                <div className="flex flex-wrap gap-4">
                                                    <button
                                                        onClick={() => handleStatusUpdate(delivery._id, 'pending')}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={delivery.status === 'pending'}
                                                    >
                                                        Mark as Pending
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(delivery._id, 'on delivering')}
                                                        className="bg-[#fdc501] hover:bg-[#fdc501]/90 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={delivery.status === 'on delivering'}
                                                    >
                                                        Mark as On Delivering
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(delivery._id, 'completed')}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={delivery.status === 'completed'}
                                                    >
                                                        Mark as Completed
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-500 text-lg mt-4">No deliveries available</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Enhanced Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Confirm Status Update</h3>
                        <p className="mb-4">Are you sure you want to update the status to <span className="font-bold">{pendingStatusUpdate?.newStatus}</span>?</p>
                        <p className="text-sm text-gray-600 mb-4">Type "confirm" to proceed with the update:</p>
                        <input
                            type="text"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc501] focus:border-transparent mb-4"
                            placeholder="Type 'confirm' here"
                        />
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setShowConfirmDialog(false);
                                    setConfirmationText('');
                                    setPendingStatusUpdate(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmationText.toLowerCase() === 'confirm') {
                                        confirmStatusUpdate();
                                        setConfirmationText('');
                                    } else {
                                        showNotification('Please type "confirm" to proceed', 'error');
                                    }
                                }}
                                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                                    confirmationText.toLowerCase() === 'confirm'
                                        ? 'bg-[#fdc501] text-white hover:bg-[#fdc501]/90'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={confirmationText.toLowerCase() !== 'confirm'}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
