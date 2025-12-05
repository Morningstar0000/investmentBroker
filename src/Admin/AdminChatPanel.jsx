"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import Input from '../components/ui/Input'
import {
  MessageCircle,
  User,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Search,
  Filter,
  Send,
  Mail,
  Phone,
  Calendar,
  Tag,
  Shield,
  ArrowLeft,
  RefreshCw,
  Paperclip, File, Image, Download
} from '../components/ui/Icons'
import { useFileUpload } from '../hooks/useFileUpload'

const AdminChatPanel = ({ supabase, user, onNavigate }) => {
  const [chatRooms, setChatRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [supportAgents, setSupportAgents] = useState([])
  const [activeTab, setActiveTab] = useState('chats')
  const messagesEndRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const { uploadFile, uploading: fileUploading } = useFileUpload(supabase)

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid file type (images, PDF, text, Word documents)');
      return;
    }

    setSelectedFile(file);
    event.target.value = ''; // Reset input
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const sendFileMessage = async () => {
    if (!selectedFile || !selectedRoom) return;

    try {
      setLoading(true);

      // Upload file to Supabase
      const fileData = await uploadFile(selectedFile, selectedRoom.id, user.id);

      // Save file message to database
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          room_id: selectedRoom.id,
          sender_id: user.id,
          message_text: `Sent a file: ${selectedFile.name}`,
          message_type: 'file',
          file_url: fileData.file_url,
          file_name: fileData.file_name,
          file_type: fileData.file_type,
          file_size: fileData.file_size
        }])
        .select();

      if (error) throw error;

      console.log('File message sent successfully:', data);
      setSelectedFile(null);

      // Also update the room's last_message_at
      await supabase
        .from('chat_rooms')
        .update({
          last_message_at: new Date().toISOString(),
          status: 'open'
        })
        .eq('id', selectedRoom.id);

      // Refresh messages to show the new one
      await fetchMessages(selectedRoom.id);

    } catch (error) {
      console.error('Error sending file message:', error);
      alert('Failed to send file. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  // Fetch all data on component mount
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchChatRooms()
      fetchSupportAgents()
    }
  }, [user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Real-time subscriptions
  useEffect(() => {
    if (!supabase || !user) return

    // Subscribe to chat_rooms changes
    const roomsSubscription = supabase
      .channel('admin_chat_rooms')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chat_rooms' },
        () => {
          fetchChatRooms()
        }
      )
      .subscribe()

    // Subscribe to messages for selected room
    if (selectedRoom) {
      const messagesSubscription = supabase
        .channel(`admin_messages_${selectedRoom.id}`)
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${selectedRoom.id}`
          },
          () => {
            fetchMessages(selectedRoom.id)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(messagesSubscription)
      }
    }

    return () => {
      supabase.removeChannel(roomsSubscription)
    }
  }, [supabase, user, selectedRoom])

  const fetchChatRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_messages (
            id,
            message_text,
            created_at,
            sender_id
          )
        `)
        .order('last_message_at', { ascending: false })

      if (error) throw error
      setChatRooms(data || [])
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
    }
  }

  const fetchSupportAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .neq('role', 'system')

      if (error) throw error
      setSupportAgents(data || [])
    } catch (error) {
      console.error('Error fetching support agents:', error)
    }
  }

  const fetchMessages = async (roomId) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSelectRoom = async (room) => {
    setSelectedRoom(room)
    await fetchMessages(room.id)

    // Mark messages as read
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('room_id', room.id)
      .eq('is_read', false)
  }

  const sendMessage = async () => {
    // If there's a selected file, send it instead of text
    if (selectedFile) {
      await sendFileMessage();
      return;
    }

    if (!newMessage.trim() || !selectedRoom) return

    try {
      const messageData = {
        room_id: selectedRoom.id,
        sender_id: user.id,
        message_text: newMessage.trim(),
        message_type: 'text',
        is_read: false,
        created_at: new Date().toISOString()
      }

      console.log('Sending message:', messageData) // Debug log

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select() // This returns the inserted data

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Message sent successfully:', data) // Debug log

      // Also update the room's last_message_at
      await supabase
        .from('chat_rooms')
        .update({
          last_message_at: new Date().toISOString(),
          status: 'open' // Ensure room stays open
        })
        .eq('id', selectedRoom.id)

      setNewMessage('')

      // Refresh messages to show the new one
      await fetchMessages(selectedRoom.id)

    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message: ' + error.message)
    }
  }

  // Update the message rendering to handle files
  // Update the message rendering to handle files
  const renderMessageContent = (message) => {
    if (message.message_type === 'file') {
      return (
        <div className="file-message bg-white rounded-lg border border-gray-200 p-3 max-w-xs">
          <div className="flex items-center space-x-2 mb-2">
            {message.file_type?.startsWith('image/') ? (
              <Image className="w-4 h-4 text-blue-600" />
            ) : (
              <File className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-sm font-medium truncate">{message.file_name}</span>
          </div>

          {/* Show image preview for images */}
          {message.file_type?.startsWith('image/') && (
            <div className="mb-2">
              <img
                src={message.file_url}
                alt={message.file_name}
                className="max-w-full h-auto rounded border border-gray-200 max-h-32 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {(message.file_size / 1024).toFixed(1)} KB
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(message.file_url, '_blank')}
              className="text-xs h-6 flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>View</span>
            </Button>
          </div>
        </div>
      );
    }

    // For text messages, return the text content
    return <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>;
  };

  const updateRoomStatus = async (roomId, status) => {
    try {
      const updates = { status }
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('chat_rooms')
        .update(updates)
        .eq('id', roomId)

      if (error) throw error

      // Refresh rooms list
      fetchChatRooms()
    } catch (error) {
      console.error('Error updating room status:', error)
    }
  }

  const assignRoom = async (roomId, agentId) => {
    try {
      const { error } = await supabase
        .from('chat_rooms')
        .update({ assigned_to: agentId })
        .eq('id', roomId)

      if (error) throw error
      fetchChatRooms()
    } catch (error) {
      console.error('Error assigning room:', error)
    }
  }

  const addTag = async (roomId, tag) => {
    try {
      const room = chatRooms.find(r => r.id === roomId)
      const currentTags = room.tags || []
      const newTags = [...new Set([...currentTags, tag])]

      const { error } = await supabase
        .from('chat_rooms')
        .update({ tags: newTags })
        .eq('id', roomId)

      if (error) throw error
      fetchChatRooms()
    } catch (error) {
      console.error('Error adding tag:', error)
    }
  }

  const removeTag = async (roomId, tagToRemove) => {
    try {
      const room = chatRooms.find(r => r.id === roomId)
      const currentTags = room.tags || []
      const newTags = currentTags.filter(tag => tag !== tagToRemove)

      const { error } = await supabase
        .from('chat_rooms')
        .update({ tags: newTags })
        .eq('id', roomId)

      if (error) throw error
      fetchChatRooms()
    } catch (error) {
      console.error('Error removing tag:', error)
    }
  }

  // Filter chat rooms based on search and status
  const filteredRooms = chatRooms.filter(room => {
    const matchesSearch = room.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.user_id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || room.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getRoomBadgeVariant = (status) => {
    switch (status) {
      case 'open': return 'default'
      case 'pending': return 'warning'
      case 'resolved': return 'success'
      case 'closed': return 'secondary'
      default: return 'outline'
    }
  }

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'warning'
      case 'normal': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString()
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
              <p className="text-gray-600">Manage customer inquiries and support tickets</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={fetchChatRooms}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
              <Badge variant="secondary" className="text-sm">
                {filteredRooms.length} {filteredRooms.length === 1 ? 'Chat' : 'Chats'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Chat Rooms List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Chat Rooms List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Active Chats</span>
                  <Badge variant="secondary">{filteredRooms.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredRooms.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p>No chats found</p>
                    </div>
                  ) : (
                    filteredRooms.map((room) => {
                      const lastMessage = room.chat_messages?.[room.chat_messages.length - 1]
                      const unreadCount = room.chat_messages?.filter(m => !m.is_read && m.sender_id !== user.id).length || 0

                      return (
                        <div
                          key={room.id}
                          className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${selectedRoom?.id === room.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                          onClick={() => handleSelectRoom(room)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-gray-900 truncate">
                                  {room.room_name}
                                </p>
                                {unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                User: {room.user_id}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <Badge variant={getRoomBadgeVariant(room.status)} className="text-xs">
                                {room.status}
                              </Badge>
                              <Badge variant={getPriorityBadgeVariant(room.priority)} className="text-xs">
                                {room.priority}
                              </Badge>
                            </div>
                          </div>

                          {lastMessage && (
                            <p className="text-sm text-gray-600 truncate">
                              {lastMessage.message_text}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDate(room.last_message_at)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(room.last_message_at)}
                            </span>
                          </div>

                          {/* Tags */}
                          {room.tags && room.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {room.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {selectedRoom ? (
              <Card className="h-full">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRoom(null)}
                        className="lg:hidden"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <div>
                        <CardTitle>{selectedRoom.room_name}</CardTitle>
                        <CardDescription>
                          User ID: {selectedRoom.user_id} •
                          Created: {formatDate(selectedRoom.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Status Actions */}
                      <select
                        value={selectedRoom.status}
                        onChange={(e) => updateRoomStatus(selectedRoom.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>

                      {/* Assign To */}
                      <select
                        value={selectedRoom.assigned_to || ''}
                        onChange={(e) => assignRoom(selectedRoom.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      >
                        <option value="">Unassigned</option>
                        {supportAgents.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.full_name || agent.email}
                          </option>
                        ))}
                      </select>

                      {/* Quick Actions */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRoomStatus(selectedRoom.id, 'resolved')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </div>

                  {/* Room Info Bar */}
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Last activity: {formatTime(selectedRoom.last_message_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>Priority: {selectedRoom.priority}</span>
                    </div>
                    {selectedRoom.assigned_to && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Shield className="w-4 h-4" />
                        <span>
                          Assigned to: {
                            supportAgents.find(a => a.id === selectedRoom.assigned_to)?.full_name ||
                            supportAgents.find(a => a.id === selectedRoom.assigned_to)?.email ||
                            'Unknown'
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {/* Messages Area */}
                  <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-md rounded-lg p-3 ${message.sender_id === user.id
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : message.sender_id === '00000000-0000-0000-0000-000000000000'
                                ? 'bg-gray-200 text-gray-800 rounded-bl-none'
                                : 'bg-green-100 text-gray-800 rounded-bl-none'
                              }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              {message.sender_id === '00000000-0000-0000-0000-000000000000' ? (
                                <Shield className="w-3 h-3" />
                              ) : (
                                <User className="w-3 h-3" />
                              )}
                              <span className="text-xs font-medium">
                                {message.sender_id === user.id
                                  ? 'You'
                                  : message.sender_id === '00000000-0000-0000-0000-000000000000'
                                    ? 'System'
                                    : 'User'}
                              </span>
                              {!message.is_read && message.sender_id === user.id && (
                                <span className="text-xs text-blue-300">(Sent)</span>
                              )}
                            </div>
                               {renderMessageContent(message)}
                            <p className="text-xs opacity-70 mt-1">
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t bg-white p-4">
                    {/* Selected File Preview */}
                    {selectedFile && (
                      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium truncate max-w-xs">
                              {selectedFile.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({(selectedFile.size / 1024).toFixed(1)} KB)
                            </span>
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

                    <div className="flex space-x-2">
                      {/* File Upload Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={fileUploading || loading}
                        className="border-gray-300"
                      >
                        {fileUploading ? (
                          <Clock className="w-4 h-4 animate-spin" />
                        ) : (
                          <Paperclip className="w-4 h-4" />
                        )}
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
                        placeholder={selectedFile ? "Add a caption (optional)" : "Type your reply..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
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

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Quick tags:</span>
                        {['Urgent', 'Follow-up', 'Technical', 'Billing'].map(tag => (
                          <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            onClick={() => addTag(selectedRoom.id, tag)}
                            className="text-xs h-6"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Press Enter to send • Max file size: 10MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Chat Selected</h3>
                  <p>Select a chat from the list to start conversation</p>
                </div>
              </Card>
            )}
          </div>

        </div>
      </div>

      {/* // Add this temporary debug component at the bottom of your AdminChatPanel */}
      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
        <h3 className="font-bold">Debug Info:</h3>
        <p>Selected Room: {selectedRoom?.id}</p>
        <p>User ID: {user?.id}</p>
        <p>User Role: {user?.role}</p>
        <p>Messages in state: {messages.length}</p>
        <button
          onClick={() => {
            console.log('Current state:', { selectedRoom, user, messages })
            fetchChatRooms()
          }}
          className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
        >
          Refresh & Log State
        </button>
      </div>
    </div>
  )
}

export default AdminChatPanel