"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Loader, Check, Upload, Camera } from '../components/ui/Icons';
import Input from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../client';
import { useToast } from '../context/ToastContext';

export default function EditInvestorDialog({
    investorId,
    isOpen,
    onClose,
    onInvestorUpdated
}) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const imgRef = useRef(null);
    const [hasFetched, setHasFetched] = useState(false);

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
        max_drawdown: '0%',
        verified: false,
        rating: 0,
    });

    // Reset hasFetched when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setHasFetched(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && investorId && !hasFetched) {
            console.log('🔵 Fetching investor data for ID:', investorId);
            fetchInvestor();
            setHasFetched(true);
        }
    }, [isOpen, investorId, hasFetched]);

    const fetchInvestor = async () => {
        try {
            setLoading(true);
            setImageError(false);

            console.log('📡 Fetching investor with ID:', investorId, 'Type:', typeof investorId);

            // Convert to integer for database query
            const investorIdInt = parseInt(investorId);

            if (isNaN(investorIdInt)) {
                throw new Error(`Invalid investor ID: ${investorId}`);
            }

            console.log('🔢 Querying with integer ID:', investorIdInt);

            const { data, error } = await supabase
                .from('investors')
                .select('*')
                .eq('id', investorIdInt)  // Use integer
                .single();

            if (error) {
                console.error('❌ Supabase fetch error:', error);
                throw error;
            }

            console.log('✅ Investor data fetched:', { id: data.id, name: data.name });

            // Clean numeric fields
            const cleanedData = {
                ...data,
                name: data.name || '',
                username: data.username || '',
                description: data.description || '',
                avatar_url: data.avatar_url || '',
                total_return: parseFloat(String(data.total_return || 0).replace('%', '')) || 0,
                monthly_return: parseFloat(String(data.monthly_return || 0).replace('%', '')) || 0,
                win_rate: parseFloat(String(data.win_rate || 0).replace('%', '')) || 0,
                max_drawdown: data.max_drawdown || '0%',
                rating: parseFloat(String(data.rating || 0)) || 0,
                followers: parseInt(data.followers || 0),
                total_trades: parseInt(data.total_trades || 0),
                profitable_trades: parseInt(data.profitable_trades || 0),
                risk_level: data.risk_level || 'medium',
                trading_style: data.trading_style || '',
                experience: data.experience || '',
                avg_hold_time: data.avg_hold_time || '',
                verified: Boolean(data.verified),
            };

            console.log('🧹 Cleaned form data:', {
                name: cleanedData.name,
                avatar_url: cleanedData.avatar_url,
                max_drawdown: cleanedData.max_drawdown
            });

            setFormData(cleanedData);

        } catch (error) {
            console.error('❌ Error loading investor:', error);
            addToast(`Error loading investor: ${error.message}`, 'error');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Special handling for max_drawdown field
        if (name === 'max_drawdown') {
            // Allow user to type freely - no automatic % addition while typing
            // Only validate when user is done typing

            // Allow backspace/delete to work properly
            if (value === '') {
                setFormData(prev => ({
                    ...prev,
                    [name]: ''
                }));
                return;
            }

            // Clean input: allow numbers, decimal point, and %
            let cleanedValue = value.replace(/[^0-9.%]/g, '');

            // Remove extra % signs
            cleanedValue = cleanedValue.replace(/%+/g, '');

            // If the last character is a %, keep it as user typed
            // Otherwise, just use the cleaned value
            if (value.endsWith('%') && !cleanedValue.endsWith('%')) {
                cleanedValue = cleanedValue + '%';
            }

            setFormData(prev => ({
                ...prev,
                [name]: cleanedValue
            }));

        } else if (type === 'number') {
            // Remove any non-numeric characters except decimal point and minus sign
            const cleanedValue = value.replace(/[^0-9.-]/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: cleanedValue === '' ? '' : parseFloat(cleanedValue) || 0
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageError = () => {
        setImageError(true);
        if (imgRef.current) {
            imgRef.current.src = '/placeholder-avatar.jpg';
        }
    };

    const handleImageLoad = () => {
        setImageError(false);
    };

    // Function to handle file upload
    const handleFileUpload = async (file) => {
        try {
            setUploading(true);

            // Validate file
            if (!file.type.startsWith('image/')) {
                throw new Error('Please upload an image file');
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error('File size must be less than 5MB');
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = fileName;

            console.log('📤 Uploading to bucket: avatars, Path:', filePath);

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('❌ Upload error:', uploadError);
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            console.log('✅ Upload successful, URL:', publicUrl);

            // Update form data with new avatar URL
            setFormData(prev => ({
                ...prev,
                avatar_url: publicUrl
            }));

            setImageError(false);
            addToast('Profile photo uploaded successfully!', 'success');

        } catch (error) {
            console.error('❌ Upload failed:', error);
            addToast(`Upload failed: ${error.message}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('avatar-upload').click();
    };

    // In EditInvestorDialog.jsx, update the handleSubmit function:

    // In the handleSubmit function, update this section:

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.name.trim()) {
            addToast('Name is required', 'error');
            return;
        }

        if (!formData.username.trim()) {
            addToast('Username is required', 'error');
            return;
        }

        try {
            setSubmitting(true);

            console.log('🔄 Attempting to update investor with ID:', investorId);
            console.log('📋 Current form data keys:', Object.keys(formData));

            // Convert investorId to integer to match int4 in database
            const investorIdInt = parseInt(investorId);

            if (isNaN(investorIdInt)) {
                throw new Error(`Invalid investor ID: ${investorId}`);
            }

            console.log('🔢 Using integer ID:', investorIdInt);

            // Prepare max_drawdown - ensure it ends with %
            const formattedMaxDrawdown = formData.max_drawdown.trim() === ''
                ? '0%'
                : formData.max_drawdown.replace(/%+$/, '') + '%';

            // Prepare ALL fields for submission - ensure proper data types
            const submissionData = {
                name: String(formData.name || '').trim(),
                username: String(formData.username || '').trim().replace(/^@/, ''),
                description: String(formData.description || ''),
                avatar_url: String(formData.avatar_url || ''),
                total_return: parseFloat(formData.total_return) || 0,
                monthly_return: parseFloat(formData.monthly_return) || 0,
                win_rate: parseFloat(formData.win_rate) || 0,
                followers: parseInt(formData.followers) || 0,
                risk_level: String(formData.risk_level || 'medium'),
                trading_style: String(formData.trading_style || ''),
                experience: String(formData.experience || ''),
                total_trades: parseInt(formData.total_trades) || 0,
                profitable_trades: parseInt(formData.profitable_trades) || 0,
                avg_hold_time: String(formData.avg_hold_time || ''),
                max_drawdown: String(formattedMaxDrawdown),
                verified: Boolean(formData.verified),
                rating: parseFloat(formData.rating) || 0,
                // REMOVE: updated_at: new Date().toISOString(),
            };

            console.log('🔧 Final submission data types:');
            Object.keys(submissionData).forEach(key => {
                console.log(`  ${key}: ${typeof submissionData[key]} = ${submissionData[key]}`);
            });

            // Check for any NaN values
            Object.keys(submissionData).forEach(key => {
                if (typeof submissionData[key] === 'number' && isNaN(submissionData[key])) {
                    console.error(`❌ ${key} is NaN!`);
                }
            });

            console.log('📤 Submission data prepared:', submissionData);
            console.log('🔍 Data types:', {
                name: typeof submissionData.name,
                total_return: typeof submissionData.total_return,
                followers: typeof submissionData.followers,
                max_drawdown: typeof submissionData.max_drawdown,
                verified: typeof submissionData.verified
            });

            // FIRST: Verify the investor exists
            const { data: existingInvestor, error: checkError } = await supabase
                .from('investors')
                .select('id, name')
                .eq('id', investorIdInt)
                .single();

            if (checkError) {
                console.error('❌ Investor check failed:', checkError);
                throw new Error(`Investor with ID ${investorIdInt} not found`);
            }

            console.log('✅ Investor exists:', existingInvestor);

            // Perform the update - use integer ID
            const { data: updateResult, error } = await supabase
                .from('investors')
                .update(submissionData)
                .eq('id', investorIdInt)  // Use integer
                .select(); // Get the updated record

            if (error) {
                console.error('❌ Supabase update error:', error);

                // Try string ID as fallback
                console.log('🔄 Trying with string ID as fallback...');
                const { data: retryResult, error: retryError } = await supabase
                    .from('investors')
                    .update(submissionData)
                    .eq('id', String(investorIdInt))
                    .select();

                if (retryError) {
                    console.error('❌ Retry also failed:', retryError);
                    throw error; // Throw original error
                }

                console.log('✅ Retry successful with string ID:', retryResult);

                if (!retryResult || retryResult.length === 0) {
                    throw new Error(`Update completed but no data returned. Check if investor ID ${investorIdInt} exists.`);
                }

                console.log('📊 Successfully updated:', retryResult[0]);
                addToast(`✅ Investor "${formData.name}" updated successfully!`, 'success');

            } else {
                console.log('✅ Update successful:', updateResult);

                if (!updateResult || updateResult.length === 0) {
                    // This shouldn't happen if we verified the investor exists
                    console.warn('⚠️ Update returned empty array but investor exists');

                    // Double-check by fetching the updated record
                    const { data: verifyData } = await supabase
                        .from('investors')
                        .select('*')
                        .eq('id', investorIdInt)
                        .single();

                    console.log('🔍 Verification fetch:', verifyData);

                    if (verifyData) {
                        console.log('✅ Verification shows update was successful');
                    }
                } else {
                    console.log('📊 Updated record:', updateResult[0]);
                }

                addToast(`✅ Investor "${formData.name}" updated successfully!`, 'success');
            }

            // Force refresh by calling the callback
            setTimeout(() => {
                console.log('🔄 Calling onInvestorUpdated callback');

                if (onInvestorUpdated) {
                    onInvestorUpdated();
                }

                console.log('🚪 Closing dialog');
                onClose();
            }, 1000);

        } catch (error) {
            console.error('❌ Error updating investor:', error);
            addToast(`❌ Error: ${error.message}`, 'error');
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

    const getSafeImageUrl = () => {
        if (!formData.avatar_url || formData.avatar_url.trim() === '') {
            return '/placeholder-avatar.jpg';
        }

        try {
            // Basic URL validation
            if (formData.avatar_url.startsWith('http')) {
                return formData.avatar_url;
            }
            return '/placeholder-avatar.jpg';
        } catch {
            return '/placeholder-avatar.jpg';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Investor</h2>
                        <p className="text-sm text-gray-600">Update investor details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        type="button"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <Loader className="w-8 h-8 text-blue-600 mx-auto" />
                                <p className="mt-4 text-gray-600">Loading investor data...</p>
                            </div>
                        </div>
                    ) : (
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
                                            ref={imgRef}
                                            src={getSafeImageUrl()}
                                            alt="Current avatar"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                                            onError={handleImageError}
                                            onLoad={handleImageLoad}
                                            loading="lazy"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full">
                                            <Camera className="w-5 h-5" />
                                        </div>
                                    </div>

                                    {/* Upload Controls */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Upload New Photo</h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Upload a clear profile picture. Max size: 5MB. Supported formats: JPG, PNG, WebP.
                                            </p>

                                            {/* Hidden file input */}
                                            <input
                                                id="avatar-upload"
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
                                            {imageError && (
                                                <p className="text-sm text-red-500 mt-1">
                                                    Could not load image. Please check the URL or upload a new image.
                                                </p>
                                            )}
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
                                            type="text"
                                            name="total_return"
                                            value={formData.total_return}
                                            onChange={handleChange}
                                            placeholder="0.0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Monthly Return (%)
                                        </label>
                                        <Input
                                            type="text"
                                            name="monthly_return"
                                            value={formData.monthly_return}
                                            onChange={handleChange}
                                            placeholder="0.0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Win Rate (%)
                                        </label>
                                        <Input
                                            type="text"
                                            name="win_rate"
                                            value={formData.win_rate}
                                            onChange={handleChange}
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
                                            min="0"
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
                                            min="0"
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
                                            type="text"
                                            name="max_drawdown"
                                            value={formData.max_drawdown}
                                            onChange={handleChange}
                                            placeholder="0.0%"
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
                                            min="0"
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
                                    className="min-w-[120px] bg-blue-600 hover:bg-blue-700"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader className="w-4 h-4 mr-2" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Investor'
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}