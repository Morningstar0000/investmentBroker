"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Toast } from '../components/ui/Toast'

const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now()

    // Store in localStorage for persistence across navigation
  const toastData = { id, message, type, duration, timestamp: Date.now() };
  const existingToasts = JSON.parse(localStorage.getItem('pendingToasts') || '[]');
  localStorage.setItem('pendingToasts', JSON.stringify([...existingToasts, toastData]));


    setToasts(prev => [...prev, { id, message, type, duration }])
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  };

  // Load pending toasts on mount
useEffect(() => {
  const pendingToasts = JSON.parse(localStorage.getItem('pendingToasts') || '[]');
  const now = Date.now();
  
  // Only show toasts less than 2 seconds old
  const recentToasts = pendingToasts.filter(toast => now - toast.timestamp < 2000);
  
  if (recentToasts.length > 0) {
    recentToasts.forEach(toast => {
      setToasts(prev => [...prev, { id: toast.id, message: toast.message, type: toast.type, duration: toast.duration }]);
      
      // Auto remove
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    });
    
    // Clear from localStorage
    localStorage.removeItem('pendingToasts');
  }
}, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAllToasts = () => {
    setToasts([])
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearAllToasts }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 max-w-md w-full md:w-auto">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}