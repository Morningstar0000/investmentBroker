"use client"

import React, { useState, useEffect } from "react"
import { supabase } from '../client'
import { useToast } from '../context/ToastContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import Input from "../components/ui/Input"
import { Badge } from "../components/ui/Badge"
import { Search, Filter, User, DollarSign, TrendingUp, Target, BarChart3, Edit, Save, X, RefreshCw, Mail, Activity } from "../components/ui/Icons"

export default function AdminUserMetrics() {
    const { addToast } = useToast()
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingMetrics, setEditingMetrics] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [updating, setUpdating] = useState(false)

    

    // Fetch users and their metrics
    useEffect(() => {
        fetchUserMetrics()
    }, [])

    const fetchUserMetrics = async () => {
        setLoading(true)
        try {
            // Fetch all users
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email, nationality, profile_picture_url')
                .order('created_at', { ascending: false })

            if (usersError) throw usersError

            // Fetch all user metrics
            const { data: metricsData, error: metricsError } = await supabase
                .from('user_metrics')
                .select('*')

            if (metricsError) throw metricsError

            // Combine user data with their metrics
            const combinedData = usersData.map(user => {
                const userMetric = metricsData?.find(metric => metric.user_id === user.id) || {
                    user_id: user.id,
                    account_balance: 0,
                    today_pnl_percent: 0.00,
                    equity: 0,
                    total_open_pnl: 0, // Add this
                    open_positions: 0,
                    win_rate: 0
                }
                return {
                    ...user,
                    metrics: userMetric
                }
            })

            setUsers(combinedData)
            setFilteredUsers(combinedData)
        } catch (error) {
            console.error("Error fetching user metrics:", error.message)
            addToast("Failed to load user metrics", "error")
        } finally {
            setLoading(false)
        }
    }

    // Filter users when search term changes
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users)
        } else {
            const filtered = users.filter(user =>
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredUsers(filtered)
        }
    }, [searchTerm, users])

    const handleEdit = (user) => {
        setEditingMetrics({
            userId: user.id,
            account_balance: user.metrics.account_balance || 0,
            today_pnl_percent: user.metrics.today_pnl_percent || 0.00,
             total_open_pnl: user.metrics.total_open_pnl || 0, // Add this
            equity: user.metrics.equity || 0,
            win_rate: user.metrics.win_rate || 0,
            open_positions: user.metrics.open_positions || 0,
            userName: `${user.first_name} ${user.last_name}`
        })
    }

    const handleSave = async () => {
        if (!editingMetrics) return

        setUpdating(true)
        try {
            const { error } = await supabase
                .from('user_metrics')
                .upsert({
                    user_id: editingMetrics.userId,
                    account_balance: parseFloat(editingMetrics.account_balance) || 0,
                    today_pnl_percent: parseFloat(editingMetrics.today_pnl_percent) || 0.00,
                    total_open_pnl: parseFloat(editingMetrics.total_open_pnl) || 0, // Add this
                    equity: parseFloat(editingMetrics.equity) || 0,
                    win_rate: parseFloat(editingMetrics.win_rate) || 0,
                    open_positions: parseInt(editingMetrics.open_positions) || 0
                }, {
                    onConflict: 'user_id'
                })

            if (error) throw error

            // Update local state
            setUsers(prev => prev.map(user => {
                if (user.id === editingMetrics.userId) {
                    return {
                        ...user,
                        metrics: {
                            user_id: editingMetrics.userId,
                            account_balance: parseFloat(editingMetrics.account_balance) || 0,
                            today_pnl_percent: parseFloat(editingMetrics.today_pnl_percent) || 0.00,
                            total_open_pnl: parseFloat(editingMetrics.total_open_pnl) || 0, // ADD THIS
                            equity: parseFloat(editingMetrics.equity) || 0,
                            win_rate: parseFloat(editingMetrics.win_rate) || 0,
                            open_positions: parseInt(editingMetrics.open_positions) || 0
                        }
                    }
                }
                return user
            }))

            setEditingMetrics(null)
            addToast("User metrics updated successfully", "success")
        } catch (error) {
            console.error("Error updating user metrics:", error.message)
            addToast("Failed to update user metrics", "error")
        } finally {
            setUpdating(false)
        }
    }

    const handleCancel = () => {
        setEditingMetrics(null)
    }

    const handleInputChange = (field, value) => {
        setEditingMetrics(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0)
    }

    const formatPercentage = (value) => {
        return `${parseFloat(value || 0).toFixed(2)}%`
    }

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Metrics Management</h1>
                    <p className="text-gray-600 mt-1">
                        Manage trading metrics for all users
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchUserMetrics} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    type="search"
                                    placeholder="Search users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Form Modal */}
            {/* Edit Form Modal - Add total_open_pnl field */}
{editingMetrics && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="max-w-md w-full max-h-[90vh] flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle>Edit User Metrics</CardTitle>
                <CardDescription>
                    Editing metrics for {editingMetrics.userName}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto flex-grow">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Balance ($)</label>
                    <Input
                        type="number"
                        step="0.01"
                        value={editingMetrics.account_balance}
                        onChange={(e) => handleInputChange('account_balance', e.target.value)}
                        placeholder="5000.00"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Today's P&L Percent (%)</label>
                    <Input
                        type="number"
                        step="0.01"
                        value={editingMetrics.today_pnl_percent}
                        onChange={(e) => handleInputChange('today_pnl_percent', e.target.value)}
                        placeholder="5.76"
                    />
                </div>

                {/* ADD THIS SECTION - Total Open P&L */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Total Open P&L ($)</label>
                    <Input
                        type="number"
                        step="0.01"
                        value={editingMetrics.total_open_pnl}
                        onChange={(e) => handleInputChange('total_open_pnl', e.target.value)}
                        placeholder="1500.00"
                    />
                    <p className="text-xs text-gray-500">
                        Sum of P&L from all open positions
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Equity ($)</label>
                    <Input
                        type="number"
                        step="0.01"
                        value={editingMetrics.equity}
                        onChange={(e) => handleInputChange('equity', e.target.value)}
                        placeholder="6500.00"
                    />
                    <p className="text-xs text-gray-500">
                        Auto-calculated: Account Balance + Total Open P&L
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Win Rate (%)</label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={editingMetrics.win_rate}
                        onChange={(e) => handleInputChange('win_rate', e.target.value)}
                        placeholder="0.00"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Open Positions</label>
                    <Input
                        type="number"
                        step="1"
                        value={editingMetrics.open_positions}
                        onChange={(e) => handleInputChange('open_positions', e.target.value)}
                        placeholder="0"
                    />
                </div>
            </CardContent>
            <div className="p-6 border-t flex-shrink-0">
                <div className="flex justify-end gap-2">
                    <Button onClick={handleCancel} variant="outline" disabled={updating}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={updating}>
                        {updating ? (
                            <>
                                <div className="loading loading-spinner loading-sm mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    </div>
)}

            {/* Users Metrics Table */}
         {/* Users Metrics Table - Add Total Open P&L column */}
<Card>
    <CardHeader>
        <CardTitle>User Trading Metrics</CardTitle>
        <CardDescription>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
        </CardDescription>
    </CardHeader>
    <CardContent>
        {loading ? (
            <div className="text-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
                <p className="mt-4 text-gray-500">Loading user metrics...</p>
            </div>
        ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
                <p className="text-gray-500">No users found</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-3 px-4">User</th>
                            <th className="text-left py-3 px-4">Account Balance</th>
                            <th className="text-left py-3 px-4">Today's P&L %</th>
                            <th className="text-left py-3 px-4">Total Open P&L</th> {/* ADD THIS */}
                            <th className="text-left py-3 px-4">Equity</th>
                            <th className="text-left py-3 px-4">Win Rate</th>
                            <th className="text-left py-3 px-4">Open Positions</th>
                            <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            {user.profile_picture_url ? (
                                                <img
                                                    src={user.profile_picture_url}
                                                    alt={user.first_name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {user.first_name} {user.last_name}
                                            </p>
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Mail className="w-3 h-3" />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-green-600" />
                                        <span className="font-medium">{formatCurrency(user.metrics.account_balance)}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className={`flex items-center gap-2 ${(user.metrics.today_pnl_percent || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="font-medium">{formatPercentage(user.metrics.today_pnl_percent)}</span>
                                    </div>
                                </td>
                                {/* ADD THIS - Total Open P&L Cell */}
                                <td className="py-3 px-4">
                                    <div className={`flex items-center gap-2 ${(user.metrics.total_open_pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="font-medium">{formatCurrency(user.metrics.total_open_pnl)}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-blue-600" />
                                        <span className="font-medium">{formatCurrency(user.metrics.equity)}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-purple-600" />
                                        <span className="font-medium">{formatPercentage(user.metrics.win_rate)}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <Badge variant="outline" className="font-medium">
                                        {user.metrics.open_positions || 0}
                                    </Badge>
                                </td>
                                <td className="py-3 px-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleEdit(user)}
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </CardContent>
</Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Balance</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(users.reduce((sum, user) => sum + (parseFloat(user.metrics.account_balance) || 0), 0))}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Avg P&L %</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatPercentage(users.reduce((sum, user) => sum + (parseFloat(user.metrics.today_pnl_percent) || 0), 0) / Math.max(users.length, 1))}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Equity</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {formatCurrency(users.reduce((sum, user) => sum + (parseFloat(user.metrics.equity) || 0), 0))}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Avg Win Rate</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {formatPercentage(users.reduce((sum, user) => sum + (parseFloat(user.metrics.win_rate) || 0), 0) / Math.max(users.length, 1))}
                                </p>
                            </div>
                            <Target className="w-8 h-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Open Positions</p>
                                <p className="text-2xl font-bold text-teal-600">
                                    {users.reduce((sum, user) => sum + (parseInt(user.metrics.open_positions) || 0), 0)}
                                </p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-teal-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}