"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card"
import { Button } from "../components/ui/Button"
import Input from "./ui/Input"
import { Badge } from "../components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs"
import { TrendingUp, Search, Filter, Plus, X, Target, DollarSign, Activity, CreditCard } from "./ui/Icons"
// Import your custom Dialog component
import Dialog from "../components/ui/Dialog"
import { supabase } from "../client"

// Accept props from App.jsx
export default function TradingSection({
  userId,
  openPositions,
  closedPositions,
  tradingSummary,
  onOpenPositionClose,
  positionsSaving,
  dataError,
  addToast
}) {
  const [searchTerm, setSearchTerm] = useState("")

  // State to manage the dialog's open/close status
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  // State to store the position we're about to close
  const [positionToClose, setPositionToClose] = useState(null)

  // This function is ONLY for calculating duration for *OPEN* positions
  const formatDurationForOpenPositions = (openTime) => {
    const now = new Date()
    const open = new Date(openTime)
    const diff = now - open
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  // This function formats a number with commas and removes trailing decimals
  const formatNumber = (num) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).replace(/\.00$/, '');
  };

  // Calculate total commission from both open and closed positions
  const calculateTotalCommission = () => {
    const openCommission = openPositions.reduce((sum, pos) => sum + (pos.commission || 0), 0)
    const closedCommission = closedPositions.reduce((sum, pos) => sum + (pos.commission || 0), 0)
    return openCommission + closedCommission
  }

  // Handles the "Close" button click to show the dialog
  const handleCloseButtonClick = (position) => {
    setPositionToClose(position)
    setIsDialogOpen(true)
  }

  // Handle the confirmation from the dialog.
  const handleConfirmClose = () => {
    if (positionToClose) {
      onOpenPositionClose(positionToClose)
      setIsDialogOpen(false) // Close the dialog after the action is confirmed
      setPositionToClose(null) // Reset the position to be closed
    }
    // // Show toast notification with position details
    // const pnlSign = positionToClose.pnl >= 0 ? '+' : ''
    // const pnlAmount = `$${Math.abs(positionToClose.pnl).toFixed(2)}`

    // addToast(
    //   `Position closed: ${positionToClose.pair} (${pnlSign}${pnlAmount})`,
    //   'success',
    //   4000
    // )
  }

  // Handle the cancel action from the dialog.
  const handleCancelClose = () => {
    setIsDialogOpen(false)
    setPositionToClose(null)
  }

  // Get today's P&L (you can pass this from parent or calculate here)
  const todaysPnl = tradingSummary.today_pnl || tradingSummary.total_closed_pnl || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Trading Positions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage your open and closed forex positions.
          </p>
        </div>
      </div>

      {dataError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {dataError}</span>
        </div>
      )}

      {/* Summary Cards - Updated with Today's P&L and Total Commission */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* Today's P&L Card (replaces Total Positions) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${tradingSummary.today_pnl >= 0 ? "text-blue-600" : "text-red-600"}`}
            >
              {tradingSummary.today_pnl >= 0 ? "+" : ""}${formatNumber(tradingSummary.today_pnl)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total for the day P&L</p>
          </CardContent>
        </Card>

        {/* Open P&L Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${tradingSummary.total_open_pnl >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {tradingSummary.total_open_pnl >= 0 ? "+" : ""}${formatNumber(tradingSummary.total_open_pnl)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Unrealized P&L</p>
          </CardContent>
        </Card>

        {/* Closed P&L Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${tradingSummary.total_closed_pnl >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {tradingSummary.total_closed_pnl >= 0 ? "+" : ""}${formatNumber(tradingSummary.total_closed_pnl)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Realized P&L</p>
          </CardContent>
        </Card>

        {/* Total Commission Card (NEW) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -${formatNumber(calculateTotalCommission())}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total fees paid</p>
          </CardContent>
        </Card>

      </div>

      <Tabs defaultValue="open" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open">Open Positions ({openPositions.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed Positions ({closedPositions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search positions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
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
            {openPositions.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No open positions found.</p>
            ) : (
              openPositions
                .filter((pos) => pos.pair.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((position) => (
                  <Card key={position.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-4 md:p-6">
                      {/* Top Row: Pair Info, Size, and Close Button */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        {/* Left: Trading Pair Info */}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <Badge
                              variant={position.type === "BUY" ? "default" : "destructive"}
                              className="px-3 py-1 text-sm font-semibold min-w-[65px] text-center"
                            >
                              {position.type}
                            </Badge>
                            <div>
                              <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                                {position.pair}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Size: <span className="font-semibold">{(position.size / 1000).toFixed(0)}K</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right: Close Button with Duration on Desktop */}
                        <div className="flex items-center space-x-4 self-end sm:self-center">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Duration</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {formatDurationForOpenPositions(position.open_time)}
                            </p>
                          </div>

                          {/* OPTION 5: Enhanced Close Button with Spinner */}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCloseButtonClick(position)}
                            disabled={positionsSaving}
                            className="px-4 py-2 font-medium min-w-[100px] transition-all duration-200 hover:scale-105 hover:shadow-lg"
                          >
                            {positionsSaving ? (
                              <div className="flex items-center">
                                {/* Clean spinner */}
                                <div className="w-5 h-5 mr-3 relative">
                                  <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
                                  <div className="absolute inset-0 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <span>Closing...</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <X className="w-4 h-4 mr-2" />
                                Close
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Bottom Row: Trading Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-5">

                        {/* Column 1: Open Price */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Open Price</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                            {position.open_price}
                          </p>
                        </div>

                        {/* Column 2: Current Price */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Price</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                            {position.current_price}
                          </p>
                        </div>

                        {/* Column 3: Stop Loss */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Stop Loss</p>
                          <p className="font-semibold text-red-600 dark:text-red-400 text-base">
                            {position.stop_loss}
                          </p>
                        </div>

                        {/* Column 4: Take Profit */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Take Profit</p>
                          <p className="font-semibold text-green-600 dark:text-green-400 text-base">
                            {position.take_profit}
                          </p>
                        </div>

                        {/* Column 5: P&L */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">P&L</p>
                          <p className={`font-bold text-base ${position.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {position.pnl >= 0 ? `+` : `-`}${Math.abs(position.pnl).toFixed(2)}
                          </p>
                        </div>

                        {/* Column 6: P&L % */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">P&L %</p>
                          <p className={`font-bold text-base ${position.pnl_percent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {position.pnl_percent >= 0 ? "+" : ""}
                            {position.pnl_percent.toFixed(2)}%
                          </p>
                        </div>

                        {/* Column 7: Swap */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Swap</p>
                          <p className={`font-medium text-base ${position.swap >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {position.swap >= 0 ? `+` : `-`}${Math.abs(position.swap).toFixed(2)}
                          </p>
                        </div>

                        {/* Column 8: Duration (Mobile Only) */}
                        <div className="space-y-1 block sm:hidden">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-base">
                            {formatDurationForOpenPositions(position.open_time)}
                          </p>
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
            {closedPositions.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No closed positions found.</p>
            ) : (
              closedPositions.map((position) => (
               <Card key={position.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
  <CardContent className="p-4 md:p-6">
    {/* Top Row: Pair Info, Size, and Close Time */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
      {/* Left: Trading Pair Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <Badge 
            variant={position.type === "BUY" ? "default" : "destructive"}
            className="px-3 py-1 text-sm font-semibold min-w-[65px] text-center"
          >
            {position.type}
          </Badge>
          <div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
              {position.pair}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge 
                variant={position.result === "win" ? "success" : "destructive"}
                className="text-xs font-semibold"
              >
                {position.result}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Size: <span className="font-semibold">{(position.size / 1000).toFixed(0)}K</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right: Close Time and Duration */}
      <div className="flex flex-col items-end self-end sm:self-center">
        <div className="text-right">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Closed</p>
          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
            {new Date(position.close_time).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(position.close_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
        <div className="mt-2 text-right">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Duration</p>
          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
            {position.duration}
          </p>
        </div>
      </div>
    </div>

    {/* Bottom Row: Trading Details Grid */}
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4 md:gap-5">
      
      {/* Column 1: Open Price */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Open Price</p>
        <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
          {position.open_price}
        </p>
      </div>
      
      {/* Column 2: Close Price */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Close Price</p>
        <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
          {position.close_price}
        </p>
      </div>

      {/* Column 3: P&L */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">P&L</p>
        <p className={`font-bold text-base ${position.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {position.pnl >= 0 ? `+` : `-`}${Math.abs(position.pnl).toFixed(2)}
        </p>
      </div>
      
      {/* Column 4: P&L % */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">P&L %</p>
        <p className={`font-bold text-base ${position.pnl_percent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {position.pnl_percent >= 0 ? "+" : ""}
          {position.pnl_percent.toFixed(2)}%
        </p>
      </div>

      {/* Column 5: Stop Loss */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Stop Loss</p>
        <p className="font-semibold text-red-600 dark:text-red-400 text-base">
          {position.stop_loss || "N/A"}
        </p>
      </div>
      
      {/* Column 6: Take Profit */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Take Profit</p>
        <p className="font-semibold text-green-600 dark:text-green-400 text-base">
          {position.take_profit || "N/A"}
        </p>
      </div>

      {/* Column 7: Swap */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Swap</p>
        <p className={`font-medium text-base ${position.swap >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {position.swap >= 0 ? `+` : `-`}${Math.abs(position.swap).toFixed(2)}
        </p>
      </div>
      
      {/* Column 8: Commission */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Commission</p>
        <p className="font-medium text-red-600 dark:text-red-400 text-base">
          -${(position.commission || 0).toFixed(2)}
        </p>
      </div>

      {/* Column 9: Result Badge (Mobile Only) */}
      <div className="space-y-1 block lg:hidden">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Result</p>
        <Badge 
          variant={position.result === "win" ? "success" : "destructive"}
          className="text-xs font-semibold"
        >
          {position.result}
        </Badge>
      </div>
    </div>

    {/* Optional: Profit/Loss Summary Bar */}
    {Math.abs(position.pnl) > 0 && (
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm">
            <span className={`font-semibold ${position.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
              {position.pnl >= 0 ? "Profit: " : "Loss: "}
            </span>
            <span className={`font-bold ${position.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
              {position.pnl >= 0 ? "+" : "-"}${Math.abs(position.pnl).toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {position.duration}
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-full rounded-full ${position.pnl >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(Math.abs(position.pnl_percent) * 2, 100)}%` }}
          ></div>
        </div>
      </div>
    )}
  </CardContent>
</Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Custom Dialog for closing position */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={handleCancelClose}
        title="Confirm Close Position"
      >
        {positionToClose && (
          <div className="p-4">
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
        <div className="flex justify-end space-x-2 m-4">
          <Button
            variant="outline"
            onClick={handleCancelClose}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmClose}
          >
            Close Position
          </Button>
        </div>
      </Dialog>
    </div>
  )
}