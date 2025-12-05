"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, User, CreditCard, Wallet, Settings, LogOut, TrendingUp } from "lucide-react"

export default function Sidebar({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "trading", label: "Trading Positions", icon: TrendingUp, badge: "8" },
    { id: "exchange", label: "Currency Exchange", icon: CreditCard },
    { id: "profile", label: "Profile", icon: User },
    { id: "wallet", label: "Wallet", icon: Wallet, badge: "$125.7K" },
  ]

  const handleMenuClick = (sectionId) => {
    setActiveSection(sectionId)
    setSidebarOpen(false) // Close mobile sidebar
  }

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ForexPro</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${
                  isActive ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? "text-blue-700" : "text-gray-500"}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
