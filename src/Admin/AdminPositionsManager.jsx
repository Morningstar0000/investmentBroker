"use client"

import React, { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { Search, Filter, Plus, Edit, Eye, Trash2, Users, DollarSign, TrendingUp, Activity } from "../ui/Icons"
import { supabase } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs"

export default function AdminTradingPositions({ user, onNavigate, supabase }) {
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [userPositions, setUserPositions] = useState({
    open: [],
    closed: []
  })

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Adjust this based on your users table name
      const { data: usersData, error } = await supabase
        .from("profiles") // Or "users" or "auth.users"
        .select(`
          id,
          email,
          full_name,
          account_balance,
          today_pnl,
          win_rate,
          created_at
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      // For each user, fetch their positions
      const usersWithPositions = await Promise.all(
        (usersData || []).map(async (user) => {
          // Fetch open positions for this user
          const { data: openPositions } = await supabase
            .from("open_positions")
            .select("*")
            .eq("user_id", user.id)

          // Fetch closed positions for this user
          const { data: closedPositions } = await supabase
            .from("closed_positions")
            .select("*")
            .eq("user_id", user.id)

          // Calculate totals
          const totalOpenPnl = (openPositions || []).reduce((sum, pos) => sum + (pos.pnl || 0), 0)
          const totalClosedPnl = (closedPositions || []).reduce((sum, pos) => sum + (pos.pnl || 0), 0)

          return {
            ...user,
            open_positions_count: openPositions?.length || 0,
            closed_positions_count: closedPositions?.length || 0,
            total_positions: (openPositions?.length || 0) + (closedPositions?.length || 0),
            total_open_pnl: totalOpenPnl,
            total_closed_pnl: totalClosedPnl,
            net_pnl: totalOpenPnl + totalClosedPnl
          }
        })
      )

      setUsers(usersWithPositions)
      
      // Auto-select first user if none selected
      if (!selectedUser && usersWithPositions.length > 0) {
        handleUserSelect(usersWithPositions[0])
      }

    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch positions for selected user
  const fetchUserPositions = async (userId) => {
    try {
      const [openRes, closedRes] = await Promise.all([
        supabase.from("open_positions").select("*").eq("user_id", userId),
        supabase.from("closed_positions").select("*").eq("user_id", userId)
      ])

      setUserPositions({
        open: openRes.data || [],
        closed: closedRes.data || []
      })
    } catch (error) {
      console.error("Error fetching user positions:", error)
    }
  }

  // Handle user selection
  const handleUserSelect = async (user) => {
    setSelectedUser(user)
    await fetchUserPositions(user.id)
  }

  // Initial fetch
  useEffect(() => {
    fetchUsers()
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  // Format percentage
  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(2)}%`
  }

  // Create position for selected user
  const handleCreatePosition = async () => {
    if (!selectedUser) {
      alert("Please select a user first")
      return
    }

    // You could open a modal here with a form
    const symbol = prompt("Enter currency pair (e.g., EUR/USD):", "EUR/USD")
    if (!symbol) return

    const type = prompt("Enter position type (BUY/SELL):", "BUY")
    if (!type) return

    const size = prompt("Enter size (in thousands, e.g., 1 for 1K):", "1")
    if (!size) return

    const openPrice = prompt("Enter open price:", "1.08500")
    if (!openPrice) return

    try {
      const positionData = {
        user_id: selectedUser.id,
        pair: symbol,
        type: type.toUpperCase(),
        size: parseFloat(size) * 1000,
        open_price: parseFloat(openPrice),
        current_price: parseFloat(openPrice),
        pnl: 0,
        pnl_percent: 0,
        swap: 0,
        commission: 0,
        open_time: new Date().toISOString(),
        status: "open"
      }

      const { error } = await supabase
        .from("open_positions")
        .insert([positionData])

      if (error) throw error

      alert("Position created successfully!")
      fetchUsers() // Refresh user list
      if (selectedUser) fetchUserPositions(selectedUser.id)

    } catch (error) {
      console.error("Error creating position:", error)
      alert("Error creating position")
    }
  }

  // Close a position
  const handleClosePosition = async (position) => {
    if (!confirm(`Close position ${position.pair}?`)) return

    try {
      const closeTime = new Date().toISOString()
      
      // Calculate duration
      const open = new Date(position.open_time)
      const close = new Date(closeTime)
      const diff = close - open
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const duration = `${hours}h ${minutes}m`

      // Create closed position
      const closedPosition = {
        user_id: position.user_id,
        pair: position.pair,
        type: position.type,
        size: position.size,
        open_price: position.open_price,
        close_price: position.current_price || position.open_price,
        pnl: position.pnl || 0,
        pnl_percent: position.pnl_percent || 0,
        swap: position.swap || 0,
        commission: position.commission || 0,
        open_time: position.open_time,
        close_time: closeTime,
        result: (position.pnl || 0) >= 0 ? "win" : "loss",
        duration: duration,
        stop_loss: position.stop_loss,
        take_profit: position.take_profit
      }

      // Insert into closed_positions
      const { error: insertError } = await supabase
        .from("closed_positions")
        .insert([closedPosition])

      if (insertError) throw insertError

      // Delete from open_positions
      const { error: deleteError } = await supabase
        .from("open_positions")
        .delete()
        .eq("id", position.id)

      if (deleteError) throw deleteError

      alert("Position closed successfully!")
      fetchUsers() // Refresh user list
      if (selectedUser) fetchUserPositions(selectedUser.id)

    } catch (error) {
      console.error("Error closing position:", error)
      alert("Error closing position")
    }
  }

  // Delete a position
  const handleDeletePosition = async (position, isOpen) => {
    if (!confirm("Delete this position permanently?")) return

    try {
      const table = isOpen ? "open_positions" : "closed_positions"
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("id", position.id)

      if (error) throw error

      alert("Position deleted successfully!")
      fetchUsers() // Refresh user list
      if (selectedUser) fetchUserPositions(selectedUser.id)

    } catch (error) {
      console.error("Error deleting position:", error)
      alert("Error deleting position")
    }
  }

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Trading Positions</h1>
          <p className="text-gray-600 mt-1">
            Manage trading positions for all users
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={fetchUsers}
          >
            Refresh
          </Button>
          <Button 
            onClick={handleCreatePosition}
            disabled={!selectedUser}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Position
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Users ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>

              {/* User List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <span className="loading loading-spinner loading-sm"></span>
                    <p className="mt-2 text-gray-500">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No users found</p>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedUser?.id === user.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.full_name || "Unnamed User"}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Badge variant={user.net_pnl >= 0 ? "success" : "destructive"}>
                          {user.net_pnl >= 0 ? "+" : ""}{formatCurrency(user.net_pnl)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div>
                          <span className="text-gray-500">Balance:</span>
                          <span className="ml-1 font-medium">{formatCurrency(user.account_balance)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Win Rate:</span>
                          <span className="ml-1 font-medium">{formatPercentage(user.win_rate)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Open:</span>
                          <span className="ml-1 font-medium">{user.open_positions_count}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Closed:</span>
                          <span className="ml-1 font-medium">{user.closed_positions_count}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Selected User Details */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="space-y-6">
              {/* User Summary */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedUser.full_name || "Unnamed User"}</h2>
                      <p className="text-gray-600">{selectedUser.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit User
                      </Button>
                      <Button size="sm" onClick={handleCreatePosition}>
                        <Plus className="w-4 h-4 mr-1" />
                        New Position
                      </Button>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Account Balance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(selectedUser.account_balance)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Today's P&L</p>
                      <p className={`text-2xl font-bold ${
                        selectedUser.today_pnl >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {selectedUser.today_pnl >= 0 ? "+" : ""}{formatCurrency(selectedUser.today_pnl)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Win Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatPercentage(selectedUser.win_rate)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Total Positions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedUser.total_positions}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedUser.open_positions_count} open, {selectedUser.closed_positions_count} closed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Positions Tabs */}
              <Tabs defaultValue="open">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="open">
                    Open Positions ({userPositions.open.length})
                  </TabsTrigger>
                  <TabsTrigger value="closed">
                    Closed Positions ({userPositions.closed.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="open" className="space-y-4">
                  {userPositions.open.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-gray-500">No open positions</p>
                        <Button 
                          className="mt-4"
                          onClick={handleCreatePosition}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Position
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    userPositions.open.map((position) => (
                      <Card key={position.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={position.type === "BUY" ? "default" : "destructive"}>
                                  {position.type}
                                </Badge>
                                <span className="font-bold text-lg">{position.pair}</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Size</p>
                                  <p className="font-medium">{(position.size / 1000).toFixed(0)}K</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Open Price</p>
                                  <p className="font-medium">{position.open_price}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Current Price</p>
                                  <p className="font-medium">{position.current_price}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">P&L</p>
                                  <p className={`font-bold ${
                                    position.pnl >= 0 ? "text-green-600" : "text-red-600"
                                  }`}>
                                    {position.pnl >= 0 ? "+" : ""}${Math.abs(position.pnl).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleClosePosition(position)}
                              >
                                Close
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePosition(position, true)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="closed" className="space-y-4">
                  {userPositions.closed.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-gray-500">No closed positions</p>
                      </CardContent>
                    </Card>
                  ) : (
                    userPositions.closed.map((position) => (
                      <Card key={position.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={position.type === "BUY" ? "default" : "destructive"}>
                                  {position.type}
                                </Badge>
                                <Badge variant={position.result === "win" ? "success" : "destructive"}>
                                  {position.result}
                                </Badge>
                                <span className="font-bold text-lg">{position.pair}</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Size</p>
                                  <p className="font-medium">{(position.size / 1000).toFixed(0)}K</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Open Price</p>
                                  <p className="font-medium">{position.open_price}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Close Price</p>
                                  <p className="font-medium">{position.close_price}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">P&L</p>
                                  <p className={`font-bold ${
                                    position.pnl >= 0 ? "text-green-600" : "text-red-600"
                                  }`}>
                                    {position.pnl >= 0 ? "+" : ""}${Math.abs(position.pnl).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePosition(position, false)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a User</h3>
                <p className="text-gray-600 mb-4">
                  Choose a user from the list to view and manage their trading positions
                </p>
                <p className="text-sm text-gray-500">
                  {users.length} user(s) available
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}