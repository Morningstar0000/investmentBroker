"use client"
import React, { useState, useEffect } from 'react';
import { supabase } from '../client';
import { Button } from './ui/Button';
import Input from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

const UpdatePassword = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if we have an access token in the URL (from email link)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken) {
        // Supabase will automatically handle the session from the URL
        console.log('Password reset token detected in URL');
      }
    }
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage('✅ Password updated successfully! Redirecting to login...');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        onNavigate('login');
      }, 3000);

    } catch (error) {
      console.error('Password update error:', error);
      setError(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">Aureus Capital</span>
            </div>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Set New Password
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Create a new password for your account
            </p>
          </CardHeader>

          <CardContent>
            {message && (
              <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
                {message}
              </div>
            )}

            {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
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
                disabled={loading}
                className="w-full bg-blue-400 hover:bg-blue-500"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>

              <div className="text-center text-sm text-slate-600">
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-blue-400 hover:text-blue-700 font-medium"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdatePassword;