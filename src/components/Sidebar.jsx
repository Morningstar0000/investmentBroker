"use client"
import React, { useState } from "react"
import { Button } from "./ui/Button"
import { Badge } from "../components/ui/Badge"
import { LayoutDashboard, User, CreditCard, Wallet, Settings, LogOut, TrendingUp, MessageCircle, Bell } from "./ui/Icons"
import NotificationDialog from "./NotificationDialog"
import { supabase } from "../client"

// Add the NotificationBell component
const NotificationBell = ({ count, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
};

/**
 * Sidebar component for navigation.
 * @param {object} props - The component props.
 * @param {string} props.currentPage - The currently active page.
 * @param {function} props.onNavigate - Function to navigate to different pages.
 * @param {boolean} props.sidebarOpen - State of the mobile sidebar.
 * @param {function} props.setSidebarOpen - Function to toggle the mobile sidebar.
 * @param {function} props.onSignOut - The function to call when the user signs out.
 * @param {function} props.onOpenChat - Function to open the chat.
 * @param {number} props.unreadCount - Number of unread messages.
 */
const Sidebar = ({
  currentPage,
  onNavigate,
  sidebarOpen,
  setSidebarOpen,
  onSignOut,
  onOpenChat,
  user,
  chatUnreadCount = 0,  // Add this prop
  systemUnreadCount = 0, // Add this prop
  profileData
}) => {
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false)
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "trading", label: "Trading Positions", icon: TrendingUp },
    { id: "accounts", label: "Account types", icon: CreditCard },
    { id: "profile", label: "Profile", icon: User },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleNotificationClick = () => {
    setNotificationDialogOpen(true)
  }

  const handleSupportClick = () => {
    if (onOpenChat) {
      onOpenChat();
      setSidebarOpen(false); // Close mobile sidebar
    }
  };

  const handleMenuClick = (pageId) => {
    onNavigate(pageId)
    setSidebarOpen(false)
  }

  // In Sidebar.jsx, add this function:
  const fetchUnreadCount = async (userId) => {
    if (!userId) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (!error) return count;
    return 0;
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

      {/* Fixed Top Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">
              <img src="Logo.png" alt="Logo" className='max-w-28' />
            </div>
          </div>
          <NotificationBell
            count={systemUnreadCount}
            onClick={handleNotificationClick}
          />
        </div>

        {/* User Profile */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          {/* Your user profile code */}
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200 flex-shrink-0">
              <span className="text-blue-700 font-bold">
                {profileData?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </span>
            </div>

            {/* User Info - Column layout */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 text-sm truncate">
                  {profileData?.firstName || "Trader"} {profileData?.lastName || ""}
                </span>
                <span className="text-xs text-gray-500 truncate mt-0.5">
                  {user?.email || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Middle Section */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-2 px-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-colors ${currentPage === item.id ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-700 hover:bg-gray-50"}`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`w-5 h-5 ${currentPage === item.id ? "text-blue-700" : "text-gray-500"}`} />
                <span className="font-medium">{item.label}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="mt-4 px-4">
          <button
            onClick={handleSupportClick}
            className="w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Support Chat</span>
            </div>
            {chatUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={onSignOut}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>

      {/* Notification Dialog - RENDERED OUTSIDE THE SIDEBAR */}
      <NotificationDialog
        isOpen={notificationDialogOpen}
        onClose={() => setNotificationDialogOpen(false)}
        supabase={supabase}
        userId={user?.id}
        onMarkAsRead={() => {
          if (user?.id) {
            // Refresh unread count
            fetchUnreadCount(user.id);
          }
        }}
      />
    </div>

  )
}

export default Sidebar