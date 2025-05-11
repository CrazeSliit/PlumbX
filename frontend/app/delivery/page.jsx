"use client";

import React, { useState, useEffect } from "react";

const DeliveryPage = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Fetch all orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/orders');
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch orders');
                }

                setOrders(data.data || []);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update order status');
            }

            // Update the orders list
            setOrders(orders.map(order => 
                order._id === orderId ? { ...order, status: newStatus } : order
            ));

            // Close the modal
            setSelectedOrder(null);
        } catch (error) {
            console.error('Error updating order status:', error);
            setError(error.message);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Delivery Management</h1>
            
            <div className="grid gap-6">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-semibold">Order #{order._id.slice(-6)}</h2>
                                <p className="text-gray-600">Total: LKR {order.totalAmount.toFixed(2)}</p>
                                <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                                <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3 className="font-medium mb-2">Items:</h3>
                            <div className="space-y-2">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {item.quantity} x LKR {item.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="text-gray-600">Size: {item.size}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Update Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Update Order Status</h2>
                        <p className="mb-4">Order #{selectedOrder._id.slice(-6)}</p>
                        
                        <div className="space-y-2">
                            {['pending', 'processing', 'completed', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => updateOrderStatus(selectedOrder._id, status)}
                                    className={`w-full text-left px-4 py-2 rounded ${
                                        selectedOrder.status === status
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="mt-4 w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryPage; 