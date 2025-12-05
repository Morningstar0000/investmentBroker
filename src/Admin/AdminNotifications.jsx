// components/AdminNotifications.jsx
"use client"
import React from 'react'
import AdminNotificationSender from './AdminNotificationSender'
import { ArrowLeft } from '../components/ui/Icons'

const AdminNotifications = ({ supabase, user, onNavigate }) => {
  // If no user, show error or redirect
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> User not authenticated. Please log in again.
          </div>
          <button
            onClick={() => onNavigate('admin')}
            className="mt-4 flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('admin')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-gray-600">Send and manage user notifications</p>
        </div>

        {/* Notification Sender */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <AdminNotificationSender />
        </div>
      </div>
    </div>
  )
}

export default AdminNotifications