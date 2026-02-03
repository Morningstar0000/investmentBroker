"use client";

import React, { useState } from 'react';
import { X, Loader, Check, Upload, Camera } from '../components/ui/Icons';
import Input from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../client';
import { useToast } from '../context/ToastContext';

export default function CreateInvestorDialog({ 
  isOpen, 
  onClose, 
  onInvestorCreated 
}) {
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    description: '',
    avatar_url: '',
    total_return: 0,
    monthly_return: 0,
    win_rate: 0,
    followers: 0,
    risk_level: 'medium',
    trading_style: '',
    experience: '',
    total_trades: 0,
    profitable_trades: 0,
    avg_hold_time: '',
    max_drawdown: 0,
    verified: false,
    rating: 0,
  });

 const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  
  // Special handling for max_drawdown field
  if (name === 'max_drawdown') {
    // Remove any non-numeric characters except decimal point and %
    let cleanedValue = value.replace(/[^0-9.%]/g, '');
    
    // Ensure there's only one % sign at the end
    cleanedValue = cleanedValue.replace(/%+$/, '') + '%';
    
    setFormData(prev => ({
      ...prev,
      [name]: cleanedValue
    }));
  } else if (type === 'number') {
    // Remove any non-numeric characters except decimal point
    const cleanedValue = value.replace(/[^0-9.-]/g, '');
    setFormData(prev => ({
      ...prev,
      [name]: cleanedValue === '' ? 0 : parseFloat(cleanedValue) || 0
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }
};

  // Function to handle file upload
  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `investor-avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update form data with new avatar URL
      setFormData(prev => ({
        ...prev,
        avatar_url: publicUrl
      }));

      addToast('Profile photo uploaded successfully!', 'success');
      
    } catch (error) {
      addToast(`Upload failed: ${error.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Function to handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Function to trigger file input
  const triggerFileInput = () => {
    document.getElementById('avatar-upload-create').click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim() || !formData.username.trim()) {
      addToast('Name and username are required', 'error');
      return;
    }

    try {
      setSubmitting(true);

        // Prepare max_drawdown - ensure it ends with %
    const formattedMaxDrawdown = formData.max_drawdown.endsWith('%') 
      ? formData.max_drawdown 
      : `${formData.max_drawdown}%`;
      
       const investorData = {
      ...formData,
      max_drawdown: formattedMaxDrawdown,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

      const { data, error } = await supabase
        .from('investors')
        .insert([investorData])
        .select()
        .single();

      if (error) throw error;

      addToast(`Investor "${formData.name}" created successfully!`, 'success');
      onInvestorCreated();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        username: '',
        description: '',
        avatar_url: '',
        total_return: 0,
        monthly_return: 0,
        win_rate: 0,
        followers: 0,
        risk_level: 'medium',
        trading_style: '',
        experience: '',
        total_trades: 0,
        profitable_trades: 0,
        avg_hold_time: '',
        max_drawdown: '0%',
        verified: false,
        rating: 0,
      });
      
    } catch (error) {
      console.error('Error creating investor:', error);
      addToast(`Error creating investor: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Investor</h2>
            <p className="text-sm text-gray-600">Create a new investor profile</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Profile Photo
              </h3>
              
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Current Avatar Preview */}
                <div className="relative">
                  <img
                    src={formData.avatar_url || '/placeholder-avatar.jpg'}
                    alt="Avatar preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.target.src = '/placeholder-avatar.jpg';
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Upload Profile Photo</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a clear profile picture. Max size: 5MB. Supported formats: JPG, PNG, WebP.
                    </p>
                    
                    {/* Hidden file input */}
                    <input
                      id="avatar-upload-create"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {/* Upload button */}
                    <Button
                      type="button"
                      onClick={triggerFileInput}
                      disabled={uploading}
                      variant="outline"
                      className="w-full"
                    >
                      {uploading ? (
                        <>
                          <Loader className="w-4 h-4 mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Photo
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Alternative: URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Or enter image URL
                    </label>
                    <Input
                      name="avatar_url"
                      value={formData.avatar_url}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      @
                    </span>
                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="rounded-l-none"
                      placeholder="johndoe"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Brief description of trading style and strategy..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified"
                  name="verified"
                  checked={formData.verified}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="verified" className="flex items-center gap-2 text-sm text-gray-700">
                  <Badge className="bg-blue-100 text-blue-800">
                    {formData.verified ? <Check className="w-3 h-3" /> : 'Verify'}
                    Verified Investor
                  </Badge>
                  <span className="text-gray-500">Mark as verified</span>
                </label>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Performance Statistics
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Return (%)
                  </label>
                  <Input
                    type="number"
                    name="total_return"
                    value={formData.total_return}
                    onChange={handleChange}
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Return (%)
                  </label>
                  <Input
                    type="number"
                    name="monthly_return"
                    value={formData.monthly_return}
                    onChange={handleChange}
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Win Rate (%)
                  </label>
                  <Input
                    type="number"
                    name="win_rate"
                    value={formData.win_rate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (1-5)
                  </label>
                  <Input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="4.5"
                  />
                </div>
              </div>
            </div>

            {/* Trading Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Trading Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Level
                  </label>
                  <select
                    name="risk_level"
                    value={formData.risk_level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                  <div className="mt-1">
                    <Badge className={getRiskColor(formData.risk_level)}>
                      {formData.risk_level.toUpperCase()} RISK
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trading Style
                  </label>
                  <Input
                    name="trading_style"
                    value={formData.trading_style}
                    onChange={handleChange}
                    placeholder="e.g., Scalping, Swing Trading"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <Input
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 7+ years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Trades
                  </label>
                  <Input
                    type="number"
                    name="total_trades"
                    value={formData.total_trades}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profitable Trades
                  </label>
                  <Input
                    type="number"
                    name="profitable_trades"
                    value={formData.profitable_trades}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avg Hold Time
                  </label>
                  <Input
                    name="avg_hold_time"
                    value={formData.avg_hold_time}
                    onChange={handleChange}
                    placeholder="e.g., 4.2 hours, 1.2 weeks"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Drawdown (%)
                  </label>
                  <Input
                    type="number"
                    name="max_drawdown"
                    value={formData.max_drawdown}
                    onChange={handleChange}
                    step="0.1"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>

            {/* Social & Followers */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Social & Followers
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Followers Count
                  </label>
                  <Input
                    type="number"
                    name="followers"
                    value={formData.followers}
                    onChange={handleChange}
                    placeholder="0"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Will display as: {formData.followers.toLocaleString()} followers
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="min-w-[120px] bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Investor'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}