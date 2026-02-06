"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../client";

// Create a simple toast function for now
const addToast = (message, type = "info") => {
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN") {
        addToast("Successfully signed in!", "success");
      } else if (event === "SIGNED_OUT") {
        addToast("Signed out successfully", "info");
      } else if (event === "USER_UPDATED") {
        // When email is confirmed
        if (session?.user?.email_confirmed_at) {
          // Update profile email_verified status
          await supabase
            .from('profiles')
            .update({ email_verified: true })
            .eq('id', session.user.id)
            .then(({ error }) => {
              if (error) {
                console.error('Failed to update profile email status:', error);
              } else {
                console.log('Profile email status updated to verified');
              }
            });
          
          addToast('Email verified successfully!', 'success');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    
    signIn: async (email, password) => {
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
        
        // Let Supabase handle email confirmation via SendGrid SMTP
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
            emailRedirectTo: `${import.meta.env.VITE_APP_URL || 'http://localhost:3000'}/auth/callback`
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
        
        // Create user profile
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
            followed_investor_id: null,
            
          }]);
        
        if (profileError) {
          console.error('Profile creation error:', profileError);
          console.log('User auth succeeded but profile creation failed');
          // Don't throw - auth succeeded, profile is secondary
        }

        // Show message about email confirmation
        addToast('Account created! Please check your email to verify your account.', 'success');

        return authData;

      } catch (error) {
        console.error('Signup error:', error);
        addToast(`Signup failed: ${error.message}`, 'error');
        throw error;
      }
    },

    resetPassword: async (email) => {
      try {
        console.log('Sending password reset to:', email);
        
        // Supabase will use SendGrid SMTP
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        
        if (error) throw error;
        
        console.log('Password reset email sent');
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
        // Use Supabase's built-in method (will use SendGrid SMTP)
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
          options: {
            emailRedirectTo: `${import.meta.env.VITE_APP_URL || 'http://localhost:3000'}/auth/callback`
          }
        });
        
        if (error) throw error;
        
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
    },
    
    checkEmailVerified: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return {
        verified: user?.email_confirmed_at ? true : false,
        email: user?.email
      };
    },
    
    // Optional: Add a helper to update profile after email verification
    updateProfileEmailVerified: async (userId) => {
      const { error } = await supabase
        .from('profiles')
        .update({ email_verified: true })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to update profile email status:', error);
      }
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}