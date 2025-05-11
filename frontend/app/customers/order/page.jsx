"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PDFDownloadLink } from '@react-pdf/renderer';
import OrderPDF from './OrderPDF';

const OrderPage = () => {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: ''
    });

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

    // Handle customer info input changes
    const handleCustomerInfoChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Create new order with customer information
    const createOrder = async (items) => {
        try {
            const orderData = {
                ...customerInfo,
                items,
                totalAmount: items.reduce((total, item) => total + (item.price * item.quantity), 0)
            };

            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create order');
            }

            // Refresh orders list
            const updatedOrdersResponse = await fetch('http://localhost:5000/api/orders');
            const updatedOrdersData = await updatedOrdersResponse.json();
            setOrders(updatedOrdersData.data || []);

            // Reset form and close modal
            setCustomerInfo({ name: '', phone: '', address: '' });
            setShowCustomerForm(false);

            return data;
        } catch (error) {
            console.error('Error creating order:', error);
            setError(error.message);
            throw error;
        }
    };

    // Update order item quantity
    const updateOrderItem = async (orderId, itemId, quantity) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: parseInt(quantity) }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update quantity');
            }

            // Update the orders list
            setOrders(orders.map(order => {
                if (order._id === orderId) {
                    return {
                        ...order,
                        items: order.items.map(item => 
                            item._id === itemId ? { ...item, quantity: parseInt(quantity) } : item
                        )
                    };
                }
                return order;
            }));

            // Close the edit modal
            setEditingItem(null);
            setEditingOrder(null);
        } catch (error) {
            console.error('Error updating quantity:', error);
            setError(error.message);
        }
    };

    // Delete order item
    const deleteOrderItem = async (orderId, itemId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/items/${itemId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete item');
            }

            // Update the orders list
            setOrders(orders.map(order => {
                if (order._id === orderId) {
                    return {
                        ...order,
                        items: order.items.filter(item => item._id !== itemId)
                    };
                }
                return order;
            }));
        } catch (error) {
            console.error('Error deleting item:', error);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">My Orders</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <select className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option>All Status</option>
                            <option>Pending</option>
                            <option>On Delivering</option>
                            <option>Completed</option>
                        </select>
                    </div>
                </div>
            
                <div className="grid gap-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
                            <div 
                                className="p-6 cursor-pointer"
                                onClick={() => {
                                    const element = document.getElementById(`order-${order._id}`);
                                    if (expandedOrderId === order._id) {
                                        element.classList.add('max-h-0');
                                        element.classList.remove('max-h-[2000px]');
                                        setExpandedOrderId(null);
                                    } else {
                                        // Collapse previously expanded card
                                        if (expandedOrderId) {
                                            const prevElement = document.getElementById(`order-${expandedOrderId}`);
                                            if (prevElement) {
                                                prevElement.classList.add('max-h-0');
                                                prevElement.classList.remove('max-h-[2000px]');
                                            }
                                        }
                                        // Expand new card
                                        element.classList.remove('max-h-0');
                                        element.classList.add('max-h-[2000px]');
                                        setExpandedOrderId(order._id);
                                    }
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-xl font-semibold text-gray-800">{order.customerName}</h2>
                                                <span className="text-sm text-gray-500">(Order #{order._id.slice(-4)})</span>
                                            </div>
                                            <p className="text-gray-600">{order.customerPhone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-800">LKR {order.totalAmount.toFixed(2)}</p>
                                            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'on delivering' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div 
                                id={`order-${order._id}`}
                                className="max-h-0 overflow-hidden transition-all duration-500 ease-in-out"
                            >
                                <div className="border-t border-gray-100">
                                    <div className="p-6">
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delivery Address</h3>
                                            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{order.customerAddress}</p>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                                        <div className="space-y-4">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                                                    <div className="flex items-center space-x-4">
                                                        {item.image && (
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.name} 
                                                                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                                                onError={(e) => {
                                                                    e.target.src = '/placeholder.png';
                                                                }}
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-800">{item.name}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {item.quantity} x LKR {item.price.toFixed(2)}
                                                            </p>
                                                            <p className="text-sm text-gray-600">Size: {item.size}</p>
                                                        </div>
                                                    </div>
                                                    {order.status !== 'on delivering' && order.status !== 'completed' && (
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingOrder(order);
                                                                    setEditingItem(item);
                                                                }}
                                                                className="px-4 py-2 rounded-lg transition-all duration-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                            >
                                                                Update Quantity
                                                            </button>
                                                            <button
                                                                onClick={() => deleteOrderItem(order._id, item._id)}
                                                                className="px-4 py-2 rounded-lg transition-all duration-200 bg-red-50 text-red-600 hover:bg-red-100"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                                        >
                                            <PDFDownloadLink
                                                document={<OrderPDF order={order} />}
                                                fileName={`order-${order._id}.pdf`}
                                                className="text-white"
                                            >
                                                {({ blob, url, loading, error }) =>
                                                    loading ? 'Generating PDF...' : 'Download PDF'
                                                }
                                            </PDFDownloadLink>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Customer Information Form */}
            {showCustomerForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Enter Your Information</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            createOrder(editingOrder.items);
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={customerInfo.name}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={customerInfo.phone}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                                    <textarea
                                        name="address"
                                        value={customerInfo.address}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        rows="3"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCustomerForm(false);
                                        setCustomerInfo({ name: '', phone: '', address: '' });
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-200"
                                >
                                    Place Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quantity Update Modal */}
            {editingOrder && editingItem && !showCustomerForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Update Quantity</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            updateOrderItem(
                                editingOrder._id,
                                editingItem._id,
                                formData.get('quantity')
                            );
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        defaultValue={editingItem.quantity}
                                        min="1"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingOrder(null);
                                        setEditingItem(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-all duration-200"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderPage;
