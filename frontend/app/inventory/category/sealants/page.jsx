'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HomeIcon, 
  ChevronRightIcon, 
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

// Helper function to load items from localStorage
const loadStoredItems = () => {
  try {
    if (typeof window !== 'undefined') {
      const storedItems = window.localStorage.getItem('recentlyAddedItems');
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        if (Array.isArray(parsedItems)) {
          // Filter to only include sealant items
          const sealantItems = parsedItems.filter(item => 
            item.category === 'sealants' || 
            item.category === 'Sealants' ||
            (item.name && item.name.toLowerCase().includes('sealant'))
          );
          
          console.log(`Found ${sealantItems.length} sealant items in localStorage`);
          return sealantItems.map(item => ({
            id: item.id || item.itemCode,
            itemCode: item.itemCode || item.id,
            name: item.name || item.itemName,
            type: item.type || 'Silicone',
            material: item.material || 'Synthetic',
            size: item.size || 'Standard',
            stockLevel: Number(item.stockLevel) || 0,
            reorderLevel: 10,
            price: Number(item.price) || 0,
            value: Number(item.price * item.stockLevel) || 0,
            location: item.location || 'Storage',
            image: item.image || '/image/sealant-placeholder.jpg',
            lastRestocked: item.dateModified ? new Date(item.dateModified).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: item.description || 'No description available'
          }));
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error loading items from localStorage:", error);
    return null;
  }
};

export default function SealantsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [error, setError] = useState(null);
  
  // Category statistics
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    averagePrice: 0,
    lowStockItems: 0
  });

  // Toggle dropdown menu
  const toggleDropdown = (itemId) => {
    setActiveDropdown(activeDropdown === itemId ? null : itemId);
  };

  // Handle updating items
  const handleUpdateItem = (item) => {
    router.push(`/inventory/add_new?edit=true&id=${item._id || item.id}`);
  };

  // Handle deleting items
  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      fetchItems();
      
    } catch (error) {
      console.error("Error deleting item:", error);
      alert('Error: ' + error.message);
    }
  };
  
  // Fetch items function
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/category/sealants');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sealant items');
      }
      
      let data = await response.json();
      
      if (data && data.data && Array.isArray(data.data)) {
        data = data.data;
      }
      
      const itemsArray = Array.isArray(data) ? data : [];
      
      const normalizedItems = itemsArray.map(item => ({
        _id: item._id || item.id,
        id: item._id || item.id,
        sku: item.sku || item.itemCode || `SEAL-${Math.floor(Math.random() * 100000)}`,
        name: item.name || item.itemName || 'Sealant',
        type: (item.type || item.material || 'Standard').toUpperCase(),
        material: (item.material || 'Standard').toUpperCase(),
        size: item.size || 'Standard',
        quantity: Number(item.quantity || item.stockLevel || item.stock || 0),
        price: Number(item.price || 0),
        image: item.image || 'https://media.istockphoto.com/id/1406690461/photo/fluoroplastic-sealing-tape.jpg?s=2048x2048&w=is&k=20&c=TOrpSoi3Cgxrx64HOxJQEj6dOM2Cvjif4eNNiMNUMBs=',
        reorderLevel: item.reorderLevel || 20,
        description: item.description || 'No description available'
      }));
      
      setItems(normalizedItems);
      
      if (normalizedItems.length > 0) {
        const totalValue = normalizedItems.reduce((acc, item) => {
          return acc + (item.price * item.quantity);
        }, 0);

        // Calculate low stock items (less than 40 units)
        const lowStockItems = normalizedItems.filter(item => item.quantity < 40).length;
        
        setStats({
          totalItems: normalizedItems.length,
          totalValue: totalValue,
          averagePrice: totalValue / normalizedItems.length,
          lowStockItems: lowStockItems
        });
      } else {
        setStats({
          totalItems: 0,
          totalValue: 0,
          averagePrice: 0,
          lowStockItems: 0
        });
      }
    } catch (error) {
      console.error("Error fetching sealant items:", error);
      setError(error.message);
      
      setItems([]);
      setStats({
        totalItems: 0,
        totalValue: 0,
        averagePrice: 0,
        lowStockItems: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Filter items based on search, filter, and sort
  const filteredItems = items
    .filter(item => {
      if (filter !== 'all') {
        const itemType = item?.type || item?.material || '';
        if (itemType.toUpperCase() !== filter) {
          return false;
        }
      }
      
      if (materialFilter !== 'all') {
        const itemMaterial = item?.material || '';
        if (itemMaterial.toUpperCase() !== materialFilter) {
          return false;
        }
      }
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const itemName = (item?.name || '').toLowerCase();
        const itemType = (item?.type || '').toLowerCase();
        const itemSize = (item?.size || '').toLowerCase();
        
        if (!itemName.includes(searchLower) &&
            !itemType.includes(searchLower) &&
            !itemSize.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      let valueA = a[sortField] || '';
      let valueB = b[sortField] || '';

      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#fdc501] to-[#fdc501]/90 rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl relative overflow-hidden"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(253, 197, 1, 0.1)'
          }}
        >
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#fdc501]/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-black mb-2">Sealants Inventory</h1>
                <p className="text-gray-800">Manage and track your sealant inventory</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/90 px-4 py-2 rounded-full">
                  <span className="text-sm text-gray-600">Total Items:</span>
                  <span className="text-lg font-semibold text-[#fdc501]">{stats.totalItems}</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#fdc501] animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/90 rounded-xl p-4 shadow-lg">
                <h3 className="text-sm text-gray-500 mb-1">Total Value</h3>
                <p className="text-2xl font-bold text-black">Rs{stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-white/90 rounded-xl p-4 shadow-lg">
                <h3 className="text-sm text-gray-500 mb-1">Average Price</h3>
                <p className="text-2xl font-bold text-black">Rs{stats.averagePrice.toLocaleString()}</p>
              </div>
              <div className="bg-white/90 rounded-xl p-4 shadow-lg">
                <h3 className="text-sm text-gray-500 mb-1">Low Stock Items</h3>
                <p className="text-2xl font-bold text-red-500">
                  {stats.lowStockItems} items
                </p>
                <p className="text-xs text-gray-500 mt-1">(Less than 40 units)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(253, 197, 1, 0.1)'
          }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search sealants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc501] focus:border-transparent"
                />
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc501] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="THREAD">Thread Sealant</option>
                <option value="SILICONE">Silicone</option>
                <option value="ADHESIVE">Adhesive</option>
                <option value="CAULK">Caulk</option>
              </select>
              <select
                value={materialFilter}
                onChange={(e) => setMaterialFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fdc501] focus:border-transparent"
              >
                <option value="all">All Materials</option>
                <option value="PVC">PVC</option>
                <option value="COPPER">Copper</option>
                <option value="IRON">Iron</option>
                <option value="STEEL">Steel</option>
              </select>
              <Link
                href="/inventory/add_new"
                className="inline-flex items-center px-4 py-2 bg-[#fdc501] text-black rounded-lg hover:bg-[#fdc501]/90 transition-colors duration-300"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Add New Sealant
              </Link>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(253, 197, 1, 0.1)'
              }}
            >
              <div className="relative h-48 bg-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('Image failed to load:', e.target.src);
                    e.target.src = 'https://media.istockphoto.com/id/1406690461/photo/fluoroplastic-sealing-tape.jpg?s=2048x2048&w=is&k=20&c=TOrpSoi3Cgxrx64HOxJQEj6dOM2Cvjif4eNNiMNUMBs=';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-2 right-2">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors duration-300"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                    {activeDropdown === item.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                        <button
                          onClick={() => handleUpdateItem(item)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-black">{item.name}</h3>
                  <span className="text-sm font-medium text-[#fdc501]">{item.type}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Size:</span>
                    <span className="text-black font-medium">{item.size}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Material:</span>
                    <span className="text-black font-medium">{item.material}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Stock:</span>
                    <span className={`font-medium ${item.quantity < (item.reorderLevel || 20) ? 'text-red-500' : 'text-green-500'}`}>
                      {item.quantity} units
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Price:</span>
                    <span className="text-black font-medium">Rs{item.price.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Value:</span>
                    <span className="text-lg font-bold text-black">Rs{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sealants found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            <Link
              href="/inventory/add_new"
              className="inline-flex items-center px-4 py-2 bg-[#fdc501] text-black rounded-lg hover:bg-[#fdc501]/90 transition-colors duration-300"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Add New Sealant
            </Link>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fdc501] mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading sealants...</p>
          </div>
        )}
      </div>
    </div>
  );
} 