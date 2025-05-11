'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaSearch, FaSortAlphaDown, FaSortAlphaUp, FaClock, FaFileDownload } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import axios from 'axios';

// Simple component implementations
const Tabs = ({ defaultValue, children, className }) => {
    const [value, setValue] = useState(defaultValue);
    return <div className={className} data-value={value}>{children(value, setValue)}</div>;
};

const TabsList = ({ className, children }) => <div className={className}>{children}</div>;

const TabsTrigger = ({ value, onClick, children, className }) => (
    <button 
        onClick={() => onClick(value)}
        className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 hover:bg-[#fdc501]/10 transition-colors focus:outline-none focus:border-[#fdc501] ${className}`}
    >
        {children}
    </button>
);

const TabsContent = ({ value, activeValue, children }) => 
    value === activeValue ? children : null;

const Collapsible = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return children(isOpen, setIsOpen);
};

export default function DeliveryReports() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'to-deliver';
    
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isGenerating, setIsGenerating] = useState(false);
    const [fileType, setFileType] = useState('pdf');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reports, setReports] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // State for delivery data
    const [deliveryData, setDeliveryData] = useState({
        'to-deliver': [],
        'on-delivering': [],
        'delivered': []
    });

    // Add new state for selected tables
    const [selectedTables, setSelectedTables] = useState({
        'to-deliver': true,
        'on-delivering': true,
        'delivered': true
    });

    // Update activeTab when URL changes
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['to-deliver', 'on-delivering', 'delivered'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Fetch data from the backend
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Map frontend tab names to backend status values
                const statusMap = {
                    'to-deliver': 'pending',
                    'on-delivering': 'on delivering',
                    'delivered': 'completed'
                };
                
                console.log('🔍 DEBUG: Fetching data for status:', statusMap[activeTab]);
                
                // Fetch data for the active tab
                const response = await axios.get(`http://localhost:5000/api/orders/status/${statusMap[activeTab]}`);
                
                console.log('✅ DEBUG: Raw backend response:', response);
                console.log('✅ DEBUG: Response data:', response.data);
                console.log('✅ DEBUG: Orders array:', response.data.data);
                
                if (response.data.status === 'success') {
                    // Log each order's total amount
                    response.data.data.forEach(order => {
                        console.log('💰 DEBUG: Order total amount:', {
                            orderId: order.id || order._id,
                            totalAmount: order.totalAmount,
                            type: typeof order.totalAmount
                        });
                    });
                    
                    // Update the delivery data for the current tab
                    setDeliveryData(prevData => {
                        const newData = {
                            ...prevData,
                            [activeTab]: response.data.data || []
                        };
                        console.log('📊 DEBUG: Updated delivery data:', newData);
                        return newData;
                    });
                } else {
                    console.error('❌ DEBUG: Failed to fetch data:', response.data);
                    setError('Failed to fetch data from the server');
                }
            } catch (err) {
                console.error('❌ DEBUG: Error fetching delivery data:', err);
                setError(err.response?.data?.message || 'Failed to fetch data from the server');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [activeTab]);
    
    // Fetch all data on component mount
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Fetch data for all tabs at once
                const [pendingResponse, onDeliveringResponse, completedResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/orders/status/pending'),
                    axios.get('http://localhost:5000/api/orders/status/on delivering'),
                    axios.get('http://localhost:5000/api/orders/status/completed')
                ]);
                
                console.log('✅ DEBUG: Fetched all data successfully');
                
                // Update the delivery data for all tabs
                setDeliveryData({
                    'to-deliver': pendingResponse.data.status === 'success' ? pendingResponse.data.data : [],
                    'on-delivering': onDeliveringResponse.data.status === 'success' ? onDeliveringResponse.data.data : [],
                    'delivered': completedResponse.data.status === 'success' ? completedResponse.data.data : []
                });
                
                console.log('📊 DEBUG: Updated all delivery data');
            } catch (err) {
                console.error('❌ DEBUG: Error fetching all delivery data:', err);
                setError('Failed to fetch data from the server');
            } finally {
                setLoading(false);
            }
        };
        
        fetchAllData();
    }, []);

    // Debug function to check data structure
    const debugData = () => {
        console.log('Current active tab:', activeTab);
        console.log('Delivery data for current tab:', deliveryData[activeTab]);
        
        if (deliveryData[activeTab] && deliveryData[activeTab].length > 0) {
            console.log('Sample item structure:', deliveryData[activeTab][0]);
        }
    };
    
    // Call debug function when data changes
    useEffect(() => {
        debugData();
    }, [deliveryData, activeTab]);

    // Sort options
    const sortOptions = [
        { value: 'newest', label: 'Newest First', icon: <FaClock /> },
        { value: 'oldest', label: 'Oldest First', icon: <FaClock className="transform rotate-180" /> },
        { value: 'asc', label: 'A-Z', icon: <FaSortAlphaDown /> },
        { value: 'desc', label: 'Z-A', icon: <FaSortAlphaUp /> }
    ];

    // Filter and sort data
    const getFilteredAndSortedData = (data) => {
        return data
            .filter(item => {
                const query = searchQuery.toLowerCase();
                return Object.values(item)
                    .join(' ')
                    .toLowerCase()
                    .includes(query);
            })
            .sort((a, b) => {
                switch (sortOption) {
                    case 'asc':
                        return a.id.localeCompare(b.id);
                    case 'desc':
                        return b.id.localeCompare(a.id);
                    case 'oldest':
                        return a.id.localeCompare(b.id);
                    case 'newest':
                    default:
                        return b.id.localeCompare(a.id);
                }
            });
    };

    // Update the table headers based on the active tab
    const getTableHeaders = (tab) => {
        switch(tab) {
            case 'to-deliver':
                return ['Order ID', 'Customer Name', 'Customer Address', 'Ordered Date'];
            case 'on-delivering':
                return ['Order ID', 'Customer Name', 'Customer Address', 'Driver ID', 'Vehicle ID'];
            case 'delivered':
                return ['Order ID', 'Customer Name', 'Customer Address', 'Driver ID', 'Vehicle ID', 'Delivered Date'];
            default:
                return [];
        }
    };

    // Get row data based on the active tab
    const getRowData = (item, tab) => {
        console.log('🔄 DEBUG: Processing item for row:', {
            tab,
            item
        });
        
        // Extract the order ID from the item and format it
        const orderId = item.id || item._id || 'N/A';
        // Format the order ID to be more readable (remove ObjectId format)
        const formattedOrderId = orderId.toString().substring(0, 8);
        
        // Format driver ID to be more readable
        const formatDriverId = (driverId) => {
            if (!driverId) return 'N/A';
            // If it's an object with _id, use that
            if (typeof driverId === 'object' && driverId._id) {
                return driverId._id.toString().substring(0, 8);
            }
            // If it's a string, use it directly
            return driverId.toString().substring(0, 8);
        };
        
        // Create row data based on tab
        let rowData = [];
        
        switch(tab) {
            case 'to-deliver':
                rowData = [
                    `#${formattedOrderId}`,
                    item.customerName || 'N/A',
                    item.customerAddress || item.location || 'N/A',
                    item.createdAt || item.preparedDate ? new Date(item.createdAt || item.preparedDate).toLocaleDateString() : 'N/A'
                ];
                break;
            case 'on-delivering':
                rowData = [
                    `#${formattedOrderId}`,
                    item.customerName || 'N/A',
                    item.customerAddress || item.location || 'N/A',
                    formatDriverId(item.driverId || item.driver),
                    item.vehicleId || item.driverVehicle || 'N/A'
                ];
                break;
            case 'delivered':
                rowData = [
                    `#${formattedOrderId}`,
                    item.customerName || 'N/A',
                    item.customerAddress || item.location || 'N/A',
                    formatDriverId(item.driverId || item.driver),
                    item.vehicleId || item.driverVehicle || 'N/A',
                    item.updatedAt || item.deliveredDateTime ? new Date(item.updatedAt || item.deliveredDateTime).toLocaleString() : 'N/A'
                ];
                break;
            default:
                rowData = [];
        }
        
        // Log the final row data
        console.log('📋 DEBUG: Final row data:', rowData);
        
        return rowData;
    };

    // Add function to generate PDF header and footer
    const generatePDFHeader = (doc, title) => {
        // Add logo
        const logoUrl = '/logo.png'; // Update this with your actual logo path
        doc.addImage(logoUrl, 'PNG', 14, 10, 30, 30);
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(253, 197, 1); // #fdc501
        doc.text('Delivery Management System', 50, 20);
        
        // Add subtitle
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 50, 30);
        
        // Add date
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 40);
        
        // Add line
        doc.setDrawColor(253, 197, 1);
        doc.setLineWidth(0.5);
        doc.line(14, 45, 196, 45);
        
        return 50; // Return the Y position where content should start
    };

    const generatePDFFooter = (doc, pageNumber) => {
        const pageHeight = doc.internal.pageSize.height;
        
        // Add line
        doc.setDrawColor(253, 197, 1);
        doc.setLineWidth(0.5);
        doc.line(14, pageHeight - 35, 196, pageHeight - 35);
        
        // Add footer text
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        
        // Left side - Website details
        doc.text('Delivery Management System', 14, pageHeight - 25);
        doc.text('www.deliverymanagement.com', 14, pageHeight - 20);
        
        // Right side - Page number
        doc.text(`Page ${pageNumber}`, 196, pageHeight - 20, { align: 'right' });
    };

    // Update handleGenerateReport function
    const handleGenerateReport = async () => {
        setIsGenerating(true);
        
        try {
            // Get selected tables
            const selectedTabs = Object.entries(selectedTables)
                .filter(([_, isSelected]) => isSelected)
                .map(([tabName]) => tabName);
            
            if (selectedTabs.length === 0) {
                console.error('❌ DEBUG: No tables selected for export');
                return;
            }

            // Fetch fresh data for selected tabs
            const fetchPromises = selectedTabs.map(tab => {
                const statusMap = {
                    'to-deliver': 'pending',
                    'on-delivering': 'on delivering',
                    'delivered': 'completed'
                };
                return axios.get(`http://localhost:5000/api/orders/status/${statusMap[tab]}`);
            });
            
            const responses = await Promise.all(fetchPromises);
            
            // Create a workbook for Excel or prepare PDF documents
            if (fileType === 'excel') {
                const wb = XLSX.utils.book_new();
                
                // Process each selected tab's data
                selectedTabs.forEach((tabName, index) => {
                    const response = responses[index];
                    const tabLabel = tabName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const headers = getTableHeaders(tabName);
                    const formattedData = (response.data.data || []).map(item => getRowData(item, tabName));
                    const ws = XLSX.utils.aoa_to_sheet([headers, ...formattedData]);
                    XLSX.utils.book_append_sheet(wb, ws, tabLabel);
                });
                
                // Save the Excel file
                XLSX.writeFile(wb, `delivery-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
            } else {
                // For PDF, create a separate document for each selected tab
                selectedTabs.forEach((tabName, index) => {
                    const response = responses[index];
                    const tabLabel = tabName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const doc = new jsPDF();

                    // Generate header and get starting Y position
                    const startY = generatePDFHeader(doc, `Delivery Report - ${tabLabel}`);
                    
                    // Add table
                autoTable(doc, {
                        head: [getTableHeaders(tabName)],
                        body: (response.data.data || []).map(item => getRowData(item, tabName)),
                        startY: startY,
                    theme: 'grid',
                    headStyles: { 
                        fillColor: [253, 197, 1],
                        textColor: [0, 0, 0],
                            fontSize: 10,
                            fontStyle: 'bold'
                        },
                        bodyStyles: {
                            fontSize: 9
                        },
                        alternateRowStyles: {
                            fillColor: [245, 245, 245]
                        },
                        margin: { left: 14, right: 14 },
                        didDrawPage: function(data) {
                            generatePDFFooter(doc, doc.internal.getNumberOfPages());
                        }
                    });
                    
                    // Save the PDF
                    doc.save(`delivery-report-${tabName}-${new Date().toISOString().split('T')[0]}.pdf`);
                });
            }
            
            console.log('✅ DEBUG: Reports generated successfully');
        } catch (error) {
            console.error('❌ DEBUG: Error generating reports:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Function to show notification
    const showNotification = (message, type = 'info') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {notification.show && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
                    notification.type === 'error' ? 'bg-red-100 text-red-800' :
                    notification.type === 'success' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                }`}>
                    {notification.message}
                </div>
            )}
            <header className="bg-gradient-to-r from-[#fdc501] to-[#ffd747] shadow-lg">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white drop-shadow-md">Delivery Reports</h1>
                            <p className="text-white/90 mt-2">Generate and manage delivery reports</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <Tabs defaultValue="to-deliver" className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {(activeTab, setActiveTab) => (
                        <>
                            <TabsList className="flex border-b">
                                <TabsTrigger 
                                    value="to-deliver" 
                                    onClick={setActiveTab}
                                    className={activeTab === 'to-deliver' ? 'border-[#fdc501] text-[#fdc501]' : 'border-transparent text-gray-500'}
                                >
                                    To Deliver
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="on-delivering" 
                                    onClick={setActiveTab}
                                    className={activeTab === 'on-delivering' ? 'border-[#fdc501] text-[#fdc501]' : 'border-transparent text-gray-500'}
                                >
                                    On Delivering
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="delivered" 
                                    onClick={setActiveTab}
                                    className={activeTab === 'delivered' ? 'border-[#fdc501] text-[#fdc501]' : 'border-transparent text-gray-500'}
                                >
                                    Delivered
                                </TabsTrigger>
                            </TabsList>

                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                                            placeholder="Search..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc501] focus:border-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>

                                    <div className="flex items-center gap-4">
                                        <select
                                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fdc501] focus:border-transparent"
                                            value={sortOption}
                                            onChange={(e) => setSortOption(e.target.value)}
                                        >
                                            {sortOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>

                                        <Collapsible>
                                            {(isOpen, setIsOpen) => (
                                                <div className="relative">
                            <button
                                                        onClick={() => setIsOpen(!isOpen)}
                                                        className="bg-[#fdc501] text-white px-4 py-2 rounded-lg hover:bg-[#fdc501]/90 transition-colors flex items-center gap-2"
                                                    >
                                                        <FaFileDownload />
                                                        Export
                            </button>

                                                    {isOpen && (
                                                        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
                                                            <div className="fixed inset-0 bg-black/30" onClick={() => setIsOpen(false)}></div>
                                                            <div className="relative bg-white rounded-lg shadow-xl w-80 max-h-[80vh] overflow-y-auto">
                                                                <div className="sticky top-0 px-4 py-3 border-b bg-white">
                                                                    <h3 className="font-medium text-gray-700">Select Tables to Export</h3>
                                                                </div>
                                                                <div className="px-4 py-3">
                                                                    {Object.entries(selectedTables).map(([tab, isSelected]) => (
                                                                        <label key={tab} className="flex items-center space-x-3 py-2 hover:bg-gray-50 rounded-lg px-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isSelected}
                                                                                onChange={(e) => setSelectedTables(prev => ({
                                                                                    ...prev,
                                                                                    [tab]: e.target.checked
                                                                                }))}
                                                                                className="rounded text-[#fdc501] focus:ring-[#fdc501] h-4 w-4"
                                                                            />
                                                                            <span className="text-sm text-gray-700">
                                                                                {tab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                                            </span>
                                                                        </label>
                        ))}
                    </div>
                                                                <div className="sticky bottom-0 px-4 py-3 border-t bg-white">
                                                                    <div className="flex flex-col gap-2">
                                                                        <button
                                                                            className="w-full px-4 py-2 bg-[#fdc501] text-white rounded-lg hover:bg-[#fdc501]/90 transition-colors text-sm font-medium"
                                                                            onClick={() => {
                                                                                setFileType('pdf');
                                                                                setIsOpen(false);
                                                                                handleGenerateReport();
                                                                            }}
                                                                        >
                                                                            Export as PDF
                                                                        </button>
                        <button
                                                                            className="w-full px-4 py-2 bg-[#fdc501] text-white rounded-lg hover:bg-[#fdc501]/90 transition-colors text-sm font-medium"
                                                                            onClick={() => {
                                                                                setFileType('excel');
                                                                                setIsOpen(false);
                                                                                handleGenerateReport();
                                                                            }}
                                                                        >
                                                                            Export as Excel
                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Collapsible>
                    </div>
                </div>

                                {loading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fdc501]"></div>
                                    </div>
                                ) : error ? (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                                        {error}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {getTableHeaders(activeTab).map((header, index) => (
                                                        <th
                                                            key={index}
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                        >
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {deliveryData[activeTab] && deliveryData[activeTab].length > 0 ? (
                                                    getFilteredAndSortedData(deliveryData[activeTab]).map((item, index) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            {getRowData(item, activeTab).map((cell, cellIndex) => (
                                                                <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {cell}
                                                            </td>
                                                        ))}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan={getTableHeaders(activeTab).length}
                                                            className="px-6 py-4 text-center text-sm text-gray-500"
                                                        >
                                                            No data available for this status
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                            </div>
                                        )}
                                    </div>
                        </>
                    )}
                </Tabs>
            </main>
        </div>
    );
}