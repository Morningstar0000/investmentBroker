"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card"
import { Button } from "./ui/Button"
import Input from "./ui/Input"
import { Badge } from "./ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs"
import { Star, Check, Search, Shield } from "./ui/Icons"

export default function SettingsPage({ userId, investors, followedInvestors, onInvestorSelect, selectedInvestor, onSettingsUpdate }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRisk, setFilterRisk] = useState("all")
  const [userSettings, setUserSettings] = useState({
    notifications: true,
    emailAlerts: true,
    riskTolerance: "medium",
    autoFollow: false,
    maxCopyAmount: 1000,
  })

  // Update the filteredInvestors to use the prop
  const filteredInvestors = investors.filter((investor) => {
    const matchesSearch =
      investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (investor.trading_style && investor.trading_style.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRisk = filterRisk === "all" || investor.risk_level === filterRisk

    return matchesSearch && matchesRisk
  })

  // In your SettingsPage component, update the handleInvestorSelect function
  const handleInvestorSelect = (investor) => {
    if (onInvestorSelect) {
      onInvestorSelect(investor);
    }
  };

  const handleSettingsChange = (key, value) => {
    const newSettings = { ...userSettings, [key]: value }
    setUserSettings(newSettings)
    onSettingsUpdate(newSettings)
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "high":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and copy trading preferences.
          </p>
        </div>
      </div>

      <Tabs defaultValue="investors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="investors">Copy Trading</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="investors" className="space-y-6">
          {/* Current Selection */}
          {selectedInvestor && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  Currently Copying
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <img
                    src={selectedInvestor.avatar_url || "/placeholder.svg"}
                    alt={selectedInvestor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{selectedInvestor.name}</h3>
                      {selectedInvestor.verified && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{selectedInvestor.username}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-green-600 font-medium">
                        +{selectedInvestor.monthly_return}% this month
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedInvestor.followers.toLocaleString()} followers
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => onInvestorSelect(null)}>
                    Stop Copying
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/ transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search investors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investors List */}
          <div className="grid gap-6">
            {filteredInvestors.map((investor) => (
              <Card key={investor.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Investor Info */}
                    <div className="flex items-start gap-4">
                      <img
                        src={investor.avatar_url || "/placeholder.svg"}
                        alt={investor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{investor.name}</h3>
                          {investor.verified && (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{investor.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{investor.username}</p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{investor.description}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getRiskColor(investor.risk_level)}>
                            {investor.risk_level.charAt(0).toUpperCase() + investor.risk_level.slice(1)} Risk
                          </Badge>
                          <Badge variant="outline">{investor.trading_style}</Badge>
                          <Badge variant="outline">{investor.experience}</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">+{investor.total_return}%</div>
                        <div className="text-xs text-gray-500">Total Return</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">+{investor.monthly_return}%</div>
                        <div className="text-xs text-gray-500">This Month</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{investor.win_rate}%</div>
                        <div className="text-xs text-gray-500">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">{investor.followers.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Followers</div>
                      </div>
                    </div>


                   
                    {/* Action */}
                    <div className="flex items-center">
                      <Button
                        onClick={() => handleInvestorSelect(investor)}
                        disabled={selectedInvestor !== null && selectedInvestor.id !== investor.id}
                        className="w-full lg:w-auto"
                      >
                        {selectedInvestor?.id === investor.id ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copying
                          </>
                        ) : selectedInvestor !== null ? (
                          "Already Copying Another Investor"
                        ) : (
                          "Copy Investor Trades"
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total Trades:</span>
                        <span className="ml-2 font-medium">{investor.total_trades.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Profitable:</span>
                        <span className="ml-2 font-medium">{investor.profitable_trades.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Hold:</span>
                        <span className="ml-2 font-medium">{investor.avg_hold_time}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Max Drawdown:</span>
                        <span className="ml-2 font-medium text-red-600">{investor.max_drawdown}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Copy Trading Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Auto Follow New Trades</label>
                  <p className="text-sm text-gray-500">Automatically copy new trades from followed investors</p>
                </div>
                <input
                  type="checkbox"
                  checked={userSettings.autoFollow}
                  onChange={(e) => handleSettingsChange("autoFollow", e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Maximum Copy Amount ($)</label>
                <Input
                  type="number"
                  value={userSettings.maxCopyAmount}
                  onChange={(e) => handleSettingsChange("maxCopyAmount", Number.parseInt(e.target.value))}
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Risk Tolerance</label>
                <select
                  value={userSettings.riskTolerance}
                  onChange={(e) => handleSettingsChange("riskTolerance", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Conservative (Low Risk)</option>
                  <option value="medium">Balanced (Medium Risk)</option>
                  <option value="high">Aggressive (High Risk)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Push Notifications</label>
                  <p className="text-sm text-gray-500">
                    Receive notifications about your trades and followed investors
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={userSettings.notifications}
                  onChange={(e) => handleSettingsChange("notifications", e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Email Alerts</label>
                  <p className="text-sm text-gray-500">Get email notifications for important trading events</p>
                </div>
                <input
                  type="checkbox"
                  checked={userSettings.emailAlerts}
                  onChange={(e) => handleSettingsChange("emailAlerts", e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}