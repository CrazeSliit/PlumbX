'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaEnvelope, FaEdit, FaSave, FaKey } from 'react-icons/fa';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const getUserIdFromCookie = () => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'userId') {
          return decodeURIComponent(value);
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const userId = getUserIdFromCookie();
        
        if (!userId) {
          router.push('/signin');
          return;
        }
        
        const response = await fetch(`/api/users/profile/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const userData = await response.json();
        setUser(userData);
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    try {
      const userId = getUserIdFromCookie();
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const updateData = {
        fullName: formData.fullName,
        email: formData.email
      };

      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      const response = await fetch(`/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Error updating profile: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button 
            onClick={() => router.push('/signin')}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-yellow-500 p-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-white text-yellow-500 py-2 px-4 rounded flex items-center"
            >
              <FaEdit className="mr-2" /> Edit Profile
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(false)}
              className="bg-white text-yellow-500 py-2 px-4 rounded"
            >
              Cancel
            </button>
          )}
        </div>
        
        <div className="p-8">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
              <InputField label="Email" name="email" value={formData.email} type="email" onChange={handleChange} />

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                <InputField label="Current Password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} type="password" />
                <InputField label="New Password" name="newPassword" value={formData.newPassword} onChange={handleChange} type="password" />
                <InputField label="Confirm New Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded-lg flex items-center justify-center"
              >
                <FaSave className="mr-2" /> Save Changes
              </button>
            </form>
          ) : (
            <ProfileDisplay user={user} />
          )}
        </div>
      </div>
    </div>
  );
}

// 👇 Helper Components
function InputField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
    </div>
  );
}

function ProfileDisplay({ user }) {
  return (
    <div className="space-y-6">
      <ProfileItem icon={<FaUser />} title="FULL NAME" value={user?.fullName || 'Not provided'} />
      <ProfileItem icon={<FaEnvelope />} title="EMAIL" value={user?.email || 'Not provided'} />
      <ProfileItem icon={<FaKey />} title="PASSWORD" value="••••••••" />
    </div>
  );
}

function ProfileItem({ icon, title, value }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="text-yellow-500 text-xl mt-1">{icon}</div>
      <div>
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-gray-800 font-medium">{value}</p>
      </div>
    </div>
  );
}
