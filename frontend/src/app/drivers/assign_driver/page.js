'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AssignDriverPage() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrders();
    fetchDrivers();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/delivery/pending-orders');
      const data = await response.json();
      if (data.status === 'success') {
        setPendingOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      toast.error('Failed to fetch pending orders');
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/delivery/available-drivers');
      const data = await response.json();
      if (data.status === 'success') {
        setDrivers(data.data);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to fetch available drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriver = async (orderId) => {
    if (!selectedDriver) {
      toast.error('Please select a driver first');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/delivery/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          driverId: selectedDriver,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Driver assigned successfully');
        fetchPendingOrders(); // Refresh the orders list
        setSelectedDriver(''); // Reset selected driver
      } else {
        toast.error(data.message || 'Failed to assign driver');
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Failed to assign driver');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Assign Driver to Orders</h1>
      
      <div className="grid gap-6">
        {pendingOrders.map((order) => (
          <Card key={order._id} className="w-full">
            <CardHeader>
              <CardTitle>Order #{order._id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <h3 className="font-semibold">Customer Information</h3>
                  <p>Name: {order.customerName}</p>
                  <p>Phone: {order.customerPhone}</p>
                  <p>Address: {order.customerAddress}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Order Items</h3>
                  <ul className="list-disc pl-4">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.name} - Quantity: {item.quantity} - Price: ${item.price}
                      </li>
                    ))}
                  </ul>
                  <p className="font-semibold mt-2">Total Amount: ${order.totalAmount}</p>
                </div>

                <div className="flex items-center gap-4">
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.driverId} value={driver.driverId}>
                          {driver.fullName} - {driver.vehicleId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={() => handleAssignDriver(order._id)}
                    disabled={!selectedDriver}
                  >
                    Assign Driver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {pendingOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No pending orders available</p>
          </div>
        )}
      </div>
    </div>
  );
} 