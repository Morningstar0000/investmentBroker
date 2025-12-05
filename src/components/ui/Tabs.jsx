"use client"

import React, { useState } from "react"

export const Tabs = ({ children, defaultValue, value, onValueChange, className = "" }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value)

  const handleTabChange = (newValue) => {
    setActiveTab(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <div className={className}>
      {React.Children.map(children, (child) => React.cloneElement(child, { activeTab, onTabChange: handleTabChange }))}
    </div>
  )
}

export const TabsList = ({ children, activeTab, onTabChange, className = "" }) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}>
      {React.Children.map(children, (child) => React.cloneElement(child, { activeTab, onTabChange }))}
    </div>
  )
}

export const TabsTrigger = ({ children, value, activeTab, onTabChange, className = "" }) => {
  const isActive = activeTab === value

  return (
    <button
      onClick={() => onTabChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
        isActive ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
      } ${className}`}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ children, value, activeTab, className = "" }) => {
  if (activeTab !== value) return null

  return <div className={`mt-2 ${className}`}>{children}</div>
}
