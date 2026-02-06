// "use client";

// // Add at the top of your App.jsx
// if (import.meta.hot) {
//   import.meta.hot.accept(() => {
//     // Preserve important state during HMR
//     // const currentUser = user;
//     // const currentPage = currentPage;
//     // The component will re-render but state might be preserved
//   });
// }

import React, { useState, useEffect } from "react";

import "./App.css";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import TradingSection from "./components/TradingSection";
import ProfileSection from "./components/ProfileSection";
import WalletSection from "./components/WalletSection";
import AccountTypeSection from "./components/account-type-section";
import SettingsPage from "./components/settings";
import AuthScreen from "./components/AuthScreen";
// Import the new components
import HomePage from "./Pages/HomePage";
import CompanyPage from "./Pages/RegulationPage";
import TradingPage from "./Pages/AccountPage";
import Layout from "./Pages/Layout";
import AccountPage from "./Pages/AccountPage";
import ClientProtection from "./Pages/ClientProtection";
import DepositPage from "./Pages/DepositPage";
import AboutUsPage from "./Pages/AboutUsPage";
import RegulationPage from "./Pages/RegulationPage";
import CommoditiesPage from "./Pages/CommoditiesPage";
import CryptoPage from "./Pages/CryptoPage";
import ForexPage from "./Pages/ForexPage";
import AdminPaymentDetails from "./Admin/AdminPaymentDetails";
import AdminLogin from "./Admin/AdminLogin";
import AdminChatPanel from "./Admin/AdminChatPanel";
import AdminLayout from "./Admin/AdminLayout";
import AdminPanel from "./Admin/AdminPanel";
import ChatBox from "./Pages/ChatBox"; // Add this import
import AdminNotifications from "./Admin/AdminNotifications";
import { MessageCircle } from "./components/ui/Icons";
import { ToastProvider } from "../src/context/ToastContext";
import { useToast } from "../src/context/ToastContext";
import { supabase } from "./client";
import AdminUserMetrics from "./Admin/AdminUserMetrics";
import AdminTradingPositions from "./Admin/AdminTradingPositions";
import { updateUserMetrics } from "./utils/userMetrics";
import AdminTransactions from "./Admin/AdminTransactions";
import AdminInvestorsPage from "../src/Admin/AdminInvestors";
import CreateInvestorPage from "../src/Admin/createInvestors";
import EditInvestorPage from "../src/Admin/editInvestors";
import UpdatePassword from "./components/UpdatePassword";


// Change it to check for VITE_SUPABASE_KEY instead:
console.log('Environment variables check:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

function App() {
  const { addToast } = useToast();
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Navigation state
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add this with your other state declarations
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [systemUnreadCount, setSystemUnreadCount] = useState(0);

  
    
  // In your main App component
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
  // Check for hash-based routing
  const hash = window.location.hash.substring(1);
  if (hash === 'update-password') {
    setCurrentPage('update-password');
  }
}, []);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setAuthLoading(false);

      // If user is logged in, set to dashboard, otherwise stay on home
      if (session?.user) {
        setCurrentPage("app");
      }
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        setCurrentPage("app");
      } else {
        setCurrentPage("home");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Add this function to generate unique session IDs
  const generateSessionId = () => {
    let sessionId = sessionStorage.getItem("appSessionId");
    if (!sessionId) {
      sessionId =
        "session-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("appSessionId", sessionId);
    }
    return sessionId;
  };

  // Add this useEffect for tab isolation
  useEffect(() => {
    // Generate or get current tab ID
    let tabId = localStorage.getItem("currentTabId");
    if (!tabId) {
      tabId =
        "tab-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("currentTabId", tabId);
    }

    // Check URL for tab parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlTabId = urlParams.get("tab");

    // If URL has a different tab ID, update our tab ID
    if (urlTabId && urlTabId !== tabId) {
      tabId = urlTabId;
      localStorage.setItem("currentTabId", tabId);
    }

    // Only auto-login if this tab matches the admin session tab
    const adminUser = localStorage.getItem("adminUser");
    const isAdmin = localStorage.getItem("isAdmin");

    if (adminUser && isAdmin === "true") {
      try {
        const userData = JSON.parse(adminUser);
        if (userData.tabId === tabId) {
          setUser(userData);
          if (window.location.pathname.includes("admin")) {
            setCurrentPage("admin");
          }
        }
      } catch (error) {
        console.error("Error parsing admin user data:", error);
      }
    }
  }, []);

  // Add this function to generate tab-specific session IDs
  const generateTabId = () => {
    let tabId = localStorage.getItem("currentTabId");
    if (!tabId) {
      tabId =
        "tab-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("currentTabId", tabId);
    }
    return tabId;
  };

  // Update handleAdminLogin to use sessionStorage instead of localStorage
  const handleAdminLogin = (adminUser) => {
    console.log("Admin login triggered with:", adminUser);

    const sessionId = generateSessionId();

    // Use sessionStorage instead of localStorage for admin data
    const adminSession = {
      ...adminUser,
      loginTime: new Date().toISOString(),
      sessionId: sessionId,
    };

    sessionStorage.setItem("adminUser", JSON.stringify(adminSession));
    sessionStorage.setItem("isAdmin", "true");

    // Force state update
    setUser(adminUser);
    setCurrentPage("admin");

    console.log("Admin login completed for session:", sessionId);
  };

  // Update the cross-tab sync to ignore other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Only react to sessionStorage changes (not localStorage)
      if (e.key === "adminUser" || e.key === "isAdmin") {
        const currentSessionId = sessionStorage.getItem("appSessionId");
        const adminUser = sessionStorage.getItem("adminUser");
        const isAdmin = sessionStorage.getItem("isAdmin");

        if (adminUser && isAdmin === "true") {
          try {
            const userData = JSON.parse(adminUser);
            // Only update if this is from the same session
            if (userData.sessionId === currentSessionId) {
              console.log("Syncing admin session from same tab");
              setUser(userData);
            } else {
              console.log("Ignoring admin session from different tab");
            }
          } catch (error) {
            console.error("Error parsing admin user data:", error);
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Add this to handle initial load without affecting other tabs
  useEffect(() => {
    const currentTabId = generateTabId();
    const adminUser = localStorage.getItem("adminUser");
    const isAdmin = localStorage.getItem("isAdmin");

    if (adminUser && isAdmin === "true") {
      try {
        const userData = JSON.parse(adminUser);
        // Only auto-login if this tab was the one that logged in
        if (userData.tabId === currentTabId) {
          setUser(userData);
          if (window.location.pathname.includes("admin")) {
            setCurrentPage("admin");
          }
        }
      } catch (error) {
        console.error("Error parsing admin user data:", error);
      }
    }
  }, []);

  // Update your handleLogin for normal users:
  const handleLogin = async (userData) => {
    setAuthLoading(true);
    try {
      // Clear any admin session first
      localStorage.removeItem("adminUser");
      localStorage.removeItem("isAdmin");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });

      if (error) throw error;

      if (data.user) {
        const userWithRole = {
          ...data.user,
          role: "user", // Always set as user for normal login
        };
        setUser(userWithRole);
        setCurrentPage("dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      // Broadcast sign out to other tabs BEFORE clearing
      localStorage.setItem("global_signout", Date.now().toString());

      // Clear ALL storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies more thoroughly
      const cookies = document.cookie.split(";");
      for (let cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie =
          name +
          "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" +
          window.location.hostname;
      }

      // Supabase logout
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear state
      setUser(null);
      setCurrentPage("home");
      setActiveSection("dashboard");

      // Force navigation
      setTimeout(() => {
        // Use replaceState to avoid back button issues
        window.history.replaceState(null, "", "/");
        window.location.reload(true);
      }, 50);
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect on error
      window.location.href = "/";
    } finally {
      setAuthLoading(false);
    }
  };

  // Add these functions in your App.jsx

// 1. Load user settings on login
useEffect(() => {
  if (user?.id) {
    loadUserSettings();
  }
}, [user]);

const loadUserSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not "no rows" error
      console.error('Error loading settings:', error);
      return;
    }
    
    if (data) {
      // Convert snake_case from DB to camelCase for React state
      const camelCaseSettings = {
        notifications: data.notifications,
        emailAlerts: data.email_alerts,
        riskTolerance: data.risk_tolerance,
        autoFollow: data.auto_follow,
        maxCopyAmount: data.max_copy_amount
      };
      
      setUserSettings(camelCaseSettings);
    } else {
      // No settings exist yet, use defaults
      const defaultSettings = {
        notifications: true,
        emailAlerts: true,
        riskTolerance: "medium",
        autoFollow: false,
        maxCopyAmount: 1000
      };
      
      // Convert camelCase to snake_case for DB insert
      const defaultSnakeCase = {
        notifications: defaultSettings.notifications,
        email_alerts: defaultSettings.emailAlerts,
        risk_tolerance: defaultSettings.riskTolerance,
        auto_follow: defaultSettings.autoFollow,
        max_copy_amount: defaultSettings.maxCopyAmount
      };
      
      // Create initial record
      await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          ...defaultSnakeCase
        });
      
      setUserSettings(defaultSettings);
    }
  } catch (error) {
    console.error('Error in loadUserSettings:', error);
  }
};

// 2. Handle settings update
const handleSettingsUpdate = async (camelCaseSettings) => {
  try {
    if (!user?.id) return;
    
    console.log('Saving settings:', camelCaseSettings);
    
    // Convert camelCase to snake_case for database
    const snakeCaseSettings = {
      notifications: camelCaseSettings.notifications,
      email_alerts: camelCaseSettings.emailAlerts,
      risk_tolerance: camelCaseSettings.riskTolerance,
      auto_follow: camelCaseSettings.autoFollow,
      max_copy_amount: camelCaseSettings.maxCopyAmount
    };
    
    // Update in database
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ...snakeCaseSettings,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    // Update local state (keep as camelCase)
    setUserSettings(camelCaseSettings);
    
    // Show success message
    console.log('Settings saved successfully');
    // addToast('Settings saved!', 'success');
    
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error; // Re-throw so SettingsPage can show error
  }
};

  // // Handle logout
  // const handleLogout = async () => {
  //   setAuthLoading(true);
  //   try {
  //     const { error } = await supabase.auth.signOut();
  //     if (error) throw error;
  //     setUser(null);
  //     setCurrentPage("home"); // Go back to home after logout
  //     setActiveSection("dashboard");
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //   } finally {
  //     setAuthLoading(false);
  //   }
  // };

  // Application states
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    riskTolerance: "",
    profilePictureUrl: "",
    accountTypeId: null,
  });

  const [metricsData, setMetricsData] = useState({
    totalBalance: 0,
    todayPnL: 0,
    winRate: 0,
    openPositions: 0,
  });

  const [openPositionsData, setOpenPositionsData] = useState([]);
  const [closedPositionsData, setClosedPositionsData] = useState([]);
  const [tradingSummaryData, setTradingSummaryData] = useState({
    total_open_pnl: 0,
    total_closed_pnl: 0,
    today_pnl: 0,
    total_commission: 0,
  });

  const [accountTypes, setAccountTypes] = useState([]);
  const [selectedAccountTypeDetails, setSelectedAccountTypeDetails] = useState(null);
  const [userSettings, setUserSettings] = useState({
    notifications: true,
    emailAlerts: true,
    riskTolerance: "medium",
    autoFollow: false,
    maxCopyAmount: 1000,
  });

  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [positionsSaving, setPositionsSaving] = useState(false);

  // Calculate duration for closed positions
  const calculateClosedDurationString = (openTime, closeTime) => {
    const open = new Date(openTime);
    const close = new Date(closeTime);
    const diff = close - open;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let durationString = "";
    if (days > 0) durationString += `${days}d `;
    if (hours % 24 > 0) durationString += `${hours % 24}h `;
    if (minutes % 60 > 0) durationString += `${minutes % 60}m `;
    if (seconds % 60 > 0 && durationString.trim() === "")
      durationString += `${seconds % 60}s`;

    return durationString.trim() || "0m";
  };

  // Fetch data and set up subscriptions
  useEffect(() => {
    if (!user) return;

    const fetchAndSubscribeUserData = async () => {
      setLoading(true);
      setDataError("");

      try {
        // Fetch account types
        const { data: fetchedAccountTypes, error: accountTypesError } =
          await supabase.from("account_types").select("*");
        if (accountTypesError) throw accountTypesError;
        setAccountTypes(fetchedAccountTypes || []);

        // Fetch or create profile
        const { data: initialProfile, error: initialProfileError } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        let currentProfileData;
        if (initialProfileError?.code !== "PGRST116" && initialProfileError) {
          throw initialProfileError;
        }

        if (initialProfile) {
          console.log("Profile from DB:", initialProfile);
          console.log("Nationality value:", initialProfile?.nationality);
          currentProfileData = {
            firstName: initialProfile.first_name || "",
            lastName: initialProfile.last_name || "",
            email: initialProfile.email || user.email || "",
            phone: initialProfile.phone || "",
            address: initialProfile.address || "",
            riskTolerance: initialProfile.risk_tolerance || "",
            accountTypeId: initialProfile.account_type_id || null,
            profilePictureUrl: initialProfile.profile_picture_url || "",
            followedInvestorId: initialProfile.followed_investor_id || null,
            nationality: initialProfile.nationality || "",
          };
        } else {
          const defaultProfile = {
            id: user.id,
            first_name:
              user.user_metadata?.first_name ||
              user.user_metadata?.full_name?.split(" ")[0] ||
              "Trader",
            last_name:
              user.user_metadata?.last_name ||
              user.user_metadata?.full_name?.split(" ")[1] ||
              "User",
            email: user.email,
            phone: user.user_metadata?.phone || "",
            nationality: user.user_metadata?.country || "",
            address: "",
            risk_tolerance: "Moderate",
            account_type_id: null,
            profile_picture_url: "",
            followed_investor_id: null,
          };

          const { error: insertError } = await supabase
            .from("profiles")
            .insert([defaultProfile]);
          if (insertError) throw insertError;

          currentProfileData = {
            firstName: defaultProfile.first_name,
            lastName: defaultProfile.last_name,
            email: defaultProfile.email,
            phone: defaultProfile.phone,
            address: defaultProfile.address,
            riskTolerance: defaultProfile.risk_tolerance,
            accountTypeId: defaultProfile.account_type_id,
            profilePictureUrl: defaultProfile.profile_picture_url,
            followedInvestorId: defaultProfile.followed_investor_id,
          };
        }
        setProfileData(currentProfileData);

        // Set account type details
        if (currentProfileData.accountTypeId && fetchedAccountTypes) {
          const details = fetchedAccountTypes.find(
            (type) => type.id === currentProfileData.accountTypeId
          );
          setSelectedAccountTypeDetails(details || null);
        }

        // Fetch or create user metrics
        const { data: initialMetrics, error: initialMetricsError } =
          await supabase
            .from("user_metrics")
            .select("*")
            .eq("user_id", user.id)
            .single();

        // Add debug logging
        console.log("🔍 Fetching user_metrics for:", user.id);
        console.log("📊 Initial metrics from DB:", initialMetrics);
        console.log("❌ Error (if any):", initialMetricsError);

        if (initialMetricsError?.code !== "PGRST116" && initialMetricsError) {
          throw initialMetricsError;
        }

        if (initialMetrics) {
          // Calculate equity if not present in DB
          const equity =
            initialMetrics.equity !== undefined
              ? initialMetrics.equity
              : (initialMetrics.account_balance || 0) +
              (initialMetrics.total_open_pnl || 0);

          console.log("🧮 Dashboard Metrics Calculation:", {
            account_balance: initialMetrics.account_balance,
            total_open_pnl: initialMetrics.total_open_pnl,
            equity_from_db: initialMetrics.equity,
            calculated_equity: equity,
            open_positions: initialMetrics.open_positions,
            today_pnl_percent: initialMetrics.today_pnl_percent,
            win_rate: initialMetrics.win_rate,
          });

          setMetricsData({
            totalBalance: initialMetrics.account_balance || 0,
            todayPnLPercent: initialMetrics.today_pnl_percent || 0.0,
            winRate: initialMetrics.win_rate || 0,
            openPositions: initialMetrics.open_positions || 0,
            totalOpenPnl: initialMetrics.total_open_pnl || 0,
            equity: equity,
          });
        } else {
          console.log("📝 Creating default metrics for new user");

          const defaultMetrics = {
            user_id: user.id,
            account_balance: 0,
            today_pnl_percent: 0.0,
            win_rate: 0,
            open_positions: 0,
            total_open_pnl: 0,
            equity: 0, // Add this - VERY IMPORTANT!
          };

          console.log("➕ Inserting default metrics:", defaultMetrics);

          const { error: insertError, data: insertedData } = await supabase
            .from("user_metrics")
            .insert([defaultMetrics])
            .select(); // Add .select() to get the inserted data back

          if (insertError) {
            console.error("❌ Error inserting default metrics:", insertError);
            throw insertError;
          }

          console.log("✅ Default metrics inserted:", insertedData);

          setMetricsData({
            totalBalance: defaultMetrics.account_balance,
            todayPnLPercent: defaultMetrics.today_pnl_percent,
            winRate: defaultMetrics.win_rate,
            openPositions: defaultMetrics.open_positions,
            totalOpenPnl: defaultMetrics.total_open_pnl,
            equity: defaultMetrics.equity,
          });
        }

        // Fetch or create trading summary
        const { data: tradingSummary, error: tradingSummaryError } =
          await supabase
            .from("trading_summary")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (tradingSummaryError?.code !== "PGRST116" && tradingSummaryError) {
          throw tradingSummaryError;
        }

        // Fetch ALL open positions data (not just IDs)
        const { data: openPositionsData } = await supabase
          .from("open_positions")
          .select("*")
          .eq("user_id", user.id);

        // Fetch ALL closed positions data (not just IDs)
        const { data: closedPositionsData } = await supabase
          .from("closed_positions")
          .select("*")
          .eq("user_id", user.id);

        const openPositions = openPositionsData || [];
        const closedPositions = closedPositionsData || [];

        const totalOpenPositions = openPositions.length;
        const totalClosedPositions = closedPositions.length;
        const totalPositions = totalOpenPositions + totalClosedPositions;

        // Calculate Open P&L (sum of pnl from open positions)
        const totalOpenPnl = openPositions.reduce(
          (sum, pos) => sum + (pos.pnl || 0),
          0
        );

        // Calculate Closed P&L (sum of pnl from closed positions)
        const totalClosedPnl = closedPositions.reduce(
          (sum, pos) => sum + (pos.pnl || 0),
          0
        );

        // Calculate Today's P&L (closed positions from today)
        const today = new Date().toISOString().split("T")[0];
        const todayPnl = closedPositions
          .filter((pos) => pos.close_time && pos.close_time.startsWith(today))
          .reduce((sum, pos) => sum + (pos.pnl || 0), 0);

        // Calculate Total Commission (from both open and closed positions)
        const openCommission = openPositions.reduce(
          (sum, pos) => sum + (pos.commission || 0),
          0
        );
        const closedCommission = closedPositions.reduce(
          (sum, pos) => sum + (pos.commission || 0),
          0
        );
        const totalCommission = openCommission + closedCommission;

        // Calculate Win Rate (percentage of winning trades)
        const totalTrades = totalPositions;
        const winningTrades = closedPositions.filter(
          (pos) => pos.result === "win"
        ).length;
        // const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

        if (tradingSummary) {
          // Update the trading summary WITHOUT updated_at
          const { error: updateError } = await supabase
            .from("trading_summary")
            .update({
              total_open_pnl: totalOpenPnl,
              total_closed_pnl: totalClosedPnl,
              today_pnl: todayPnl,
              total_commission: totalCommission,
              // NO updated_at here
            })
            .eq("user_id", user.id);

          if (updateError) throw updateError;

          // Set the updated trading summary data for frontend
          setTradingSummaryData({
            ...tradingSummary,
            total_open_pnl: totalOpenPnl,
            total_closed_pnl: totalClosedPnl,
            today_pnl: todayPnl,
            total_commission: totalCommission,
          });
        } else {
          // Create new trading summary WITHOUT timestamps
          const defaultSummary = {
            user_id: user.id,
            total_open_pnl: totalOpenPnl,
            total_closed_pnl: totalClosedPnl,
            today_pnl: todayPnl,
            total_commission: totalCommission,
            // NO created_at or updated_at here
          };

          const { data: insertedSummary, error: insertError } = await supabase
            .from("trading_summary")
            .insert([defaultSummary])
            .select()
            .single();

          if (insertError) throw insertError;

          setTradingSummaryData(insertedSummary || defaultSummary);
        }
        // Also set positions for the TradingSection component
        setOpenPositionsData(openPositionsData);
        setClosedPositionsData(closedPositionsData);

        // Set up realtime subscriptions
        const subscriptions = [
          supabase
            .channel(`profiles_for_${user.id}`)
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "profiles",
                filter: `id=eq.${user.id}`,
              },
              (payload) => {
                const updatedProfile = {
                  firstName: payload.new.first_name || "",
                  lastName: payload.new.last_name || "",
                  email: payload.new.email || "",
                  phone: payload.new.phone || "",
                  address: payload.new.address || "",
                  riskTolerance: payload.new.risk_tolerance || "",
                  accountTypeId: payload.new.account_type_id || null,
                  profilePictureUrl: payload.new.profile_picture_url || "",
                  followedInvestorId: payload.new.followed_investor_id || null,
                };
                setProfileData(updatedProfile);
                if (
                  payload.old.followed_investor_id !==
                  payload.new.followed_investor_id
                ) {
                  loadFollowedInvestors(user.id);
                }
              }
            )
            .subscribe(),

          supabase
            .channel(`metrics_for_${user.id}`)
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "user_metrics",
                filter: `user_id=eq.${user.id}`,
              },
              (payload) => {
                setMetricsData({
                  totalBalance: payload.new.account_balance,
                  todayPnL: payload.new.today_pnl,
                  winRate: payload.new.win_rate,
                  openPositions: payload.new.open_positions,
                });
              }
            )
            .subscribe(),

          supabase
            .channel(`open_positions_for_${user.id}`)
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "open_positions",
                filter: `user_id=eq.${user.id}`,
              },
              (payload) => {
                if (payload.eventType === "INSERT") {
                  setOpenPositionsData((prev) => [...prev, payload.new]);
                } else if (payload.eventType === "UPDATE") {
                  setOpenPositionsData((prev) =>
                    prev.map((pos) =>
                      pos.id === payload.old.id ? payload.new : pos
                    )
                  );
                } else if (payload.eventType === "DELETE") {
                  setOpenPositionsData((prev) =>
                    prev.filter((pos) => pos.id !== payload.old.id)
                  );
                }
              }
            )
            .subscribe(),

          supabase
            .channel(`closed_positions_for_${user.id}`)
            .on(
              "postgres_changes",
              {
                event: "*",
                schema: "public",
                table: "closed_positions",
                filter: `user_id=eq.${user.id}`,
              },
              (payload) => {
                if (payload.eventType === "INSERT") {
                  setClosedPositionsData((prev) => [...prev, payload.new]);
                } else if (payload.eventType === "UPDATE") {
                  setClosedPositionsData((prev) =>
                    prev.map((pos) =>
                      pos.id === payload.old.id ? payload.new : pos
                    )
                  );
                } else if (payload.eventType === "DELETE") {
                  setClosedPositionsData((prev) =>
                    prev.filter((pos) => pos.id !== payload.old.id)
                  );
                }
              }
            )
            .subscribe(),
        ];

        return () => {
          subscriptions.forEach((sub) => supabase.removeChannel(sub));
        };
      } catch (error) {
        console.error("Error loading data:", error);
        setDataError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSubscribeUserData();
  }, [user]);

  // Data update handlers
  const handleProfileUpdate = async (updatedProfile) => {
    if (!user) {
      setDataError("Please sign in to update your profile");
      return;
    }
    setProfileSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: updatedProfile.firstName,
          last_name: updatedProfile.lastName,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
          address: updatedProfile.address,
          risk_tolerance: updatedProfile.riskTolerance,
          account_type_id: updatedProfile.accountTypeId,
          profile_picture_url: updatedProfile.profilePictureUrl,
        })
        .eq("id", user.id);

      if (error) throw error;
      setProfileData(updatedProfile);
    } catch (error) {
      setDataError(error.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAccountTypeSelect = async (accountTypeId) => {
    if (!user) {
      setDataError("Please sign in to update account type");
      return;
    }
    setProfileSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_type_id: accountTypeId })
        .eq("id", user.id);

      if (error) throw error;
      setProfileData((prev) => ({ ...prev, accountTypeId }));
    } catch (error) {
      setDataError(error.message);
    } finally {
      setProfileSaving(false);
    }
  };


  const handleOpenPositionClose = async (positionToClose) => {
    if (!user) {
      setDataError("Please sign in to close positions");
      return;
    }
    setPositionsSaving(true);
    try {
      const closeTime = new Date().toISOString();
      const durationString = calculateClosedDurationString(
        positionToClose.open_time,
        closeTime
      );

      const closedPosition = {
        user_id: user.id,
        pair: positionToClose.pair,
        type: positionToClose.type,
        size: positionToClose.size,
        swap: positionToClose.swap,
        open_price: positionToClose.open_price,
        close_price: positionToClose.current_price,
        pnl: positionToClose.pnl,
        pnl_percent: positionToClose.pnl_percent,
        open_time: positionToClose.open_time,
        close_time: closeTime,
        result: positionToClose.pnl >= 0 ? "win" : "loss",
        duration: durationString,
        stop_loss: positionToClose.stop_loss,
        take_profit: positionToClose.take_profit,
        commission: positionToClose.commission,
      };

      // 1. Insert into closed_positions
      const { error: insertError } = await supabase
        .from("closed_positions")
        .insert([closedPosition]);
      if (insertError) throw insertError;

      // 2. Delete from open_positions
      const { error: deleteError } = await supabase
        .from("open_positions")
        .delete()
        .eq("id", positionToClose.id);
      if (deleteError) throw deleteError;

      // 3. 🔥 CALCULATE NEW METRICS
      console.log("💰 Calculating new metrics after closing position...");

      // Get current account balance and total open P&L
      const { data: currentMetrics, error: metricsError } = await supabase
        .from("user_metrics")
        .select("account_balance, total_open_pnl")
        .eq("user_id", user.id)
        .maybeSingle();

      if (metricsError && metricsError.code !== "PGRST116") {
        console.error("Error fetching current metrics:", metricsError);
      }

      const currentBalance = currentMetrics?.account_balance || 0;
      const currentOpenPnl = currentMetrics?.total_open_pnl || 0;

      // Calculate new values
      const newBalance = currentBalance + positionToClose.pnl;
      const newTotalOpenPnl = currentOpenPnl - positionToClose.pnl; // Remove closed position's P&L from open P&L
      const newEquity = newBalance + newTotalOpenPnl;

      console.log("📊 Calculations:", {
        currentBalance,
        currentOpenPnl,
        positionPnl: positionToClose.pnl,
        newBalance,
        newTotalOpenPnl,
        newEquity
      });

      // 4. UPDATE USER METRICS DIRECTLY (immediate update)
      console.log("🏦 Updating user_metrics directly...");
      const { error: balanceError } = await supabase
        .from("user_metrics")
        .upsert(
          {
            user_id: user.id,
            account_balance: newBalance,
            total_open_pnl: newTotalOpenPnl,
            equity: newEquity,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (balanceError) {
        console.error("Error updating user_metrics:", balanceError);
      } else {
        console.log("✅ User_metrics updated directly:", {
          newBalance,
          newTotalOpenPnl,
          newEquity,
        });
      }

      // 5. CALL UPDATEUSERMETRICS TO RECALCULATE EVERYTHING (double-check)
      console.log("🔄 Calling updateUserMetrics for complete recalculation...");
      const updateResult = await updateUserMetrics(user.id);

      if (updateResult.success) {
        console.log("✅ updateUserMetrics completed:", updateResult.metrics);
      } else {
        console.error("❌ updateUserMetrics failed:", updateResult.error);
      }

      // 6. UPDATE LOCAL STATE IMMEDIATELY
      console.log("🔄 Updating local state...");
      setMetricsData((prev) => ({
        ...prev,
        totalBalance: newBalance,
        equity: newEquity,
        totalOpenPnl: newTotalOpenPnl,
        openPositions: (prev.openPositions || 0) - 1,
      }));

      // 7. REFRESH TRADING DATA
      console.log("🔄 Refreshing trading data...");
      await fetchTradingData();

      // Add toast instead
      const pnlSign = positionToClose.pnl >= 0 ? '+' : ''
      const pnlAmount = `$${Math.abs(positionToClose.pnl).toFixed(2)}`

      addToast(
        `Position closed successfully: ${positionToClose.pair} (${pnlSign}${pnlAmount})`,
        'success',
        4000
      )

      // Log final state
      console.log("🎯 FINAL STATE AFTER CLOSING POSITION:", {
        positionClosed: positionToClose.pair,
        pnl: positionToClose.pnl,
        newBalance,
        newEquity,
        newTotalOpenPnl,
      });

    } catch (error) {
      console.error("❌ Error closing position:", error);
      setDataError(error.message);
      addToast(`Failed to close position: ${error.message}`, 'error', 5000)
    } finally {
      setPositionsSaving(false);
    }
  };

  const fetchTradingData = async () => {
    if (!user?.id) return;

    try {
      // Fetch open positions
      const { data: openPositions } = await supabase
        .from("open_positions")
        .select("*")
        .eq("user_id", user.id);

      // Fetch closed positions
      const { data: closedPositions } = await supabase
        .from("closed_positions")
        .select("*")
        .eq("user_id", user.id);

      // Fetch user metrics for Dashboard
      const { data: userMetrics } = await supabase
        .from("user_metrics")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Calculate metrics
      const openPosList = openPositions || [];
      const closedPosList = closedPositions || [];

      const totalOpenPnl = openPosList.reduce(
        (sum, pos) => sum + (pos.pnl || 0),
        0
      );

      // CRITICAL FIX: Account Balance should be calculated from closed positions
      const accountBalance = closedPosList.reduce(
        (sum, pos) => sum + (pos.pnl || 0),
        0
      );

      // CRITICAL FIX: Equity = Account Balance + Total Open P&L
      const equity = accountBalance + totalOpenPnl;

      console.log("🔄 fetchTradingData - Recalculated metrics:", {
        openPositions: openPosList.length,
        closedPositions: closedPosList.length,
        totalOpenPnl,
        accountBalance,
        equity,
        userMetricsFromDB: userMetrics
      });

      // CRITICAL: Update metricsData state - this is what the Dashboard displays
      setMetricsData(prev => ({
        ...prev,
        totalBalance: accountBalance,
        totalOpenPnl: totalOpenPnl,
        equity: equity,
        openPositions: openPosList.length,
        // Keep other metrics from database if available
        todayPnLPercent: userMetrics?.today_pnl_percent || prev.todayPnLPercent || 0,
        winRate: userMetrics?.win_rate || prev.winRate || 0
      }));

      // Update positions state
      setOpenPositionsData(openPosList);
      setClosedPositionsData(closedPosList);

      // Calculate today's P&L
      const today = new Date().toISOString().split("T")[0];
      const todayPnl = closedPosList
        .filter((pos) => pos.close_time && pos.close_time.startsWith(today))
        .reduce((sum, pos) => sum + (pos.pnl || 0), 0);

      const openCommission = openPosList.reduce(
        (sum, pos) => sum + (pos.commission || 0),
        0
      );
      const closedCommission = closedPosList.reduce(
        (sum, pos) => sum + (pos.commission || 0),
        0
      );
      const totalCommission = openCommission + closedCommission;

      // Update trading summary state
      setTradingSummaryData({
        total_open_pnl: totalOpenPnl,
        total_closed_pnl: accountBalance, // Use accountBalance, not totalClosedPnl
        today_pnl: todayPnl,
        total_commission: totalCommission,
        total_positions: openPosList.length + closedPosList.length,
        total_open_positions: openPosList.length,
      });

      // Also ensure user_metrics is updated in database
      if (userMetrics) {
        // Update existing user_metrics
        await supabase
          .from("user_metrics")
          .update({
            account_balance: accountBalance,
            total_open_pnl: totalOpenPnl,
            equity: equity,
            open_positions: openPosList.length,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);
      } else {
        // Create new user_metrics if doesn't exist
        await supabase
          .from("user_metrics")
          .insert({
            user_id: user.id,
            account_balance: accountBalance,
            total_open_pnl: totalOpenPnl,
            equity: equity,
            open_positions: openPosList.length,
            today_pnl_percent: 0,
            win_rate: 0
          });
      }

      // Update trading_summary table (optional, but keeps it consistent)
      const { data: existingSummary } = await supabase
        .from("trading_summary")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingSummary) {
        await supabase
          .from("trading_summary")
          .update({
            total_open_pnl: totalOpenPnl,
            total_closed_pnl: accountBalance,
            total_commission: totalCommission,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      } else {
        await supabase.from("trading_summary").insert({
          user_id: user.id,
          total_open_pnl: totalOpenPnl,
          total_closed_pnl: accountBalance,
          total_commission: totalCommission,
          today_pnl: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

    } catch (error) {
      console.error("Error fetching trading data:", error);
      setDataError("Failed to load trading data");
    }
  };

  // Remove the mockInvestors array and replace with state for investors
  const [followedInvestors, setFollowedInvestors] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [selectedInvestor, setSelectedInvestor] = useState(null);

  // Function to fetch investors from database
  const fetchInvestors = async () => {
    try {
      const { data, error } = await supabase.from("investors").select("*");

      if (error) throw error;
      setInvestors(data || []);
    } catch (error) {
      console.error("Error fetching investors:", error);
      setDataError("Failed to load investors data");
    }
  };

  // Update loadFollowedInvestors to get the followed investor from the user's profile
  const loadFollowedInvestors = async (userId) => {
    try {
      // First, get the user's profile to see which investor they're following
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("followed_investor_id")
        .eq("id", userId)
        .single();

      if (profileError && profileError.code !== "PGRST116") throw profileError;

      // If the user has a followed investor, get its details
      if (profile && profile.followed_investor_id) {
        const { data: investorData, error: investorError } = await supabase
          .from("investors")
          .select("*")
          .eq("id", profile.followed_investor_id)
          .single();

        if (investorError) throw investorError;

        if (investorData) {
          setFollowedInvestors([investorData]);
          setSelectedInvestor(investorData);
        }
      } else {
        setFollowedInvestors([]);
        setSelectedInvestor(null);
      }
    } catch (error) {
      console.error("Error loading followed investors:", error);
    }
  };

  // Fetch investors when component mounts
  useEffect(() => {
    if (user) {
      fetchInvestors();
    }
  }, [user]);

  // Function to handle investor selection (follow/unfollow) - SINGLE SELECTION
  const handleInvestorSelect = async (investor) => {
    if (!user) return;

    try {
      if (investor === null) {
        // Stop following all investors
        // First update the profile
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ followed_investor_id: null })
          .eq("id", user.id);

        if (profileError) throw profileError;

        // Then remove from followed_investors table
        const { error: deleteError } = await supabase
          .from("followed_investors")
          .delete()
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        // Update state
        setFollowedInvestors([]);
        setSelectedInvestor(null);
      } else if (selectedInvestor && selectedInvestor.id === investor.id) {
        // If clicking the already selected investor, unfollow them
        // First update the profile
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ followed_investor_id: null })
          .eq("id", user.id);

        if (profileError) throw profileError;

        // Then remove from followed_investors table
        const { error: deleteError } = await supabase
          .from("followed_investors")
          .delete()
          .eq("user_id", user.id)
          .eq("investor_id", investor.id);

        if (deleteError) throw deleteError;

        // Update state
        setFollowedInvestors([]);
        setSelectedInvestor(null);
      } else {
        // First, update the user's profile with the new followed investor
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ followed_investor_id: investor.id })
          .eq("id", user.id);

        if (profileError) throw profileError;

        // Then, remove any existing followed investors (only allow one)
        const { error: deleteError } = await supabase
          .from("followed_investors")
          .delete()
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;

        // Then add the new investor to followed_investors table
        const { error: insertError } = await supabase
          .from("followed_investors")
          .insert([{ user_id: user.id, investor_id: investor.id }]);

        if (insertError) throw insertError;

        // Update state
        setFollowedInvestors([investor]);
        setSelectedInvestor(investor);
      }
    } catch (error) {
      console.error("Error updating followed investors:", error);
      setDataError("Failed to update followed investors");
    }
  };

  // Load followed investors when user changes
  useEffect(() => {
    if (user) {
      loadFollowedInvestors(user.id);
    }
  }, [user]);

  // In App.jsx, update the fetchUnreadCounts function:
  useEffect(() => {
    if (!user?.id || !supabase) {
      setChatUnreadCount(0);
      setSystemUnreadCount(0);
      return;
    }

    const fetchUnreadCounts = async () => {
      try {
        // 1. FIRST, get all chat rooms for this user
        const { data: rooms, error: roomsError } = await supabase
          .from("chat_rooms")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "open"); // Only count messages in open rooms

        if (roomsError) throw roomsError;

        let chatCount = 0;

        // 2. If user has rooms, count unread messages in those rooms
        if (rooms && rooms.length > 0) {
          const roomIds = rooms.map((room) => room.id);

          const { count, error: chatError } = await supabase
            .from("chat_messages")
            .select("*", { count: "exact", head: true })
            .in("room_id", roomIds) // Use IN clause for multiple rooms
            .eq("is_read", false)
            .neq("sender_id", user.id); // Only count messages from support (not from user)

          if (!chatError) {
            chatCount = count || 0;
          }
        }

        // 3. Count system notifications (unchanged)
        const { count: systemCount, error: systemError } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false)
          .neq("type", "support"); // Exclude support type

        console.log("Unread counts - Chat:", chatCount, "System:", systemCount);

        setChatUnreadCount(chatCount);
        if (!systemError) setSystemUnreadCount(systemCount || 0);
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      }
    };

    // Fetch initial counts
    fetchUnreadCounts();

    // Subscribe to real-time changes
    const chatSubscription = supabase
      .channel(`chat-count-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        async (payload) => {
          // When any chat message changes, check if it's relevant to this user
          const { data: room } = await supabase
            .from("chat_rooms")
            .select("user_id")
            .eq("id", payload.new.room_id)
            .single();

          // If this message belongs to current user's room, refresh counts
          if (room && room.user_id === user.id) {
            fetchUnreadCounts();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_rooms",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // When user's rooms change (new room created, status changed)
          fetchUnreadCounts();
        }
      )
      .subscribe();

    const notificationSubscription = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCounts();
        }
      )
      .subscribe();

    return () => {
      chatSubscription.unsubscribe();
      notificationSubscription.unsubscribe();
    };
  }, [user?.id, supabase]); // Add supabase to dependencies

  const [currentPage, setCurrentPage] = useState("home");

  // Add navigation handler for public pages
  const handleNavigation = (page) => {
    setCurrentPage(page);
    // If user is admin and navigating to admin pages, ensure it starts with 'admin-'
    if (user?.role === "administrator" && page.startsWith("admin-")) {
      setCurrentPage(page);
    }
    window.history.pushState(null, "", `/${page}`);
    window.scrollTo(0, 0);
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.substring(1) || "home";
      setCurrentPage(path);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Determine auth mode based on current page
  const getAuthScreenMode = () => {
    if (currentPage === "login") return "login";
    if (currentPage === "register") return "register";
    return "login"; // default fallback
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <span className="loading loading-spinner loading-lg text-blue-500"></span>
      </div>
    );
  }

  // Render content based on active section
  const renderContent = () => {
    if (!user) {
      switch (currentPage) {
        case "home":
          return <HomePage onNavigate={handleNavigation} />;
        case "about":
          return <AboutUsPage onNavigate={handleNavigation} />;
        case "regulations":
          return <RegulationPage onNavigate={handleNavigation} />;
        case "accounts":
          return <AccountPage onNavigate={handleNavigation} />;
        case "forex":
          return <ForexPage onNavigate={handleNavigation} />;
        case "commodities":
          return <CommoditiesPage onNavigate={handleNavigation} />;
        case "crypto":
          return <CryptoPage onNavigate={handleNavigation} />;
        case "clients-protection":
          return <ClientProtection onNavigate={handleNavigation} />;
        case "deposit-withdrawal":
          return <DepositPage onNavigate={handleNavigation} />;
          case "auth/callback":
  // Supabase will handle the password reset here
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg text-blue-500 mb-4"></span>
        <p className="text-gray-700 dark:text-gray-300">
          Processing password reset...
        </p>
      </div>
    </div>
  );
  case "update-password":
  return <UpdatePassword onNavigate={handleNavigation} />;
        case "login":
          return (
            <AuthScreen
              onLogin={handleLogin}
              initialMode="login"
              loading={authLoading}
              onToggleMode={(newMode) => {
                if (newMode === "register") {
                  handleNavigation("register");
                }
              }}
            />
          );
        case "register":
          return (
            <AuthScreen
              onLogin={handleLogin}
              initialMode="register"
              loading={authLoading}
              onToggleMode={(newMode) => {
                if (newMode === "login") {
                  handleNavigation("login");
                }
              }}
            />
          );
        case "admin-login":
          return (
            <AdminLogin
              onAdminLogin={handleAdminLogin}
              onNavigate={handleNavigation}
            />
          );
        default:
          return <HomePage onNavigate={handleNavigation} />;
      }
    }

    // First declare isAdmin
    const isAdmin = user?.role === "administrator" || user?.role === "admin";

    // Then use it
    const shouldShowAdminLayout = isAdmin && currentPage.startsWith("admin");

    // Debug logs - AFTER declaration
    console.log("DEBUG - User role:", user?.role);
    console.log("DEBUG - Current page:", currentPage);
    console.log("DEBUG - isAdmin check:", isAdmin);
    console.log("DEBUG - Should show admin layout:", shouldShowAdminLayout);

    // Then update your switch statement:
    if (shouldShowAdminLayout) {
      const editInvestorId = localStorage.getItem('editInvestorId');
      switch (currentPage) {
        case "admin":
          return (
            <AdminPanel
              supabase={supabase}
              user={user}
              onNavigate={handleNavigation}
            />
          );
        case "admin-chat":
          return (
            <AdminChatPanel
              supabase={supabase}
              user={user}
              onNavigate={handleNavigation}
            />
          );
        case "admin-payment":
          return <AdminPaymentDetails supabase={supabase} user={user} />;
        case "admin-notifications":
          // Safety check - if user is not defined, redirect to admin panel
          if (!user) {
            return (
              <AdminPanel
                supabase={supabase}
                user={user}
                onNavigate={handleNavigation}
              />
            );
          }
          return (
            <AdminNotifications
              supabase={supabase}
              user={user}
              onNavigate={handleNavigation}
            />
          );
        case "admin-user-metrics": // ADD THIS CASE
          return (
            <AdminUserMetrics
              supabase={supabase}
              user={user}
              onNavigate={handleNavigation}
            />
          );
        case "admin-trading-positions":
          return (
            <AdminTradingPositions
              supabase={supabase}
              user={user}
              onNavigate={handleNavigation}
            />
          );
        case "admin-transactions":
          return (
            <AdminTransactions
              supabase={supabase}
              user={user}
            />
          );
        // Investor Management Routes - with props passed directly
        case "admin-investors":
          return <AdminInvestorsPage supabase={supabase} user={user} onNavigate={handleNavigation} />;

        case "admin-investors-create":
          return <CreateInvestorPage supabase={supabase} user={user} onNavigate={handleNavigation} />;

        case "admin-investors-edit":
          return <EditInvestorPage investorId={editInvestorId} supabase={supabase} user={user} onNavigate={handleNavigation} />;
        default:
          return (
            <AdminPanel
              supabase={supabase}
              user={user}
              onNavigate={handleNavigation}
            />
          );
      }
    }
    // Regular user pages with user layout
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            userId={user?.id}
            metricsData={metricsData}
            dataError={dataError}
            selectedAccountTypeDetails={selectedAccountTypeDetails}
            recentTrades={closedPositionsData}
            onNavigate={handleNavigation}
            profileData={profileData}
          />
        );
      case "trading":
        return (
          <TradingSection
            userId={user?.id}
            openPositions={openPositionsData}
            closedPositions={closedPositionsData}
            tradingSummary={tradingSummaryData}
            onOpenPositionClose={handleOpenPositionClose}
            positionsSaving={positionsSaving}
            dataError={dataError}
            addToast={addToast}
          />
        );
      case "accounts":
        return (
          <AccountTypeSection
            userId={user?.id}
            accountTypes={accountTypes}
            selectedAccountTypeId={profileData.accountTypeId}
            onAccountTypeSelect={handleAccountTypeSelect}
            profileSaving={profileSaving}
            dataError={dataError}
          />
        );
      case "profile":
        return (
          <ProfileSection
            userId={user?.id}
            profileData={profileData}
            onProfileUpdate={handleProfileUpdate}
            profileSaving={profileSaving}
            dataError={dataError}
            selectedAccountTypeDetails={selectedAccountTypeDetails}
            followedInvestors={followedInvestors}
            userSettings={userSettings}
          />
        );
      case "wallet":
        return <WalletSection supabase={supabase} userId={user?.id} />;
      case "settings":
        return (
          <SettingsPage
            userId={user?.id}
          userSettings={userSettings || {}} // Pass the loaded settings
      onSettingsUpdate={handleSettingsUpdate}
            onInvestorSelect={handleInvestorSelect}
            followedInvestors={followedInvestors}
            investors={investors}
            selectedInvestor={selectedInvestor}
            user={user} // Add this line
          />
        );
      default:
        return (
          <Dashboard
            userId={user?.id}
            metricsData={metricsData}
            dataError={dataError}
            selectedAccountTypeDetails={selectedAccountTypeDetails}
            recentTrades={closedPositionsData}
            onNavigate={handleNavigation}
            profileData={profileData}
          />
        );
    }
  };

  return (
    <>
      <ToastProvider>
        {user ? (
          // Check if user is admin and on admin pages
          (user?.role?.includes("admin") || user?.adminProfile) &&
            currentPage.startsWith("admin") ? (
            // Admin layout for admin pages
            <AdminLayout
              user={user}
              onLogout={handleLogout}
              onNavigate={handleNavigation}
              currentPage={currentPage}
            >
              {renderContent()}
            </AdminLayout>
          ) : (
            // Regular user layout with sidebar
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter">
              {/* Mobile menu button */}
              <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {sidebarOpen ? (
                    <svg
                      className="w-4 h-4 text-gray-800 dark:text-gray-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-800 dark:text-gray-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Sidebar */}
              <Sidebar
                currentPage={currentPage}
                onNavigate={handleNavigation}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                onSignOut={handleLogout}
                // onSignOut={signOut}
                onOpenChat={() => setChatOpen(true)}
                supabase={supabase} // Add this
                user={user}
                chatUnreadCount={chatUnreadCount} // Pass chat count
                systemUnreadCount={systemUnreadCount}
                profileData={profileData}
              />

              {/* Main Content */}
              <div className="lg:ml-64 min-h-screen">
                <main className="p-6 pt-16 lg:pt-6">
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <span className="loading loading-spinner loading-lg">
                        Loading...
                      </span>
                    </div>
                  ) : (
                    renderContent()
                  )}
                </main>
              </div>

              {/* Add ChatBox here */}
              <ChatBox
                supabase={supabase}
                user={user}
                isOpen={chatOpen}
                onClose={() => setChatOpen(false)}
                onToggle={() => setChatOpen(!chatOpen)}
                setUnreadCount={setUnreadCount} // Add this
              />

              {/* Floating Chat Button */}
              {!chatOpen && (
                <button
                  onClick={() => setChatOpen(true)}
                  style={{
                    position: "fixed",
                    bottom: "24px",
                    right: "24px",
                    zIndex: 40,
                    backgroundColor: "#2563eb",
                    color: "white",
                    padding: "16px",
                    borderRadius: "50%",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    border: "none",
                    cursor: "pointer",
                  }}
                  className="hover:bg-blue-700 transition-colors relative"
                >
                  <MessageCircle className="w-6 h-6" />

                  {/* Show chat unread count on floating button */}
                  {chatUnreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        fontSize: "12px",
                        borderRadius: "50%",
                        height: "24px",
                        width: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "pulse 2s infinite",
                      }}
                    >
                      {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
                    </span>
                  )}
                </button>
              )}

              {/* Mobile overlay */}
              {sidebarOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                ></div>
              )}
            </div>
          )
        ) : (
          // Public layout with navigation
          <Layout
            user={user}
            onLogout={handleLogout}
            onNavigate={handleNavigation}
            currentPage={currentPage}
            supabase={supabase}
          >
            {renderContent()}
          </Layout>
        )}
      </ToastProvider>
    </>
  );
}

export default App;
