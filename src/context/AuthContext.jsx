"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../client';
import { Button } from '../components/ui/Button';

// Create a simple toast function for now
const addToast = (message, type = 'info') => {
  console.log(`[Toast ${type}]: ${message}`);
  // You can add actual toast logic later
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          addToast('Successfully signed in!', 'success');
        } else if (event === 'SIGNED_OUT') {
          addToast('Signed out successfully', 'info');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Helper to call your working resend-email function
  const resendEmail = async (email, type = 'signup') => {
    try {
      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-email`;
      console.log('Calling resend-email function:', { email, type });
      
      const response = await fetch(
        edgeFunctionUrl,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, type })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Resend email result:', result);
      return result;
    } catch (error) {
      console.error('Resend email error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn: async (email, password) => { // ✅ Changed from object to separate params
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        addToast('Successfully signed in!', 'success');
        return data;
      } catch (error) {
        addToast(`Sign in failed: ${error.message}`, 'error');
        throw error;
      }
    },
    
    signUp: async (credentials) => {
  const { firstName, lastName, phone, country, email, password, address } = credentials;
  
  try {
    console.log('Starting signup for:', email);
    
    // Step 1: Create user WITH email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          country: country,
          address: address || ''
        },
        // Send verification email from Supabase
        emailRedirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`
      }
    });
    
    if (authError) {
      console.error('Supabase auth error:', authError);
      addToast(`Signup failed: ${authError.message}`, 'error');
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error('User creation failed - no user returned');
    }

    console.log('User created:', authData.user.id);
    
    // Step 2: Create user profile (even before email verification)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || '',
        nationality: country || '',
        address: address || '',
        risk_tolerance: 'Moderate',
        account_type_id: null,
        profile_picture_url: '',
        followed_investor_id: null
      }]);
    
    if (profileError) {
      console.error('Profile creation error:', profileError);
      addToast('Account created but profile setup failed', 'warning');
    }

    // Step 3: Check if email confirmation was sent
    if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
      addToast('Account created! Please check your email to verify your account.', 'success');
    } else {
      addToast('Account created! Check your email for verification.', 'success');
    }

    return authData;

  } catch (error) {
    console.error('Signup error:', error);
    addToast(`Signup failed: ${error.message}`, 'error');
    throw error;
  }
},

  resetPassword: async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_APP_URL}/update-password`,
    });
    
    if (error) throw error;
    
    addToast('Password reset email sent! Check your inbox.', 'success');
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    addToast(`Failed to send reset email: ${error.message}`, 'error');
    throw error;
  }
},
    
    resendVerification: async (email) => {
      try {
        // Use your working edge function
        await resendEmail(email, 'signup');
        addToast('Verification email resent! Check your inbox.', 'success');
        return { success: true };
      } catch (error) {
        console.error('Resend verification error:', error);
        addToast(`Failed to resend verification: ${error.message}`, 'error');
        throw error;
      }
    },
    
    signOut: async () => {
      await supabase.auth.signOut();
      addToast('Signed out successfully', 'info');
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}