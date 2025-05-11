'use client';
import React, { useState, useEffect } from 'react';

function ReportFilter({ activeFilter, onFilterChange, dateRange, onDateRangeChange }) {
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-4 flex-wrap">
                    {['Daily', 'Weekly', 'Monthly', 'Custom'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => onFilterChange(filter.toLowerCase())}
                            className={`px-6 py-2 rounded-lg transition-all duration-300 ${
                                activeFilter === filter.toLowerCase()
                                    ? 'bg-yellow-500 text-black shadow-md transform scale-105'
                                    : 'bg-white border-2 border-yellow-500 text-black hover:bg-yellow-50 hover:border-yellow-600'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
                {activeFilter === 'custom' && (
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <label className="text-black font-medium">From:</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                                max={today}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-black font-medium">To:</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                                max={today}
                                min={dateRange.start}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ReportTable({ data, onSort, sortConfig }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState(data);

    useEffect(() => {
        if (!data) return;
        
        const results = data.filter(item => {
            if (!item) return false;
            
            const searchLower = searchTerm.toLowerCase();
            const itemCode = (item.itemCode || '').toString().toLowerCase();
            const name = (item.name || '').toString().toLowerCase();
            const category = (item.category || '').toString().toLowerCase();
            const stockLevel = (item.stockLevel || '').toString().toLowerCase();
            const value = (item.value || '').toString().toLowerCase();
            const lastUpdated = (item.lastUpdated || '').toString().toLowerCase();

            return (
                itemCode.includes(searchLower) ||
                name.includes(searchLower) ||
                category.includes(searchLower) ||
                stockLevel.includes(searchLower) ||
                value.includes(searchLower) ||
                lastUpdated.includes(searchLower)
            );
        });
        setFilteredData(results);
    }, [searchTerm, data]);

    const sortedData = React.useMemo(() => {
        if (!filteredData) return [];
        
        let sortableItems = [...filteredData];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue === undefined || bValue === undefined) return 0;
                
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' 
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const columns = [
        { key: 'itemCode', label: 'SKU' },
        { key: 'name', label: 'Name' },
        { key: 'category', label: 'Category' },
        { key: 'stockLevel', label: 'Stock Level' },
        { key: 'value', label: 'Value' },
        { key: 'lastUpdated', label: 'Last Updated' }
    ];

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="relative w-full md:w-64">
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                    </div>
                    <div className="text-sm text-black">
                        Showing {filteredData.length} of {data.length} items
                        {searchTerm && ` (filtered from ${data.length} total)`}
                    </div>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => onSort(column.key)}
                                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {sortConfig.key === column.key && (
                                            <span className="text-yellow-500">
                                                {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    No items found matching your search
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((item) => (
                                <tr key={item.itemCode} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-black">{item.itemCode}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-black">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-black">{item.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            item.stockLevel < 40 
                                                ? 'bg-red-100 text-red-800' 
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {item.stockLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-black">Rs{item.value.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-black">{item.lastUpdated}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ReportSummary({ data }) {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const totalStocked = data.reduce((sum, item) => sum + item.stockLevel, 0);
    const lowStockItems = data.filter(item => item.stockLevel < 40).length;
    const totalCategories = new Set(data.map(item => item.category)).size;

    const summaryCards = [
        {
            title: 'Total Items',
            value: `${data.length} items`,
            icon: '📦',
            color: 'yellow',
            borderColor: 'border-yellow-500'
        },
        {
            title: 'Total Stock',
            value: `${totalStocked} units`,
            icon: '📊',
            color: 'blue',
            borderColor: 'border-blue-500'
        },
        {
            title: 'Total Value',
            value: `Rs${totalValue.toFixed(2)}`,
            icon: '💰',
            color: 'green',
            borderColor: 'border-green-500'
        },
        {
            title: 'Low Stock Items',
            value: lowStockItems,
            icon: '⚠️',
            color: 'red',
            borderColor: 'border-red-500'
        },
        {
            title: 'Categories',
            value: totalCategories,
            icon: '📑',
            color: 'purple',
            borderColor: 'border-purple-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {summaryCards.map((card, index) => (
                <div 
                    key={index}
                    className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${card.borderColor} transform hover:scale-105 transition-all duration-300`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-black">{card.title}</h3>
                            <p className="text-2xl font-bold mt-2 text-black">{card.value}</p>
                        </div>
                        <div className={`text-3xl ${card.color === 'yellow' ? 'text-yellow-500' : 
                                                      card.color === 'blue' ? 'text-blue-500' :
                                                      card.color === 'green' ? 'text-green-500' :
                                                      card.color === 'red' ? 'text-red-500' :
                                                      'text-purple-500'}`}>
                            {card.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function InventoryReportPage() {
    const [filter, setFilter] = useState('daily');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const fetchReportData = async () => {
        setLoading(true);
        try {
            let startDate, endDate;
            const today = new Date();
            
            // Set date range based on filter
            switch (filter) {
                case 'daily':
                    startDate = new Date(today.setHours(0, 0, 0, 0));
                    endDate = new Date(today.setHours(23, 59, 59, 999));
                    break;
                case 'weekly':
                    startDate = new Date(today.setDate(today.getDate() - 7));
                    endDate = new Date();
                    break;
                case 'monthly':
                    startDate = new Date(today.setDate(today.getDate() - 30));
                    endDate = new Date();
                    break;
                case 'custom':
                    if (dateRange.start && dateRange.end) {
                        startDate = new Date(dateRange.start);
                        endDate = new Date(dateRange.end);
                        endDate.setHours(23, 59, 59, 999);
                    } else {
                        startDate = new Date(today.setHours(0, 0, 0, 0));
                        endDate = new Date(today.setHours(23, 59, 59, 999));
                    }
                    break;
                default:
                    startDate = new Date(today.setHours(0, 0, 0, 0));
                    endDate = new Date(today.setHours(23, 59, 59, 999));
            }

            const response = await fetch('/api/inventory');
            if (!response.ok) {
                throw new Error('Failed to fetch inventory data');
            }
            const data = await response.json();
            
            // Transform the data to match our table format
            const transformedData = data.map(item => ({
                itemCode: item.sku,
                name: item.itemName,
                category: item.category,
                stockLevel: item.quantity,
                distributed: 0, // This would need to be calculated from transaction history
                restocked: 0, // This would need to be calculated from transaction history
                value: item.price * item.quantity,
                lastUpdated: new Date(item.lastUpdated)
            }));

            // Filter data based on date range
            const filteredData = transformedData.filter(item => {
                const itemDate = new Date(item.lastUpdated);
                return itemDate >= startDate && itemDate <= endDate;
            });

            // Format dates for display
            const formattedData = filteredData.map(item => ({
                ...item,
                lastUpdated: item.lastUpdated.toLocaleDateString()
            }));
            
            setReportData(formattedData);
        } catch (error) {
            console.error('Error fetching inventory data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [filter, dateRange]);

    const handlePrint = () => {
        setIsGenerating(true);
        
        try {
            const printWindow = window.open('', '_blank');
            
            if (!printWindow) {
                alert("Please allow popups to print this report");
                setIsGenerating(false);
                return;
            }
            
            const reportDate = new Date().toLocaleDateString();
            const reportPeriod = filter.charAt(0).toUpperCase() + filter.slice(1);
            
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Inventory Report - ${reportPeriod}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        
                        body { 
                            font-family: 'Inter', sans-serif;
                            max-width: 1200px; 
                            margin: 0 auto; 
                            padding: 40px; 
                            color: #1a1a1a;
                            background: #ffffff;
                        }
                        
                        .header {
                            text-align: center;
                            margin-bottom: 40px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #fdc501;
                            position: relative;
                        }
                        
                        .header::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 4px;
                            background: linear-gradient(90deg, #fdc501, #ff9800);
                        }
                        
                        .header h1 { 
                            font-size: 28px; 
                            font-weight: 700;
                            margin: 0;
                            color: #1a1a1a;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        }
                        
                        .header p { 
                            font-size: 14px; 
                            color: #666;
                            margin: 10px 0 0;
                        }
                        
                        .company-logo {
                            margin-bottom: 20px;
                        }
                        
                        .summary-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 20px;
                            margin-bottom: 40px;
                        }
                        
                        .summary-card {
                            background: #f8f9fa;
                            border-radius: 8px;
                            padding: 20px;
                            border-left: 4px solid #fdc501;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                            transition: transform 0.2s;
                        }
                        
                        .summary-card:hover {
                            transform: translateY(-2px);
                        }
                        
                        .summary-label {
                            font-size: 14px;
                            color: #666;
                            margin-bottom: 8px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        
                        .summary-value {
                            font-size: 24px;
                            font-weight: 600;
                            color: #1a1a1a;
                        }
                        
                        .section-title {
                            font-size: 20px;
                            font-weight: 600;
                            margin: 30px 0 20px;
                            color: #1a1a1a;
                            padding-bottom: 10px;
                            border-bottom: 1px solid #eee;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                            font-size: 14px;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        }
                        
                        th {
                            background: #f8f9fa;
                            color: #1a1a1a;
                            font-weight: 600;
                            text-align: left;
                            padding: 12px 16px;
                            border-bottom: 2px solid #eee;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            font-size: 12px;
                        }
                        
                        td {
                            padding: 12px 16px;
                            border-bottom: 1px solid #eee;
                            color: #1a1a1a;
                        }
                        
                        tr:nth-child(even) {
                            background: #f8f9fa;
                        }
                        
                        tr:hover {
                            background: #fff9e6;
                        }
                        
                        .stock-low {
                            color: #dc2626;
                            font-weight: 500;
                        }
                        
                        .stock-ok {
                            color: #059669;
                            font-weight: 500;
                        }
                        
                        .footer {
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #eee;
                            text-align: center;
                            font-size: 12px;
                            color: #666;
                            position: relative;
                        }
                        
                        .footer::before {
                            content: '';
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            height: 4px;
                            background: linear-gradient(90deg, #fdc501, #ff9800);
                        }
                        
                        .page-number {
                            position: absolute;
                            bottom: 20px;
                            right: 20px;
                            font-size: 12px;
                            color: #666;
                        }
                        
                        @media print {
                            body {
                                padding: 20px;
                            }
                            
                            .no-print {
                                display: none;
                            }
                            
                            table {
                                page-break-inside: avoid;
                            }
                            
                            thead {
                                display: table-header-group;
                            }
                            
                            .page-break {
                                page-break-after: always;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="company-logo">
                            <img src="/logo.png" alt="Company Logo" style="height: 60px;">
                        </div>
                        <h1>Inventory Report</h1>
                        <p>Period: ${reportPeriod} • Generated on: ${reportDate}</p>
                    </div>
                    
                    <div class="summary-grid">
                        <div class="summary-card">
                            <div class="summary-label">Total Items</div>
                            <div class="summary-value">${reportData.length}</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Total Stock</div>
                            <div class="summary-value">${reportData.reduce((sum, item) => sum + item.stockLevel, 0)} units</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Total Value</div>
                            <div class="summary-value">Rs${reportData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Low Stock Items</div>
                            <div class="summary-value">${reportData.filter(item => item.stockLevel < 40).length}</div>
                        </div>
                        <div class="summary-card">
                            <div class="summary-label">Categories</div>
                            <div class="summary-value">${new Set(reportData.map(item => item.category)).size}</div>
                        </div>
                    </div>
                    
                    <h2 class="section-title">Inventory Items</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Stock Level</th>
                                <th>Value</th>
                                <th>Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportData.map(item => `
                                <tr>
                                    <td>${item.itemCode}</td>
                                    <td>${item.name}</td>
                                    <td>${item.category}</td>
                                    <td class="${item.stockLevel < 40 ? 'stock-low' : 'stock-ok'}">${item.stockLevel}</td>
                                    <td>Rs${item.value.toFixed(2)}</td>
                                    <td>${item.lastUpdated}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>This report was generated automatically on ${new Date().toLocaleString()}</p>
                        <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                        <div class="page-number">Page 1 of 1</div>
                    </div>
                    
                    <div class="no-print" style="margin-top: 30px; text-align: center;">
                        <button onclick="window.print()" style="padding: 12px 24px; background: #fdc501; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            Print / Save as PDF
                        </button>
                    </div>
                    
                    <script>
                        setTimeout(() => {
                            window.print();
                        }, 1000);
                    </script>
                </body>
                </html>
            `);
            
            printWindow.document.close();
        } catch (error) {
            console.error("Error generating printable report:", error);
            alert("There was an error generating the report. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    // CSV Export function
    const handleExportCSV = () => {
        setIsGenerating(true);
        
        try {
            // Create CSV content
            const csvHeader = '"Item Code","Name","Category","Stock Level","Distributed","Restocked","Value (Rs)","Last Updated"\n';
            const csvRows = reportData.map(item => 
                `"${item.itemCode}","${item.name}","${item.category}","${item.stockLevel}","${item.distributed}","${item.restocked}","${item.value.toFixed(2)}","${item.lastUpdated}"`
            ).join('\n');
            
            const csvString = csvHeader + csvRows;
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            // Set download attributes
            link.setAttribute('href', url);
            link.setAttribute('download', `inventory-report-${filter}-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            
            // Trigger download
            link.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                setIsGenerating(false);
            }, 100);
        } catch (error) {
            console.error("Error exporting CSV:", error);
            alert("There was an error exporting to CSV. Please try again.");
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-black">Inventory Report</h1>
                        <p className="text-gray-600 mt-2">
                            {filter === 'daily' && 'Today\'s Inventory Summary'}
                            {filter === 'weekly' && 'Last 7 Days Summary'}
                            {filter === 'monthly' && 'Last 30 Days Summary'}
                            {filter === 'custom' && 'Custom Period Summary'}
                        </p>
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center gap-2">
                            <div className="mr-2">
                                <select 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
                                    id="export-format"
                                    disabled={isGenerating}
                                >
                                    <option value="pdf">PDF (Print)</option>
                                    <option value="csv">CSV</option>
                                </select>
                            </div>
                            
                            <button
                                onClick={() => {
                                    const format = document.getElementById('export-format').value;
                                    if (format === 'csv') {
                                        handleExportCSV();
                                    } else {
                                        handlePrint();
                                    }
                                }}
                                disabled={isGenerating}
                                className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors duration-300 flex items-center"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Exporting...
                                    </>
                                ) : (
                                    'Export Report'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <ReportFilter 
                    activeFilter={filter} 
                    onFilterChange={setFilter}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                />
                <ReportSummary data={reportData} />
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-black">Loading report data...</div>
                    </div>
                ) : (
                    <ReportTable 
                        data={reportData}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                    />
                )}
            </div>
        </div>
    );
}
