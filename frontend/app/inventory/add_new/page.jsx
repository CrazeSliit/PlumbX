'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

// Safe localStorage utility functions with improved error handling
const safeLocalStorage = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      // Use a safer error reporting method
      try {
        console.error('Error accessing localStorage:', e.message || 'Unknown error');
      } catch (_) {
        // Fallback if console.error fails
      }
      return null;
    }
  },
  
  setItem: (key, value) => {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (e) {
      // Use a safer error reporting method
      try {
        console.log('Error setting localStorage:', e.message || 'Unknown error');
      } catch (_) {
        // Fallback if console.log fails
      }
      return false;
    }
  },
  
  removeItem: (key) => {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (e) {
      try {
        console.log('Error removing from localStorage:', e.message || 'Unknown error');
      } catch (_) {
        // Fallback if console.log fails
      }
      return false;
    }
  }
};

export default function AddNewItem() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const editItemId = searchParams.get('itemId');
  
  // Add isMounted state to ensure we don't use localStorage during SSR
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    price: '',
    size: '',
    category: '',
    stockLevel: 0,
    material: 'PVC',
    description: '',
    imageUrl: '', // Add this field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add function to generate item code
  const generateItemCode = (material) => {
    const prefix = material?.substring(0, 3).toUpperCase() || 'ITM';
    const timestamp = Date.now().toString().slice(-5);
    return `${prefix}-${timestamp}`;
  };

  // Update useEffect for setting initial item code
  useEffect(() => {
    setIsMounted(true);
    if (!isEditMode) {
      // Auto-generate item code when material changes
      setFormData(prev => ({
        ...prev,
        itemCode: generateItemCode(prev.material)
      }));
    }
  }, [isEditMode, formData.material]);

  // Update the useEffect for fetching edit item data
  useEffect(() => {
    const fetchEditItem = async () => {
      if (!isMounted) return;

      const itemId = searchParams.get('id');
      if (!itemId) return;

      try {
        setIsSubmitting(true); // Show loading state
        console.log('Fetching item with ID:', itemId); // Debug log

        const response = await fetch(`/api/inventory/${itemId}`);
        if (!response.ok) throw new Error('Failed to fetch item');
        
        const itemData = await response.json();
        console.log('Fetched item data:', itemData); // Debug log
        
        setFormData({
          id: itemData._id,
          itemCode: itemData.sku,
          itemName: itemData.itemName,
          price: itemData.price,
          size: itemData.size,
          category: itemData.category,
          stockLevel: itemData.quantity,
          material: itemData.material,
          description: itemData.description || '',
          imageUrl: itemData.imageUrl || itemData.image || '', // Handle both image field names
        });
      } catch (error) {
        console.error("Error loading item for edit:", error);
        alert("Error loading item data. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    if (isEditMode) {
      fetchEditItem();
    }
  }, [isMounted, isEditMode, searchParams]);

  // Update handleInputChange to regenerate item code when material changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Add validation for price and stock level
    if (name === 'price' || name === 'stockLevel') {
      // Only allow numbers and decimal point for price
      if (name === 'price') {
        const priceValue = value.replace(/[^0-9.]/g, '');
        // Ensure only one decimal point
        const parts = priceValue.split('.');
        if (parts.length > 2) {
          return;
        }
        // Limit to 2 decimal places
        if (parts[1] && parts[1].length > 2) {
          return;
        }
        setFormData(prev => ({
          ...prev,
          [name]: priceValue
        }));
      } else {
        // For stock level, only allow whole numbers
        const stockValue = value.replace(/[^0-9]/g, '');
        setFormData(prev => ({
          ...prev,
          [name]: stockValue
        }));
      }
      return;
    }

    setFormData(prev => {
      const updates = { [name]: value };
      
      // Auto-generate item code when material changes and not in edit mode
      if (name === 'material' && !isEditMode) {
        updates.itemCode = generateItemCode(value);
      }
      
      return { ...prev, ...updates };
    });
  };

  // Store or update item in localStorage
  const storeAddedItem = (item, isUpdate = false) => {
    // Only execute once mounted
    if (!isMounted) {
      try { console.log("Component not mounted yet, cannot access localStorage"); } catch (_) {}
      return false;
    }
    
    try {
      // Get existing items or initialize empty array
      const existingItems = safeLocalStorage.getItem('recentlyAddedItems');
      let items = [];
      
      if (existingItems) {
        try {
          items = JSON.parse(existingItems);
          if (!Array.isArray(items)) {
            console.warn("Stored items was not an array, resetting");
            items = [];
          }
        } catch (parseError) {
          console.error("Error parsing stored items:", parseError);
          items = [];
        }
      }
      
      // IMPORTANT: Prepare the item with correct structure and validate image
      const itemToStore = {
        ...item,
        id: item.id || Date.now(),
        name: item.itemName || "Unnamed Item", // Ensure name field is set
        itemName: item.itemName || "Unnamed Item", // Keep both for consistency
        material: item.material || "Unknown",
        size: item.size || "Standard",
        stockLevel: Number(item.stockLevel) || 0,
        price: Number(item.price) || 0,
        dateAdded: item.dateAdded || new Date().toISOString(),
        dateModified: new Date().toISOString(),
        // Make sure image is properly stored
        image: item.image || null,
        // Add a flag to indicate if there's an image
        hasImage: !!item.image
      };
      
      // Log what we're storing for debugging
      console.log(`${isUpdate ? 'Updating' : 'Adding'} item with image:`, !!itemToStore.image);
      
      if (isUpdate) {
        // Try to find the item by ID first, then by itemCode as fallback
        let index = items.findIndex(i => i.id === item.id);
        
        // If not found by ID, try to find by itemCode
        if (index === -1 && item.originalItemCode) {
          index = items.findIndex(i => i.itemCode === item.originalItemCode);
          console.log(`Item not found by ID, searching by itemCode ${item.originalItemCode}, found at index: ${index}`);
        }
        
        if (index !== -1) {
          // Keep the original ID if it exists
          itemToStore.id = items[index].id || itemToStore.id;
          items[index] = itemToStore;
          console.log(`Updated item at index ${index}:`, itemToStore);
        } else {
          // If item not found, add it as new
          items.unshift(itemToStore);
          console.log("Item not found for update, adding as new:", itemToStore);
        }
      } else {
        // Add new item to the beginning of the array
        items.unshift(itemToStore);
        console.log("Added new item:", itemToStore);
      }
      
      // Keep only the last 20 items
      if (items.length > 20) {
        items = items.slice(0, 20);
      }
      
      // Extra safety check for browser environment
      if (typeof window === 'undefined' || !window.localStorage) {
        console.log("Window or localStorage not available");
        return false;
      }
      
      // Use our safe method instead of direct access
      const success = safeLocalStorage.setItem('recentlyAddedItems', JSON.stringify(items));
      
      if (success) {
        console.log("Successfully stored items with length:", items.length);
      } else {
        console.log("Failed to store items");
      }
      
      // Clean up if we were updating
      if (isUpdate && success) {
        safeLocalStorage.removeItem('itemToUpdate');
      }
      
      // Extra safety check for image size
      try {
        const totalSize = JSON.stringify(items).length;
        console.log(`Total localStorage size: ~${Math.round(totalSize / 1024)}KB`);
        // Warning if over 4MB (localStorage typical limit is ~5MB)
        if (totalSize > 4 * 1024 * 1024) {
          console.warn("WARNING: localStorage size is approaching the limit!");
        }
      } catch (e) {}
      
      return success;
    } catch (error) {
      try { console.log("Error in storeAddedItem function:", error.message || "Unknown error"); } catch (_) {}
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMounted) return;
    
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.itemName || !formData.category || !formData.price || !formData.stockLevel || !formData.size || !formData.material) {
        throw new Error('Please fill in all required fields (marked with *)');
      }

      // Validate numeric fields
      if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
        throw new Error('Price must be a valid positive number');
      }

      if (isNaN(parseInt(formData.stockLevel)) || parseInt(formData.stockLevel) < 0) {
        throw new Error('Stock level must be a valid positive number');
      }

      // Validate category
      const validCategories = ['tools', 'pipes', 'fittings', 'valves', 'pvc', 'fixtures', 'sealants', 'safety', 'others'];
      if (!validCategories.includes(formData.category.toLowerCase())) {
        throw new Error('Please select a valid category');
      }

      const itemData = {
        itemName: formData.itemName,
        category: formData.category.toLowerCase(),
        quantity: parseInt(formData.stockLevel),
        price: parseFloat(formData.price),
        size: formData.size,
        material: formData.material,
        imageUrl: formData.imageUrl,
        description: formData.description || '',
        supplier: formData.supplier || '',
        reorderPoint: parseInt(formData.reorderPoint) || 10,
        location: formData.location || '',
        sku: formData.itemCode
      };

      const url = isEditMode ? `/api/inventory/${formData.id}` : '/api/inventory';
      const method = isEditMode ? 'PUT' : 'POST';

      console.log('Submitting data:', itemData); // Debug log

      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(itemData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Failed to ${isEditMode ? 'update' : 'save'} item. Status: ${response.status}`);
      }

      console.log('Server response:', responseData); // Debug log

      // Show success message
      alert(`Item ${isEditMode ? 'updated' : 'added'} successfully!`);
      
      // Redirect to inventory management page
      router.push('/inventory/inventory_management');
    } catch (error) {
      console.error('Error saving item:', error);
      
      // Show more detailed error message
      alert(`Error: ${error.message}\n\nPlease check your input and try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#fdc501] to-[#fdc501]/90 rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-black mb-2">
              {isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h1>
            <p className="text-gray-800 mb-4 max-w-2xl">
              {isEditMode 
                ? 'Update your inventory item details below'
                : 'Fill in the details below to add a new item to your inventory'}
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Code and Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Item Code</label>
                <input
                  type="text"
                  name="itemCode"
                  value={formData.itemCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all duration-300"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Price and Stock Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Price <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rs.</span>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all duration-300"
                  />
                </div>
                <p className="text-xs text-gray-500">Enter price with up to 2 decimal places</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Stock Level <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="stockLevel"
                  value={formData.stockLevel}
                  onChange={handleInputChange}
                  required
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all duration-300"
                />
                <p className="text-xs text-gray-500">Enter whole numbers only</p>
              </div>
            </div>

            {/* Size and Material */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Size <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all duration-300"
                  placeholder="Enter size (e.g., 1/2 inch)"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Material <span className="text-red-500">*</span></label>
                <select
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all duration-300"
                >
                  <option value="">Select Material</option>
                  <option value="PVC">PVC</option>
                  <option value="COPPER">COPPER</option>
                  <option value="IRON">IRON</option>
                  <option value="STEEL">STEEL</option>
                </select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all duration-300"
              >
                <option value="">Select a category</option>
                <option value="tools">Tools</option>
                <option value="pipes">Pipes</option>
                <option value="fittings">Fittings</option>
                <option value="valves">Valves</option>
                <option value="pvc">PVC</option>
                <option value="fixtures">Fixtures</option>
                <option value="sealants">Sealants</option>
                <option value="safety">Safety Equipment</option>
                <option value="others">Others</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all duration-300"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="Enter image URL"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#fdc501] focus:ring-2 focus:ring-[#fdc501]/20 transition-all duration-300"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-white border-2 border-[#fdc501] text-black rounded-xl hover:bg-[#fdc501]/5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-[#fdc501] to-[#fdc501]/90 text-black rounded-xl hover:from-[#fdc501]/90 hover:to-[#fdc501] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditMode ? 'Updating...' : 'Adding...'}
                  </span>
                ) : (
                  isEditMode ? 'Update Item' : 'Add Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
