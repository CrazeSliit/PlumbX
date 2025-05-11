"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotationPDF from './QuotationPDF';

const CartPage = () => {
    const router = useRouter();
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: ''
    });

    // Load cart items from local storage
    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                // Ensure each item has all required fields
                const validatedCart = parsedCart.map(item => ({
                    id: item.id || Math.random().toString(36).substr(2, 9),
                    name: item.name || 'Unknown Product',
                    price: Number(item.price) || 0,
                    size: item.size || 'N/A',
                    quantity: Number(item.quantity) || 1,
                    image: item.image || '/placeholder-image.png'
                }));
                setCartItems(validatedCart);
            } catch (error) {
                console.error('Error parsing cart data:', error);
                setCartItems([]);
            }
        }
    }, []);

    // Function to update quantity
    const updateQuantity = (id, newQuantity) => {
        const updatedCart = cartItems.map(item =>
            item.id === id ? { ...item, quantity: Number(newQuantity) } : item
        );
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    // Function to remove an item from the cart
    const removeFromCart = (id) => {
        const updatedCart = cartItems.filter(item => item.id !== id);
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    // Calculate total price
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Handle customer info input changes
    const handleCustomerInfoChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Checkout function: Create order in backend and clear cart
    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            setError("Your cart is empty");
            return;
        }

        // Show customer form instead of directly creating order
        setShowCustomerForm(true);
    };

    // Submit order with customer information
    const submitOrder = async (e) => {
        e.preventDefault();
        
        // Validate customer information
        if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
            setError("Please fill in all customer information fields");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Prepare order data with all required fields including customer info
            const orderData = {
                customerName: customerInfo.name,
                customerPhone: customerInfo.phone,
                customerAddress: customerInfo.address,
                items: cartItems.map(item => ({
                    name: item.name,
                    price: Number(item.price),
                    size: item.size,
                    quantity: Number(item.quantity),
                    image: item.image
                })),
                totalAmount: calculateTotal()
            };

            console.log('Sending order data:', orderData);

            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create order');
            }

            console.log('Order created successfully:', data);

            // Clear cart
            localStorage.removeItem("cart");
            setCartItems([]);

            // Reset customer info
            setCustomerInfo({ name: '', phone: '', address: '' });
            setShowCustomerForm(false);

            // Redirect to Order Dashboard
            router.push("/customers/order");
        } catch (error) {
            console.error('Error creating order:', error);
            setError(error.message || 'Failed to create order. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-6">Shopping Cart</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {cartItems.length === 0 ? (
                <p className="text-gray-500 text-center">Your cart is empty</p>
            ) : (
                <div className="space-y-4">
                    {cartItems.map((item, index) => (
                        <div key={item.id || index} className="flex justify-between items-center bg-white p-4 shadow-lg rounded">
                            <div className="flex items-center space-x-4">
                                {item.image && (
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-20 h-20 object-cover rounded"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.png';
                                        }}
                                    />
                                )}
                                <div>
                                    <h2 className="font-semibold text-lg">{item.name}</h2>
                                    <p className="text-gray-700">Price: LKR {item.price.toFixed(2)}</p>
                                    <p className="text-gray-700">Size: {item.size}</p>

                                    {/* Quantity Selector */}
                                    <label className="block mt-2">
                                        Quantity:
                                        <select
                                            className="ml-2 border rounded px-2 py-1"
                                            value={item.quantity}
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="font-bold">LKR {(item.price * item.quantity).toFixed(2)}</p>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="mt-2 text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    <div className="bg-white p-4 shadow-lg rounded mt-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Total</h2>
                            <p className="text-xl font-bold">LKR {calculateTotal().toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between items-center mt-6">
                            <PDFDownloadLink
                                document={<QuotationPDF items={cartItems} totalAmount={calculateTotal()} />}
                                fileName={`quotation-${Date.now().toString().slice(-6)}.pdf`}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                            >
                                {({ blob, url, loading, error }) =>
                                    loading ? 'Generating PDF...' : 'Download Quotation'
                                }
                            </PDFDownloadLink>
                            <button
                                onClick={handleCheckout}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Information Form Modal */}
            {showCustomerForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Enter Your Information</h2>
                        <form onSubmit={submitOrder}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={customerInfo.name}
                                        onChange={handleCustomerInfoChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={customerInfo.phone}
                                        onChange={handleCustomerInfoChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Delivery Address *</label>
                                    <textarea
                                        name="address"
                                        value={customerInfo.address}
                                        onChange={handleCustomerInfoChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Place Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;


