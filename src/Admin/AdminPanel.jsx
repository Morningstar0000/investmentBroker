"use client"
import React from 'react'
import { Button } from '../components/ui/Button'
import {
  MessageCircle,
  CreditCard,
  Users,
  Settings,
  Bell,
  BarChart3,
  TrendingUp,
  Activity,
  Receipt  // Add Receipt icon for transactions
} from '../components/ui/Icons'
import AdminNotifications from './AdminNotifications'

const AdminPanel = ({ user, onNavigate, supabase }) => { // Add supabase to props
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Platform administration and management</p>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Payment Management Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Payment Methods</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage bank accounts and cryptocurrency wallets for deposits
            </p>
            <Button
              onClick={() => onNavigate('admin-payment')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Manage Payments
            </Button>
          </div>

          {/* Chat Management Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <MessageCircle className="w-8 h-8 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Customer Support</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage live chat conversations and customer inquiries
            </p>
            <Button
              onClick={() => onNavigate('admin-chat')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Manage Chats
            </Button>
          </div>

          {/* TRANSACTIONS MANAGEMENT CARD - ADDED THIS */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Receipt className="w-8 h-8 text-red-600" />
              <h3 className="text-xl font-semibold text-gray-900">Transactions</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage user deposits, withdrawals, and transaction history
            </p>
            <Button
              onClick={() => onNavigate('admin-transactions')}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Manage Transactions
            </Button>
          </div>

          {/* USER METRICS MANAGEMENT CARD */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <BarChart3 className="w-8 h-8 text-teal-600" />
              <h3 className="text-xl font-semibold text-gray-900">User Metrics</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage user trading metrics, balances, P&L, and win rates
            </p>
            <Button
              onClick={() => onNavigate('admin-user-metrics')}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              Manage Metrics
            </Button>
          </div>

          {/* TRADING POSITIONS CARD */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-8 h-8 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-900">Trading Positions</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage user trading positions, P&L, and trade history
            </p>
            <Button
              onClick={() => onNavigate('admin-trading-positions')}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Manage Positions
            </Button>
          </div>

          {/* Notification Management Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-8 h-8 text-yellow-600" />
              <h3 className="text-xl font-semibold text-gray-900">Send Notifications</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Send notifications and alerts to users
            </p>
            <Button
              onClick={() => onNavigate('admin-notifications')}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              Send Notifications
            </Button>
          </div>

          {/* User Management Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-8 h-8 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View and manage user accounts and permissions
            </p>
            <Button
              onClick={() => onNavigate('admin-users')}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Manage Users
            </Button>
          </div>

          {/* Investor Management Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-8 h-8 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-900">Investor Management</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Add, edit, and manage trading investors for copy trading
            </p>
            <Button
              onClick={() => onNavigate('admin-investors')}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              Manage Investors
            </Button>
          </div>

          {/* Platform Settings Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-8 h-8 text-orange-600" />
              <h3 className="text-xl font-semibold text-gray-900">Platform Settings</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure platform-wide settings and preferences
            </p>
            <Button
              onClick={() => onNavigate('admin-settings')}
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled
            >
              Coming Soon
            </Button>
          </div>
        </div>

        {/* Notification Sender Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="w-6 h-6 text-yellow-600 mr-2" />
              Quick Notification Sender
            </h3>
            <p className="text-gray-600 mb-4">
              Send immediate notifications to users for deposits, withdrawals, or system alerts.
            </p>
            <AdminNotifications />
          </div>
        </div>

        {/* Quick Stats - UPDATED WITH TRANSACTIONS STAT */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Active Chats</h4>
            <p className="text-3xl font-bold text-blue-600">12</p>
            <p className="text-sm text-gray-500">Currently open conversations</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Methods</h4>
            <p className="text-3xl font-bold text-green-600">8</p>
            <p className="text-sm text-gray-500">Active deposit options</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Transactions</h4>
            <p className="text-3xl font-bold text-red-600">1,245</p>
            <p className="text-sm text-gray-500">Total transactions processed</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">User Metrics</h4>
            <p className="text-3xl font-bold text-teal-600">150+</p>
            <p className="text-sm text-gray-500">Tracked user metrics</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel