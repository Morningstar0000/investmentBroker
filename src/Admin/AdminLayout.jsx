"use client"
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { MessageCircle, CreditCard, Users, Settings, Shield, LogOut, Home } from '../components/ui/Icons';

export default function AdminLayout({ children, user, onLogout, onNavigate, currentPage }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const adminMenuItems = [
    { id: 'admin', label: 'Dashboard', icon: Shield },
    { id: 'admin-chat', label: 'Customer Support', icon: MessageCircle },
    { id: 'admin-payment', label: 'Payment Methods', icon: CreditCard },
    
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <nav className="bg-white shadow-lg border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => onNavigate('admin')} className="flex-shrink-0">
                <div className="text-2xl font-bold text-red-600">
                  <span className="flex items-center">
                    <Shield className="w-8 h-8 mr-2" />
                    Admin Portal
                  </span>
                </div>
              </button>

              {/* Desktop Admin Navigation */}
              <div className="hidden md:ml-6 md:flex md:space-x-1">
                {adminMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => !item.disabled && onNavigate(item.id)}
                    disabled={item.disabled}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === item.id
                        ? 'bg-red-100 text-red-700'
                        : item.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                    {item.disabled && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1 rounded">Soon</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            
              <Button onClick={onLogout} variant="outline" size="sm" className="border-red-300 text-red-700">
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}