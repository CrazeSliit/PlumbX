const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// Get all deliveries
router.get('/', deliveryController.getAllDeliveries);

// Get pending orders for driver assignment
router.get('/pending-orders', deliveryController.getPendingOrders);

// Get available drivers
router.get('/available-drivers', deliveryController.getAvailableDrivers);

// Get delivery by ID
router.get('/:id', deliveryController.getDeliveryById);

// Create new delivery
router.post('/', deliveryController.createDelivery);

// Assign driver to order
router.post('/assign', deliveryController.assignDriver);

// Delete delivery
router.delete('/:id', deliveryController.deleteDelivery);

// Update delivery status
router.put('/:id/status', deliveryController.updateStatus);

// Get deliveries by driver
router.get('/driver/:driverId', deliveryController.getDeliveriesByDriver);

module.exports = router; 