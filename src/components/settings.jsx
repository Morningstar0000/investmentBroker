"use client";

import React, { useState, useEffect } from "react"; // Add useEffect
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";
import Input from "./ui/Input";
import { Badge } from "./ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import { Star, Check, Search, Shield, RefreshCw } from "./ui/Icons"; // Add RefreshCw
import { supabase } from "../client";
import { useToast } from "../context/ToastContext"

export default function SettingsPage({
  userId,
  investors,
  followedInvestors,
  onInvestorSelect,
  selectedInvestor,
  onSettingsUpdate,
  user,
  userSettings: propUserSettings = {} // Rename prop to avoid conflict
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("all");
  
  // Local state for unsaved changes (camelCase)
  const [localSettings, setLocalSettings] = useState({
    notifications: true,
    emailAlerts: true,
    riskTolerance: "medium",
    autoFollow: false,
    maxCopyAmount: 1000,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Password update states
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  const { addToast } = useToast()

  // Load settings from parent when component mounts
  useEffect(() => {
    if (propUserSettings && Object.keys(propUserSettings).length > 0) {
      setLocalSettings(propUserSettings);
      setHasUnsavedChanges(false);
    }
  }, [propUserSettings]);

  // Check for unsaved changes
  useEffect(() => {
    if (propUserSettings && Object.keys(propUserSettings).length > 0) {
      const changes = JSON.stringify(localSettings) !== JSON.stringify(propUserSettings);
      setHasUnsavedChanges(changes);
    }
  }, [localSettings, propUserSettings]);

  // Update the filteredInvestors to use the prop
  const filteredInvestors = investors.filter((investor) => {
    const matchesSearch =
      investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (investor.trading_style &&
        investor.trading_style
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesRisk =
      filterRisk === "all" || investor.risk_level === filterRisk;

    return matchesSearch && matchesRisk;
  });

  const handleInvestorSelect = (investor) => {
    if (onInvestorSelect) {
      onInvestorSelect(investor);
    }
  };

  // Handle local changes (doesn't save immediately)
  const handleLocalChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save settings to parent/database
  const handleSaveSettings = async () => {
    if (!hasUnsavedChanges) return;
    
    setIsSaving(true);
    setSaveMessage("");
    
    try {
      if (onSettingsUpdate) {
        await onSettingsUpdate(localSettings);
        setSaveMessage("Settings saved successfully!");
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setSaveMessage("");
        }, 3000);
      }
    } catch (error) {
      setSaveMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      setPasswordError("Both fields are required")
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }
    
    try {
      setPasswordLoading(true)
      setPasswordError("")
      setPasswordSuccess("")
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      addToast("Password updated successfully!", "success")
      
      setNewPassword("")
      setConfirmPassword("")
      
      setTimeout(() => {
        setPasswordSuccess("")
      }, 5000)
      
    } catch (err) {
      setPasswordError(`Error: ${err.message}`)
    } finally {
      setPasswordLoading(false)
    }
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case "low":
        return "text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-700";
      case "medium":
        return "text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700";
      case "high":
        return "text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300 border border-red-200 dark:border-red-700";
      default:
        return "text-gray-700 bg-gray-100 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
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

        {/* KEEP YOUR EXISTING INVESTORS TAB CONTENT - NO CHANGES */}
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
                      <h3 className="font-bold text-lg">
                        {selectedInvestor.name}
                      </h3>
                      {selectedInvestor.verified && (
                        <Badge
                          variant="default"
                          className="bg-blue-100 text-blue-800"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedInvestor.username}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-green-600 font-medium">
                        +{selectedInvestor.monthly_return}% this month
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedInvestor.followers.toLocaleString()} followers
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => onInvestorSelect(null)}
                  >
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
          <div className="grid gap-4">
            {filteredInvestors.map((investor) => (
              <Card key={investor.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left Column: Investor Profile Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img
                            src={investor.avatar_url || "/placeholder.svg"}
                            alt={investor.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          />
                          {investor.verified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                              <Shield className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
                              {investor.name}
                            </h3>
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {investor.rating}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                            @{investor.username}
                          </p>
                          
                          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                            {investor.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className={`${getRiskColor(investor.risk_level)} px-3 py-1`}>
                              {investor.risk_level.charAt(0).toUpperCase() + investor.risk_level.slice(1)} Risk
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1">
                              {investor.trading_style}
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1">
                              {investor.experience}
                            </Badge>
                          </div>
                          
                          {/* Trading Stats Grid - Similar to screenshot */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {investor.total_trades.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">Total Trades</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {investor.profitable_trades.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">Profitable</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                {investor.avg_hold_time}
                              </div>
                              <div className="text-xs text-gray-500">Avg Hold</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                                {investor.max_drawdown}
                              </div>
                              <div className="text-xs text-gray-500">Max Drawdown</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column: Performance Stats and Action Button */}
                    <div className="lg:w-80 flex flex-col gap-4">
                      {/* Performance Stats - Column Layout */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="space-y-4">
                          <div>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                              +{investor.total_return}%
                            </div>
                            <div className="text-sm text-gray-500">Total Return</div>
                          </div>
                          
                          <div>
                            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                              +{investor.monthly_return}%
                            </div>
                            <div className="text-sm text-gray-500">This Month</div>
                          </div>
                          
                          <div>
                            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                              {investor.win_rate}%
                            </div>
                            <div className="text-sm text-gray-500">Win Rate</div>
                          </div>
                          
                          <div>
                            <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                              {investor.followers.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Followers</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        <Button
                          onClick={() => handleInvestorSelect(investor)}
                          disabled={
                            selectedInvestor !== null &&
                            selectedInvestor.id !== investor.id
                          }
                          className={`w-full ${selectedInvestor?.id === investor.id 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : selectedInvestor !== null 
                              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                              : 'bg-blue-500 hover:bg-blue-600'
                          } text-white transition-colors duration-200`}
                        >
                          {selectedInvestor?.id === investor.id ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Currently Copying
                            </>
                          ) : selectedInvestor !== null ? (
                            <>
                              <span className="text-sm">Already Copying Another Investor</span>
                            </>
                          ) : (
                            <>
                              Copy This Investor
                            </>
                          )}
                        </Button>
                        
                        {/* Follow Status */}
                        {followedInvestors?.some(fi => fi.investor_id === investor.id) && (
                          <div className="mt-2 text-center">
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                              <Check className="w-3 h-3 mr-1" />
                              Following
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* UPDATED: Account Settings Tab */}
        <TabsContent value="account" className="space-y-6">
          {/* Copy Trading Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Copy Trading Settings</CardTitle>
              {hasUnsavedChanges && (
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ You have unsaved changes
                </div>
              )}
              {saveMessage && (
                <div className={`text-sm ${saveMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}>
                  {saveMessage}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Auto Follow New Trades</label>
                  <p className="text-sm text-gray-500">
                    Automatically copy new trades from followed investors
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.autoFollow}
                  onChange={(e) => handleLocalChange("autoFollow", e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">
                  Maximum Copy Trade
                </label>
                <Input
                  type="number"
                  value={localSettings.maxCopyAmount}
                  onChange={(e) => 
                    handleLocalChange("maxCopyAmount", Number.parseInt(e.target.value) || 0)
                  }
                  placeholder="1000"
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Risk Tolerance</label>
                <select
                  value={localSettings.riskTolerance}
                  onChange={(e) => handleLocalChange("riskTolerance", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="low">Conservative (Low Risk)</option>
                  <option value="medium">Balanced (Medium Risk)</option>
                  <option value="high">Aggressive (High Risk)</option>
                </select>
              </div>

              {/* Save Button Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
                {!hasUnsavedChanges && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    All changes are saved
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Password Update Card */}
          <Card>
            <CardHeader>
              <CardTitle>Update Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={passwordLoading || !newPassword || !confirmPassword}
                  className="w-full bg-blue-400 hover:bg-blue-500"
                >
                  {passwordLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Updating Password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <p>Forgot your password? <button
                    type="button"
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      alert("Use the 'Forgot Password' link on the login page")
                    }}
                  >Reset it here</button></p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication Card */}
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">2FA Status</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Not Enabled
                  </Badge>
                </div>

                <Button variant="outline" className="w-full" disabled>
                  Enable Two-Factor Authentication
                </Button>

                <p className="text-xs text-gray-500">
                  Note: Two-factor authentication requires a paid Supabase plan.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UPDATED: Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              {hasUnsavedChanges && (
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ You have unsaved changes
                </div>
              )}
              {saveMessage && (
                <div className={`text-sm ${saveMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}>
                  {saveMessage}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Push Notifications</label>
                  <p className="text-sm text-gray-500">
                    Receive notifications about your trades and followed investors
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.notifications}
                  onChange={(e) => handleLocalChange("notifications", e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Email Alerts</label>
                  <p className="text-sm text-gray-500">
                    Get email notifications for important trading events
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.emailAlerts}
                  onChange={(e) => handleLocalChange("emailAlerts", e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              {/* Save Button for Notifications */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Notification Settings'
                  )}
                </Button>
                {!hasUnsavedChanges && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    All changes are saved
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}