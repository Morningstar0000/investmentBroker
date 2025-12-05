"use client"
import React from 'react'
import { Button } from './ui/Button'
import { MessageCircle } from './ui/Icons'

const ChatTrigger = ({ onClick, unreadCount = 0 }) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 shadow-2xl bg-blue-400 hover:bg-blue-600 rounded-xl hover:rounded-full text-white z-40"
      size="lg"
    >
      <div className="relative">
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
    </Button>
  )
}

export default ChatTrigger