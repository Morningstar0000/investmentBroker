"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import Input from "../components/ui/Input"
import { supabase } from "../client"
import { Plus, DollarSign, Target, Activity, X } from "../components/ui/Icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/Select"


export default function AdminPositionCreator({ onPositionCreated }) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Your open_positions table structure
    pair: "EUR/USD",
    type: "BUY",
    size: 1000,
    open_price: "",
    current_price: "",
    stop_loss: "",
    take_profit: "",
    pnl: 0,
    pnl_percent: 0,
    swap: 0,
    commission: 0,
    open_time: new Date().toISOString(),
    // These will be calculated/added
    user_id: "", // Leave empty or add if you have user management
  })

  const currencyPairs = [
    "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF",
    "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP",
    "EUR/JPY", "GBP/JPY", "AUD/JPY", "EUR/CHF"
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.open_price) {
      alert("Please enter an open price")
      return
    }

    setLoading(true)

    try {
      const dataToSubmit = {
        ...formData,
        current_price: formData.current_price || formData.open_price,
        size: parseFloat(formData.size) || 1000,
        open_price: parseFloat(formData.open_price),
        current_price: parseFloat(formData.current_price || formData.open_price),
        stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
        take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
        pnl: parseFloat(formData.pnl) || 0,
        pnl_percent: parseFloat(formData.pnl_percent) || 0,
        swap: parseFloat(formData.swap) || 0,
        commission: parseFloat(formData.commission) || 0,
        open_time: new Date().toISOString()
      }

      console.log("Creating position in open_positions:", dataToSubmit)

      // Insert into OPEN_POSITIONS table
      const { data, error } = await supabase
        .from("open_positions")
        .insert([dataToSubmit])
        .select()

      if (error) throw error

      alert("✅ Position created successfully in open positions!")
      
      
      // Reset form to defaults
      resetForm()

      // Notify parent component
      if (onPositionCreated && data && data[0]) {
        onPositionCreated(data[0])
      }

    } catch (error) {
      console.error("Error creating position:", error)
      alert(`❌ Error creating position: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      pair: "EUR/USD",
      type: "BUY",
      size: 1000,
      open_price: "",
      current_price: "",
      stop_loss: "",
      take_profit: "",
      pnl: 0,
      pnl_percent: 0,
      swap: 0,
      commission: 0,
      open_time: new Date().toISOString(),
      user_id: ""
    })
  }

  

  return (
    <Card className="w-full border-2 border-dashed border-blue-200 bg-blue-50 dark:bg-blue-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="w-5 h-5 text-blue-600" />
            Create New Open Position
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetForm}
            className="h-8"
          >
            <X className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Currency Pair */}
            <div className="space-y-2">
              <label htmlFor="pair">Currency Pair *</label>
              <Select 
                value={formData.pair} 
                onValueChange={(value) => handleSelectChange("pair", value)}
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
              <label htmlFor="type">Position Type *</label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange("type", value)}
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
              <label htmlFor="size">Size (in thousands) *</label>
              <div className="relative">
                <Input
                  id="size"
                  name="size"
                  type="number"
                  step="1"
                  min="1"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="pr-10"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">K</span>
              </div>
            </div>

            {/* Open Price */}
            <div className="space-y-2">
              <label htmlFor="open_price">Open Price *</label>
              <Input
                id="open_price"
                name="open_price"
                type="number"
                step="0.00001"
                value={formData.open_price}
                onChange={handleInputChange}
                required
                placeholder="e.g., 1.08500"
              />
            </div>

            {/* Current Price */}
            <div className="space-y-2">
              <label htmlFor="current_price">Current Price</label>
              <Input
                id="current_price"
                name="current_price"
                type="number"
                step="0.00001"
                value={formData.current_price}
                onChange={handleInputChange}
                placeholder="Auto-fills with open price"
              />
            </div>

            {/* Stop Loss */}
            <div className="space-y-2">
              <label htmlFor="stop_loss">Stop Loss</label>
              <Input
                id="stop_loss"
                name="stop_loss"
                type="number"
                step="0.00001"
                value={formData.stop_loss}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>

            {/* Take Profit */}
            <div className="space-y-2">
              <label htmlFor="take_profit">Take Profit</label>
              <Input
                id="take_profit"
                name="take_profit"
                type="number"
                step="0.00001"
                value={formData.take_profit}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>

            {/* P&L */}
            <div className="space-y-2">
              <label htmlFor="pnl">P&L</label>
              <Input
                id="pnl"
                name="pnl"
                type="number"
                step="0.01"
                value={formData.pnl}
                onChange={handleInputChange}
                placeholder="Current P&L"
              />
            </div>

            {/* P&L % */}
            <div className="space-y-2">
              <label htmlFor="pnl_percent">P&L %</label>
              <Input
                id="pnl_percent"
                name="pnl_percent"
                type="number"
                step="0.01"
                value={formData.pnl_percent}
                onChange={handleInputChange}
                placeholder="Current P&L %"
              />
            </div>

            {/* Swap */}
            <div className="space-y-2">
              <label htmlFor="swap">Swap</label>
              <Input
                id="swap"
                name="swap"
                type="number"
                step="0.01"
                value={formData.swap}
                onChange={handleInputChange}
              />
            </div>

            {/* Commission */}
            <div className="space-y-2">
              <label htmlFor="commission">Commission</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="commission"
                  name="commission"
                  type="number"
                  step="0.01"
                  value={formData.commission}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* User ID */}
            <div className="space-y-2">
              <label htmlFor="user_id">User ID (Optional)</label>
              <Input
                id="user_id"
                name="user_id"
                type="text"
                value={formData.user_id}
                onChange={handleInputChange}
                placeholder="Leave empty for no specific user"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h4 className="font-medium mb-3">Position Preview:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Pair:</span>
                <span className="ml-2 font-medium">{formData.pair}</span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className={`ml-2 font-medium px-2 py-0.5 rounded text-xs ${
                  formData.type === "BUY" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {formData.type}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>
                <span className="ml-2 font-medium">{formData.size / 1000}K</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 font-medium text-blue-600">Open</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || !formData.open_price}
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Open Position
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}