const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Fixed routes order - specific routes first
router.get('/alerts', inventoryController.getAlerts);
router.get('/analytics', inventoryController.getInventoryAnalytics);
router.post('/forecast', inventoryController.getInventoryForecast);
router.get('/stats', inventoryController.getInventoryStats);
router.get('/categories', inventoryController.getCategoryStats);
router.get('/category/:category', inventoryController.getItemsByCategory);
router.get('/alerts/low-stock', inventoryController.getLowStockAlerts);
router.get('/report', inventoryController.getInventoryReport);

// Generic CRUD routes
router.get('/', inventoryController.getAllItems);
router.get('/:id', inventoryController.getItemById);
router.post('/', inventoryController.createItem);
router.put('/:id', inventoryController.updateItem);
router.delete('/:id', inventoryController.deleteItem);

module.exports = router;