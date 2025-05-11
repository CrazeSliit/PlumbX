'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function AssignDriver() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [notification, setNotification] = useState({ show: false, message: '', type: '' })
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [orders, setOrders] = useState([])
    const [drivers, setDrivers] = useState([])
    const [availableVehicles, setAvailableVehicles] = useState([])
    const [selectedVehicle, setSelectedVehicle] = useState(null)
    const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState('')
    const [priorityLevel, setPriorityLevel] = useState('normal')
    const [deliveryNotes, setDeliveryNotes] = useState('')

    // Show notification function
    const showNotification = (message, type = 'info') => {
        setNotification({ show: true, message, type })
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' })
        }, 3000)
    }

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [ordersResponse, driversResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/delivery/pending-orders'),
                    axios.get('http://localhost:5000/api/drivers')
                ])

                if (ordersResponse.data.status === 'success') {
                    setOrders(ordersResponse.data.data)
                }
                
                if (driversResponse.data.status === 'success') {
                    const driversData = Array.isArray(driversResponse.data.data) 
                        ? driversResponse.data.data 
                        : []
                    setDrivers(driversData)
                }
            } catch (err) {
                console.error('Error fetching data:', err)
                setError(err.response?.data?.message || 'Failed to fetch data')
                showNotification('Failed to fetch data. Please check if the backend server is running.', 'error')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Filter orders based on search query with null check
    const filteredOrders = (orders || []).filter(order => 
        order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerAddress?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Handle order selection
    const handleOrderSelect = (order) => {
        setSelectedOrder(order)
        setSelectedDriver(null)
        setSelectedVehicle(null)
        setEstimatedDeliveryTime('')
        setDeliveryNotes('')
    }

    // Handle driver selection
    const handleDriverSelect = (driver) => {
        setSelectedDriver(driver)
        // Set estimated delivery time to 5 days from now
        const fiveDaysFromNow = new Date()
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5)
        setEstimatedDeliveryTime(fiveDaysFromNow.toISOString().slice(0, 16))
    }

    // Handle assignment submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!selectedOrder || !selectedDriver) {
            showNotification('Please select an order and driver', 'error')
            return
        }

        try {
            const response = await axios.post('http://localhost:5000/api/delivery/assign', {
                orderId: selectedOrder._id,
                driverId: selectedDriver._id
            })

            if (response.data.status === 'success') {
                showNotification('✅ Driver assignment completed successfully', 'success')
                // Refresh the orders list
                const ordersResponse = await axios.get('http://localhost:5000/api/delivery/pending-orders')
                if (ordersResponse.data.status === 'success') {
                    setOrders(ordersResponse.data.data)
                }
                // Reset form
                setSelectedOrder(null)
                setSelectedDriver(null)
                setEstimatedDeliveryTime('')
            }
        } catch (err) {
            console.error('Error assigning driver:', err)
            showNotification(err.response?.data?.message || 'Failed to assign driver. Please try again.', 'error')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Notification Component */}
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
                    notification.type === 'error' ? 'bg-red-100 text-red-800' :
                    notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                    'bg-blue-100 text-blue-800'
                }`}>
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* Header Section */}
            <header className="bg-gradient-to-r from-[#fdc501] to-[#ffd747] shadow-lg">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white drop-shadow-md">Assign Driver</h1>
                            <p className="text-white/90 mt-2">Manage driver assignments for pending deliveries</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                            <p className="text-sm opacity-80">Pending Orders</p>
                            <p className="text-2xl font-bold">{orders.length}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fdc501]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-800">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Orders List Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Pending Orders</h2>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search orders..."
                                            className="w-64 px-4 py-2 pl-10 rounded-lg border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all outline-none"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                    {filteredOrders.length > 0 ? (
                                        filteredOrders.map((order) => (
                                            <div
                                                key={order._id}
                                                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                                    selectedOrder?._id === order._id
                                                        ? 'border-[#fdc501] bg-[#fdc501]/5'
                                                        : 'border-gray-200 hover:border-[#fdc501]/50'
                                                }`}
                                                onClick={() => handleOrderSelect(order)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-gray-800">Order #{order._id}</h3>
                                                        <p className="text-gray-600">{order.customerName}</p>
                                                        <p className="text-sm text-gray-500">{order.customerAddress}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                        <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                            Pending
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No orders found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Assignment Form Section */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Assignment Details</h2>
                                
                                {selectedOrder ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Order Summary */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-800 mb-2">Selected Order</h3>
                                            <p className="text-gray-600">#{selectedOrder._id}</p>
                                            <p className="text-gray-600">{selectedOrder.customerName}</p>
                                            <p className="text-sm text-gray-500">{selectedOrder.customerAddress}</p>
                                        </div>

                                        {/* Driver Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Driver
                                            </label>
                                            <select
                                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all outline-none"
                                                value={selectedDriver?._id || ''}
                                                onChange={(e) => {
                                                    const driver = drivers.find(d => d._id === e.target.value);
                                                    handleDriverSelect(driver);
                                                }}
                                                required
                                            >
                                                <option value="">Choose a driver</option>
                                                {drivers && drivers.length > 0 ? (
                                                    drivers.map((driver) => (
                                                        <option key={driver._id} value={driver._id}>
                                                            {driver.fullName} ({driver.drivingLicense})
                                                        </option>
                                                    ))
                                                ) : (
                                                    <option disabled>No drivers available</option>
                                                )}
                                            </select>
                                        </div>

                                        {/* Estimated Delivery Time */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Estimated Delivery Time
                                            </label>
                                            <input
                                                type="datetime-local"
                                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all outline-none"
                                                value={estimatedDeliveryTime}
                                                readOnly
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="w-full bg-[#fdc501] hover:bg-[#fdc501]/90 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                                        >
                                            Assign Driver
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center py-12">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <p className="mt-4 text-gray-500">Select an order to assign a driver</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}