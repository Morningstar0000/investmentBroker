"use client"
import React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "../components/ui/Button"
import Input from "../components/ui/Input"
import { CardHeader, CardTitle } from "../components/ui/Card"
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Maximize2,
  User,
  Shield,
  Clock,
  Paperclip,
  File,
  Image,
  Download,
} from "../components/ui/Icons"
import { useFileUpload } from "../hooks/useFileUpload"
import { useNotifications } from "../hooks/useNotification"

const ChatBox = ({ supabase, user, isOpen, onClose, onToggle, setUnreadCount }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const { uploadFile, uploading: fileUploading, error: fileError } = useFileUpload(supabase)
  const [chatUserId, setChatUserId] = useState(null)
  

  useEffect(() => {
    const identifier = user ? user.id : `visitor_${Date.now()}`
    setChatUserId(identifier)
  }, [user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize or get chat room
  useEffect(() => {
    if (isOpen && chatUserId) {
      initializeChatRoom()
    }
  }, [isOpen, chatUserId])

  // Reset minimization when opening chat
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false)
    }
  }, [isOpen])

  const initializeChatRoom = async () => {
    try {
      setLoading(true)
      console.log("🚀 INITIALIZING CHAT ROOM")

      if (!supabase || !chatUserId) {
        console.error("❌ Supabase client or Chat User ID is missing!")
        return
      }

      const roomName = user ? `Support - ${user.email}` : "Customer Support"

      // Check for existing open room from last 24 hours
      const { data: existingRooms, error: roomError } = await supabase
        .from("chat_rooms")
        .select("*")
        .eq("user_id", chatUserId)
        .eq("status", "open")
        .gte("last_message_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("last_message_at", { ascending: false })
        .limit(1)

      if (roomError) {
        console.error("❌ Room query error:", roomError)
        throw roomError
      }

      let room
      if (existingRooms && existingRooms.length > 0) {
        room = existingRooms[0]
        console.log("✅ Using existing room:", room.id)

        if (room.status === "closed") {
          const { data: updatedRoom, error: updateError } = await supabase
            .from("chat_rooms")
            .update({ status: "open" })
            .eq("id", room.id)
            .select()
            .single()

          if (updateError) throw updateError
          room = updatedRoom
        }
      } else {
        // Create new room
        const { data: newRoom, error: createError } = await supabase
          .from("chat_rooms")
          .insert([
            {
              user_id: chatUserId,
              room_name: roomName,
              status: "open",
              priority: "normal",
            },
          ])
          .select()
          .single()

        if (createError) throw createError
        room = newRoom

        // Add welcome message
        const { error: welcomeError } = await supabase.from("chat_messages").insert([
          {
            room_id: room.id,
            sender_id: "00000000-0000-0000-0000-000000000000",
            message_text: "Welcome to customer support! How can we help you today?",
            message_type: "auto-reply",
          },
        ])

        if (welcomeError) {
          console.error("❌ Welcome message error:", welcomeError)
        }
      }

      setCurrentRoom(room)
      await fetchMessages(room.id)
      setupRealtimeSubscription(room.id)
    } catch (error) {
      console.error("💥 Error initializing chat:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (roomId) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const setupRealtimeSubscription = (roomId) => {
    const subscription = supabase
      .channel(`chat_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
          if (payload.new.sender_id !== chatUserId) {
            setIsTyping(false)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }



  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid file type (images, PDF, text, Word documents)")
      return
    }

    setSelectedFile(file)
    event.target.value = ""
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
  }

  const sendFileMessage = async () => {
    if (!selectedFile || !currentRoom) return

    try {
      setLoading(true)
      const fileData = await uploadFile(selectedFile, currentRoom.id, chatUserId)

      const { data, error } = await supabase
        .from("chat_messages")
        .insert([
          {
            room_id: currentRoom.id,
            sender_id: chatUserId,
            message_text: `Sent a file: ${selectedFile.name}`,
            message_type: "file",
            file_url: fileData.file_url,
            file_name: fileData.file_name,
            file_type: fileData.file_type,
            file_size: fileData.file_size,
          },
        ])
        .select()

      if (error) throw error

      await supabase
        .from("chat_rooms")
        .update({
          last_message_at: new Date().toISOString(),
          status: "open",
        })
        .eq("id", currentRoom.id)

      setSelectedFile(null)
      await fetchMessages(currentRoom.id)
    } catch (error) {
      console.error("Error sending file message:", error)
      alert(`Failed to send file: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

// In ChatBox.jsx, update the unread count useEffect:
useEffect(() => {
  if (!currentRoom || !chatUserId || !setUnreadCount) return

  const fetchUnreadCount = async () => {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', currentRoom.id)
      .eq('is_read', false)
      .neq('sender_id', chatUserId)

    if (!error && setUnreadCount) {
      setUnreadCount(count || 0) // This updates App.jsx state
    }
  }

  // Initial fetch
  fetchUnreadCount()

  // Real-time subscription for THIS ROOM ONLY
  const subscription = supabase
    .channel(`room_unread_${currentRoom.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${currentRoom.id}`,
      },
      (payload) => {
        // Update local count for this room
        fetchUnreadCount()
        
        // Show notification for new incoming messages
        if (payload.eventType === 'INSERT' && 
            payload.new.sender_id !== chatUserId && 
            !payload.new.is_read) {
          showNewMessageNotification(payload.new)
        }
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [currentRoom, chatUserId, setUnreadCount])

const showNewMessageNotification = (message) => {
  // Check if browser supports notifications
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return
  }

  // Request permission if not granted
  if (Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        createNotification(message)
      }
    })
  } else if (Notification.permission === "granted") {
    createNotification(message)
  }
}

const createNotification = (message) => {
  const notification = new Notification("New Message from Support", {
    body: message.message_type === 'text' 
      ? message.message_text 
      : `Sent a file: ${message.file_name}`,
    icon: "/favicon.ico", // Add your app icon
    tag: "chat-message"
  })

  // Close notification after 5 seconds
  setTimeout(() => {
    notification.close()
  }, 5000)

  // Focus window when notification is clicked
  notification.onclick = () => {
    window.focus()
    notification.close()
  }
}

 // In ChatBox.jsx, update markMessagesAsRead
const markMessagesAsRead = async () => {
  if (!currentRoom || !chatUserId || !setUnreadCount) return
  
  const { error } = await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('room_id', currentRoom.id)
    .eq('is_read', false)
    .neq('sender_id', chatUserId)
  
  if (error) {
    console.error('Error marking messages as read:', error)
  } else {
    console.log('Messages marked as read')
    // Update parent's unread count
    setUnreadCount(0)
  }
}

// Update the useEffect that calls markMessagesAsRead:
useEffect(() => {
  if (isOpen && currentRoom) {
    markMessagesAsRead()
  }
}, [isOpen, currentRoom])

  const sendMessage = async () => {
    const messageToSend = newMessage.trim() // Declare messageToSend variable here
    if (selectedFile) {
      await sendFileMessage()
      return
    }

    if (!messageToSend || !currentRoom) return

    try {
      setNewMessage("")

      const userMessagesCount = messages.filter(
        (msg) => msg.sender_id === chatUserId && msg.message_type !== "auto-reply",
      ).length

      const { data, error } = await supabase
        .from("chat_messages")
        .insert([
          {
            room_id: currentRoom.id,
            sender_id: chatUserId,
            message_text: messageToSend,
            message_type: "text",
          },
        ])
        .select()

      if (error) throw error

      if (userMessagesCount === 0) {
        setIsTyping(true)

        setTimeout(async () => {
          const { error: replyError } = await supabase.from("chat_messages").insert([
            {
              room_id: currentRoom.id,
              sender_id: "00000000-0000-0000-0000-000000000000",
              message_text: "Thank you for your message. An agent will be with you shortly.",
              message_type: "auto-reply",
            },
          ])

          if (replyError) {
            console.error("Auto-reply error:", replyError)
          }

          setIsTyping(false)
        }, 1500)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setNewMessage(messageToSend)
      setIsTyping(false)
    }
  }

  const renderMessageContent = (message) => {
    if (message.message_type === "file") {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 p-2 bg-white rounded border">
            {message.file_type?.startsWith("image/") ? (
              <Image className="w-5 h-5 text-blue-600" />
            ) : (
              <File className="w-5 h-5 text-gray-600" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.file_name}</p>
              <p className="text-xs text-gray-500">{(message.file_size / 1024).toFixed(1)} KB</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(message.file_url, "_blank")}
              className="text-blue-600 hover:text-blue-800"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
          {message.message_text && <p className="text-sm text-gray-600">{message.message_text}</p>}
        </div>
      )
    }

    return <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleMinimizeToggle = () => {
    setIsMinimized(!isMinimized)
  }

  if (!isOpen) return null

  return (
    <div className={`fixed  -bottom-5  right-4 z-50 ${isMinimized ? "w-60" : "w-70"} transition-all duration-300`}>
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-200">
        {/* Header */}
        <CardHeader className="bg-blue-600 text-white p-4 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-5 h-5" />
              <CardTitle className="text-lg sm:text-sm font-semibold md:font-extralight md:text-sm">Customer Support</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={handleMinimizeToggle} className="text-white  hover:bg-blue-800 hover:rounded-full">
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-blue-800 hover:rounded-3xl border-none">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <div className="flex flex-col">
            <div className="h-80 overflow-y-auto p-4 space-y-4  bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center space-x-2 text-gray-500 h-full">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Loading conversation...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 space-y-2 h-full flex flex-col justify-center">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-400" />
                  <p>Start a conversation with our support team!</p>
                  <p className="text-sm">We're here to help you 24/7.</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === chatUserId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-lg p-3 ${message.sender_id === chatUserId
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                          }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {message.sender_id === "00000000-0000-0000-0000-000000000000" ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          <span className="text-xs font-medium">
                            {message.sender_id === chatUserId ? "You" : "Support"}
                          </span>
                        </div>
                        {renderMessageContent(message)}
                        <p className="text-xs opacity-70 mt-1">{formatTime(message.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none p-3">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">Support is typing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Selected File Preview */}
            {selectedFile && (
              <div className="border-t bg-yellow-50 p-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium truncate max-w-xs">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeSelectedFile}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="border-t bg-white p-4 rounded-b-2xl flex-shrink-0">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={fileUploading || loading}
                  className="border-gray-300"
                >
                  {fileUploading ? <Clock className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                </Button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx"
                  className="hidden"
                />

                <Input
                  type="text"
                  placeholder={selectedFile ? "Add a caption (optional)" : "Type your message..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={loading || fileUploading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={(!newMessage.trim() && !selectedFile) || loading || fileUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">Press Enter to send • Max file size: 10MB</p>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatBox
