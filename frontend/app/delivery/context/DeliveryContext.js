'use client'
import { createContext, useContext, useState } from 'react'

const DeliveryContext = createContext()

export function DeliveryProvider({ children }) {
    const [deliveries, setDeliveries] = useState({
        toDeliver: [],
        onDelivering: [],
        delivered: []
    })

    const updateDeliveryStatus = (orderId, newStatus) => {
        setDeliveries(prev => {
            // Implementation of status update logic
            return { ...prev }
        })
    }

    return (
        <DeliveryContext.Provider value={{ deliveries, updateDeliveryStatus }}>
            {children}
        </DeliveryContext.Provider>
    )
}

export function useDeliveries() {
    return useContext(DeliveryContext)
}
