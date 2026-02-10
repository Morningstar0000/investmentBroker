"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../client";
import { useToast } from "./ToastContext";


// Create a simple toast function for now
// const addToast = (message, type = "info") => {
//   console.log(`[Toast ${type}]: ${message}`);
//   // You can add actual toast logic later
// };

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false); // Add this for operation loading

  // Get the real toast function
  let addToast;
  try {
    const toastContext = useToast();
    addToast = toastContext.addToast;
  } catch (error) {
    // Fallback if toast context is not available
    addToast = (message, type = "info") => {
      console.log(`[Toast ${type}]: ${message}`);
    };
    console.warn('Toast context not available, using console fallback');
  }

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
    // Listen for auth changes
const {
  data: { subscription },
} = supabase.auth.onAuthStateChange(async (event, session) => {
  setUser(session?.user ?? null);
  setLoading(false);

  // Remove or comment out the SIGNED_IN toast - signIn function already shows it
  // if (event === "SIGNED_IN") {
  //   addToast("Successfully signed in!", "success");
  // }
  
  if (event === "SIGNED_OUT") {
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
    loading: operationLoading, // Use operationLoading for button loading states
    operationLoading, // Also expose it if needed

    signIn: async (email, password) => {
  try {
    setOperationLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Always show the same message for security
      addToast('Invalid email or password. Please check your credentials.', 'error');
      throw error;
    }
    
    addToast('Successfully signed in!', 'success');
    return data;
  } catch (error) {
    throw error;
  } finally {
    setOperationLoading(false);
  }
},

    signUp: async (credentials) => {
      const { firstName, lastName, phone, country, email, password, address } = credentials;

      try {
        setOperationLoading(true); // Start loading
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
          addToast(`'Invalid email or password. Please check your credentials.`, 'error');
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
      } finally {
        setOperationLoading(false); // End loading
      }
    },

    resetPassword: async (email) => {
      try {
        setOperationLoading(true); // Start loading
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
      } finally {
        setOperationLoading(false); // End loading
      }
    },

    resendVerification: async (email) => {
      try {
        setOperationLoading(true); // Start loading
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
      } finally {
        setOperationLoading(false); // End loading
      }
    },

    signOut: async () => {
      setOperationLoading(true); // Start loading
      try {
        await supabase.auth.signOut();
        addToast('Signed out successfully', 'info');
      } finally {
        setOperationLoading(false); // End loading
      }
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