const Order = require('../models/Order');
const Driver = require('../models/Driver');
const Delivery = require('../models/deliveryModel');

// @desc    Get all deliveries
// @route   GET /api/delivery
// @access  Private
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate('driver')
      .sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      data: deliveries
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get delivery by ID
// @route   GET /api/delivery/:id
// @access  Private
exports.getDeliveryById = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: `Get delivery by ID: ${req.params.id}`,
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new delivery
// @route   POST /api/delivery
// @access  Private
exports.createDelivery = async (req, res) => {
  try {
    res.status(201).json({
      status: 'success',
      message: 'Create delivery endpoint',
      data: req.body
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update delivery
// @route   PUT /api/delivery/:id
// @access  Private
exports.updateDelivery = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: `Update delivery with ID: ${req.params.id}`,
      data: req.body
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete delivery
// @route   DELETE /api/delivery/:id
// @access  Private
exports.deleteDelivery = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: `Delete delivery with ID: ${req.params.id}`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get pending orders for driver assignment
// @route   GET /api/delivery/pending-orders
// @access  Private
exports.getPendingOrders = async (req, res) => {
  try {
    const pendingOrders = await Order.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      data: pendingOrders
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get available drivers
// @route   GET /api/delivery/available-drivers
// @access  Private
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      data: drivers
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Assign driver to order
// @route   POST /api/delivery/assign
// @access  Private
exports.assignDriver = async (req, res) => {
  try {
    const { orderId, driverId } = req.body;
    console.log('Received request to assign driver:', { orderId, driverId });

    if (!orderId || !driverId) {
      console.log('Missing required fields:', { orderId, driverId });
      return res.status(400).json({
        status: 'error',
        message: 'Order ID and Driver ID are required'
      });
    }

    // Find the order
    console.log('Finding order with ID:', orderId);
    const order = await Order.findById(orderId);
    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    console.log('Order found:', order);

    // Find the driver
    console.log('Finding driver with ID:', driverId);
    const driver = await Driver.findById(driverId);
    if (!driver) {
      console.log('Driver not found:', driverId);
      return res.status(404).json({
        status: 'error',
        message: 'Driver not found'
      });
    }
    console.log('Driver found:', driver);

    // Update order with driver details and status
    console.log('Updating order with driver details');
    order.driver = driver._id;
    order.driverName = driver.fullName;
    order.driverPhone = driver.phone;
    order.driverVehicle = driver.vehicleId;
    order.status = 'on delivering';
    order.assignedDate = new Date();
    
    await order.save();
    console.log('Order updated successfully');

    res.status(200).json({
      status: 'success',
      message: 'Driver assigned successfully',
      data: {
        order
      }
    });
  } catch (error) {
    console.error('Error in assignDriver:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to assign driver'
    });
  }
};

// @desc    Update delivery status
// @route   PUT /api/delivery/:id/status
// @access  Private
exports.updateStatus = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: `Update status for delivery ID: ${req.params.id}`,
      data: req.body
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get deliveries by driver
// @route   GET /api/delivery/driver/:driverId
// @access  Private
exports.getDeliveriesByDriver = async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: `Get deliveries for driver ID: ${req.params.driverId}`,
      data: []
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 