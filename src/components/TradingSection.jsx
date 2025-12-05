"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card"
import { Button } from "../components/ui/Button"
import Input from "./ui/Input"
import { Badge} from "../components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs"
import { TrendingUp, Search, Filter, Plus, X, Target, DollarSign, Activity } from "./ui/Icons"
// Import your custom Dialog component
import Dialog from "../components/ui/Dialog"

// Accept props from App.jsx
export default function TradingSection({
  userId,
  openPositions,
  closedPositions,
  tradingSummary,
  onOpenPositionClose,
  positionsSaving,
  dataError,
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
  }
  
  // Handle the cancel action from the dialog.
  const handleCancelClose = () => {
    setIsDialogOpen(false)
    setPositionToClose(null)
  }

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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Trade
        </Button>
      </div>

      {dataError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {dataError}</span>
        </div>
      )}

      {/* Summary Cards - Now using tradingSummary prop */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {tradingSummary.total_open_positions}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active trades</p>
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{tradingSummary.win_rate}%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Success rate</p>
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
                            <p className="font-medium text-red-600 dark:text-red-400">{position.stop_loss}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Take Profit</p>
                            <p className="font-medium text-green-600 dark:text-green-400">{position.take_profit}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">P&L</p>
                            <p
                              className={`font-bold ${position.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                            >
                              {position.pnl >= 0 ? `+` : `-`}${Math.abs(position.pnl).toFixed(2)}
                            </p>
                          </div>
                          {/* Display P&L Percent for Open Positions */}
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">P&L %</p>
                            <p
                              className={`font-bold ${position.pnl_percent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                            >
                              {position.pnl_percent >= 0 ? "+" : ""}
                              {position.pnl_percent.toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Duration</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {formatDurationForOpenPositions(position.open_time)}
                            </p>
                          </div>
                          {/* NEW: Display Swap for Open Positions */}
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Swap</p>
                            <p
                              className={`font-medium ${position.swap >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                            >
                              {position.swap >= 0 ? `+` : `-`}${Math.abs(position.swap).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 lg:ml-auto">
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
            {closedPositions.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No closed positions found.</p>
            ) : (
              closedPositions.map((position) => (
                <Card key={position.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant={position.type === "BUY" ? "default" : "destructive"}>{position.type}</Badge>
                          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{position.pair}</span>
                          <Badge variant={position.result === "win" ? "success" : "destructive"}>
                            {position.result}
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
                          <p
                            className={`font-bold ${position.pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {position.pnl >= 0 ? `+` : `-`}${Math.abs(position.pnl).toFixed(2)}
                          </p>
                        </div>
                        {/* Display P&L Percent for Closed Positions */}
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">P&L %</p>
                          <p
                            className={`font-bold ${position.pnl_percent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {position.pnl_percent >= 0 ? "+" : ""}
                            {position.pnl_percent.toFixed(2)}%
                          </p>
                        </div>
                        {/* Display Stop Loss for Closed Positions */}
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Stop Loss</p>
                          <p className="font-medium text-red-600 dark:text-red-400">{position.stop_loss || "N/A"}</p>
                        </div>
                        {/* Display Take Profit for Closed Positions */}
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Take Profit</p>
                          <p className="font-medium text-green-600 dark:text-green-400">
                            {position.take_profit || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Duration</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{position.duration}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Swap</p>
                          <p
                            className={`font-medium ${position.swap >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            {position.swap >= 0 ? `+` : `-`}${Math.abs(position.swap).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Commission</p>
                          <p className="font-medium text-red-600 dark:text-red-400">
                            -${position.commission.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                        <p>Closed: {new Date(position.close_time).toLocaleDateString()}</p>
                        <p>{new Date(position.close_time).toLocaleTimeString()}</p>
                      </div>
                    </div>
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
          >
            Close Position
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
