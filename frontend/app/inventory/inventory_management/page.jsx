'use client';
import React, { useState, useEffect } from 'react';
import { InventoryChart, SalesChart } from '@/components/Charts.js';
import Link from 'next/link';
import { FaBell, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import InventoryModal from '@/components/inventory/InventoryModal';
import { useRouter } from 'next/navigation'; // Add this import

function StockStats({ stats }) {
  return (
    <>
      {stats.map((stat) => (
        <div 
          key={stat.title} 
          className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#fdc501] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(253, 197, 1, 0.1)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#fdc501]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
              <div className="w-8 h-8 rounded-full bg-[#fdc501]/10 flex items-center justify-center group-hover:bg-[#fdc501]/20 transition-colors duration-300">
                <span className="text-[#fdc501] text-sm">→</span>
              </div>
            </div>
            <p className={`text-3xl font-bold ${stat.color} transition-colors duration-300`}>{stat.value}</p>
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#fdc501] w-0 group-hover:w-full transition-all duration-500"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function QuickActions({ actions }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Link 
        href="/inventory/add_new" 
        className="p-4 bg-gradient-to-r from-[#fdc501] to-[#fdc501]/90 text-black rounded-xl hover:from-[#fdc501]/90 hover:to-[#fdc501] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg text-center font-semibold group relative overflow-hidden"
        style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(253, 197, 1, 0.1)'
        }}
      >
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10 flex items-center justify-center gap-2">
          <span>Add New Item</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">+</span>
        </div>
      </Link>
      <Link 
        href="/inventory/inventory_report" 
        className="p-4 bg-white border-2 border-[#fdc501] text-black rounded-xl hover:bg-[#fdc501]/5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg text-center font-semibold group relative overflow-hidden"
        style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(253, 197, 1, 0.1)'
        }}
      >
        <div className="absolute inset-0 bg-[#fdc501]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10 flex items-center justify-center gap-2">
          <span>Inventory Report</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
        </div>
      </Link>
      <Link 
        href="/inventory/inventory_analytics" 
        className="p-4 bg-white border-2 border-[#fdc501] text-black rounded-xl hover:bg-[#fdc501]/5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg text-center font-semibold group relative overflow-hidden"
        style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(253, 197, 1, 0.1)'
        }}
      >
        <div className="absolute inset-0 bg-[#fdc501]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10 flex items-center justify-center gap-2">
          <span>Analytics Chart</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
        </div>
      </Link>
      <Link 
        href="/inventory/view_alerts" 
        className="p-4 bg-white border-2 border-[#fdc501] text-black rounded-xl hover:bg-[#fdc501]/5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg text-center font-semibold group relative overflow-hidden"
        style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(253, 197, 1, 0.1)'
        }}
      >
        <div className="absolute inset-0 bg-[#fdc501]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10 flex items-center justify-center gap-2">
          <span>View Alerts</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
        </div>
      </Link>
    </div>
  );
}

function CategoryList({ categories }) {
  // Define different background colors and shadow colors for each category
  const categoryStyles = {
    'Pipes': { 
      bg: 'from-blue-50 to-white', 
      shadow: 'shadow-blue-200', 
      border: 'border-blue-100',
      icon: '🔧',
      color: 'text-blue-600'
    },
    'Fixtures': { 
      bg: 'from-green-50 to-white', 
      shadow: 'shadow-green-200', 
      border: 'border-green-100',
      icon: '🚰',
      color: 'text-green-600'
    },
    'Sealants': { 
      bg: 'from-purple-50 to-white', 
      shadow: 'shadow-purple-200', 
      border: 'border-purple-100',
      icon: '🧪',
      color: 'text-purple-600'
    },
    'Safety': { 
      bg: 'from-red-50 to-white', 
      shadow: 'shadow-red-200', 
      border: 'border-red-100',
      icon: '🛡️',
      color: 'text-red-600'
    },
    'Others': { 
      bg: 'from-gray-50 to-white', 
      shadow: 'shadow-gray-200', 
      border: 'border-gray-100',
      icon: '📦',
      color: 'text-gray-600'
    },
    'Tools': { 
      bg: 'from-yellow-50 to-white', 
      shadow: 'shadow-yellow-200', 
      border: 'border-yellow-100',
      icon: '🛠️',
      color: 'text-yellow-600'
    },
    'Valves': { 
      bg: 'from-indigo-50 to-white', 
      shadow: 'shadow-indigo-200', 
      border: 'border-indigo-100',
      icon: '🔌',
      color: 'text-indigo-600'
    },
    'Fittings': { 
      bg: 'from-pink-50 to-white', 
      shadow: 'shadow-pink-200', 
      border: 'border-pink-100',
      icon: '🔩',
      color: 'text-pink-600'
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl"
      style={{
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(253, 197, 1, 0.1)'
      }}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-black mb-2">Product Categories</h2>
          <p className="text-gray-500">Browse through our comprehensive inventory categories</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-full">
            <span className="text-sm text-gray-600">Total Categories:</span>
            <span className="text-lg font-semibold text-[#fdc501]">{categories.length}</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#fdc501] animate-pulse"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const style = categoryStyles[category.name] || categoryStyles['Others'];
          return (
            <Link 
              href={category.link} 
              key={category.name} 
              className="block group"
            >
              <div className={`p-6 bg-gradient-to-br ${style.bg} rounded-xl hover:bg-gradient-to-br hover:from-[#fdc501]/5 hover:to-white cursor-pointer transition-all duration-300 border ${style.border} transform hover:-translate-y-2 hover:${style.shadow} relative overflow-hidden`}
                style={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(253, 197, 1, 0.1)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#fdc501]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{style.icon}</span>
                      <h3 className={`text-xl font-bold ${style.color} group-hover:text-[#fdc501] transition-colors duration-300`}>{category.name}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#fdc501]/10 flex items-center justify-center group-hover:bg-[#fdc501]/20 transition-colors duration-300">
                      <span className="text-[#fdc501] text-sm transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-[#fdc501]"></div>
                        <span className="text-sm text-gray-600">In Stock</span>
                      </div>
                      <span className="text-lg font-semibold text-black">{category.inStock}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#fdc501] transition-all duration-500"
                        style={{ 
                          width: `${Math.min((category.inStock / 100) * 100, 100)}%`,
                          opacity: category.inStock > 0 ? 1 : 0.3
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-500">View Details</span>
                      <span className="text-sm font-medium text-[#fdc501] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explore →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function getInventoryChartData(categories) {
  return {
    labels: categories.map(cat => cat.name),
    datasets: [
      {
        label: 'Current Stock',
        data: categories.map(cat => cat.inStock),
        backgroundColor: '#fdc501',
      }
    ]
  };
}

export default function InventoryManagementPage() {
  const router = useRouter();
  const [stats, setStats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [actions, setActions] = useState([
    { label: 'Add New Item', bgColor: 'bg-yellow-500 text-black', hoverColor: 'bg-yellow-400' },
    { label: 'Inventory Report', bgColor: 'bg-white border-2 border-yellow-500', hoverColor: 'bg-gray-50' },
    { label: 'Analytics Chart', bgColor: 'bg-white border-2 border-yellow-500', hoverColor: 'bg-gray-50', link: '/inventory_analytics' },
    { label: 'View Alerts', bgColor: 'bg-white border-2 border-yellow-500', hoverColor: 'bg-gray-50', link: '/view_alerts' },
  ]);

  // Add data caching
  const [cachedData, setCachedData] = useState({
    stats: null,
    categories: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Check if we have cached data and if it's less than 5 minutes old
        const now = new Date().getTime();
        if (cachedData.stats && cachedData.categories && lastFetchTime && (now - lastFetchTime < 5 * 60 * 1000)) {
          setStats(cachedData.stats);
          setCategories(cachedData.categories);
          setLoading(false);
          return;
        }

        await Promise.all([fetchStats(), fetchCategories()]);
        setLastFetchTime(now);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch items from all categories
      const categories = ['pipes', 'fixtures', 'sealants', 'safety', 'others', 'tools', 'valves', 'fittings'];
      let totalItems = 0;
      let totalValue = 0;
      let lowStockItems = 0;

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
        
        // Calculate statistics
        totalItems += itemsArray.length;
        totalValue += itemsArray.reduce((sum, item) => 
          sum + (Number(item.price || 0) * Number(item.quantity || item.stockLevel || item.stock || 0)), 0
        );
        
        // Count low stock items (quantity < 40)
        lowStockItems += itemsArray.filter(item => {
          const quantity = Number(item.quantity || item.stockLevel || item.stock || 0);
          return quantity < 40;
        }).length;
      }
      
      // Get categories count
      const categoriesResponse = await fetch('/api/inventory/categories');
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories');
      }
      const categoriesData = await categoriesResponse.json();
      
      const newStats = [
        { title: 'Total Items', value: totalItems.toString(), color: 'text-black' },
        { title: 'Low Stock Items', value: lowStockItems.toString(), color: 'text-red-500' },
        { title: 'Categories', value: categoriesData.length.toString(), color: 'text-black' },
        { title: 'Total Value', value: `Rs${totalValue.toLocaleString()}`, color: 'text-black' }
      ];

      setStats(newStats);
      setCachedData(prev => ({ ...prev, stats: newStats }));
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
      // Set default stats on error
      const defaultStats = [
        { title: 'Total Items', value: '0', color: 'text-black' },
        { title: 'Low Stock Items', value: '0', color: 'text-red-500' },
        { title: 'Categories', value: '0', color: 'text-black' },
        { title: 'Total Value', value: 'Rs0', color: 'text-black' }
      ];
      setStats(defaultStats);
      setCachedData(prev => ({ ...prev, stats: defaultStats }));
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch all categories
      const categories = ['pipes', 'fixtures', 'sealants', 'safety', 'others', 'tools', 'valves', 'fittings'];
      const categoryData = [];

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
        
        // Calculate total items in stock for this category
        const inStock = itemsArray.reduce((sum, item) => 
          sum + (Number(item.quantity || item.stockLevel || item.stock || 0)), 0
        );
        
        categoryData.push({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          image: `/images/${category}.jpg`,
          inStock: inStock,
          link: `/inventory/category/${category}`
        });
      }
      
      setCategories(categoryData);
      setCachedData(prev => ({ ...prev, categories: categoryData }));
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
      setCategories([]);
      setCachedData(prev => ({ ...prev, categories: [] }));
    }
  };

  // Add manual refresh function
  const handleRefresh = async () => {
    setLastFetchTime(null); // Clear cache
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchCategories()]);
      setLastFetchTime(new Date().getTime());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Only show charts if categories have loaded
  const showCharts = categories.length > 0;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero section with background image */}
        <div className="bg-gradient-to-r from-[#fdc501] to-[#fdc501]/90 rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl relative overflow-hidden"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(253, 197, 1, 0.1)'
          }}
        >
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#fdc501]/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-black mb-2">Inventory Management</h1>
            <p className="text-gray-800 mb-4 max-w-2xl">Efficiently manage your plumbing supplies and track inventory levels with real-time updates and analytics</p>
            <div className="inline-flex items-center px-4 py-2 bg-white/90 text-black rounded-lg transition-all duration-300 hover:bg-white shadow-md transform hover:-translate-y-1">
              <span className="font-medium">Total items: {stats.length > 0 ? stats[0].value : 'Loading...'}</span>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="mt-2 h-1 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StockStats stats={stats} />
          </div>
        )}

        <QuickActions actions={actions} />

        {/* Charts - only render if data is loaded */}
        {showCharts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdc501]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-black">Inventory Levels</h2>
                  <div className="w-8 h-8 rounded-full bg-[#fdc501]/10 flex items-center justify-center group-hover:bg-[#fdc501]/20 transition-colors duration-300">
                    <span className="text-[#fdc501] text-sm">→</span>
                  </div>
                </div>
                <div className="transition-opacity duration-300">
                  <InventoryChart data={getInventoryChartData(categories)} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#fdc501]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-black">Sales Overview</h2>
                  <div className="w-8 h-8 rounded-full bg-[#fdc501]/10 flex items-center justify-center group-hover:bg-[#fdc501]/20 transition-colors duration-300">
                    <span className="text-[#fdc501] text-sm">→</span>
                  </div>
                </div>
                <div className="transition-opacity duration-300">
                  <SalesChart />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-xl flex items-center justify-center">
              <p className="text-gray-500">Please wait while we load your inventory data...</p>
            </div>
          </div>
        )}

        <CategoryList categories={categories} />
      </div>
    </div>
  );
}
