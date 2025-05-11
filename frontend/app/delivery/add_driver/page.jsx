'use client'
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaSortAlphaDown, FaSortAlphaUp, FaClock } from 'react-icons/fa';

export default function AddDriver() {
    // Generate new driver ID
    const generateDriverId = (currentDrivers) => {
        if (currentDrivers.length === 0) return "D001";
        const lastId = currentDrivers[currentDrivers.length - 1].driverId;
        const numericPart = parseInt(lastId.slice(1)) + 1;
        return `D${numericPart.toString().padStart(3, '0')}`;
    };

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [drivers, setDrivers] = useState([]);
    const [editingDriver, setEditingDriver] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        driverId: null,
        driverName: ''
    });
    const [updateConfirmation, setUpdateConfirmation] = useState({
        isOpen: false,
        driver: null,
        formData: null,
        selectedImage: null
    });
    const [saveConfirmation, setSaveConfirmation] = useState({
        isOpen: false,
        formData: null
    });
    const [formData, setFormData] = useState({
        driverId: '',
        fullName: '',
        contactNumber: '',
        vehicleId: '',
        drivingLicense: '',
        vehicleLicense: '',
        image: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('newest'); // 'newest', 'oldest', 'asc', 'desc'
    const [validationError, setValidationError] = useState('');
    const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Fetch drivers from API
    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/drivers');
            const data = await response.json();
            if (data.status === 'success') {
                setDrivers(data.data);
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    // Filter and sort drivers
    const filteredAndSortedDrivers = drivers
        .filter(driver => {
            const query = searchQuery.toLowerCase();
            return (
                driver.fullName.toLowerCase().includes(query) ||
                driver.vehicleId.toLowerCase().includes(query) ||
                driver.contactNumber.toLowerCase().includes(query)
            );
        })
        .sort((a, b) => {
            switch (sortOption) {
                case 'asc':
                    return a.fullName.localeCompare(b.fullName);
                case 'desc':
                    return b.fullName.localeCompare(a.fullName);
                case 'oldest':
                    return a.driverId.localeCompare(b.driverId);
                case 'newest':
                default:
                    return b.driverId.localeCompare(a.driverId);
            }
        });

    // Sort options
    const sortOptions = [
        { value: 'newest', label: 'Newest First', icon: <FaClock /> },
        { value: 'oldest', label: 'Oldest First', icon: <FaClock className="transform rotate-180" /> },
        { value: 'asc', label: 'A-Z', icon: <FaSortAlphaDown /> },
        { value: 'desc', label: 'Z-A', icon: <FaSortAlphaUp /> }
    ];

    const validateForm = () => {
        // Contact number validation
        const contactRegex = /^0\d{9}$/;
        if (!contactRegex.test(formData.contactNumber.replace(/\s+/g, ''))) {
            setValidationError('Contact number must start with 0 and contain exactly 10 digits');
            return false;
        }
        setValidationError('');
        return true;
    };

    // Function to show notification
    const showNotification = (message, type = 'info') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showNotification(validationError, 'error');
            return;
        }

        if (isEditMode && editingDriver) {
            setUpdateConfirmation({
                isOpen: true,
                driver: editingDriver,
                formData: formData,
                selectedImage: selectedImage
            });
        } else {
            setSaveConfirmation({
                isOpen: true,
                formData: {
                    ...formData,
                    contactNumber: formData.contactNumber.replace(/\s+/g, '')
                }
            });
        }
    };

    // Add this new helper function for image conversion
    const convertImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const handleUpdateConfirm = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/drivers/${updateConfirmation.driver.driverId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateConfirmation.formData)
            });

            const data = await response.json();
            if (data.status === 'success') {
                fetchDrivers();
                setIsEditMode(false);
                resetForm();
                setUpdateConfirmation({ isOpen: false, driver: null, formData: null, selectedImage: null });
                showNotification('Driver updated successfully', 'success');
            } else {
                showNotification(data.message || 'Failed to update driver', 'error');
            }
        } catch (error) {
            console.error('Error updating driver:', error);
            showNotification('Failed to update driver', 'error');
        }
    };

    const handleUpdateCancel = () => {
        setUpdateConfirmation({ isOpen: false, driver: null, formData: null, selectedImage: null });
    };

    const handleSaveConfirm = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/drivers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saveConfirmation.formData)
            });

            const data = await response.json();
            if (data.status === 'success') {
                await fetchDrivers();
                resetForm();
                setIsFormOpen(false);
                showNotification('Driver added successfully', 'success');
            } else {
                showNotification(data.message || 'Failed to add driver', 'error');
            }
        } catch (error) {
            console.error('Error saving driver:', error);
            showNotification('Failed to add driver', 'error');
        }
        setSaveConfirmation({ isOpen: false, formData: null });
    };

    const handleSaveCancel = () => {
        setSaveConfirmation({ isOpen: false, formData: null });
    };

    const resetForm = () => {
        setFormData({
            driverId: '',
            fullName: '',
            contactNumber: '',
            vehicleId: '',
            drivingLicense: '',
            vehicleLicense: '',
            image: ''
        });
        setSelectedImage(null);
        setIsFormOpen(false);
        setEditingDriver(null);
    };

    const handleEdit = (driver) => {
        setFormData(driver);
        setEditingDriver(driver);
        setIsEditMode(true);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (driver) => {
        setDeleteConfirmation({
            isOpen: true,
            driverId: driver.driverId,
            driverName: driver.fullName
        });
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirmationInput.toLowerCase() !== 'delete') {
            showNotification('Please type "delete" to confirm', 'error');
            return;
        }

        if (deleteConfirmation.driverId) {
            try {
                const response = await fetch(`http://localhost:5000/api/drivers/${deleteConfirmation.driverId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();
                if (data.status === 'success') {
                    fetchDrivers();
                    setDeleteConfirmation({ isOpen: false, driverId: null, driverName: '' });
                    setDeleteConfirmationInput('');
                    showNotification('Driver deleted successfully', 'success');
                } else {
                    showNotification(data.message || 'Failed to delete driver', 'error');
                }
            } catch (error) {
                console.error('Error deleting driver:', error);
                showNotification('Failed to delete driver', 'error');
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmation({ isOpen: false, driverId: null, driverName: '' });
        setDeleteConfirmationInput(''); // Reset the input when canceling
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'contactNumber') {
            // Remove any non-digit characters
            const numbersOnly = value.replace(/\D/g, '');
            // Limit to 10 digits and ensure starts with 0
            if (numbersOnly.length <= 10 && (numbersOnly === '' || numbersOnly[0] === '0')) {
                setFormData(prev => ({
                    ...prev,
                    [name]: numbersOnly
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
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
            {/* Fixed Header Section */}
            <header className="bg-gradient-to-r from-[#fdc501] to-[#ffd747] shadow-lg">
            <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                            <h1 className="text-4xl font-bold text-white drop-shadow-md">Manage Drivers</h1>
                            <p className="text-white/90 mt-2">Add, edit, and delete drivers</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                {/* Search and Actions Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Search Bar */}
                    <div className="relative flex-grow">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, vehicle ID or contact number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fdc501] focus:border-[#fdc501] shadow-sm transition-all duration-200"
                        />
                    </div>

                    {/* Sort Options */}
                    <div className="flex gap-2">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSortOption(option.value)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                                    sortOption === option.value
                                        ? 'bg-gradient-to-r from-[#fdc501] to-[#ffd747] text-black shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                                }`}
                                title={option.label}
                            >
                                {option.icon}
                                <span className="hidden md:inline">{option.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Add Driver Button */}
                    <button
                        onClick={() => {
                            if (!isFormOpen) {
                                setIsEditMode(false);
                                setEditingDriver(null);
                            }
                            setIsFormOpen(!isFormOpen);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-[#fdc501] to-[#ffd747] text-black font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                    >
                        {isFormOpen ? (
                            <>
                                <span>✕</span>
                                <span>Close Form</span>
                            </>
                        ) : (
                            <>
                                <span>+</span>
                                <span>Add New Driver</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Driver Form */}
                {isFormOpen && (
                    <div className="mb-8 bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
                        <div className="px-8 py-6 bg-gradient-to-r from-[#fdc501] to-[#ffd747] border-b">
                            <h2 className="text-2xl font-bold text-black">
                                {isEditMode ? 'Edit Driver' : 'Add New Driver'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8">
                            {validationError && (
                                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-500">⚠️</span>
                                        <span>{validationError}</span>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Driver ID</label>
                                    <input
                                        type="text"
                                        name="driverId"
                                        value={isEditMode ? editingDriver.driverId : 'Auto-generated'}
                                        className="w-full px-4 py-3 text-gray-500 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed"
                                        disabled
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                        Full Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fdc501] focus:border-[#fdc501] transition-all duration-200"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                        Contact Number
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        placeholder="0XXXXXXXXX"
                                        maxLength="10"
                                        className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fdc501] focus:border-[#fdc501] transition-all duration-200"
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Enter a 10-digit number starting with 0
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                        Vehicle ID
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="vehicleId"
                                        value={formData.vehicleId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fdc501] focus:border-[#fdc501] transition-all duration-200"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                        Driving License
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="drivingLicense"
                                        value={formData.drivingLicense}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fdc501] focus:border-[#fdc501] transition-all duration-200"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                        Vehicle License
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="vehicleLicense"
                                        value={formData.vehicleLicense}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fdc501] focus:border-[#fdc501] transition-all duration-200"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                        Driver Photo
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-32 h-32 bg-gray-100 rounded-xl overflow-hidden">
                                                {selectedImage ? (
                                                    <img
                                                        src={selectedImage}
                                                        alt="Driver preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <span>No image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-grow space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Image URL
                                                    </label>
                                                    <input
                                                        type="url"
                                                        name="image"
                                                        value={formData.image}
                                                        onChange={handleChange}
                                                        placeholder="https://example.com/driver-image.jpg"
                                                        className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fdc501] focus:border-[#fdc501] transition-all duration-200"
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-gray-200"></div>
                                                    </div>
                                                    <div className="relative flex justify-center text-sm">
                                                        <span className="px-2 bg-white text-gray-500">Or</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Upload Image
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="w-full px-4 py-3 text-gray-900 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#fdc501] focus:border-[#fdc501] transition-all duration-200"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Enter an image URL or upload a clear photo of the driver. URL input takes priority over file upload.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-[#fdc501] to-[#ffd747] text-black font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    {isEditMode ? 'Update Driver' : 'Add Driver'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Update Confirmation Modal */}
                {updateConfirmation.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Update</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to update the details for driver "{updateConfirmation.driver?.fullName}"?
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">Changes to be applied:</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    {updateConfirmation.formData?.fullName !== updateConfirmation.driver?.fullName && (
                                        <li>Name: {updateConfirmation.driver?.fullName} → {updateConfirmation.formData?.fullName}</li>
                                    )}
                                    {updateConfirmation.formData?.contactNumber !== updateConfirmation.driver?.contactNumber && (
                                        <li>Contact: {updateConfirmation.driver?.contactNumber} → {updateConfirmation.formData?.contactNumber}</li>
                                    )}
                                    {updateConfirmation.formData?.vehicleId !== updateConfirmation.driver?.vehicleId && (
                                        <li>Vehicle ID: {updateConfirmation.driver?.vehicleId} → {updateConfirmation.formData?.vehicleId}</li>
                                    )}
                                    {updateConfirmation.formData?.drivingLicense !== updateConfirmation.driver?.drivingLicense && (
                                        <li>Driving License: {updateConfirmation.driver?.drivingLicense} → {updateConfirmation.formData?.drivingLicense}</li>
                                    )}
                                    {updateConfirmation.formData?.vehicleLicense !== updateConfirmation.driver?.vehicleLicense && (
                                        <li>Vehicle License: {updateConfirmation.driver?.vehicleLicense} → {updateConfirmation.formData?.vehicleLicense}</li>
                                    )}
                                    {updateConfirmation.selectedImage && <li>New image will be uploaded</li>}
                                </ul>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={handleUpdateCancel}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateConfirm}
                                    className="px-4 py-2 bg-[#fdc501] text-black rounded-lg hover:bg-[#fdc501]/80 transition-colors"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Confirmation Modal */}
                {saveConfirmation.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Save</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to add this new driver?
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h4 className="font-medium text-gray-900 mb-2">Driver Details:</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>Name: {saveConfirmation.formData?.fullName}</li>
                                    <li>Contact: {saveConfirmation.formData?.contactNumber}</li>
                                    <li>Vehicle ID: {saveConfirmation.formData?.vehicleId}</li>
                                    <li>Driving License: {saveConfirmation.formData?.drivingLicense}</li>
                                    <li>Vehicle License: {saveConfirmation.formData?.vehicleLicense}</li>
                                </ul>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={handleSaveCancel}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveConfirm}
                                    className="px-4 py-2 bg-[#fdc501] text-black rounded-lg hover:bg-[#fdc501]/80 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirmation.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to delete driver "{deleteConfirmation.driverName}"? This action cannot be undone.
                            </p>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type "delete" to confirm:
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmationInput}
                                    onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="delete"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={handleDeleteCancel}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteConfirmationInput.toLowerCase() !== 'delete'}
                                    className={`px-4 py-2 rounded-lg transition-colors ${
                                        deleteConfirmationInput.toLowerCase() === 'delete'
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-red-300 text-white cursor-not-allowed'
                                    }`}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Updated Drivers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredAndSortedDrivers.length > 0 ? (
                        filteredAndSortedDrivers.map((driver, index) => (
                            <div key={index} className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                {/* Action buttons */}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(driver)}
                                        className="p-1.5 bg-[#fdc501] rounded-full hover:bg-[#fdc501]/80 transition-colors"
                                    >
                                        <FaEdit className="text-black text-sm" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(driver)}
                                        className="p-1.5 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <FaTrash className="text-white text-sm" />
                                    </button>
                                </div>
                                {driver.image && (
                                    <div className="aspect-square">
                                        <img
                                            src={driver.image}
                                            alt={driver.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-3">
                                    <h3 className="text-base font-bold text-gray-900 mb-1">{driver.fullName}</h3>
                                    <div className="space-y-0.5 text-xs">
                                        <p className="text-gray-900">ID: <span className="font-medium text-[#fdc501]">{driver.driverId}</span></p>
                                        <p className="text-gray-900">Contact: <span className="font-medium text-[#fdc501]">{driver.contactNumber}</span></p>
                                        <p className="text-gray-900">Vehicle: <span className="font-medium text-[#fdc501]">{driver.vehicleId}</span></p>
                                        <p className="text-gray-900">License: <span className="font-medium text-[#fdc501]">{driver.drivingLicense}</span></p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-500 text-lg">No drivers found matching your search criteria.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}