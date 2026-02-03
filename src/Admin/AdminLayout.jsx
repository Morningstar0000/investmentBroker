"use client"
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { 
  MessageCircle, 
  CreditCard, 
  Users, 
  Settings, 
  Shield, 
  LogOut, 
  Home, 
  BarChart3, 
  Bell, 
  Activity,
  Receipt,
  Menu,
  X
} from '../components/ui/Icons';

export default function AdminLayout({ children, user, onLogout, onNavigate, currentPage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminMenuItems = [
    { id: 'admin', label: 'Dashboard', icon: Shield },
    { id: 'admin-chat', label: 'Customer Support', icon: MessageCircle },
    { id: 'admin-transactions', label: 'Transactions', icon: Receipt },
    { id: 'admin-payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'admin-user-metrics', label: 'User Metrics', icon: BarChart3 },
    { id: 'admin-notifications', label: 'Notifications', icon: Bell },
    { id: 'admin-trading-positions', label: 'Trading Positions', icon: Activity },
    { id: 'admin-investors', label: 'Investor Management', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header - IMPROVED RESPONSIVENESS */}
      <nav className="bg-white shadow-lg border-b border-red-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side: Logo and mobile menu button */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* Logo/Brand */}
              <button onClick={() => onNavigate('admin')} className="flex-shrink-0 ml-2 md:ml-0">
                <div className="text-xl md:text-2xl font-bold text-red-600 flex items-center">
                  <Shield className="w-6 h-6 md:w-8 md:h-8 mr-2" />
                  <span className="hidden sm:inline">Admin Portal</span>
                  <span className="sm:hidden">Admin</span>
                </div>
              </button>

              {/* Desktop Admin Navigation - IMPROVED WRAPPING */}
              <div className="hidden md:flex md:ml-6 md:space-x-1 flex-wrap max-w-2xl">
                {adminMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                      currentPage === item.id
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-1 md:mr-2" />
                    <span className="hidden lg:inline">{item.label}</span>
                    <span className="lg:hidden">
                      {item.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
           
           
            {/* Right side: User info and logout */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              
              {/* Compact user info for mobile */}
              <div className="sm:hidden">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-700 font-bold text-sm">
                    {user?.name?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
            
              <Button 
                onClick={onLogout} 
                variant="outline" 
                size="sm" 
                className="border-red-300 text-red-700"
              >
                <LogOut className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile menu - appears below navbar */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {adminMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      currentPage === item.id
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}