const Order = require('../models/Order');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        console.log('Creating new order with data:', req.body);
        
        const { items, totalAmount, customerName, customerPhone, customerAddress } = req.body;
        
        // Validate request data
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Order must contain at least one item' 
            });
        }

        if (!totalAmount || isNaN(totalAmount)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid total amount' 
            });
        }

        // Validate customer information
        if (!customerName || !customerPhone || !customerAddress) {
            return res.status(400).json({
                success: false,
                message: 'Customer information (name, phone, address) is required'
            });
        }

        // Validate each item
        for (const item of items) {
            if (!item.name || !item.price || !item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have a name, price, and quantity'
                });
            }
        }

        // Create new order
        const order = new Order({
            customerName,
            customerPhone,
            customerAddress,
            items: items.map(item => ({
                name: item.name,
                price: item.price,
                size: item.size || 'N/A',
                quantity: item.quantity,
                image: item.image || ''
            })),
            totalAmount: totalAmount,
            status: 'pending'
        });

        console.log('Saving order to database...');
        const savedOrder = await order.save();
        console.log('Order saved successfully:', savedOrder);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: savedOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all orders
exports.getOrders = async (req, res) => {
    try {
        console.log('Fetching all orders...');
        const orders = await Order.find()
            .populate('driver')  // Populate the driver field
            .sort({ createdAt: -1 });
        console.log(`Found ${orders.length} orders`);
        
        res.json({
            status: 'success',  // Changed from success: true to match frontend expectation
            data: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ 
            status: 'error',  // Changed to match frontend expectation
            message: 'Failed to fetch orders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get a single order
exports.getOrder = async (req, res) => {
    try {
        console.log(`Fetching order with ID: ${req.params.id}`);
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            console.log('Order not found');
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        console.log('Order found:', order);
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update an order
exports.updateOrder = async (req, res) => {
    try {
        console.log(`Updating order with ID: ${req.params.id}`);
        console.log('Request body:', req.body);
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'processing', 'on delivering', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            console.log('Invalid status provided:', status);
            return res.status(400).json({ 
                success: false, 
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }

        // Find and update the order
        const order = await Order.findById(req.params.id);
        if (!order) {
            console.log('Order not found for update');
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        console.log(`Current order status: ${order.status}`);
        console.log(`Updating to new status: ${status}`);

        // Update order status
        order.status = status;
        order.updatedAt = Date.now();
        
        const updatedOrder = await order.save();
        console.log('Order updated successfully:', updatedOrder);

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
    try {
        console.log(`Deleting order with ID: ${req.params.id}`);
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            console.log('Order not found for deletion');
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        console.log('Order deleted successfully');
        res.json({ 
            success: true,
            message: 'Order deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update an order item
exports.updateOrderItem = async (req, res) => {
    try {
        console.log(`Updating item ${req.params.itemId} in order ${req.params.orderId}`);
        console.log('Update data:', req.body);

        const { quantity } = req.body;

        // Validate input
        if (!quantity || isNaN(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quantity. Must be a positive number.'
            });
        }

        // Find the order
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Find and update the item
        const itemIndex = order.items.findIndex(item => item._id.toString() === req.params.itemId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in order'
            });
        }

        // Update item quantity
        order.items[itemIndex].quantity = quantity;

        // Recalculate total amount
        order.totalAmount = order.items.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );

        // Save the updated order
        const updatedOrder = await order.save();
        console.log('Order updated successfully:', updatedOrder);

        res.json({
            success: true,
            message: 'Quantity updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update quantity',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete an order item
exports.deleteOrderItem = async (req, res) => {
    try {
        console.log(`Deleting item ${req.params.itemId} from order ${req.params.orderId}`);

        // Find the order
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Remove the item
        order.items = order.items.filter(item => item._id.toString() !== req.params.itemId);

        // If no items left, delete the order
        if (order.items.length === 0) {
            await Order.findByIdAndDelete(req.params.orderId);
            return res.json({
                success: true,
                message: 'Order deleted as it has no items left'
            });
        }

        // Recalculate total amount
        order.totalAmount = order.items.reduce((total, item) => 
            total + (item.price * item.quantity), 0
        );

        // Save the updated order
        const updatedOrder = await order.save();
        console.log('Order updated successfully:', updatedOrder);

        res.json({
            success: true,
            message: 'Order item deleted successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Error deleting order item:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete order item',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        console.log(`Updating status for order with ID: ${req.params.id}`);
        console.log('Request body:', req.body);
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'processing', 'on delivering', 'completed', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            console.log('Invalid status provided:', status);
            return res.status(400).json({ 
                success: false, 
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }

        // Find and update the order
        const order = await Order.findById(req.params.id);
        if (!order) {
            console.log('Order not found for status update');
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        console.log(`Current order status: ${order.status}`);
        console.log(`Updating to new status: ${status}`);

        // Update order status
        order.status = status;
        order.updatedAt = Date.now();
        
        const updatedOrder = await order.save();
        console.log('Order status updated successfully:', updatedOrder);

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update order status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get orders by status for delivery reports
exports.getOrdersByStatus = async (req, res) => {
    try {
        console.log('🔍 DEBUG: Fetching orders by status for delivery reports...');
        const { status } = req.params;
        
        // Validate status
        const validStatuses = ['pending', 'on delivering', 'completed'];
        if (!validStatuses.includes(status)) {
            console.log('❌ DEBUG: Invalid status provided:', status);
            return res.status(400).json({
                status: 'error',
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }
        
        // Find orders by status and populate driver information
        // Explicitly select all fields including totalAmount
        const orders = await Order.find({ status })
            .select('_id customerName customerAddress totalAmount createdAt updatedAt assignedDate driver driverVehicle items')
            .populate('driver', '_id name phone') // Populate driver with specific fields
            .sort({ createdAt: -1 });
            
        console.log(`✅ DEBUG: Found ${orders.length} orders with status: ${status}`);
        
        // Log raw orders data to verify totalAmount and driver info
        orders.forEach(order => {
            console.log('📦 DEBUG: Raw order data:', {
                id: order._id,
                totalAmount: order.totalAmount,
                type: typeof order.totalAmount,
                status: order.status,
                driver: order.driver ? {
                    id: order.driver._id,
                    name: order.driver.name
                } : null
            });
        });
        
        // Format the data for the frontend
        const formattedOrders = orders.map(order => {
            // Ensure totalAmount is a number
            const totalAmount = typeof order.totalAmount === 'number' ? order.totalAmount : 0;
            
            const baseData = {
                id: order._id,
                location: order.customerAddress,
                customerName: order.customerName,
                totalAmount: totalAmount, // Send the totalAmount directly
                preparedDate: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : null
            };
            
            // Add additional fields based on status
            if (status === 'on delivering') {
                return {
                    ...baseData,
                    startedDateTime: order.assignedDate ? new Date(order.assignedDate).toISOString().replace('T', ' ').substring(0, 16) : null,
                    driverId: order.driver ? order.driver._id : null,
                    driverName: order.driver ? order.driver.name : null,
                    vehicleId: order.driverVehicle || null
                };
            } else if (status === 'completed') {
                return {
                    ...baseData,
                    startedDateTime: order.assignedDate ? new Date(order.assignedDate).toISOString().replace('T', ' ').substring(0, 16) : null,
                    deliveredDateTime: order.updatedAt ? new Date(order.updatedAt).toISOString().replace('T', ' ').substring(0, 16) : null,
                    driverId: order.driver ? order.driver._id : null,
                    driverName: order.driver ? order.driver.name : null,
                    vehicleId: order.driverVehicle || null
                };
            }
            
            return baseData;
        });
        
        console.log('📊 DEBUG: Formatted orders with totalAmount and driver info:', formattedOrders.map(order => ({
            id: order.id,
            totalAmount: order.totalAmount,
            status: status,
            driverId: order.driverId,
            driverName: order.driverName
        })));
        
        res.json({
            status: 'success',
            data: formattedOrders
        });
    } catch (error) {
        console.error('❌ DEBUG: Error fetching orders by status:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch orders by status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get orders by status
exports.getOrdersByStatus = async (req, res) => {
    try {
        console.log(`Fetching orders with status: ${req.params.status}`);
        const { status } = req.params;

        // Validate status
        const validStatuses = ['pending', 'processing', 'on delivering', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            console.log('Invalid status provided:', status);
            return res.status(400).json({ 
                status: 'error', 
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }

        // Find orders with the specified status
        const orders = await Order.find({ status })
            .populate('driver')
            .sort({ createdAt: -1 });

        console.log(`Found ${orders.length} orders with status: ${status}`);

        // Format the response data according to frontend expectations
        const formattedOrders = orders.map(order => {
            const baseData = {
                id: order._id,
                location: order.customerAddress,
                customerName: order.customerName,
                preparedDate: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : null
            };

            // Add additional fields based on status
            if (status === 'on delivering') {
                return {
                    ...baseData,
                    startedDateTime: order.assignedDate ? new Date(order.assignedDate).toISOString().replace('T', ' ').substring(0, 16) : null,
                    driverId: order.driver ? order.driver._id : null,
                    vehicleId: order.driverVehicle || null
                };
            } else if (status === 'completed') {
                return {
                    ...baseData,
                    startedDateTime: order.assignedDate ? new Date(order.assignedDate).toISOString().replace('T', ' ').substring(0, 16) : null,
                    deliveredDateTime: order.updatedAt ? new Date(order.updatedAt).toISOString().replace('T', ' ').substring(0, 16) : null,
                    driverId: order.driver ? order.driver._id : null,
                    vehicleId: order.driverVehicle || null
                };
            }

            return baseData;
        });

        res.json({
            status: 'success',
            data: formattedOrders
        });
    } catch (error) {
        console.error('Error fetching orders by status:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to fetch orders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create a test order (for testing purposes only)
exports.createTestOrder = async (req, res) => {
    try {
        console.log('🔍 DEBUG: Creating test order...');
        
        // Create a test order with pending status
        const testOrder = new Order({
            customerName: 'Test Customer',
            customerPhone: '1234567890',
            customerAddress: '123 Test Street',
            items: [{
                name: 'Test Item',
                price: 100,
                quantity: 1,
                size: 'M'
            }],
            totalAmount: 100,
            status: 'pending'
        });

        console.log('📝 DEBUG: Test order data:', testOrder);
        
        const savedOrder = await testOrder.save();
        console.log('✅ DEBUG: Test order saved successfully:', savedOrder);

        res.status(201).json({
            status: 'success',
            message: 'Test order created successfully',
            data: savedOrder
        });
    } catch (error) {
        console.error('❌ DEBUG: Error creating test order:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create test order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 