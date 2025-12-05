"use client"
import React, { useState } from 'react'
import { Button } from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Shield, MessageCircle, ArrowLeft, Mail, Lock, User } from '../components/ui/Icons'
import { supabase } from '../client' // Import your existing Supabase client



export default function AdminLogin({ onAdminLogin, onNavigate, }) {
    const [formData, setFormData] = useState({
        email: '',
        name: '' // Changed from password to name
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [currentPage, setCurrentPage ] = useState()

    const handleAdminLogin = async (adminUser) => {
         console.log('Admin logged in:', adminUser);
    setCurrentPage('admin'); // Force to admin page
        if (!formData.email || !formData.name) {
            setError('Please enter both email and name')
            return
        }

        setLoading(true)
        setError('')

        try {
            // Check against admin_profiles table directly
            const { data: adminProfile, error: adminError } = await supabase
                .from('admin_profiles')
                .select('*')
                .eq('email', formData.email)
                .eq('name', formData.name)
                .eq('status', 'active')
                .single();

            if (adminError || !adminProfile) {
                throw new Error('Invalid admin credentials or access denied');
            }

            // Create admin user object (without auth)
            const adminUser = {
                id: adminProfile.id,
                email: adminProfile.email,
                role: adminProfile.role,
                name: adminProfile.name,
                adminProfile: adminProfile
            };
            
            onAdminLogin(adminUser);
            
        } catch (error) {
            console.error('Admin login error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAdminLogin()
        }
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        setError('')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                        <Shield className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Admin Login
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Simple administrator access
                    </p>
                </div>

                {/* Login Form */}
                <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-lg border border-gray-200">
                    <div className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="miracleosaro000@gmail.com"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Name Field (instead of password) */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Admin Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Morningstar osaro"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div>
                            <Button
                                onClick={handleAdminLogin}
                                disabled={loading || !formData.email.trim() || !formData.name.trim()}
                                className="w-full bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 py-3 text-base font-medium"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign In as Admin'
                                )}
                            </Button>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <p className="text-xs text-yellow-700">
                                <strong>Note:</strong> This is a simple admin login. Use the exact email and name from your admin profile.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back to regular login */}
                <div className="text-center">
                    <button
                        onClick={() => onNavigate('login')}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to User Login
                    </button>
                </div>
            </div>
        </div>
    )
}