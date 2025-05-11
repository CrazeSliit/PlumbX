'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HomeIcon, 
  ChevronRightIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShoppingCartIcon,
  TagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function ViewAlertsPage() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('quantity');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  const sortItems = (items) => {
    return [...items].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filterItems = (items) => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action}`, selectedItems);
  };

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const categories = ['pipes', 'fixtures', 'sealants', 'safety', 'others', 'tools', 'valves', 'fittings'];
      const allItems = [];

      for (const category of categories) {
        const response = await fetch(`/api/inventory/category/${category}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${category} items`);
        }
        
        let data = await response.json();
        if (data && data.data && Array.isArray(data.data)) {
          data = data.data;
        }
        
        const itemsArray = Array.isArray(data) ? data : [];
        
        const lowStockCategoryItems = itemsArray
          .filter(item => {
            const quantity = Number(item.quantity || item.stockLevel || item.stock || 0);
            const reorderPoint = Number(item.reorderPoint || item.reorderLevel || 40);
            return quantity < reorderPoint;
          })
          .map(item => ({
            id: item._id || item.id,
            name: item.name || item.itemName || 'Item',
            category: category.charAt(0).toUpperCase() + category.slice(1),
            quantity: Number(item.quantity || item.stockLevel || item.stock || 0),
            reorderLevel: Number(item.reorderPoint || item.reorderLevel || 40),
            price: Number(item.price || 0),
            value: Number(item.price || 0) * Number(item.quantity || item.stockLevel || item.stock || 0)
          }));

        allItems.push(...lowStockCategoryItems);
      }

      setLowStockItems(allItems);
      setCategories(['all', ...new Set(allItems.map(item => item.category))]);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? lowStockItems 
    : lowStockItems.filter(item => item.category === selectedCategory);

  const sortedAndFilteredItems = sortItems(filterItems(filteredItems));

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-yellow-500 rounded-2xl shadow-lg p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full -mr-32 -mt-32 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400 rounded-full -ml-32 -mb-32 opacity-20"></div>
          <div className="relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <nav className="flex mb-4" aria-label="Breadcrumb">
                  <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                      <Link href="/dashboard" className="flex items-center text-sm font-medium text-black hover:text-gray-800 transition-colors duration-200">
                        <HomeIcon className="w-4 h-4 mr-2"/>
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <ChevronRightIcon className="w-5 h-5 text-black"/>
                        <Link href="/inventory/inventory_management" className="ml-1 text-sm font-medium text-black hover:text-gray-800 transition-colors duration-200 md:ml-2">
                          Inventory
                        </Link>
                      </div>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <ChevronRightIcon className="w-5 h-5 text-black"/>
                        <span className="ml-1 text-sm font-medium text-black md:ml-2">Low Stock Alerts</span>
                      </div>
                    </li>
                  </ol>
                </nav>
                <h1 className="text-3xl font-bold text-black">Low Stock Alerts</h1>
                <p className="mt-2 text-black">Items that need immediate attention</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={fetchLowStockItems}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Refresh Alerts
                </button>
                {selectedItems.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('reorder')}
                      className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <ShoppingCartIcon className="h-5 w-5 mr-2" />
                      Reorder Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('mark')}
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <TagIcon className="h-5 w-5 mr-2" />
                      Mark as Reviewed
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="quantity">Sort by Quantity</option>
                <option value="value">Sort by Value</option>
                <option value="name">Sort by Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-xl border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-red-500 rounded-full" 
                  style={{ width: `${Math.min((lowStockItems.length / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-xl border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <TagIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Categories Affected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(lowStockItems.map(item => item.category)).size}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(lowStockItems.map(item => item.category))).map(category => (
                  <span key={category} className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-xl border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Value at Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs.{lowStockItems.reduce((acc, item) => acc + item.value, 0).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Average Value per Item</p>
              <p className="text-lg font-semibold text-green-600">
                Rs.{(lowStockItems.reduce((acc, item) => acc + item.value, 0) / (lowStockItems.length || 1)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                  <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                    {category === 'all' 
                      ? lowStockItems.length 
                      : lowStockItems.filter(item => item.category === category).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-red-50 rounded-2xl p-6 shadow-lg">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 font-medium">{error}</p>
                <button
                  onClick={fetchLowStockItems}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : sortedAndFilteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <ShoppingCartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  {selectedCategory === 'all' 
                    ? 'No low stock items found' 
                    : `No low stock items found in ${selectedCategory} category`}
                </p>
              </div>
            </div>
          ) : (
            sortedAndFilteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-xl border-l-4 border-red-500 ${
                  selectedItems.includes(item.id) ? 'ring-2 ring-yellow-500' : ''
                }`}
                onClick={() => {
                  setSelectedItems(prev => 
                    prev.includes(item.id) 
                      ? prev.filter(id => id !== item.id)
                      : [...prev, item.id]
                  );
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg mr-3">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => e.stopPropagation()}
                    className="h-5 w-5 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Stock</p>
                    <p className="text-lg font-semibold text-red-500">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reorder Level</p>
                    <p className="text-lg font-semibold text-gray-900">{item.reorderLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unit Price</p>
                    <p className="text-lg font-semibold text-gray-900">Rs.{item.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Value</p>
                    <p className="text-lg font-semibold text-gray-900">Rs.{item.value.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-red-500 rounded-full" 
                      style={{ width: `${(item.quantity / item.reorderLevel) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((item.quantity / item.reorderLevel) * 100)}% of reorder level
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
