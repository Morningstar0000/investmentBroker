"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import  Input  from './ui/Input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';

/**
 * AuthScreen component for handling user login and signup.
 * @param {object} props - The component props.
 * @param {function} props.onLogin - A function to call after successful login.
 */
const AuthScreen = ({ onLogin, initialMode = 'login', onToggleMode,  }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const { signIn, signUp, loading, error } = useAuth();

  // Reset mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode) }
  )
  /**
   * Handles form submission for both login and signup.
   * @param {object} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await signIn({ email, password });
        onLogin();
      } else {
        // Validate passwords match
        if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
        }
        
        if (!termsAccepted) {
          alert('Please accept the Terms of Service and Privacy Policy');
          return;
        }

        await signUp({ 
          email, 
          password,
          firstName,
          lastName,
          phone,
          country 
        });
        alert('Signup successful! Please log in.');
        setMode('login'); // Switch to login view after successful signup
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);

      if (onToggleMode) {
      onToggleMode(newMode);
    }
    
    // Clear error when switching modes
    if (error) {
      // Assuming your auth context has a way to clear errors
      // If not, you might need to add that functionality
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block">
            <div className="flex items-center justify-center space-x-2 hover:opacity-80 transition-opacity">
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
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {mode === 'login' 
                ? 'Sign in to your Aureus capital account' 
                : 'Join Aureus capital and start copy trading today'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
                {error.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName">First Name</label>
                    <Input 
                      id="firstName" 
                      type="text" 
                      placeholder="John" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName">Last Name</label>
                    <Input 
                      id="lastName" 
                      type="text" 
                      placeholder="Doe" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required 
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email">Email Address</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={mode === 'login' ? "Enter your email" : "john.doe@example.com"} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="phone">Phone Number</label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+1 (555) 123-4567" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="country">Country</label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="password">Password</label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder={mode === 'login' ? "Enter your password" : "Create a strong password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  minLength={6}
                />
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Confirm your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                    minLength={6}
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="remember" className="text-sm text-slate-600">
                      Remember me
                    </label>
                  </div>
                  <button 
                    type="button" 
                    className="text-sm text-blue-400 hover:text-blue-700 font-medium"
                    onClick={() => alert('Password reset functionality coming soon!')}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-1"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                      I agree to the{" "}
                      <button 
                        type="button" 
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                        onClick={() => alert('Terms of Service coming soon!')}
                      >
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button 
                        type="button" 
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                        onClick={() => alert('Privacy Policy coming soon!')}
                      >
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <input
                      id="marketing"
                      type="checkbox"
                      checked={marketingEmails}
                      onChange={(e) => setMarketingEmails(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-1"
                    />
                    <label htmlFor="marketing" className="text-sm text-slate-600 leading-relaxed">
                      I would like to receive trading insights and market updates via email
                    </label>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-400 hover:bg-blue-500"
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="w-full bg-transparent"
                onClick={() => alert('Google authentication coming soon!')}
                type="button"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button 
                variant="outline" 
                className="w-full bg-transparent"
                onClick={() => alert('Facebook authentication coming soon!')}
                type="button"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>

            <div className="text-center text-sm text-slate-600">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={toggleMode}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {mode === 'login' ? 'Sign up here' : 'Sign in here'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AuthScreen;