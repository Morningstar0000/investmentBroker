"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import Input from './ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { sortedCountries } from '../utils/countries';
import ReactCountryFlag from "react-country-flag";
import { supabase } from '../client'; // Import supabase client
import { useToast } from '../context/ToastContext'
import { countriesWithCallingCodes, getCallingCodeByCountryCode } from '../utils/countries';
import { Loader2 } from "lucide-react"; // Import Loader2 icon

const AuthScreen = ({ onLogin, initialMode = 'login', onToggleMode }) => {
  const { addToast } = useToast()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [mode, setMode] = useState(initialMode); // 'login', 'register', or 'forgot-password'
  const { signIn, signUp, loading, resetPassword } = useAuth();
  
  
  // Forgot password states
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  // Get calling code for selected country
  const [callingCode, setCallingCode] = useState('+1'); // Default
  const [phoneNumber, setPhoneNumber] = useState('');

   // Update calling code when country changes
  useEffect(() => {
    if (country) {
      const code = getCallingCodeByCountryCode(country);
      setCallingCode(code);
    }
  }, [country]);

  // Handle phone input change
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setPhoneNumber(value);
    
    // Format for storage: +[callingCode][phoneNumber]
    if (value) {
      setPhone(`${callingCode}${value}`);
    } else {
      setPhone('');
    }
  };

  // Format phone for display
  const formatPhoneDisplay = () => {
    if (!phoneNumber) return '';
    
    // Basic formatting (customize based on country if needed)
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 10)}`;
  };


  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);


const handleForgotPassword = async () => {
    try {
      setResetError('');
      await resetPassword(forgotPasswordEmail); // ✅ Now resetPassword is available
      setResetSent(true);
    } catch (err) {
      setResetError(err.message);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (mode === 'login') {
      await signIn(email, password); 
      // AuthContext now shows the success toast
      // So we don't need to show it here
      
      // Delay redirect to allow toast to show
      setTimeout(() => {
        onLogin();
      }, 500);
    } else if (mode === 'register') {
      // Validate passwords match
      if (password !== confirmPassword) {
        addToast('Passwords do not match', 'error');
        return;
      }

      if (!termsAccepted) {
        addToast('Please accept the Terms of Service and Privacy Policy', 'error');
        return;
      }

      // Find the country name from the selected code
      const selectedCountry = sortedCountries.find(c => c.code === country);
      const countryName = selectedCountry ? selectedCountry.name : country;

      await signUp({
        email,
        password,
        firstName,
        lastName,
        phone,
        country: countryName,
        address,
      });
      // AuthContext shows the signup success toast
      // So we don't need to show it here
      setMode('login');
    }
  } catch (err) {
    // AuthContext now handles the error toasts
    // So we don't need to show them here
    // Just log the error for debugging
    console.error('Auth error:', err);
  }
};

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    if (onToggleMode) {
      onToggleMode(newMode);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) throw error;
    } catch (err) {
      console.error('Google sign in error:', err);
      alert('Failed to sign in with Google');
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      if (error) throw error;
    } catch (err) {
      console.error('Facebook sign in error:', err);
      alert('Failed to sign in with Facebook');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="inline-block">
            <div className="flex items-center justify-center space-x-2 hover:opacity-80 transition-opacity">
              
              <img src="Logo.png" alt="" width={300}/>
            </div>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {mode === 'login' ? 'Welcome Back' : 
               mode === 'register' ? 'Create Account' : 
               'Reset Password'}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {mode === 'login' ? 'Sign in to your Aureus capital account' :
               mode === 'register' ? 'Join Aureus capital and start copy trading today' :
               'Enter your email to reset your password'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* {error && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200" role="alert">
                {error.message}
              </div>
            )} */}

            {/* FORGOT PASSWORD FORM */}
            {mode === 'forgot-password' ? (
              <div className="space-y-4">
                {resetSent ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700">
                      ✅ Check your email for password reset instructions.
                    </p>
                    <button 
                      onClick={() => setMode('login')}
                      className="mt-2 text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Back to login
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 text-sm">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    
                    <div className="space-y-2">
                      <label htmlFor="reset-email" className="text-sm font-medium">Email Address</label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      />
                    </div>
                    
                    {resetError && (
                      <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                        {resetError}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleForgotPassword}
                        className="flex-1 bg-blue-400 hover:bg-blue-500 min-w-[120px]"
                        disabled={!forgotPasswordEmail || loading}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Sending...</span>
                          </div>
                        ) : 'Send Reset Link'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setMode('login')}
                      >
                        Cancel
                      </Button>
                    </div>
                    
                    <div className="text-center text-sm text-slate-600">
                      Remember your password?{' '}
                      <button
                        onClick={() => setMode('login')}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Sign in here
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* LOGIN OR REGISTER FORM */
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <>
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
                  </>
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
                    {/* Phone Number with Country Code */}
                    <div className="space-y-2">
                      <label htmlFor="phone">Phone Number</label>
                      <div className="flex gap-2">
                        {/* Country Calling Code Selector */}
                        <div className="w-24 flex-shrink-0">
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              {callingCode}
                            </div>
                            <Select value={country} onValueChange={setCountry}>
                              <SelectTrigger className="w-full pl-12">
                                <SelectValue placeholder="Code">
                                  {country && (
                                    <div className="flex items-center">
                                      <ReactCountryFlag
                                        countryCode={country}
                                        svg
                                        style={{
                                          width: '1em',
                                          height: '1em',
                                          marginRight: '4px',
                                        }}
                                      />
                                    </div>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
                                {countriesWithCallingCodes.map((c) => (
                                  <SelectItem key={c.code} value={c.code}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <ReactCountryFlag
                                          countryCode={c.code}
                                          svg
                                          style={{
                                            width: '1.2em',
                                            height: '1.2em',
                                            marginRight: '8px',
                                          }}
                                        />
                                        <span className="text-sm">{c.name}</span>
                                      </div>
                                      <span className="text-sm text-gray-500">{c.callingCode}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* Phone Number Input */}
                        <div className="flex-1">
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="123 456 7890"
                            value={formatPhoneDisplay()}
                            onChange={handlePhoneChange}
                            required
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Selected: {country ? countriesWithCallingCodes.find(c => c.code === country)?.name : 'No country selected'} ({callingCode})
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="address">Address</label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="123 Main St, City, State, ZIP"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    
                    {/* Country Selection (for nationality) */}
                    <div className="space-y-2">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country / Nationality
                      </label>
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select your country">
                            {country && (
                              <div className="flex items-center">
                                <ReactCountryFlag
                                  countryCode={country}
                                  svg
                                  style={{
                                    width: '1.2em',
                                    height: '1.2em',
                                    marginRight: '8px',
                                  }}
                                />
                                <span>{countriesWithCallingCodes.find(c => c.code === country)?.name}</span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
                          {countriesWithCallingCodes.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              <div className="flex items-center">
                                <ReactCountryFlag
                                  countryCode={c.code}
                                  svg
                                  style={{
                                    width: '1.5em',
                                    height: '1.5em',
                                    marginRight: '8px',
                                  }}
                                />
                                <span>{c.name}</span>
                                <span className="ml-auto text-sm text-gray-500">{c.callingCode}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {mode !== 'forgot-password' && (
                  <>
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
                          onClick={() => setMode('forgot-password')}
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
                      
                      {console.log('AuthScreen - loading state:', loading, 'mode:', mode)}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-400 hover:bg-blue-500 min-w-[120px]"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                        </div>
                      ) : mode === 'login' ? 'Sign In' : 'Create Account'}
                    </Button>

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
                        onClick={handleGoogleSignIn}
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
                        onClick={handleFacebookSignIn}
                        type="button"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </Button>
                    </div>
                  </>
                )}
              </form>
            )}

            {mode !== 'forgot-password' && (
              <div className="text-center text-sm text-slate-600">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={toggleMode}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  {mode === 'login' ? 'Sign up here' : 'Sign in here'}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AuthScreen;