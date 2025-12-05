// components/AdminNotificationSender.jsx
"use client"
import React, { useState } from 'react'
import { supabase } from '../client'

const AdminNotificationSender = () => {
  const [formData, setFormData] = useState({
    userId: '',
    type: 'system',
    title: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  

  const notificationTypes = [
    { value: 'deposit', label: 'Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'support', label: 'Support' },
    { value: 'system', label: 'System' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' }
  ]

  const sendNotification = async () => {
    if (!formData.userId || !formData.title || !formData.message) {
      setResult('Please fill all fields')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: formData.userId,
            type: formData.type,
            title: formData.title,
            message: formData.message,
            is_read: false
          }
        ])
        .select()

      if (error) {
        throw error
      }

      setResult('✅ Notification sent successfully!')
      setFormData({
        userId: '',
        type: 'system',
        title: '',
        message: ''
      })
    } catch (error) {
      console.error('Error sending notification:', error)
      setResult('❌ Error sending notification: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Send Notification to User</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User ID
          </label>
          <input
            type="text"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            placeholder="Enter user UUID"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notification Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            {notificationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Notification title"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Notification message"
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <button
          onClick={sendNotification}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>

        {result && (
          <div className={`p-3 rounded-md ${
            result.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {result}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminNotificationSender;