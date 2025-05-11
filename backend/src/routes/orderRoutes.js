const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get all orders
router.get('/', orderController.getOrders);

// Get orders by status
router.get('/status/:status', orderController.getOrdersByStatus);

// Get a single order
router.get('/:id', orderController.getOrder);

// Create a new order
router.post('/', orderController.createOrder);

// Create a test order (for testing purposes only)
router.post('/test', orderController.createTestOrder);

// Check all orders in database
router.get('/check/all', async (req, res) => {
    try {
        const Order = require('../models/Order');
        const orders = await Order.find();
        res.json({
            status: 'success',
            count: orders.length,
            orders: orders
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Update an order
router.put('/:id', orderController.updateOrder);

// Update order status
router.put('/:id/status', orderController.updateOrderStatus);

// Delete an order
router.delete('/:id', orderController.deleteOrder);

// Update an order item
router.put('/:orderId/items/:itemId', orderController.updateOrderItem);

// Delete an order item
router.delete('/:orderId/items/:itemId', orderController.deleteOrderItem);

module.exports = router; 