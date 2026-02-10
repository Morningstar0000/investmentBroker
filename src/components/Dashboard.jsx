"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
// Add WifiOff to your imports
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Target,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { CurrencyData } from "../API/CurrencyData";
import { NotificationBell } from "./NotificatioBell";

export default function Dashboard({
  userId,
  metricsData,
  dataError,
  selectedAccountTypeDetails,
  recentTrades,
  unreadCount,
  onOpenChat,
  profileData,
}) {
  const { majorPairs, loading, error, refreshData } = CurrencyData();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Add at the top of your Dashboard component, after the state declarations:
  useEffect(() => {
    console.log("📊 Dashboard received metricsData:", metricsData);
    console.log("📈 Current Equity Calculation:", {
      totalBalance: metricsData?.totalBalance,
      totalOpenPnl: metricsData?.totalOpenPnl,
      calculatedEquity: (metricsData?.totalBalance || 0) + (metricsData?.totalOpenPnl || 0),
      equityFromData: metricsData?.equity
    });
  }, [metricsData]);

  const handleRefresh = () => {
    refreshData();
    setLastUpdated(new Date());
  };

  const formatTradeTime = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Add this function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {getTimeBasedGreeting()}, {profileData?.firstName || "Trader"}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {profileData?.firstName ? "Here's your trading overview" : "Monitor your forex positions and market opportunities."}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {selectedAccountTypeDetails ? (
            <span className="text-lg font-semibold text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900">
              {selectedAccountTypeDetails.name}
            </span>
          ) : (
            <span className="text-lg font-semibold text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
              No Account Type Selected
            </span>
          )}
        </div>
      </div>

      {dataError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {dataError}</span>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Account Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${metricsData?.totalBalance?.toLocaleString() || "N/A"}
            </div>
            <div className="flex items-center text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4 mr-1" />+
              {metricsData?.todayPnLPercent}% today
            </div>
          </CardContent>
        </Card>

        {/* Equity Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equity</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              ${((metricsData?.totalBalance || 0) + (metricsData?.totalOpenPnl || 0)).toLocaleString()}
            </div>
            <div className="text-xs text-green-600 dark:text-green-600 space-y-1">
              <div>Account: ${(metricsData?.totalBalance || 0).toLocaleString()}</div>
            </div>
          
          </CardContent>
        </Card>

        {/* Open Positions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Positions
            </CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metricsData?.openPositions || 0}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Active trades
            </p>
          </CardContent>
        </Card>

  

        {/* Win Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metricsData?.winRate || 0}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid (Major Currency Pairs & Recent Trades) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Major Currency Pairs */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Major Currency Pairs</CardTitle>
              <CardDescription>Live forex rates</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* {error && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-4">
                <strong className="font-bold">Note: </strong>
                {error}
              </div>
            )} */}

            {loading ? (
              // Loading skeleton
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                      <div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : majorPairs.length > 0 ? (
              // Display currency pairs
              <div className="space-y-4">
                {majorPairs.map((pairData) => {
                  const baseCurrency = pairData.pair.split("/")[0];

                  return (
                    <div
                      key={pairData.pair}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300">
                            {baseCurrency}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {pairData.pair}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Vol: {pairData.volume}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                          {pairData.price}
                        </p>
                        {pairData.changePercent !== "NaN" && (
                          <div
                            className={`flex items-center text-sm ${parseFloat(pairData.change) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                              }`}
                          >
                            {parseFloat(pairData.change) >= 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {parseFloat(pairData.change) >= 0 ? "+" : ""}
                            {pairData.change} (
                            {parseFloat(pairData.changePercent) >= 0 ? "+" : ""}
                            {pairData.changePercent}%)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Empty state
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No currency data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
            <CardDescription>Your latest trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(recentTrades) && recentTrades.length > 0 ? (
                recentTrades
                  .sort(
                    (a, b) => new Date(b.close_time) - new Date(a.close_time)
                  )
                  .map((trade) => (
                    <div
                      key={trade.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              trade.type.toLowerCase() === "buy"
                                ? "default"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {trade.type.toUpperCase()}
                          </Badge>
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {trade.pair}
                          </span>
                        </div>
                        <Badge className="text-xs">Closed</Badge>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{(trade.size / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Entry:</span>
                          <span>{trade.open_price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Close:</span>
                          <span>{trade.close_price}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>P&L:</span>
                          <span
                            className={
                              trade.pnl >= 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            {trade.pnl >= 0 ? "+" : ""}$
                            {trade.pnl.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Duration:</span>
                          <span>{trade.duration}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Closed:</span>
                          <span>{formatTradeTime(trade.close_time)}</span>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No recent trades available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
