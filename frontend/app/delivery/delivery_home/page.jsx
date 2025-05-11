'use client';
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'
import axios from 'axios'
import { useRouter } from 'next/navigation'

// Register all required Chart.js components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement
)

export default function DeliveryHome() {
    // State for delivery data
    const [deliveryData, setDeliveryData] = useState({
        'to-deliver': [],
        'on-delivering': [],
        'delivered': []
    });

    // State for loading and error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add refs for scrolling
    const toDeliverRef = useRef(null)
    const onDeliveringRef = useRef(null)
    const deliveredRef = useRef(null)

    // Add animation trigger state
    const [animationTrigger, setAnimationTrigger] = useState(0);

    // Add state for chart rotation
    const [chartRotation, setChartRotation] = useState(0);

    // Add new state for active table
    const [activeTable, setActiveTable] = useState('to-deliver');

    // Add new state for status filter
    const [statusFilter, setStatusFilter] = useState('all');

    // Add new state for sort order
    const [sortOrder, setSortOrder] = useState('desc');

    // Add new state for filtered deliveries
    const [filteredDeliveries, setFilteredDeliveries] = useState([]);

    // Add new state for deliveries
    const deliveries = useRef([]);

    // Add new state for router
    const router = useRouter();

    // Add new state for notification
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Add new state for delivery timeline data
    const [deliveryTimelineData, setDeliveryTimelineData] = useState({
        labels: [],
        data: []
    });

    // Function to show notification
    const showNotification = (message, type = 'info') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Add function to process delivery timeline data
    const processDeliveryTimelineData = (orders) => {
        // Group orders by date
        const ordersByDate = orders.reduce((acc, order) => {
            const date = new Date(order.createdAt).toLocaleDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // Sort dates and get the last 7 days
        const sortedDates = Object.keys(ordersByDate).sort((a, b) => new Date(a) - new Date(b));
        const last7Days = sortedDates.slice(-7);

        // Format dates for display
        const formattedDates = last7Days.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        });

        // Get counts for each date
        const counts = last7Days.map(date => ordersByDate[date] || 0);

        setDeliveryTimelineData({
            labels: formattedDates,
            data: counts
        });
    };

    // Fetch data from the backend
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Fetch all orders from the database
                const response = await axios.get('http://localhost:5000/api/orders');
                
                if (response.data.status === 'success' && Array.isArray(response.data.data)) {
                    const allOrders = response.data.data;
                    
                    // Calculate counts based on status
                    const pendingOrders = allOrders.filter(order => order.status === 'pending');
                    const onDeliveringOrders = allOrders.filter(order => order.status === 'on delivering');
                    const completedOrders = allOrders.filter(order => order.status === 'completed');
                    
                    // Update the delivery data
                    setDeliveryData({
                        'to-deliver': pendingOrders,
                        'on-delivering': onDeliveringOrders,
                        'delivered': completedOrders
                    });
                    
                    // Update deliveries
                    deliveries.current = allOrders;

                    // Process timeline data
                    processDeliveryTimelineData(allOrders);

                    // Update filtered deliveries to only show 'on delivering' orders
                    setFilteredDeliveries(onDeliveringOrders);

                    // Show success notification
                    showNotification('Delivery data updated successfully', 'success');
                } else {
                    throw new Error('Invalid response format from server');
                }
            } catch (err) {
                console.error('Error fetching delivery data:', err);
                setError(err.response?.data?.message || 'Failed to fetch data from the server');
                showNotification('Failed to fetch delivery data', 'error');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
        
        // Set up interval for data refresh
        const interval = setInterval(() => {
            fetchData();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    // Update the stats display
    const totalActiveDeliveries = deliveryData['to-deliver'].length + deliveryData['on-delivering'].length;
    const pendingCount = deliveryData['to-deliver'].length;
    const onDeliveringCount = deliveryData['on-delivering'].length;
    const completedCount = deliveryData['delivered'].length;

    // Use actual data counts from fetched data
    const actualCounts = {
        toDeliver: deliveryData['to-deliver'].length,
        onDelivering: deliveryData['on-delivering'].length,
        delivered: deliveryData['delivered'].length
    };

    // Update totalOrders calculation to use dynamic counts
    const totalOrders = actualCounts.toDeliver + actualCounts.onDelivering + actualCounts.delivered;

    // Update Chart data configurations
    const chartData = {
        labels: ['To Deliver', 'On Delivering', 'Delivered'],
        datasets: [
            {
                data: [actualCounts.toDeliver, actualCounts.onDelivering, actualCounts.delivered],
                backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(253, 197, 1, 0.8)', 'rgba(34, 197, 94, 0.8)'],
                borderColor: ['#ef4444', '#fdc501', '#22c55e'],
                borderWidth: 1,
            },
        ],
    }

    const chartOptions = {
        cutout: '70%',
        plugins: {
            legend: {
                display: false
            }
        },
        rotation: chartRotation
    }

    // Update specific data for each chart with all colors visible
    const toDeliverChartData = {
        ...chartData,
        datasets: [{
            ...chartData.datasets[0],
            backgroundColor: [
                'rgba(239, 68, 68, 0.9)',  // Red highlighted
                'rgba(253, 197, 1, 0.3)',  // Yellow dimmed
                'rgba(34, 197, 94, 0.3)'   // Green dimmed
            ],
            borderColor: ['#ef4444', 'rgba(253, 197, 1, 0.3)', 'rgba(34, 197, 94, 0.3)'],
            borderWidth: [2, 1, 1]
        }]
    }

    const onDeliveringChartData = {
        ...chartData,
        datasets: [{
            ...chartData.datasets[0],
            backgroundColor: [
                'rgba(239, 68, 68, 0.3)',  // Red dimmed
                'rgba(253, 197, 1, 0.9)',  // Yellow highlighted
                'rgba(34, 197, 94, 0.3)'   // Green dimmed
            ],
            borderColor: ['rgba(239, 68, 68, 0.3)', '#fdc501', 'rgba(34, 197, 94, 0.3)'],
            borderWidth: [1, 2, 1]
        }]
    }

    const deliveredChartData = {
        ...chartData,
        datasets: [{
            ...chartData.datasets[0],
            backgroundColor: [
                'rgba(239, 68, 68, 0.3)',  // Red dimmed
                'rgba(253, 197, 1, 0.3)',  // Yellow dimmed
                'rgba(34, 197, 94, 0.9)'   // Green highlighted
            ],
            borderColor: ['rgba(239, 68, 68, 0.3)', 'rgba(253, 197, 1, 0.3)', '#22c55e'],
            borderWidth: [1, 1, 2]
        }]
    }

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // Function to get latest entries with proper error handling
    const getLatestEntries = (data, limit = 3) => {
        if (!Array.isArray(data) || data.length === 0) {
            return [];
        }
        
        return [...data]
            .sort((a, b) => {
                // Sort by order ID in descending order (assuming higher numbers are newer)
                const aId = a.id || a._id || '';
                const bId = b.id || b._id || '';
                return bId.localeCompare(aId);
            })
            .slice(0, limit);
    };

    // Get latest entries for each table with proper error handling
    const latestToDeliver = getLatestEntries(deliveryData['to-deliver']);
    const latestOnDelivering = getLatestEntries(deliveryData['on-delivering']);
    const latestDelivered = getLatestEntries(deliveryData['delivered']);

    // Add function to handle manual navigation
    const handleTableNavigation = (direction) => {
        setActiveTable(current => {
            switch(current) {
                case 'to-deliver':
                    return direction === 'next' ? 'on-delivering' : 'delivered';
                case 'on-delivering':
                    return direction === 'next' ? 'delivered' : 'to-deliver';
                case 'delivered':
                    return direction === 'next' ? 'to-deliver' : 'on-delivering';
                default:
                    return 'to-deliver';
            }
        });
    };

    // Remove countdown useEffect and keep just the table rotation useEffect
    useEffect(() => {
        const interval = setInterval(() => {
            handleTableNavigation('next');
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // Add function to get table title
    const getTableTitle = (tableName) => {
        switch(tableName) {
            case 'to-deliver':
                return 'To Deliver';
            case 'on-delivering':
                return 'On Delivering';
            case 'delivered':
                return 'Successfully Delivered';
            default:
                return '';
        }
    };

    // Function to get the correct tab value for navigation
    const getTabValue = (tableName) => {
        switch(tableName) {
            case 'to-deliver':
                return 'to-deliver';
            case 'on-delivering':
                return 'on-delivering';
            case 'delivered':
                return 'delivered';
            default:
                return 'to-deliver';
        }
    };

    // Function to get table headers based on status
    const getTableHeaders = (status) => {
        switch(status) {
            case 'to-deliver':
                return ['Order ID', 'Customer Name', 'Customer Address', 'Ordered Date'];
            case 'on-delivering':
                return ['Order ID', 'Customer Name', 'Customer Address', 'Driver ID', 'Vehicle ID'];
            case 'delivered':
                return ['Order ID', 'Customer Name', 'Customer Address', 'Driver ID', 'Vehicle ID', 'Delivered Date'];
            default:
                return [];
        }
    };

    // Function to get row data based on status
    const getRowData = (item, status) => {
        const orderId = item.id || item._id || 'N/A';
        const formattedOrderId = orderId.toString().substring(0, 8);
        
        const formatDriverId = (driverId) => {
            if (!driverId) return 'N/A';
            if (typeof driverId === 'object' && driverId._id) {
                return driverId._id.toString().substring(0, 8);
            }
            return driverId.toString().substring(0, 8);
        };
        
        switch(status) {
            case 'to-deliver':
                return [
                    `#${formattedOrderId}`,
                    item.customerName || 'N/A',
                    item.customerAddress || item.location || 'N/A',
                    item.createdAt || item.preparedDate ? new Date(item.createdAt || item.preparedDate).toLocaleDateString() : 'N/A'
                ];
            case 'on-delivering':
                return [
                    `#${formattedOrderId}`,
                    item.customerName || 'N/A',
                    item.customerAddress || item.location || 'N/A',
                    formatDriverId(item.driverId || item.driver),
                    item.vehicleId || item.driverVehicle || 'N/A'
                ];
            case 'delivered':
                return [
                    `#${formattedOrderId}`,
                    item.customerName || 'N/A',
                    item.customerAddress || item.location || 'N/A',
                    formatDriverId(item.driverId || item.driver),
                    item.vehicleId || item.driverVehicle || 'N/A',
                    item.updatedAt || item.deliveredDateTime ? new Date(item.updatedAt || item.deliveredDateTime).toLocaleString() : 'N/A'
                ];
            default:
                return [];
        }
    };

    // Add function to filter deliveries based on status
    const filterDeliveries = () => {
        const filtered = deliveries.current.filter(delivery => {
            if (statusFilter === 'all') return true;
            return delivery.status === statusFilter;
        });
        setFilteredDeliveries(filtered);
    };

    // Add function to sort deliveries
    const sortDeliveries = () => {
        const sorted = [...filteredDeliveries].sort((a, b) => {
            if (sortOrder === 'desc') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
        });
        setFilteredDeliveries(sorted);
    };

    // Add function to handle status filter change
    const handleStatusFilterChange = () => {
        filterDeliveries();
        sortDeliveries();
    };

    // Add function to handle sort order change
    const handleSortOrderChange = () => {
        sortDeliveries();
    };

    // Add function to handle delivery status view
    const handleDeliveryStatusView = (delivery) => {
        router.push(`/delivery/delivery_status`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Notification Component */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
                    notification.type === 'error' ? 'bg-red-100 text-red-800' :
                    notification.type === 'success' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                }`}>
                    {notification.message}
                </div>
            )}
            
            {/* Enhanced Header with Quick Stats */}
            <header className="bg-gradient-to-r from-[#fdc501] to-[#ffd747] shadow-lg">
            <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                            <h1 className="text-4xl font-bold text-white drop-shadow-md">Delivery Dashboard</h1>
                            <p className="text-white/90 mt-2">Monitor and manage all delivery operations</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white hover:bg-white/20 transition-all duration-300">
                                <p className="text-sm opacity-80">Total Jobs</p>
                                <p className="text-2xl font-bold">{totalActiveDeliveries}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white hover:bg-white/20 transition-all duration-300">
                                <p className="text-sm opacity-80">Pending</p>
                                <p className="text-2xl font-bold">{pendingCount}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white hover:bg-white/20 transition-all duration-300">
                                <p className="text-sm opacity-80">On Delivering</p>
                                <p className="text-2xl font-bold">{onDeliveringCount}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white hover:bg-white/20 transition-all duration-300">
                                <p className="text-sm opacity-80">Completed</p>
                                <p className="text-2xl font-bold">{completedCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Quick Actions Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => router.push('/delivery/add_driver')}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#fdc501] to-[#ffd747] text-white rounded-lg hover:from-[#ffd747] hover:to-[#fdc501] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <span className="font-medium">Add New Driver</span>
                            </button>
                            <button
                                onClick={() => router.push('/delivery/assign_driver')}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#ffd747] to-[#fdc501] text-white rounded-lg hover:from-[#fdc501] hover:to-[#ffd747] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <span className="font-medium">Assign Driver</span>
                            </button>
                            <button
                                onClick={() => router.push('/delivery/delivery_reports')}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#fdc501] to-[#ffd747] text-white rounded-lg hover:from-[#ffd747] hover:to-[#fdc501] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="font-medium">View Reports</span>
                            </button>
                            <button
                                onClick={() => router.push('/delivery/delivery_status')}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#ffd747] to-[#fdc501] text-white rounded-lg hover:from-[#fdc501] hover:to-[#ffd747] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="font-medium">Track Status</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 md:col-span-2">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {deliveries.current.slice(0, 5).map((delivery) => (
                                <div key={delivery._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${
                                            delivery.status === 'completed' ? 'bg-green-500' :
                                            delivery.status === 'on delivering' ? 'bg-[#fdc501]' :
                                            'bg-red-500'
                                        }`}></div>
                                        <div>
                                            <p className="font-medium text-gray-800">#{delivery._id}</p>
                                            <p className="text-sm text-gray-500">{delivery.customerName}</p>
                                </div>
                            </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            delivery.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            delivery.status === 'on delivering' ? 'bg-[#fdc501]/10 text-[#fdc501]' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            {delivery.status}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(delivery.createdAt).toLocaleDateString()}
                                        </span>
                                </div>
                                </div>
                            ))}
                            </div>
                    </div>
                    </div>

                {/* Enhanced Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Status Distribution Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Status Distribution</h2>
                        <div className="h-64">
                            <Doughnut
                                data={chartData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                            labels: {
                                                padding: 20,
                                                font: {
                                                    size: 12
                                                }
                                            }
                                        }
                                    },
                                    cutout: '70%'
                                }}
                                    />
                                </div>
                            </div>

                    {/* Delivery Timeline Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Delivery Timeline</h2>
                        <div className="h-64">
                            <Line
                                data={{
                                    labels: deliveryTimelineData.labels,
                                    datasets: [
                                        {
                                            label: 'Deliveries',
                                            data: deliveryTimelineData.data,
                                            borderColor: '#fdc501',
                                            backgroundColor: 'rgba(253, 197, 1, 0.1)',
                                            tension: 0.4,
                                            fill: true
                                        }
                                    ]
                                }}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                display: true,
                                                color: 'rgba(0, 0, 0, 0.1)'
                                            }
                                        },
                                        x: {
                                            grid: {
                                                display: false
                                            }
                                        }
                                    }
                                }}
                                    />
                                </div>
                    </div>
                </div>

                {/* Enhanced Delivery List */}
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Active Deliveries</h2>
                        <div className="flex gap-4">
                            <select
                                className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all outline-none appearance-none cursor-pointer bg-white text-gray-800"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="on delivering">On Delivering</option>
                                <option value="completed">Completed</option>
                            </select>
                            <select
                                className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all outline-none appearance-none cursor-pointer bg-white text-gray-800"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                                        </div>
                                        <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                                        <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Order ID</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Driver</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                                    <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                {filteredDeliveries.map((delivery) => (
                                    <tr key={delivery._id} className="border-b hover:bg-gray-50 transition-colors duration-200">
                                        <td className="py-3 px-4">#{delivery._id}</td>
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium">{delivery.customerName}</p>
                                                <p className="text-sm text-gray-500">{delivery.customerPhone}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-medium">{delivery.driverName || 'Not assigned'}</p>
                                                <p className="text-sm text-gray-500">{delivery.driverVehicle || '-'}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                delivery.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                delivery.status === 'on delivering' ? 'bg-[#fdc501]/10 text-[#fdc501]' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {delivery.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {new Date(delivery.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() => handleDeliveryStatusView(delivery)}
                                                className="px-3 py-1 bg-[#fdc501] text-white rounded-lg hover:bg-[#fdc501]/90 transition-colors duration-200"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
