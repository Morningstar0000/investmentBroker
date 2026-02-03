"use client";

import React, { useState } from 'react';
import Input from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Check, X } from '../components/ui/Icons';

export default function InvestorForm({ 
  initialData = {}, 
  onSubmit, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    username: initialData.username || '',
    description: initialData.description || '',
    avatar_url: initialData.avatar_url || '',
    total_return: initialData.total_return || 0,
    monthly_return: initialData.monthly_return || 0,
    win_rate: initialData.win_rate || 0,
    followers: initialData.followers || 0,
    risk_level: initialData.risk_level || 'medium',
    trading_style: initialData.trading_style || '',
    experience: initialData.experience || '',
    total_trades: initialData.total_trades || 0,
    profitable_trades: initialData.profitable_trades || 0,
    avg_hold_time: initialData.avg_hold_time || '',
    max_drawdown: initialData.max_drawdown || 0,
    verified: initialData.verified || false,
    rating: initialData.rating || 0,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) || 0 : 
              value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData.id ? 'Edit Investor Details' : 'New Investor Details'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    @
                  </span>
                  <Input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="rounded-l-none"
                    placeholder="johndoe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Brief description of trading style and strategy..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar URL
              </label>
              <Input
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
              />
              {formData.avatar_url && (
                <div className="mt-2 flex items-center gap-3">
                  <img 
                    src={formData.avatar_url} 
                    alt="Preview" 
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => e.target.src = '/placeholder-avatar.jpg'}
                  />
                  <span className="text-sm text-gray-500">Preview</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verified"
                name="verified"
                checked={formData.verified}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="verified" className="flex items-center gap-2 text-sm text-gray-700">
                <Badge className="bg-blue-100 text-blue-800">
                  {formData.verified ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  Verified Investor
                </Badge>
                <span className="text-gray-500">Mark as verified (shows verification badge)</span>
              </label>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Performance Statistics</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Return (%)
                </label>
                <Input
                  type="number"
                  name="total_return"
                  value={formData.total_return}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="0.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Return (%)
                </label>
                <Input
                  type="number"
                  name="monthly_return"
                  value={formData.monthly_return}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="0.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Win Rate (%)
                </label>
                <Input
                  type="number"
                  name="win_rate"
                  value={formData.win_rate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0.0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-5)
                </label>
                <Input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="4.5"
                />
              </div>
            </div>
          </div>

          {/* Trading Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Trading Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Risk Level
                </label>
                <select
                  name="risk_level"
                  value={formData.risk_level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>
                <div className="mt-1">
                  <Badge className={getRiskColor(formData.risk_level)}>
                    {formData.risk_level.toUpperCase()} RISK
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trading Style
                </label>
                <Input
                  name="trading_style"
                  value={formData.trading_style}
                  onChange={handleChange}
                  placeholder="e.g., Scalping, Swing Trading"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience
                </label>
                <Input
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 7+ years"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Trades
                </label>
                <Input
                  type="number"
                  name="total_trades"
                  value={formData.total_trades}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profitable Trades
                </label>
                <Input
                  type="number"
                  name="profitable_trades"
                  value={formData.profitable_trades}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avg Hold Time
                </label>
                <Input
                  name="avg_hold_time"
                  value={formData.avg_hold_time}
                  onChange={handleChange}
                  placeholder="e.g., 4.2 hours, 1.2 weeks"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Drawdown (%)
                </label>
                <Input
                  type="number"
                  name="max_drawdown"
                  value={formData.max_drawdown}
                  onChange={handleChange}
                  step="0.1"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Social & Followers */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Social & Followers</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Followers Count
                </label>
                <Input
                  type="number"
                  name="followers"
                  value={formData.followers}
                  onChange={handleChange}
                  placeholder="0"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Will display as: {formData.followers.toLocaleString()} followers
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  {initialData.id ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                initialData.id ? 'Update Investor' : 'Create Investor'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}