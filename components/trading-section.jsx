"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Search,
  Filter,
  Plus,
  X,
  Target,
  DollarSign,
  Activity,
  Calendar,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function TradingSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  // Mock open positions data
  const openPositions = [
    {
      id: 1,
      pair: "EUR/USD",
      type: "BUY",
      size: 100000,
      openPrice: 1.0852,
      currentPrice: 1.0875,
      stopLoss: 1.082,
      takeProfit: 1.092,
      pnl: 230,
      pnlPercent: 0.21,
      openTime: "2024-01-20T09:30:00Z",
      swap: -2.5,
      commission: 8.0,
    },
    {
      id: 2,
      pair: "GBP/USD",
      type: "SELL",
      size: 75000,
      openPrice: 1.2699,
      currentPrice: 1.2654,
      stopLoss: 1.275,
      takeProfit: 1.26,
      pnl: 337.5,
      pnlPercent: 0.35,
      openTime: "2024-01-20T11:15:00Z",
      swap: -1.8,
      commission: 6.0,
    },
    {
      id: 3,
      pair: "USD/JPY",
      type: "BUY",
      size: 50000,
      openPrice: 149.18,
      currentPrice: 149.85,
      stopLoss: 148.5,
      takeProfit: 150.5,
      pnl: 224.5,
      pnlPercent: 0.45,
      openTime: "2024-01-20T14:22:00Z",
      swap: 0.5,
      commission: 4.0,
    },
    {
      id: 4,
      pair: "AUD/USD",
      type: "BUY",
      size: 80000,
      openPrice: 0.6553,
      currentPrice: 0.6587,
      stopLoss: 0.652,
      takeProfit: 0.662,
      pnl: 272,
      pnlPercent: 0.52,
      openTime: "2024-01-19T16:45:00Z",
      swap: -3.2,
      commission: 6.4,
    },
    {
      id: 5,
      pair: "USD/CHF",
      type: "SELL",
      size: 60000,
      openPrice: 0.8935,
      currentPrice: 0.8923,
      stopLoss: 0.897,
      takeProfit: 0.888,
      pnl: 72,
      pnlPercent: 0.13,
      openTime: "2024-01-19T13:20:00Z",
      swap: 1.2,
      commission: 4.8,
    },
  ]

  // Mock closed positions data
  const closedPositions = [
    {
      id: 101,
      pair: "EUR/USD",
      type: "SELL",
      size: 100000,
      openPrice: 1.092,
      closePrice: 1.0875,
      pnl: 450,
      pnlPercent: 0.41,
      openTime: "2024-01-19T08:30:00Z",
      closeTime: "2024-01-19T15:45:00Z",
      duration: "7h 15m",
      swap: -4.5,
      commission: 8.0,
      result: "win",
    },
    {
      id: 102,
      pair: "GBP/USD",
      type: "BUY",
      size: 75000,
      openPrice: 1.258,
      closePrice: 1.2654,
      pnl: 555,
      pnlPercent: 0.59,
      openTime: "2024-01-18T10:15:00Z",
      closeTime: "2024-01-19T09:30:00Z",
      duration: "23h 15m",
      swap: -6.8,
      commission: 6.0,
      result: "win",
    },
    {
      id: 103,
      pair: "USD/JPY",
      type: "SELL",
      size: 80000,
      openPrice: 148.95,
      closePrice: 149.45,
      pnl: -266.7,
      pnlPercent: -0.34,
      openTime: "2024-01-18T14:20:00Z",
      closeTime: "2024-01-18T16:10:00Z",
      duration: "1h 50m",
      swap: 0,
      commission: 6.4,
      result: "loss",
    },
    {
      id: 104,
      pair: "AUD/USD",
      type: "SELL",
      size: 90000,
      openPrice: 0.6621,
      closePrice: 0.6587,
      pnl: 306,
      pnlPercent: 0.51,
      openTime: "2024-01-17T11:30:00Z",
      closeTime: "2024-01-18T08:45:00Z",
      duration: "21h 15m",
      swap: -8.1,
      commission: 7.2,
      result: "win",
    },
    {
      id: 105,
      pair: "USD/CHF",
      type: "BUY",
      size: 70000,
      openPrice: 0.889,
      closePrice: 0.8923,
      pnl: 231,
      pnlPercent: 0.37,
      openTime: "2024-01-17T09:15:00Z",
      closeTime: "2024-01-17T17:30:00Z",
      duration: "8h 15m",
      swap: 2.1,
      commission: 5.6,
      result: "win",
    },
  ]

  const totalOpenPnL = openPositions.reduce((sum, pos) => sum + pos.pnl, 0)
  const totalClosedPnL = closedPositions.reduce((sum, pos) => sum + pos.pnl, 0)
  const winRate = (
    (closedPositions.filter((pos) => pos.result === "win").length / closedPositions.length) *
    100
  ).toFixed(1)

  const handleClosePosition = (positionId) => {
    console.log("Closing position:", positionId)
    // Handle close position logic
  }

  const formatDuration = (openTime) => {
    const now = new Date()
    const open = new Date(openTime)
    const diff = now - open
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trading Positions</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your open and closed forex positions.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Trade
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openPositions.length}</div>
            <p className="text-xs text-muted-foreground">Active trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalOpenPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalOpenPnL >= 0 ? "+" : ""}${totalOpenPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Unrealized P&L</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalClosedPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalClosedPnL >= 0 ? "+" : ""}${totalClosedPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Realized P&L</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{winRate}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
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
                    className="pl-10"
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
            {openPositions.map((position) => (
              <Card key={position.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant={position.type === "BUY" ? "default" : "destructive"}>{position.type}</Badge>
                        <span className="font-bold text-lg">{position.pair}</span>
                      </div>
                      <div className="text-sm text-gray-600">Size: {(position.size / 1000).toFixed(0)}K</div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Open Price</p>
                        <p className="font-medium">{position.openPrice}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Current Price</p>
                        <p className="font-medium">{position.currentPrice}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Stop Loss</p>
                        <p className="font-medium text-red-600">{position.stopLoss}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Take Profit</p>
                        <p className="font-medium text-green-600">{position.takeProfit}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">P&L</p>
                        <p className={`font-bold ${position.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">{formatDuration(position.openTime)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Modify Position</DropdownMenuItem>
                          <DropdownMenuItem>Set Alert</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Close Position</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="outline" size="sm" onClick={() => handleClosePosition(position.id)}>
                        <X className="w-4 h-4 mr-1" />
                        Close
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="closed" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search closed positions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date Range
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Closed Positions List */}
          <div className="space-y-4">
            {closedPositions.map((position) => (
              <Card key={position.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant={position.type === "BUY" ? "default" : "destructive"}>{position.type}</Badge>
                        <span className="font-bold text-lg">{position.pair}</span>
                        <Badge
                          variant={position.result === "win" ? "default" : "secondary"}
                          className={
                            position.result === "win" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {position.result}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">Size: {(position.size / 1000).toFixed(0)}K</div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Open Price</p>
                        <p className="font-medium">{position.openPrice}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Close Price</p>
                        <p className="font-medium">{position.closePrice}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">P&L</p>
                        <p className={`font-bold ${position.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {position.pnl >= 0 ? "+" : ""}${position.pnl.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">{position.duration}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Swap</p>
                        <p className={`font-medium ${position.swap >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {position.swap >= 0 ? "+" : ""}${position.swap.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Commission</p>
                        <p className="font-medium text-red-600">-${position.commission.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="text-right text-sm text-gray-500">
                      <p>Closed: {new Date(position.closeTime).toLocaleDateString()}</p>
                      <p>{new Date(position.closeTime).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
