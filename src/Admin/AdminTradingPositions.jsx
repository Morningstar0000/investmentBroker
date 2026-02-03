"use client"

import React, { useState, useEffect } from "react"
import { Button } from "../components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Badge } from "../components/ui/Badge"
import { Search, Filter, Plus, Edit, Trash2, Users, DollarSign, TrendingUp, Activity, CreditCard, X } from "../components/ui/Icons"
import { supabase } from "../client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import Dialog from "../components/ui/Dialog"
import Input from "../components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select"
import { updateUserMetrics } from '../utils/userMetrics'

export default function AdminTradingPositions({ user, onNavigate, supabase: supabaseClient }) {
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [userPositions, setUserPositions] = useState({
        open: [],
        closed: []
    })
    const [tradingSummary, setTradingSummary] = useState({
        total_open_pnl: 0,
        total_closed_pnl: 0,
        today_pnl: 0,
        total_commission: 0
    })
    const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [positionToClose, setPositionToClose] = useState(null)
    const [positionsSaving, setPositionsSaving] = useState(false)

    // New position form state
    const [newPosition, setNewPosition] = useState({
        pair: "EUR/USD",
        type: "BUY",
        size: 1, // in thousands
        open_price: "",
        current_price: "",
        stop_loss: "",
        take_profit: "",
        swap: 0,
        commission: 0,
        pnl: 0,
        pnl_percent: 0
    })

    // Currency pairs
    const currencyPairs = [
        "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF",
        "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP",
        "EUR/JPY", "GBP/JPY", "AUD/JPY", "EUR/CHF",
        "GBP/CHF", "USD/CNH", "USD/HKD", "USD/SGD"
    ]

    // Use the passed supabase client or import directly
    const supabase = supabaseClient || supabase;

    // Format number function
    const formatNumber = (num) => {
        return (num || 0).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).replace(/\.00$/, '')
    }

    // Format duration for open positions
    const formatDurationForOpenPositions = (openTime) => {
        if (!openTime) return "N/A"
        try {
            const now = new Date()
            const open = new Date(openTime)
            const diff = now - open
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            return `${hours}h ${minutes}m`
        } catch (error) {
            return "N/A"
        }
    }

    // Calculate trading summary
    const calculateTradingSummary = (openPositions, closedPositions) => {
        const totalOpenPnl = openPositions.reduce((sum, pos) => sum + (pos.pnl || 0), 0)
        const totalClosedPnl = closedPositions.reduce((sum, pos) => sum + (pos.pnl || 0), 0)

        // Today's P&L - only positions closed TODAY
        const today = new Date().toISOString().split('T')[0]
        const todayPnl = closedPositions
            .filter(pos => {
                if (!pos.close_time) return false
                const closeDate = pos.close_time.split('T')[0]
                return closeDate === today
            })
            .reduce((sum, pos) => sum + (pos.pnl || 0), 0)

        // Calculate total commission
        const openCommission = openPositions.reduce((sum, pos) => sum + (pos.commission || 0), 0)
        const closedCommission = closedPositions.reduce((sum, pos) => sum + (pos.commission || 0), 0)
        const totalCommission = openCommission + closedCommission

        return {
            total_open_pnl: totalOpenPnl,
            total_closed_pnl: totalClosedPnl,
            today_pnl: todayPnl,
            total_commission: totalCommission
        }
    }

    const fetchUsers = async () => {
        setLoading(true)
        try {
            console.log("Fetching users...")

            // Fetch ALL users from profiles
            const { data: allProfiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, email, first_name, last_name')
                .order('created_at', { ascending: false })

            if (profilesError) throw profilesError

            console.log("Found profiles:", allProfiles?.length || 0)

            // Fetch ALL user metrics
            const { data: allMetrics, error: metricsError } = await supabase
                .from("user_metrics")
                .select("*")

            if (metricsError && metricsError.code !== 'PGRST116') {
                console.error("Error fetching user metrics:", metricsError)
            }

            // Create a map of user_id -> metrics for easy lookup
            const metricsMap = new Map()
            allMetrics?.forEach(metric => {
                metricsMap.set(metric.user_id, metric)
            })

            // Combine profile data with metrics
            const usersWithData = await Promise.all(
                (allProfiles || []).map(async (profile) => {
                    const userId = profile.id
                    const userMetric = metricsMap.get(userId) || {
                        user_id: userId,
                        account_balance: 0,
                        total_open_pnl: 0,
                        equity: 0,
                        today_pnl_percent: 0.00,
                        win_rate: 0,
                        open_positions: 0
                    }

                    // Fetch positions for this user
                    const [openRes, closedRes] = await Promise.all([
                        supabase.from("open_positions").select("*").eq("user_id", userId),
                        supabase.from("closed_positions").select("*").eq("user_id", userId)
                    ])

                    const openPositions = openRes.data || []
                    const closedPositions = closedRes.data || []

                    const summary = calculateTradingSummary(openPositions, closedPositions)

                    return {
                        id: userId,
                        email: profile.email || `user_${String(userId).slice(0, 8)}@example.com`,
                        full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || `User ${String(userId).slice(0, 8)}`,
                        account_balance: userMetric.account_balance || 0,
                        today_pnl: summary.today_pnl || 0,
                        win_rate: userMetric.win_rate || 0,
                        open_positions_count: openPositions.length,
                        closed_positions_count: closedPositions.length,
                        total_positions: openPositions.length + closedPositions.length,
                        total_open_pnl: summary.total_open_pnl,
                        total_closed_pnl: summary.total_closed_pnl,
                        // today_pnl: summary.today_pnl,
                        total_commission: summary.total_commission,
                        net_pnl: summary.total_open_pnl + summary.total_closed_pnl,
                        created_at: profile.created_at || new Date().toISOString()
                    }
                })
            )

            setUsers(usersWithData)
            console.log("Total users loaded:", usersWithData.length)

            // Auto-select first user if none selected
            if (!selectedUser && usersWithData.length > 0) {
                handleUserSelect(usersWithData[0])
            }

        } catch (error) {
            console.error("Error fetching users:", error)
        } finally {
            setLoading(false)
        }
    }

    // Fallback: Extract users from positions tables
    const fetchUsersFromPositions = async () => {
        try {
            console.log("Fetching users from positions tables...")

            // Get unique user_ids from both tables
            const [openRes, closedRes] = await Promise.all([
                supabase.from("open_positions").select("user_id, pair, pnl, commission"),
                supabase.from("closed_positions").select("user_id, pair, pnl, commission, close_time")
            ])

            const openData = openRes.data || []
            const closedData = closedRes.data || []

            // Combine and get unique user IDs
            const allUserIds = new Set()
            openData.forEach(pos => pos.user_id && allUserIds.add(pos.user_id))
            closedData.forEach(pos => pos.user_id && allUserIds.add(pos.user_id))

            console.log("Found user IDs:", Array.from(allUserIds))

            if (allUserIds.size === 0) {
                setUsers([])
                return
            }

            const usersWithData = []

            for (const userId of Array.from(allUserIds)) {
                // Get positions for this user
                const userOpenPositions = openData.filter(pos => pos.user_id === userId)
                const userClosedPositions = closedData.filter(pos => pos.user_id === userId)

                const summary = calculateTradingSummary(userOpenPositions, userClosedPositions)

                usersWithData.push({
                    id: userId,
                    email: `user_${userId.slice(0, 8)}@example.com`,
                    full_name: `User ${userId.slice(0, 8)}`,
                    account_balance: 0,
                    today_pnl: summary.today_pnl,
                    win_rate: 0,
                    open_positions_count: userOpenPositions.length,
                    closed_positions_count: userClosedPositions.length,
                    total_positions: userOpenPositions.length + userClosedPositions.length,
                    total_open_pnl: summary.total_open_pnl,
                    total_closed_pnl: summary.total_closed_pnl,
                    // today_pnl: summary.today_pnl,
                    total_commission: summary.total_commission,
                    net_pnl: summary.total_open_pnl + summary.total_closed_pnl,
                    created_at: new Date().toISOString()
                })
            }

            setUsers(usersWithData)

            if (!selectedUser && usersWithData.length > 0) {
                handleUserSelect(usersWithData[0])
            }

        } catch (error) {
            console.error("Error fetching users from positions:", error)
            setUsers([])
        }
    }

    // Fetch positions for selected user
    const fetchUserPositions = async (userId) => {
        try {
            console.log("Fetching positions for user:", userId)

            const [openRes, closedRes] = await Promise.all([
                supabase.from("open_positions").select("*").eq("user_id", userId),
                supabase.from("closed_positions").select("*").eq("user_id", userId)
            ])

            const openPositions = openRes.data || []
            const closedPositions = closedRes.data || []

            setUserPositions({
                open: openPositions,
                closed: closedPositions
            })

            // Update trading summary
            setTradingSummary(calculateTradingSummary(openPositions, closedPositions))

            console.log("User positions loaded:", {
                open: openPositions.length,
                closed: closedPositions.length
            })

        } catch (error) {
            console.error("Error fetching user positions:", error)
        }
    }

    // Handle user selection
    const handleUserSelect = async (user) => {
        console.log("Selected user:", user.email)
        setSelectedUser(user)
        await fetchUserPositions(user.id)
    }

    // Initial fetch
    useEffect(() => {
        fetchUsers()
    }, [])

    // Dialog handlers for closing position
    const handleCloseButtonClick = (position) => {
        setPositionToClose(position)
        setIsCloseDialogOpen(true)
    }

    const handleConfirmClose = async () => {
        if (!positionToClose || !selectedUser) return

        setPositionsSaving(true)
        try {
            const closeTime = new Date().toISOString()

            // Calculate duration
            const open = new Date(positionToClose.open_time)
            const close = new Date(closeTime)
            const diff = close - open
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const duration = `${hours}h ${minutes}m`

            // Create closed position
            const closedPosition = {
                user_id: selectedUser.id,
                pair: positionToClose.pair,
                type: positionToClose.type,
                size: positionToClose.size,
                swap: positionToClose.swap || 0,
                open_price: positionToClose.open_price,
                close_price: positionToClose.current_price || positionToClose.open_price,
                pnl: positionToClose.pnl || 0,
                pnl_percent: positionToClose.pnl_percent || 0,
                open_time: positionToClose.open_time,
                close_time: closeTime,
                result: (positionToClose.pnl || 0) >= 0 ? "win" : "loss",
                duration: duration,
                stop_loss: positionToClose.stop_loss,
                take_profit: positionToClose.take_profit,
                commission: positionToClose.commission || 0,
            }

            console.log("Closing position:", closedPosition)

            console.log("🎯 handleConfirmClose - Calling updateUserMetrics...")
            const result = await updateUserMetrics(selectedUser.id)
            console.log("✅ updateUserMetrics result:", result)

            // Insert into closed_positions
            const { error: insertError } = await supabase
                .from("closed_positions")
                .insert([closedPosition])

            if (insertError) throw insertError

            // Delete from open_positions
            const { error: deleteError } = await supabase
                .from("open_positions")
                .delete()
                .eq("id", positionToClose.id)

            if (deleteError) throw deleteError

            // Refresh data
            await fetchUserPositions(selectedUser.id)
            await fetchUsers()

            // Update account balance with closed P&L
            const currentBalance = selectedUser.account_balance || 0
            const newBalance = currentBalance + positionToClose.pnl

            // / Update user metrics with new balance
            const { error: balanceError } = await supabase
                .from("user_metrics")
                .update({
                    account_balance: newBalance,

                })
                .eq("user_id", selectedUser.id)

            if (balanceError) console.error("Error updating balance:", balanceError)

            await updateUserMetrics(selectedUser.id) // ADD THIS LINE

            alert("✅ Position closed successfully!")

        } catch (error) {
            console.error("Error closing position:", error)
            alert(`❌ Error closing position: ${error.message}`)
        } finally {
            setPositionsSaving(false)
            setIsCloseDialogOpen(false)
            setPositionToClose(null)
        }
    }

    const handleCancelClose = () => {
        setIsCloseDialogOpen(false)
        setPositionToClose(null)
    }

    // Handle new position form changes
    const handleNewPositionChange = (field, value) => {
        setNewPosition(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Reset new position form
    const resetNewPositionForm = () => {
        setNewPosition({
            pair: "EUR/USD",
            type: "BUY",
            size: 1,
            open_price: "",
            current_price: "",
            stop_loss: "",
            take_profit: "",
            swap: 0,
            commission: 0,
            pnl: 0,
            pnl_percent: 0
        })
    }

    // Create position for selected user
    const handleCreatePosition = async () => {
        if (!selectedUser) {
            alert("Please select a user first")
            return
        }

        console.log("🎯 handleCreatePosition - Calling updateUserMetrics...")
        const result = await updateUserMetrics(selectedUser.id)
        console.log("✅ updateUserMetrics result:", result)

        // Validate form
        if (!newPosition.open_price) {
            alert("Please enter an open price")
            return
        }

        if (!newPosition.size || newPosition.size <= 0) {
            alert("Please enter a valid size")
            return
        }

        try {
            const positionData = {
                user_id: selectedUser.id,
                pair: newPosition.pair,
                type: newPosition.type,
                size: parseFloat(newPosition.size) * 1000, // Convert to actual size
                open_price: parseFloat(newPosition.open_price),
                current_price: parseFloat(newPosition.current_price || newPosition.open_price),
                pnl: parseFloat(newPosition.pnl || 0),
                pnl_percent: parseFloat(newPosition.pnl_percent || 0),
                swap: parseFloat(newPosition.swap || 0),
                commission: parseFloat(newPosition.commission || 0),
                open_time: new Date().toISOString(),
                // Optional fields
                stop_loss: newPosition.stop_loss ? parseFloat(newPosition.stop_loss) : null,
                take_profit: newPosition.take_profit ? parseFloat(newPosition.take_profit) : null
            }

            console.log("Creating position:", positionData)

            const { error } = await supabase
                .from("open_positions")
                .insert([positionData])

            if (error) {
                console.error("Supabase error:", error)
                throw error
            }

            alert("✅ Position created successfully!")

            // Refresh data
            await fetchUserPositions(selectedUser.id)
            await fetchUsers()

            // Update user metrics
            await updateUserMetrics(selectedUser.id) // ADD THIS LINE

            // Reset form and close modal
            resetNewPositionForm()
            setIsCreateDialogOpen(false)

        } catch (error) {
            console.error("Error creating position:", error)
            alert(`❌ Error creating position: ${error.message || "Unknown error"}`)
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

            alert("✅ Position deleted successfully!")

            // Refresh data
            await fetchUserPositions(selectedUser.id)
            await fetchUsers()

            await updateUserMetrics(selectedUser.id) // ADD THIS LINE

        } catch (error) {
            console.error("Error deleting position:", error)
            alert(`❌ Error deleting position: ${error.message}`)
        }
    }

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )

    // Filter positions based on search
    const filteredOpenPositions = userPositions.open.filter(pos =>
        (pos.pair?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )

    const filteredClosedPositions = userPositions.closed.filter(pos =>
        (pos.pair?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )

    // Add these new state variables at the top with other useState declarations:
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [positionToEdit, setPositionToEdit] = useState(null)
    const [editFormData, setEditFormData] = useState({
        pair: "",
        type: "BUY",
        size: 0,
        open_price: "",
        current_price: "",
        stop_loss: "",
        take_profit: "",
        pnl: 0,
        pnl_percent: 0,
        swap: 0,
        commission: 0
    })

    // Add this function to handle opening the edit dialog
    const handleEditButtonClick = (position) => {
        setPositionToEdit(position)
        setEditFormData({
            pair: position.pair || "",
            type: position.type || "BUY",
            size: position.size ? position.size / 1000 : 0, // Convert to thousands
            open_price: position.open_price || "",
            current_price: position.current_price || position.open_price || "",
            stop_loss: position.stop_loss || "",
            take_profit: position.take_profit || "",
            pnl: position.pnl || 0,
            pnl_percent: position.pnl_percent || 0,
            swap: position.swap || 0,
            commission: position.commission || 0
        })
        setIsEditDialogOpen(true)
    }

    // Add this function to handle edit form changes
    const handleEditFormChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }


    // Replace the handleSaveEdit function with this:
    const handleSaveEdit = async () => {
        if (!positionToEdit || !selectedUser) return

        setPositionsSaving(true)
        try {
            const updatedPosition = {
                pair: editFormData.pair,
                type: editFormData.type,
                size: parseFloat(editFormData.size) * 1000, // Convert back from thousands
                open_price: parseFloat(editFormData.open_price),
                current_price: parseFloat(editFormData.current_price || editFormData.open_price),
                stop_loss: editFormData.stop_loss ? parseFloat(editFormData.stop_loss) : null,
                take_profit: editFormData.take_profit ? parseFloat(editFormData.take_profit) : null,
                pnl: parseFloat(editFormData.pnl || 0),
                pnl_percent: parseFloat(editFormData.pnl_percent || 0),
                swap: parseFloat(editFormData.swap || 0),
                commission: parseFloat(editFormData.commission || 0),
                // Keep original open_time - DO NOT CHANGE
                open_time: positionToEdit.open_time,
                // REMOVE this line: updated_at: new Date().toISOString()
            }

            console.log("Updating position:", positionToEdit.id, updatedPosition)

            console.log("🎯 handleSaveEdit - Calling updateUserMetrics...")
            const result = await updateUserMetrics(selectedUser.id)
            console.log("✅ updateUserMetrics result:", result)

            const { error } = await supabase
                .from("open_positions")
                .update(updatedPosition)
                .eq("id", positionToEdit.id)

            if (error) throw error

            alert("✅ Position updated successfully!")

            // Refresh data
            await fetchUserPositions(selectedUser.id)
            await fetchUsers()

            await updateUserMetrics(selectedUser.id) // ADD THIS LINE

            // Close edit dialog
            setIsEditDialogOpen(false)
            setPositionToEdit(null)

        } catch (error) {
            console.error("Error updating position:", error)
            alert(`❌ Error updating position: ${error.message}`)
        } finally {
            setPositionsSaving(false)
        }
    }

    // Add this function
    const testImport = () => {
        console.log("🔍 Testing updateUserMetrics import...")
        console.log("Type of updateUserMetrics:", typeof updateUserMetrics)
        console.log("Function:", updateUserMetrics)

        if (typeof updateUserMetrics === 'function') {
            alert("✅ Function imported successfully!")
        } else {
            alert("❌ Function NOT imported! Check the import path.")
        }
    }

    // Add this function to AdminTradingPositions.jsx temporarily
    const createMissingUserMetrics = async () => {
        try {
            console.log("🔧 Creating missing user_metrics entries...")

            // Get all profiles
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id')

            if (!profiles?.length) {
                console.log("No profiles found")
                return
            }

            console.log(`Found ${profiles.length} profiles`)

            // Get existing user_metrics
            const { data: existingMetrics } = await supabase
                .from('user_metrics')
                .select('user_id')

            const existingUserIds = new Set(existingMetrics?.map(m => m.user_id) || [])

            // Find missing users
            const missingUsers = profiles.filter(profile => !existingUserIds.has(profile.id))

            console.log(`Found ${missingUsers.length} users missing user_metrics`)

            if (missingUsers.length === 0) {
                console.log("✅ All users have user_metrics entries")
                return
            }

            // Create default entries for missing users
            const defaultMetrics = missingUsers.map(user => ({
                user_id: user.id,
                account_balance: 0,
                total_open_pnl: 0,
                equity: 0,
                today_pnl_percent: 0.00,
                win_rate: 0,
                open_positions: 0,
            }))

            const { error } = await supabase
                .from('user_metrics')
                .insert(defaultMetrics)

            if (error) throw error

            console.log(`✅ Created ${missingUsers.length} user_metrics entries`)

            // Refresh users list
            await fetchUsers()

            alert(`Created ${missingUsers.length} missing user_metrics entries`)

        } catch (error) {
            console.error("Error creating missing user_metrics:", error)
            alert(`Error: ${error.message}`)
        }
    }

    const fixDataConsistency = async () => {
        if (!selectedUser) {
            alert("Please select a user first")
            return
        }

        try {
            console.log("🔧 Fixing data consistency for user:", selectedUser.email)

            // 1. Check database vs frontend state
            const { data: dbOpenPositions } = await supabase
                .from('open_positions')
                .select('*')
                .eq('user_id', selectedUser.id)

            const { data: dbClosedPositions } = await supabase
                .from('closed_positions')
                .select('*')
                .eq('user_id', selectedUser.id)

            console.log("📊 Database state:")
            console.log("   Open positions in DB:", dbOpenPositions?.length || 0)
            console.log("   Closed positions in DB:", dbClosedPositions?.length || 0)

            // 2. Check user_metrics
            const { data: userMetrics } = await supabase
                .from('user_metrics')
                .select('*')
                .eq('user_id', selectedUser.id)
                .single()

            console.log("📈 User metrics in DB:", userMetrics)

            // 3. Identify the orphaned position (closed in frontend but not in DB)
            // Look for positions that should be closed but aren't
            // This is tricky without transaction logs, so we'll do a manual check

            alert(`Current State:
    Open positions in DB: ${dbOpenPositions?.length || 0}
    Open positions in metrics: ${userMetrics?.open_positions || 0}
    Account balance: $${userMetrics?.account_balance || 0}
    
    What would you like to do?
    1. Force sync metrics from current DB state
    2. Check for specific orphaned positions
    `)

            // 4. Force sync metrics from current database state
            console.log("🔄 Force syncing metrics from current DB state...")
            const syncResult = await updateUserMetrics(selectedUser.id)

            if (syncResult.success) {
                console.log("✅ Force sync successful:", syncResult)

                // 5. Refresh all data
                await fetchUserPositions(selectedUser.id)
                await fetchUsers()

                // 6. Check final state
                const { data: finalMetrics } = await supabase
                    .from('user_metrics')
                    .select('*')
                    .eq('user_id', selectedUser.id)
                    .single()

                alert(`✅ Data consistency fixed!
      
      Before fix:
      - Open positions: ${userMetrics?.open_positions || 0}
      - Account balance: $${userMetrics?.account_balance || 0}
      - Equity: $${userMetrics?.equity || 0}
      
      After fix:
      - Open positions: ${finalMetrics?.open_positions || 0}
      - Account balance: $${finalMetrics?.account_balance || 0}
      - Equity: $${finalMetrics?.equity || 0}
      
      Open positions in database: ${dbOpenPositions?.length || 0}
      `)
            } else {
                throw new Error(`Sync failed: ${syncResult.error}`)
            }

        } catch (error) {
            console.error("❌ Error fixing data consistency:", error)
            alert(`Error: ${error.message}`)
        }
    }







    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Trading Positions</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage and monitor trading positions for users
                    </p>
                    {selectedUser && (
                        <p className="text-sm text-gray-500 mt-1">
                            Managing positions for: <span className="font-semibold">{selectedUser.full_name}</span> ({selectedUser.email})
                        </p>
                    )}
                </div>

                <Button onClick={fixDataConsistency} variant="outline" className="ml-2" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b' }}>
                    🔧 Fix Data Consistency
                </Button>

                <Button onClick={createMissingUserMetrics} variant="outline" className="ml-2">
                    🔧 Fix Missing Metrics
                </Button>

                <Button onClick={testImport} variant="outline" className="mt-2">
                    Test Import
                </Button>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={fetchUsers}
                    >
                        Refresh
                    </Button>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        disabled={!selectedUser}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Trade
                    </Button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
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
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No users found</p>
                                        <Button
                                            className="mt-2"
                                            size="sm"
                                            onClick={fetchUsers}
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedUser?.id === user.id
                                                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600'
                                                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                            onClick={() => handleUserSelect(user)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{user.full_name}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                                </div>
                                                <Badge variant={user.net_pnl >= 0 ? "success" : "destructive"}>
                                                    {user.net_pnl >= 0 ? "+" : ""}${formatNumber(Math.abs(user.net_pnl))}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Open:</span>
                                                    <span className="ml-1 font-medium">{user.open_positions_count}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Closed:</span>
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

                {/* Right Column - Trading Section */}
                <div className="lg:col-span-3">
                    {selectedUser ? (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Today's P&L */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
                                        <DollarSign className="h-6 w-6 text-gray-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${tradingSummary.today_pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                                            {tradingSummary.today_pnl >= 0 ? "+" : ""}${formatNumber(tradingSummary.today_pnl)}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total for the day P&L</p>
                                    </CardContent>
                                </Card>

                                {/* Open P&L */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Open P&L</CardTitle>
                                        <TrendingUp className="h-6 w-6 text-gray-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${tradingSummary.total_open_pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                                            {tradingSummary.total_open_pnl >= 0 ? "+" : ""}${formatNumber(tradingSummary.total_open_pnl)}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Unrealized P&L</p>
                                    </CardContent>
                                </Card>

                                {/* Closed P&L */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Closed P&L</CardTitle>
                                        <DollarSign className="h-6 w-6 text-gray-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${tradingSummary.total_closed_pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                                            {tradingSummary.total_closed_pnl >= 0 ? "+" : ""}${formatNumber(tradingSummary.total_closed_pnl)}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Realized P&L</p>
                                    </CardContent>
                                </Card>

                                {/* Total Commission */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                                        <CreditCard className="h-6 w-6 text-gray-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-600">
                                            -${formatNumber(tradingSummary.total_commission)}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total fees paid</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Positions Tabs */}
                            <Tabs defaultValue="open" className="space-y-6">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="open">Open Positions ({userPositions.open.length})</TabsTrigger>
                                    <TabsTrigger value="closed">Closed Positions ({userPositions.closed.length})</TabsTrigger>
                                </TabsList>

                                <TabsContent value="open" className="space-y-6">
                                    {/* Search and Filter */}
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <input
                                                        placeholder="Search positions..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                                    />
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    <Filter className="w-4 h-4 mr-2" />
                                                    Filter
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Open Positions List */}
                                    <div className="space-y-4">
                                        {filteredOpenPositions.length === 0 ? (
                                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No open positions found.</p>
                                        ) : (
                                            filteredOpenPositions.map((position) => (
                                                <Card key={position.id}>
                                                    <CardContent className="pt-6">
                                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <Badge variant={position.type === "BUY" ? "default" : "destructive"}>{position.type}</Badge>
                                                                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{position.pair}</span>
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Size: {(position.size / 1000).toFixed(0)}K
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 lg:grid-cols-8 gap-4 text-sm flex-1">
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Open Price</p>
                                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{position.open_price}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Current Price</p>
                                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{position.current_price}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Stop Loss</p>
                                                                    <p className="font-medium text-red-600 dark:text-red-400">{position.stop_loss || "N/A"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Take Profit</p>
                                                                    <p className="font-medium text-green-600 dark:text-green-400">{position.take_profit || "N/A"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">P&L</p>
                                                                    <p className={`font-bold ${position.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                                        {position.pnl >= 0 ? `+` : `-`}${Math.abs(position.pnl || 0).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">P&L %</p>
                                                                    <p className={`font-bold ${position.pnl_percent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                                        {position.pnl_percent >= 0 ? "+" : ""}
                                                                        {(position.pnl_percent || 0).toFixed(2)}%
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Duration</p>
                                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                        {formatDurationForOpenPositions(position.open_time)}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Swap</p>
                                                                    <p className={`font-medium ${position.swap >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                                        {position.swap >= 0 ? `+` : `-`}${Math.abs(position.swap || 0).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2 lg:ml-auto">
                                                                {/* Edit Button - ADD THIS */}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleEditButtonClick(position)}
                                                                    disabled={positionsSaving}
                                                                >
                                                                    <Edit className="w-4 h-4 mr-1" />
                                                                    Edit
                                                                </Button>

                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleCloseButtonClick(position)}
                                                                    disabled={positionsSaving}
                                                                >
                                                                    {positionsSaving ? (
                                                                        <span className="loading loading-spinner"></span>
                                                                    ) : (
                                                                        <>
                                                                            <X className="w-4 h-4 mr-1" />
                                                                            Close
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="closed" className="space-y-6">
                                    {/* Closed Positions List */}
                                    <div className="space-y-4">
                                        {filteredClosedPositions.length === 0 ? (
                                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No closed positions found.</p>
                                        ) : (
                                            filteredClosedPositions.map((position) => (
                                                <Card key={position.id}>
                                                    <CardContent className="pt-6">
                                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <Badge variant={position.type === "BUY" ? "default" : "destructive"}>{position.type}</Badge>
                                                                    <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{position.pair}</span>
                                                                    <Badge variant={position.result === "win" ? "success" : "destructive"}>
                                                                        {position.result || "closed"}
                                                                    </Badge>
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Size: {(position.size / 1000).toFixed(0)}K
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 lg:grid-cols-9 gap-4 text-sm flex-1">
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Open Price</p>
                                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{position.open_price}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Close Price</p>
                                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{position.close_price}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">P&L</p>
                                                                    <p className={`font-bold ${position.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                                        {position.pnl >= 0 ? `+` : `-`}${Math.abs(position.pnl || 0).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">P&L %</p>
                                                                    <p className={`font-bold ${position.pnl_percent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                                        {position.pnl_percent >= 0 ? "+" : ""}
                                                                        {(position.pnl_percent || 0).toFixed(2)}%
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Stop Loss</p>
                                                                    <p className="font-medium text-red-600 dark:text-red-400">{position.stop_loss || "N/A"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Take Profit</p>
                                                                    <p className="font-medium text-green-600 dark:text-green-400">
                                                                        {position.take_profit || "N/A"}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Duration</p>
                                                                    <p className="font-medium text-gray-900 dark:text-gray-100">{position.duration || "N/A"}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Swap</p>
                                                                    <p className={`font-medium ${position.swap >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                                        {position.swap >= 0 ? `+` : `-`}${Math.abs(position.swap || 0).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500 dark:text-gray-400">Commission</p>
                                                                    <p className="font-medium text-red-600 dark:text-red-400">
                                                                        -${(position.commission || 0).toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                                                                <p>Closed: {position.close_time ? new Date(position.close_time).toLocaleDateString() : "N/A"}</p>
                                                                <p>{position.close_time ? new Date(position.close_time).toLocaleTimeString() : ""}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    {loading ? "Loading users..." : "Select a User"}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {loading
                                        ? "Fetching user data from database..."
                                        : "Choose a user from the list to manage their trading positions"
                                    }
                                </p>
                                {!loading && (
                                    <>
                                        <p className="text-sm text-gray-500 mb-2">
                                            Found {users.length} user(s) in database
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={fetchUsers}
                                            className="mt-2"
                                        >
                                            Refresh User List
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Dialog for closing position */}
            <Dialog
                isOpen={isCloseDialogOpen}
                onClose={handleCancelClose}
                title="Confirm Close Position"
            >
                {positionToClose && (
                    <div className="py-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Are you sure you want to close the position on{" "}
                            <span className="font-semibold">{positionToClose.pair}</span>?
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                            Current P&L:{" "}
                            <span className={`font-semibold ${positionToClose.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {positionToClose.pnl >= 0 ? `+` : `-`}${formatNumber(Math.abs(positionToClose.pnl))}
                            </span>
                        </p>
                    </div>
                )}
                <div className="flex justify-end space-x-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={handleCancelClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirmClose}
                        disabled={positionsSaving}
                    >
                        {positionsSaving ? "Closing..." : "Close Position"}
                    </Button>
                </div>
            </Dialog>

            {/* Dialog for creating new position */}
            <Dialog
                isOpen={isCreateDialogOpen}
                onClose={() => {
                    setIsCreateDialogOpen(false)
                    resetNewPositionForm()
                }}
                title="Create New Position"
                size="lg"
                scrollable={true}
            >
                <div className="py-4">
                    {!selectedUser ? (
                        <p className="text-red-600">Please select a user first</p>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Creating position for: <span className="font-semibold">{selectedUser.full_name}</span>
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Currency Pair */}
                                <div className="space-y-2">
                                    <label htmlFor="pair">Currency Pair</label>
                                    <Select
                                        value={newPosition.pair}
                                        onValueChange={(value) => handleNewPositionChange("pair", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select pair" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencyPairs.map(pair => (
                                                <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Position Type */}
                                <div className="space-y-2">
                                    <label htmlFor="type">Position Type</label>
                                    <Select
                                        value={newPosition.type}
                                        onValueChange={(value) => handleNewPositionChange("type", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BUY" className="text-green-600">BUY</SelectItem>
                                            <SelectItem value="SELL" className="text-red-600">SELL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Size */}
                                <div className="space-y-2">
                                    <label htmlFor="size">Size (in thousands)</label>
                                    <div className="relative">
                                        <Input
                                            id="size"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={newPosition.size}
                                            onChange={(e) => handleNewPositionChange("size", e.target.value)}
                                            className="pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">K</span>
                                    </div>
                                </div>

                                {/* Open Price */}
                                <div className="space-y-2">
                                    <label htmlFor="open_price">Open Price *</label>
                                    <Input
                                        id="open_price"
                                        type="number"
                                        step="0.00001"
                                        value={newPosition.open_price}
                                        onChange={(e) => handleNewPositionChange("open_price", e.target.value)}
                                        required
                                        placeholder="e.g., 1.08500"
                                    />
                                </div>

                                {/* Current Price */}
                                <div className="space-y-2">
                                    <label htmlFor="current_price">Current Price</label>
                                    <Input
                                        id="current_price"
                                        type="number"
                                        step="0.00001"
                                        value={newPosition.current_price}
                                        onChange={(e) => handleNewPositionChange("current_price", e.target.value)}
                                        placeholder="Leave empty to use open price"
                                    />
                                </div>

                                {/* Stop Loss */}
                                <div className="space-y-2">
                                    <label htmlFor="stop_loss">Stop Loss (Optional)</label>
                                    <Input
                                        id="stop_loss"
                                        type="number"
                                        step="0.00001"
                                        value={newPosition.stop_loss}
                                        onChange={(e) => handleNewPositionChange("stop_loss", e.target.value)}
                                        placeholder="Optional"
                                    />
                                </div>

                                {/* Take Profit */}
                                <div className="space-y-2">
                                    <label htmlFor="take_profit">Take Profit (Optional)</label>
                                    <Input
                                        id="take_profit"
                                        type="number"
                                        step="0.00001"
                                        value={newPosition.take_profit}
                                        onChange={(e) => handleNewPositionChange("take_profit", e.target.value)}
                                        placeholder="Optional"
                                    />
                                </div>

                                {/* Swap */}
                                <div className="space-y-2">
                                    <label htmlFor="swap">Swap</label>
                                    <Input
                                        id="swap"
                                        type="number"
                                        step="0.01"
                                        value={newPosition.swap}
                                        onChange={(e) => handleNewPositionChange("swap", e.target.value)}
                                    />
                                </div>

                                {/* Commission */}
                                <div className="space-y-2">
                                    <label htmlFor="commission">Commission</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                        <Input
                                            id="commission"
                                            type="number"
                                            step="0.01"
                                            value={newPosition.commission}
                                            onChange={(e) => handleNewPositionChange("commission", e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* P&L Fields (Optional) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="pnl">Initial P&L (Optional)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                        <Input
                                            id="pnl"
                                            type="number"
                                            step="0.01"
                                            value={newPosition.pnl}
                                            onChange={(e) => handleNewPositionChange("pnl", e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="pnl_percent">P&L % (Optional)</label>
                                    <div className="relative">
                                        <Input
                                            id="pnl_percent"
                                            type="number"
                                            step="0.01"
                                            value={newPosition.pnl_percent}
                                            onChange={(e) => handleNewPositionChange("pnl_percent", e.target.value)}
                                            className="pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsCreateDialogOpen(false)
                            resetNewPositionForm()
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreatePosition}
                        disabled={!selectedUser || !newPosition.open_price}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Position
                    </Button>
                </div>
            </Dialog>

            {/* Edit Position Dialog */}
            <Dialog
                isOpen={isEditDialogOpen}
                onClose={() => {
                    setIsEditDialogOpen(false)
                    setPositionToEdit(null)
                }}
                title="Edit Open Position"
                size="lg"
                scrollable={true}
            >
                {positionToEdit && (
                    <div className="py-4 px-6">
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                Editing position: <span className="font-semibold">{positionToEdit.pair}</span>
                                <br />
                                User: <span className="font-semibold">{selectedUser?.full_name}</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Currency Pair */}
                            <div className="space-y-2">
                                <label htmlFor="edit-pair">Currency Pair</label>
                                <Select
                                    value={editFormData.pair}
                                    onValueChange={(value) => handleEditFormChange("pair", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select pair" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencyPairs.map(pair => (
                                            <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Position Type */}
                            <div className="space-y-2">
                                <label htmlFor="edit-type">Position Type</label>
                                <Select
                                    value={editFormData.type}
                                    onValueChange={(value) => handleEditFormChange("type", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BUY" className="text-green-600">BUY</SelectItem>
                                        <SelectItem value="SELL" className="text-red-600">SELL</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Size */}
                            <div className="space-y-2">
                                <label htmlFor="edit-size">Size (in thousands)</label>
                                <div className="relative">
                                    <Input
                                        id="edit-size"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={editFormData.size}
                                        onChange={(e) => handleEditFormChange("size", e.target.value)}
                                        className="pr-10"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">K</span>
                                </div>
                            </div>

                            {/* Open Price */}
                            <div className="space-y-2">
                                <label htmlFor="edit-open-price">Open Price *</label>
                                <Input
                                    id="edit-open-price"
                                    type="number"
                                    step="0.00001"
                                    value={editFormData.open_price}
                                    onChange={(e) => handleEditFormChange("open_price", e.target.value)}
                                    required
                                    placeholder="e.g., 1.08500"
                                />
                            </div>

                            {/* Current Price */}
                            <div className="space-y-2">
                                <label htmlFor="edit-current-price">Current Price *</label>
                                <Input
                                    id="edit-current-price"
                                    type="number"
                                    step="0.00001"
                                    value={editFormData.current_price}
                                    onChange={(e) => handleEditFormChange("current_price", e.target.value)}
                                    required
                                    placeholder="Current market price"
                                />
                            </div>

                            {/* Stop Loss */}
                            <div className="space-y-2">
                                <label htmlFor="edit-stop-loss">Stop Loss (Optional)</label>
                                <Input
                                    id="edit-stop-loss"
                                    type="number"
                                    step="0.00001"
                                    value={editFormData.stop_loss}
                                    onChange={(e) => handleEditFormChange("stop_loss", e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>

                            {/* Take Profit */}
                            <div className="space-y-2">
                                <label htmlFor="edit-take-profit">Take Profit (Optional)</label>
                                <Input
                                    id="edit-take-profit"
                                    type="number"
                                    step="0.00001"
                                    value={editFormData.take_profit}
                                    onChange={(e) => handleEditFormChange("take_profit", e.target.value)}
                                    placeholder="Optional"
                                />
                            </div>

                            {/* P&L */}
                            <div className="space-y-2">
                                <label htmlFor="edit-pnl">P&L</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                    <Input
                                        id="edit-pnl"
                                        type="number"
                                        step="0.01"
                                        value={editFormData.pnl}
                                        onChange={(e) => handleEditFormChange("pnl", e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            {/* P&L % */}
                            <div className="space-y-2">
                                <label htmlFor="edit-pnl-percent">P&L %</label>
                                <div className="relative">
                                    <Input
                                        id="edit-pnl-percent"
                                        type="number"
                                        step="0.01"
                                        value={editFormData.pnl_percent}
                                        onChange={(e) => handleEditFormChange("pnl_percent", e.target.value)}
                                        className="pr-10"
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                                </div>
                            </div>

                            {/* Swap */}
                            <div className="space-y-2">
                                <label htmlFor="edit-swap">Swap</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                    <Input
                                        id="edit-swap"
                                        type="number"
                                        step="0.01"
                                        value={editFormData.swap}
                                        onChange={(e) => handleEditFormChange("swap", e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            {/* Commission */}
                            <div className="space-y-2">
                                <label htmlFor="edit-commission">Commission</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                    <Input
                                        id="edit-commission"
                                        type="number"
                                        step="0.01"
                                        value={editFormData.commission}
                                        onChange={(e) => handleEditFormChange("commission", e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Original Data Preview */}
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Original Position Data</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Pair:</span>
                                    <span className="ml-2 font-medium">{positionToEdit.pair}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Size:</span>
                                    <span className="ml-2 font-medium">{(positionToEdit.size / 1000).toFixed(2)}K</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Open Price:</span>
                                    <span className="ml-2 font-medium">{positionToEdit.open_price}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Current Price:</span>
                                    <span className="ml-2 font-medium">{positionToEdit.current_price}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">P&L:</span>
                                    <span className={`ml-2 font-medium ${positionToEdit.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        ${positionToEdit.pnl?.toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Opened:</span>
                                    <span className="ml-2 font-medium">
                                        {new Date(positionToEdit.open_time).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Position ID: {positionToEdit?.id ? String(positionToEdit.id).slice(0, 8) + '...' : 'N/A'}
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false)
                                    setPositionToEdit(null)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveEdit}
                                disabled={positionsSaving || !editFormData.open_price}
                                className="min-w-[120px]"
                            >
                                {positionsSaving ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm mr-2"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}