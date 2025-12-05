// components/NotificationDialog.jsx
"use client"
import React, { useState, useEffect } from 'react'
import { X, MessageCircle, CreditCard, AlertCircle, CheckCircle } from './ui/Icons'

const NotificationDialog = ({ isOpen, onClose, supabase, userId, onMarkAsRead, fetchUnreadCount }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  // Notification types with icons and colors
  const notificationTypes = {
    deposit: { icon: CreditCard, color: 'text-green-600', bgColor: 'bg-green-50' },
    withdrawal: { icon: CreditCard, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    support: { icon: MessageCircle, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    system: { icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    success: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    warning: { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
  }



  // In NotificationDialog.jsx, add real-time subscription
useEffect(() => {
  if (isOpen && userId) {
    fetchNotifications()

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('New notification received:', payload.new)
          setNotifications(prev => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }
}, [isOpen, userId])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      // Fetch from your notifications table (you'll need to create this)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

 // In NotificationDialog.jsx, update the markAsRead function:
const markAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId); // Important: Add user_id check for security

    if (!error) {
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      
      // Trigger unread count update in parent
      if (onMarkAsRead) {
        onMarkAsRead();
      }
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const typeConfig = notificationTypes[notification.type] || notificationTypes.system
              const Icon = typeConfig.icon
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${typeConfig.bgColor}`}>
                      <Icon className={`w-4 h-4 ${typeConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={fetchNotifications}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationDialog