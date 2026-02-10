"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"
import { Button } from "../components/ui/Button"
import Input from "./ui/Input"
import { Badge } from "../components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs"
import { Wallet, Plus, TrendingUp, TrendingDown, DollarSign, Banknote, Bitcoin, Ethereum, RefreshCw, CheckCircle, XCircle, Clock, Globe, MapPin, Building, Copy, ArrowRight } from "../components/ui/Icons"
import { useToast } from '../context/ToastContext';


const WalletSection = ({ supabase, userId }) => {
  const { addToast } = useToast();

  const [transferAmount, setTransferAmount] = useState("");
  const [transferType, setTransferType] = useState("deposit");
  const [walletData, setWalletData] = useState({
    availableBalance: 0,
    pendingTransfers: 0,
    completedTransfers: 0,
    declinedTransfers: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [message, setMessage] = useState(null);

  // New state for payment method selection
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedBankRegion, setSelectedBankRegion] = useState(null); // 'us' or 'europe'
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);



  // New state for payment details from Supabase
  const [paymentDetails, setPaymentDetails] = useState({
    bank_us: null,
    bank_europe: null,
    crypto: []
  });

  // State for transaction statistics
  const [transactionStats, setTransactionStats] = useState({
    pending: 0,
    completed: 0,
    declined: 0,
    totalAmount: 0
  });

  // Add this near other state declarations in WalletSection.jsx
  const [showTransferToAccount, setShowTransferToAccount] = useState(false);
  const [transferToAccountAmount, setTransferToAccountAmount] = useState("");

  const handleTransferToTradingAccount = async () => {
  const amount = parseFloat(transferToAccountAmount);

  if (isNaN(amount) || amount <= 0) {
    addToast('Please enter a valid amount.', 'error');
    return;
  }

  if (amount > walletData.availableBalance) {
    addToast('Insufficient wallet balance.', 'error');
    return;
  }

  setLoading(true);

  try {
    // 1. Update wallet table - decrease available balance
    const newWalletBalance = walletData.availableBalance - amount;
    const { error: walletError } = await supabase
      .from('wallets')
      .update({
        available_balance: newWalletBalance
      })
      .eq('user_id', userId);

    if (walletError) throw walletError;

    // 2. Get current user_metrics
    const { data: currentMetric, error: fetchError } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Check if record exists
    const recordExists = !fetchError || (fetchError && fetchError.code !== 'PGRST116');

    // 🔴🔴🔴 CRITICAL FIX: Calculate starting_balance 🔴🔴🔴
    let startingBalance = 0;
    let currentBalance = 0;
    let currentEquity = 0;
    let currentEquityNumeric = 0;
    let currentTotalOpenPnl = 0;

    if (recordExists && currentMetric) {
      // Use existing values
      startingBalance = currentMetric.starting_balance || 0;
      currentBalance = currentMetric.account_balance || 0;
      currentEquity = currentMetric.equity || 0;
      currentEquityNumeric = currentMetric.equity_numeric || 0;
      currentTotalOpenPnl = currentMetric.total_open_pnl || 0;
    }

    // 🔴🔴🔴 KEY FIX: When transferring to trading account, 
    // you're ADDING to the starting balance, not just account balance
    // The starting balance represents ALL wallet transfers to trading
    const newStartingBalance = startingBalance + amount;
    const newAccountBalance = currentBalance + amount;
    const newEquity = currentEquity + amount;
    const newEquityNumeric = currentEquityNumeric + amount;

    // Prepare the data
    const upsertData = {
      user_id: userId,
      starting_balance: newStartingBalance, // 🔴 THIS IS CRITICAL
      account_balance: newAccountBalance,
      equity: newEquity,
     
      today_pnl_percent: recordExists && currentMetric?.today_pnl_percent ? currentMetric.today_pnl_percent : 0,
      open_positions: recordExists && currentMetric?.open_positions ? currentMetric.open_positions : 0,
      win_rate: recordExists && currentMetric?.win_rate ? currentMetric.win_rate : 0,
      total_open_pnl: currentTotalOpenPnl,
      
    };

    console.log('💰 Transferring to trading account:', {
      amount,
      oldStartingBalance: startingBalance,
      newStartingBalance,
      oldAccountBalance: currentBalance,
      newAccountBalance
    });

    // Update or insert user_metrics record
    const { error: metricError } = await supabase
      .from('user_metrics')
      .upsert(upsertData, {
        onConflict: 'user_id'
      });

    if (metricError) throw metricError;

    // 3. Also create a wallet_transfers record for tracking
    const { error: transferError } = await supabase
      .from('wallet_transfers')
      .insert([{
        user_id: userId,
        transfer_type: 'wallet_to_trading',
        amount: amount,
        status: 'completed',
        description: 'Transfer to Trading Account',
        created_at: new Date().toISOString()
      }]);

    if (transferError) {
      console.warn('Could not create wallet_transfers record:', transferError);
      // Don't throw, this is optional
    }

    // 4. Create a transaction record
    const { error: transError } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        type: 'transfer',
        amount: amount,
        description: 'Transfer to Trading Account',
        status: 'completed',
        transaction_date: new Date().toISOString()
      }]);

    if (transError) throw transError;

    // 5. Refresh data
    await fetchWalletData();

    // 6. Show success and reset
    addToast(`Successfully transferred $${amount} to trading account!`, 'success');
    setShowTransferToAccount(false);
    setTransferToAccountAmount("");

  } catch (e) {
    console.error("Error transferring to trading account:", e);

    // More specific error handling
    if (e.code === '23502') {
      addToast('Database error: Missing required fields. Please contact support.', 'error');
    } else if (e.code === 'PGRST116') {
      // No existing record - this is actually fine, we create new one
      addToast('Transfer completed! New account created.', 'success');
    } else {
      addToast(`Transfer failed: ${e.message}`, 'error');
    }
  } finally {
    setLoading(false);
  }
};

  // Add this CopyButton component inside your WalletSection component file
  const CopyButton = ({ text, label, onCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (onCopy) onCopy();

        // Reset after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    };

    return (
      <button
        onClick={handleCopy}
        className={`
        flex items-center gap-1 px-2 py-1 rounded text-xs font-medium 
        transition-all duration-200
        ${copied
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50'
          }
      `}
        disabled={copied}
      >
        {copied ? (
          <>
            <CheckCircle className="w-3 h-3" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy </span>
          </>
        )}
      </button>
    );
  };

  // Function to fetch transactions and calculate statistics
  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions for user:', userId);

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('Error fetching transactions:', fetchError);
        throw fetchError;
      }

      console.log('Fetched transactions:', data);

      // Calculate transaction statistics
      const pending = data ? data.filter(t => t.status === 'pending').length : 0;
      const completed = data ? data.filter(t => t.status === 'completed').length : 0;
      const declined = data ? data.filter(t => t.status === 'declined' || t.status === 'failed').length : 0;
      const totalAmount = data ? data
        .filter(t => t.status === 'completed' && t.type === 'deposit')
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) : 0;

      setTransactionStats({
        pending,
        completed,
        declined,
        totalAmount
      });

      // Format recent transactions (last 5)
      const formattedTransactions = data ? data.slice(0, 5).map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        transaction_date: t.transaction_date,
        status: t.status,
      })) : [];

      console.log('Formatted transactions:', formattedTransactions);
      setRecentTransactions(formattedTransactions);

    } catch (e) {
      console.error("Error fetching transactions:", e);
      setError(`Failed to load transactions: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch payment details from Supabase - UPDATED for US/Europe banks
  const fetchPaymentDetails = async () => {
    try {
      const { data, error: paymentError } = await supabase
        .from('payment_details')
        .select('*')
        .eq('is_active', true)
        .order('payment_type', { ascending: true });

      if (paymentError) throw paymentError;

      if (data) {
        const bankUSDetails = data.find(item => item.payment_type === 'bank_us');
        const bankEuropeDetails = data.find(item => item.payment_type === 'bank_europe');
        const cryptoDetails = data.filter(item => item.payment_type === 'crypto');

        setPaymentDetails({
          bank_us: bankUSDetails,
          bank_europe: bankEuropeDetails,
          crypto: cryptoDetails
        });
      }
    } catch (e) {
      console.error("Error fetching payment details:", e);
      setError(`Failed to load payment details: ${e.message}`);
    }
  };

  // Function to fetch wallet data from the 'wallets' table
  const fetchWalletData = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') { // No rows found
        const { data: newWallet, error: insertError } = await supabase
          .from('wallets')
          .insert([{
            user_id: userId,
            available_balance: 0,
            pending_transfers: 0,
            completed_transfers: 0,
            declined_transfers: 0
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        setWalletData({
          availableBalance: newWallet.available_balance,
          pendingTransfers: newWallet.pending_transfers,
          completedTransfers: newWallet.completed_transfers || 0,
          declinedTransfers: newWallet.declined_transfers || 0,
        });
        addToast('New wallet created for Trader.', 'info');
      } else if (fetchError) {
        throw fetchError;
      } else if (data) {
        setWalletData({
          availableBalance: data.available_balance,
          pendingTransfers: data.pending_transfers,
          completedTransfers: data.completed_transfers || 0,
          declinedTransfers: data.declined_transfers || 0,
        });
      }
    } catch (e) {
      console.error("Error fetching or creating wallet data:", e);
      setError(`Failed to load wallet data: ${e.message}`);
    }
  };

 // --- Supabase Data Fetching and Realtime Listener ---
useEffect(() => {
  if (!supabase || !userId) {
    console.error("Supabase client or user ID not provided.");
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);

  // Initial fetch
  fetchPaymentDetails();
  fetchWalletData();
  fetchTransactions();

  // Realtime listeners
  const walletSubscription = supabase
    .channel('wallets_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'wallets', 
      filter: `user_id=eq.${userId}` 
    }, payload => {
      if (payload.new) {
        setWalletData({
          availableBalance: payload.new.available_balance,
          pendingTransfers: payload.new.pending_transfers,
          completedTransfers: payload.new.completed_transfers || 0,
          declinedTransfers: payload.new.declined_transfers || 0,
        });
      }
    })
    .subscribe();

  const transactionsSubscription = supabase
    .channel('transactions_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'transactions', 
      filter: `user_id=eq.${userId}` 
    }, payload => {
      console.log('Real-time transaction update:', payload);
      fetchTransactions();
    })
    .subscribe();

  const paymentDetailsSubscription = supabase
    .channel('payment_details_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'payment_details' 
    }, payload => {
      fetchPaymentDetails();
    })
    .subscribe();

  const userMetricsSubscription = supabase
    .channel('user_metrics_changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'user_metrics', 
      filter: `user_id=eq.${userId}` 
    }, payload => {
      console.log('User metrics updated:', payload);
      // You might want to refresh something here if needed
      // The dashboard should automatically update via its own metricsData prop
    })
    .subscribe();

  // SINGLE cleanup function at the end
  return () => {
    console.log('Cleaning up Supabase subscriptions');
    if (walletSubscription) supabase.removeChannel(walletSubscription);
    if (transactionsSubscription) supabase.removeChannel(transactionsSubscription);
    if (paymentDetailsSubscription) supabase.removeChannel(paymentDetailsSubscription);
    if (userMetricsSubscription) supabase.removeChannel(userMetricsSubscription);
  };
}, [supabase, userId]);

  // Helper function to get crypto details
  const getCryptoDetails = (currency) => {
    return paymentDetails.crypto.find(crypto => crypto.currency === currency);
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast('Please enter a valid amount.', 'error');
      return;
    }

    // For deposits, require payment method selection
    if (transferType === "deposit" && !selectedPaymentMethod) {
      addToast('Please select a payment method.', 'error');
      return;
    }

    if (transferType === "deposit" && selectedPaymentMethod === 'bank' && !selectedBankRegion) {
      addToast('Please select a bank region.', 'error');
      return;
    }

    if (transferType === "deposit" && selectedPaymentMethod === 'crypto' && !selectedCrypto) {
      addToast('Please select a cryptocurrency.', 'error');
      return;
    }

    setLoading(true);
    setError(null); // Remove setMessage(null) since we're not using message state anymore

    try {
      let transactionDescription = "";
      let transactionType = transferType;
      let newPendingTransfers = walletData.pendingTransfers + amount;
      let newAvailableBalance = walletData.availableBalance;
      let newCompletedTransfers = walletData.completedTransfers;
      let newDeclinedTransfers = walletData.declinedTransfers;

      // Build description based on payment method
      if (transferType === "deposit") {
        if (selectedPaymentMethod === 'bank') {
          transactionDescription = `Deposit via ${selectedBankRegion === 'us' ? 'US Bank Transfer' : 'European Bank Transfer'}`;
        } else if (selectedPaymentMethod === 'crypto') {
          transactionDescription = `Deposit via ${selectedCrypto.toUpperCase()}`;
        }
        // For deposits, mark as pending (admin needs to verify)
        newPendingTransfers += amount;
      } else { // withdrawal
        if (newAvailableBalance < amount) {
          addToast('Insufficient balance.', 'error');
          setLoading(false);
          return;
        }
        transactionDescription = "Withdrawal Request";
        // For withdrawals, also mark as pending
        newPendingTransfers += amount;
      }

      // 1. Update 'wallets' table in Supabase
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          available_balance: newAvailableBalance,
          pending_transfers: newPendingTransfers,
          completed_transfers: newCompletedTransfers,
          declined_transfers: newDeclinedTransfers,
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // 2. Insert new transaction into 'transactions' table
      const transactionData = {
        user_id: userId,
        type: transactionType,
        amount: amount,
        description: transactionDescription,
        status: "pending", // Mark as pending for admin approval
        transaction_date: new Date().toISOString()
      };

      console.log('Inserting transaction:', transactionData);

      const { error: insertTransError } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (insertTransError) {
        console.error('Error inserting transaction:', insertTransError);
        throw insertTransError;
      }

      // Refresh transactions immediately after successful transfer
      await fetchTransactions();

      // Use toast for success message
      addToast(
        transferType === 'deposit'
          ? `Deposit request of $${amount} has been submitted and is pending verification.`
          : `Withdrawal request of $${amount} has been submitted and is pending approval.`,
        'success'
      );

      // Reset form
      setTransferAmount("");
      setSelectedPaymentMethod(null);
      setSelectedBankRegion(null);
      setSelectedCrypto(null);
      setShowPaymentDetails(false);

    } catch (e) {
      console.error("Error performing transfer:", e);
      // Update declined transfers count
      const newDeclinedTransfers = walletData.declinedTransfers + 1;

      await supabase
        .from('wallets')
        .update({
          declined_transfers: newDeclinedTransfers,
        })
        .eq('user_id', userId);

      setError(`Transfer failed: ${e.message}`);
      // Use toast for error message
      addToast(`Transfer failed: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTransferAmount("");
    setSelectedPaymentMethod(null);
    setSelectedBankRegion(null);
    setSelectedCrypto(null);
    setShowPaymentDetails(false);
  };

  // Add this function to manually refresh transactions
  const refreshTransactions = async () => {
    setLoading(true);
    await fetchTransactions();
  };

  if (error) {
    return <div className="text-center py-10 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 p-1 sm:p-3 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Wallet</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your funds and track transactions.</p>
        </div>
        <Button
          onClick={() => {
            setShowTransferToAccount(true); // New state to show transfer modal
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          <ArrowRight className="w-4 h-4 mr-2" /> {/* Add this icon to Icons.jsx */}
          Transfer to Trading Account
        </Button>
      </div>

      {/* Balance Overview - Fixed 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Transfers Card */}
        <Card className="rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending Transfers</CardTitle>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-500">
              {transactionStats.pending}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting processing</p>
            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              Transfers in review
            </div>
          </CardContent>
        </Card>

        {/* Completed Transfers Card */}
        <Card className="rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Completed Transfers</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">
              {transactionStats.completed}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Successful transactions</p>
            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
              ${transactionStats.totalAmount.toLocaleString()} total deposited
            </div>
          </CardContent>
        </Card>

        {/* Declined Transfers Card */}
        <Card className="rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Declined Transfers</CardTitle>
            <XCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-red-600 dark:text-red-400">
              {transactionStats.declined}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Failed transactions</p>
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              Transactions rejected
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Balance Card */}
      <Card className="rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Available Balance</p>
              <p className="text-3xl sm:text-4xl font-bold mt-1">${walletData.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm opacity-90 mt-2">Your total available funds for trading</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Wallet className="w-12 h-12 sm:w-16 sm:h-16 opacity-80" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:dark:text-blue-400 rounded-md transition-all duration-200"
          >
            Transaction History
          </TabsTrigger>
          <TabsTrigger
            value="transfer"
            className="data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:dark:text-blue-400 rounded-md transition-all duration-200"
          >
            Transfer Funds
          </TabsTrigger>
        </TabsList>

        {/* TRANSACTION HISTORY TAB */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="rounded-xl shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">Recent Transactions</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Your latest wallet activity</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshTransactions}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">Loading transactions...</p>
              ) : recentTransactions.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent transactions.</p>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-sm transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === "deposit" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                            }`}
                        >
                          {transaction.type === "deposit" ? (
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">{transaction.type}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.description}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(transaction.transaction_date).toLocaleDateString()} at{' '}
                            {new Date(transaction.transaction_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p
                            className={`font-semibold text-lg ${transaction.type === "deposit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                              }`}
                          >
                            {transaction.type === "deposit" ? "+" : "-"}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <Badge
                            variant={
                              transaction.status === "completed" ? "success" :
                                transaction.status === "pending" ? "warning" :
                                  "destructive"
                            }
                            className="mt-1"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TRANSFER FUNDS TAB - UPDATED WITH US/EUROPE BANK OPTIONS */}
        <TabsContent value="transfer" className="space-y-1">
          <Card className="rounded-xl shadow-md overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {transferType === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                {transferType === "deposit"
                  ? "Add funds to your trading account"
                  : "Withdraw funds to your bank account"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transfer Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Transfer Type</label>
                <div className="flex gap-2">
                  <Button
                    variant={transferType === "deposit" ? "default" : "outline"}
                    onClick={() => {
                      setTransferType("deposit");
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Deposit
                  </Button>
                  <Button
                    variant={transferType === "withdrawal" ? "default" : "outline"}
                    onClick={() => {
                      setTransferType("withdrawal");
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label htmlFor="amount-input" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="amount-input"
                    type="number"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Deposit-specific payment method selection */}
              {transferType === "deposit" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose a Payment Method</label>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedPaymentMethod === "bank" ? "default" : "outline"}
                        onClick={() => {
                          setSelectedPaymentMethod("bank");
                          setSelectedCrypto(null);
                        }}
                        className="flex-1"
                        disabled={!paymentDetails.bank_us && !paymentDetails.bank_europe}
                      >
                        <Banknote className="w-4 h-4 mr-2" />
                        Bank Transfer
                      </Button>
                      <Button
                        variant={selectedPaymentMethod === "crypto" ? "default" : "outline"}
                        onClick={() => {
                          setSelectedPaymentMethod("crypto");
                          setSelectedBankRegion(null);
                        }}
                        className="flex-1"
                        disabled={paymentDetails.crypto.length === 0}
                      >
                        <Bitcoin className="w-4 h-4 mr-2" />
                        Crypto
                      </Button>
                    </div>
                  </div>

                  {/* Bank Region Selection */}
                  {selectedPaymentMethod === "bank" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Bank Region</label>
                      <div className="flex gap-2">
                        <Button
                          variant={selectedBankRegion === "us" ? "default" : "outline"}
                          onClick={() => {
                            setSelectedBankRegion("us");
                          }}
                          className="flex-1"
                          disabled={!paymentDetails.bank_us}
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          US Bank Transfer
                        </Button>
                        <Button
                          variant={selectedBankRegion === "europe" ? "default" : "outline"}
                          onClick={() => {
                            setSelectedBankRegion("europe");
                          }}
                          className="flex-1"
                          disabled={!paymentDetails.bank_europe}
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          European Bank Transfer
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* US Bank Transfer Details */}
                  {selectedPaymentMethod === "bank" && selectedBankRegion === "us" && paymentDetails.bank_us && (
                    <Card className="rounded-lg shadow-inner border-dashed border-2 border-gray-300 dark:border-gray-600 mt-4 bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">US Bank Transfer Details</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Bank Name</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{paymentDetails.bank_us.bank_name}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Account Name</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{paymentDetails.bank_us.account_name}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Account Number</span>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800 dark:text-gray-200 text-xs break-all bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                  {paymentDetails.bank_us.account_number}
                                </span>
                                <CopyButton
                                  text={paymentDetails.bank_us.account_number}
                                  label="Account"
                                  onCopy={() => addToast('Account Number copied to clipboard!', 'success',)}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Routing Number</span>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                  {paymentDetails.bank_us.routing_number}
                                </span>
                                <CopyButton
                                  text={paymentDetails.bank_us.routing_number}
                                  label="Routing"
                                  onCopy={() => addToast('Routing Number copied to clipboard!', 'success',)}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Account Type</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{paymentDetails.bank_us.account_type || 'Checking'}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          {paymentDetails.bank_us.notes ? (
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                                Important Notes:
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-line">
                                {paymentDetails.bank_us.notes}
                              </p>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                                Important: Please make sure the amount you fill, is the exact amount you send.
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                • Please contact support for deposit limits
                              </p>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* European Bank Transfer Details */}
                  {selectedPaymentMethod === "bank" && selectedBankRegion === "europe" && paymentDetails.bank_europe && (
                    <Card className="rounded-lg shadow-inner border-dashed border-2 border-gray-300 dark:border-gray-600 mt-4 bg-gray-50 dark:bg-gray-800/50">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Globe className="w-5 h-5 text-green-600" />
                          <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">European Bank Transfer Details</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Bank Name</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{paymentDetails.bank_europe.bank_name}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Account Name</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{paymentDetails.bank_europe.account_name}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">IBAN</span>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800 dark:text-gray-200 text-xs break-all bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                  {paymentDetails.bank_europe.iban}
                                </span>
                                <CopyButton
                                  text={paymentDetails.bank_europe.iban}
                                  label="IBAN"
                                  onCopy={() => addToast('IBAN copied to clipboard!', 'success',)}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">BIC/SWIFT</span>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                  {paymentDetails.bank_europe.swift_bic}
                                </span>
                                <CopyButton
                                  text={paymentDetails.bank_europe.swift_bic}
                                  label="SWIFT"
                                  onCopy={() => addToast('BIC/SWIFT copied to clipboard!', 'success',)}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Bank Address</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 text-xs text-right">
                              {paymentDetails.bank_europe.bank_address}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          {paymentDetails.bank_europe.notes ? (
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                                Important Notes:
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-line">
                                {paymentDetails.bank_europe.notes}
                              </p>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                                Important: Please make sure the amount you filled, is the exact amount you send.
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                • SEPA transfers only (EUR currency)
                              </p>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Conditionally render crypto options and details */}
                  {selectedPaymentMethod === "crypto" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose a Coin</label>
                        <div className="flex gap-2 flex-wrap">
                          {paymentDetails.crypto.map((crypto) => (
                            <Button
                              key={crypto.currency}
                              variant={selectedCrypto === crypto.currency ? "default" : "outline"}
                              onClick={() => {
                                setSelectedCrypto(crypto.currency);
                              }}
                              className="flex-1 min-w-[100px]"
                            >
                              {crypto.currency === 'btc' && <Bitcoin className="w-4 h-4 mr-2" />}
                              {crypto.currency === 'eth' && <Ethereum className="w-4 h-4 mr-2" />}
                              {crypto.currency === 'usdt' && <DollarSign className="w-4 h-4 mr-2" />}
                              {crypto.currency.toUpperCase()}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {selectedCrypto && getCryptoDetails(selectedCrypto) && (
                        <Card className="rounded-lg shadow-inner border-dashed border-2 border-gray-300 dark:border-gray-600 mt-4 bg-gray-50 dark:bg-gray-800/50">
                          <CardContent className="p-4 space-y-2">
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                              Wallet Details for {selectedCrypto.toUpperCase()}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Network</span>
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                  {getCryptoDetails(selectedCrypto).network}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Wallet Address:</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded break-all flex-1">
                                    {getCryptoDetails(selectedCrypto).wallet_address}
                                  </code>
                                  <CopyButton
                                    text={getCryptoDetails(selectedCrypto).wallet_address}
                                    label="Address"
                                    onCopy={() => setMessage({ type: 'success', text: 'Wallet address copied to clipboard!' })}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                                Important: Only send {selectedCrypto.toUpperCase()} to this address
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                • Network: {getCryptoDetails(selectedCrypto).network}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                • Minimum deposit: ${getCryptoDetails(selectedCrypto).min_deposit_amount || 10} equivalent
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Transfer Button */}
              <div className="pt-4">
                <Button
                  onClick={handleTransfer}
                  className="w-full rounded-md py-3 px-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                  disabled={loading || transferAmount <= 0 ||
                    (transferType === 'deposit' && (
                      !selectedPaymentMethod ||
                      (selectedPaymentMethod === 'bank' && !selectedBankRegion) ||
                      (selectedPaymentMethod === 'crypto' && !selectedCrypto)
                    ))}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : transferType === 'deposit' ? (
                    'Submit Deposit Request'
                  ) : (
                    'Request Withdrawal'
                  )}
                </Button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {transferType === 'deposit'
                    ? 'Your deposit will be credited after verification (usually within 1-2 hours)'
                    : 'Withdrawals are processed within 1-3 business days'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer to Trading Account Modal */}
      {showTransferToAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Transfer to Trading Account</CardTitle>
              <CardDescription>
                Transfer funds from your wallet to your trading account balance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={transferToAccountAmount}
                    onChange={(e) => setTransferToAccountAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Available in wallet: ${walletData.availableBalance.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowTransferToAccount(false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTransferToTradingAccount}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={loading || !transferToAccountAmount || parseFloat(transferToAccountAmount) <= 0}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Transfer Now'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Message/Error Display */}
      {/* {message && (
        <div className={`rounded-lg p-4 ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300'}`}>
          <div className="flex items-center">
            {message.type === 'error' ? (
              <XCircle className="w-5 h-5 mr-2" />
            ) : (
              <CheckCircle className="w-5 h-5 mr-2" />
            )}
            <p>{message.text}</p>
          </div>
        </div>
      )} */}
    </div>
  )
}

export default WalletSection;