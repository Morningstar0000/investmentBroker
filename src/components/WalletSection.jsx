"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"
import { Button } from "../components/ui/Button"
import Input from "./ui/Input"
import { Badge } from "../components/ui/Badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs"
import { Wallet, Plus, TrendingUp, TrendingDown, DollarSign, Banknote, Bitcoin, Ethereum, FileText, RefreshCw } from "./ui/Icons"

const WalletSection = ({ supabase, userId }) => {
  const [transferAmount, setTransferAmount] = useState("");
  const [transferType, setTransferType] = useState("deposit");
  const [walletData, setWalletData] = useState({
    availableBalance: 0,
    pendingTransfers: 0,
    monthlyInflow: 0,
    monthlyOutflow: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // New state for payment method selection
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  
  // New state for payment details from Supabase
  const [paymentDetails, setPaymentDetails] = useState({
    bank: null,
    crypto: []
  });

  // Function to fetch transactions - MOVED OUTSIDE useEffect
  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions for user:', userId);
      
      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .limit(5);

      if (fetchError) {
        console.error('Error fetching transactions:', fetchError);
        throw fetchError;
      }
      
      console.log('Fetched transactions:', data);
      
      const formattedTransactions = data ? data.map(t => ({
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

  // Function to fetch payment details from Supabase
  const fetchPaymentDetails = async () => {
    try {
      const { data, error: paymentError } = await supabase
        .from('payment_details')
        .select('*')
        .eq('is_active', true)
        .order('payment_type', { ascending: true });

      if (paymentError) throw paymentError;

      if (data) {
        const bankDetails = data.find(item => item.payment_type === 'bank');
        const cryptoDetails = data.filter(item => item.payment_type === 'crypto');
        
        setPaymentDetails({
          bank: bankDetails,
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
            monthly_inflow: 0,
            monthly_outflow: 0
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        setWalletData({
          availableBalance: newWallet.available_balance,
          pendingTransfers: newWallet.pending_transfers,
          monthlyInflow: newWallet.monthly_inflow,
          monthlyOutflow: newWallet.monthly_outflow,
        });
        setMessage({ type: 'info', text: 'New wallet created for mock user.' });
      } else if (fetchError) {
        throw fetchError;
      } else if (data) {
        setWalletData({
          availableBalance: data.available_balance,
          pendingTransfers: data.pending_transfers,
          monthlyInflow: data.monthly_inflow,
          monthlyOutflow: data.monthly_outflow,
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

    // Realtime listener for 'wallets' table
    const walletSubscription = supabase
      .channel('wallets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${userId}` }, payload => {
        if (payload.new) {
          setWalletData({
            availableBalance: payload.new.available_balance,
            pendingTransfers: payload.new.pending_transfers,
            monthlyInflow: payload.new.monthly_inflow,
            monthlyOutflow: payload.new.monthly_outflow,
          });
        }
      })
      .subscribe();

    // Realtime listener for 'transactions' table
    const transactionsSubscription = supabase
      .channel('transactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, payload => {
        console.log('Real-time transaction update:', payload);
        fetchTransactions(); // Always refetch when any change happens
      })
      .subscribe();

    // Realtime listener for 'payment_details' table
    const paymentDetailsSubscription = supabase
      .channel('payment_details_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_details' }, payload => {
        fetchPaymentDetails();
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(walletSubscription);
      supabase.removeChannel(transactionsSubscription);
      supabase.removeChannel(paymentDetailsSubscription);
    };
  }, [supabase, userId]);

  // Helper function to get crypto details
  const getCryptoDetails = (currency) => {
    return paymentDetails.crypto.find(crypto => crypto.currency === currency);
  };

  const handleInitiateTransfer = () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount.' });
      return;
    }
    // For deposits, show the payment details first
    if (transferType === "deposit" && selectedPaymentMethod) {
      setShowPaymentDetails(true);
    } else {
      // For withdrawals, proceed directly with the transfer
      handleTransfer();
    }
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      let transactionDescription = "";
      let transactionType = transferType;
      let newPendingTransfers = walletData.pendingTransfers + amount;
      let newAvailableBalance = walletData.availableBalance;
      let newMonthlyInflow = walletData.monthlyInflow;
      let newMonthlyOutflow = walletData.monthlyOutflow;

      if (transferType === "deposit") {
        transactionDescription = `Deposit via ${selectedPaymentMethod === 'bank' ? 'Bank Transfer' : selectedCrypto.toUpperCase()}`;
        newMonthlyInflow += amount;
      } else { // withdrawal
        if (newAvailableBalance < amount) {
          setMessage({ type: 'error', text: 'Insufficient balance.' });
          setLoading(false);
          return;
        }
        newAvailableBalance -= amount; // Debit available balance immediately
        transactionDescription = "Withdrawal from Wallet";
        newMonthlyOutflow += amount;
      }

      // 1. Update 'wallets' table in Supabase
      const { error: updateError } = await supabase
        .from('wallets')
        .update({
          available_balance: newAvailableBalance,
          pending_transfers: newPendingTransfers,
          monthly_inflow: newMonthlyInflow,
          monthly_outflow: newMonthlyOutflow,
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // 2. Insert new transaction into 'transactions' table in Supabase
      const { error: insertTransError } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          type: transactionType,
          amount: amount,
          description: transactionDescription,
          status: "pending",
          transaction_date: new Date().toISOString()
        }]);

      if (insertTransError) throw insertTransError;

      // Refresh transactions immediately after successful transfer
      await fetchTransactions();
      
      setMessage({ type: 'success', text: `${transferType === 'deposit' ? 'Deposit' : 'Withdrawal'} of $${amount} has been initiated and is pending.` });
      setTransferAmount("");
      setSelectedPaymentMethod(null);
      setSelectedCrypto(null);
      setShowPaymentDetails(false);
    } catch (e) {
      console.error("Error performing transfer:", e);
      setError(`Transfer failed: ${e.message}`);
      setMessage({ type: 'error', text: `Transfer failed: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTransferAmount("");
    setSelectedPaymentMethod(null);
    setSelectedCrypto(null);
    setShowPaymentDetails(false);
  };

  // Add this function to manually refresh transactions
  const refreshTransactions = async () => {
    setLoading(true);
    await fetchTransactions(); // Now this will work because fetchTransactions is in scope
  };

  if (error) {
    return <div className="text-center py-10 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your funds and track transactions.</p>
        </div>
        <Button onClick={() => { setTransferType("deposit"); document.querySelector('[value="transfer"]').click(); resetForm(); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Funds
        </Button>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Available Balance</CardTitle>
            <Wallet className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-gray-900">${walletData.availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500 mt-1">Ready for trading</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Pending Transfers</CardTitle>
            <DollarSign className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-gray-900">${walletData.pendingTransfers.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500 mt-1">Processing</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Weekly Inflow</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-green-600">+${walletData.monthlyInflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500 mt-1">This Week</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Weekly Outflow</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-red-600">-${walletData.monthlyOutflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-gray-500 mt-1">This week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-md transition-all duration-200">Transaction History</TabsTrigger>
          <TabsTrigger value="transfer" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-md transition-all duration-200">Transfer Funds</TabsTrigger>
        </TabsList>

        {/* TRANSACTION HISTORY TAB */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="rounded-xl shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-800">Recent Transactions</CardTitle>
                <CardDescription className="text-gray-600">Your latest wallet activity</CardDescription>
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
                <p className="text-center text-gray-500 py-4">Loading transactions...</p>
              ) : recentTransactions.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No recent transactions.</p>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "deposit" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {transaction.type === "deposit" ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 capitalize">{transaction.type}</p>
                          <p className="text-sm text-gray-500">{transaction.description}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.transaction_date).toLocaleDateString()} at{' '}
                            {new Date(transaction.transaction_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p
                            className={`font-semibold text-lg ${
                              transaction.type === "deposit" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.type === "deposit" ? "+" : "-"}${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <Badge variant={transaction.status === "completed" ? "success" : transaction.status === "pending" ? "warning" : "destructive"} className="mt-1">
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

        <TabsContent value="transfer" className="space-y-6">
          {/* Your existing transfer form code remains here */}
          {/* Deposit-specific payment method selection */}
              {transferType === "deposit" && (
                <>
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-gray-700">Choose a Payment Method</label>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedPaymentMethod === "bank" ? "default" : "outline"}
                        onClick={() => { setSelectedPaymentMethod("bank"); setSelectedCrypto(null); }}
                        className="flex-1"
                        disabled={!paymentDetails.bank}
                      >
                        <Banknote className="w-4 h-4 mr-2" />
                        Bank Transfer
                      </Button>
                      <Button
                        variant={selectedPaymentMethod === "crypto" ? "default" : "outline"}
                        onClick={() => { setSelectedPaymentMethod("crypto"); }}
                        className="flex-1"
                        disabled={paymentDetails.crypto.length === 0}
                      >
                        <Bitcoin className="w-4 h-4 mr-2" />
                        Cryptocurrency
                      </Button>
                    </div>
                  </div>

                  {/* Conditionally render bank details */}
                 // In your WalletSection.jsx, update the deposit section to include validation:

                  {selectedPaymentMethod === "bank" && paymentDetails.bank && (
                    <Card className="rounded-lg shadow-inner border-dashed mt-4 bg-gray-50">
                      <CardContent className="p-4 space-y-2">
                        <p className="font-semibold text-sm">Transfer details</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Bank Name</span>
                          <span className="font-medium">{paymentDetails.bank.bank_name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Account Name</span>
                          <span className="font-medium">{paymentDetails.bank.account_name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Account Number</span>
                          <span className="font-medium">{paymentDetails.bank.account_number}</span>
                        </div>

                        {/* Add validation messages */}
                        {parseFloat(transferAmount) < paymentDetails.bank.min_deposit_amount && (
                          <p className="text-xs text-red-500">
                            * Minimum deposit: ${paymentDetails.bank.min_deposit_amount}
                          </p>
                        )}
                        {parseFloat(transferAmount) > paymentDetails.bank.max_deposit_amount && (
                          <p className="text-xs text-red-500">
                            * Maximum deposit: ${paymentDetails.bank.max_deposit_amount}
                          </p>
                        )}

                        <p className="text-xs text-red-500 mt-2">
                          *Please ensure the exact amount is transferred to this account.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Conditionally render crypto options and details */}
                  {selectedPaymentMethod === "crypto" && (
                    <>
                      <div className="space-y-2 mt-4">
                        <label className="text-sm font-medium text-gray-700">Choose a Coin</label>
                        <div className="flex gap-2 flex-wrap">
                          {paymentDetails.crypto.map((crypto) => (
                            <Button
                              key={crypto.currency}
                              variant={selectedCrypto === crypto.currency ? "default" : "outline"}
                              onClick={() => setSelectedCrypto(crypto.currency)}
                              className="flex-1 min-w-[100px]"
                            >
                              {crypto.currency === 'btc' && <Bitcoin className="w-4 h-4 mr-2" />}
                              {crypto.currency === 'eth' && <Ethereum className="w-4 h-4 mr-2" />}
                              {crypto.currency === 'usdt' && <FileText className="w-4 h-4 mr-2" />}
                              {crypto.currency.toUpperCase()}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {selectedCrypto && getCryptoDetails(selectedCrypto) && (
                        <Card className="rounded-lg shadow-inner border-dashed mt-4 bg-gray-50">
                          <CardContent className="p-4 space-y-2">
                            <p className="font-semibold text-sm">Wallet details for {selectedCrypto.toUpperCase()}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Network</span>
                              <span className="font-medium">{getCryptoDetails(selectedCrypto).network}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm break-all">
                              <span className="text-gray-600">Wallet Address</span>
                              <span className="font-medium text-xs sm:text-sm">{getCryptoDetails(selectedCrypto).wallet_address}</span>
                            </div>
                            <p className="text-xs text-red-500 mt-2">
                              *Only transfer {selectedCrypto.toUpperCase()} to this address on the specified network.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </>
              )}
              
              {/* Rest of your form remains the same... */}
              <div className="space-y-2">
                <label htmlFor="amount-input" className="text-sm font-medium text-gray-700">Amount</label>
                <Input
                  id="amount-input"
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {transferType === "withdrawal" && (
                <div className="space-y-2">
                  <label htmlFor="bank-account-select" className="text-sm font-medium text-gray-700">Bank Account</label>
                  <select
                    id="bank-account-select"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option>Chase Bank ****1234 (Default)</option>
                    <option>Wells Fargo ****5678</option>
                  </select>
                </div>
              )}

              {transferType === "deposit" ? (
                <Button
                  onClick={showPaymentDetails ? handleTransfer : handleInitiateTransfer}
                  className="w-full rounded-md py-2 px-4 text-lg font-semibold"
                  disabled={loading || transferAmount <= 0 || !selectedPaymentMethod || (selectedPaymentMethod === 'crypto' && !selectedCrypto)}
                >
                  {loading ? 'Processing...' : (showPaymentDetails ? 'I have transferred funds' : 'Initiate Transfer')}
                </Button>
              ) : (
                <Button onClick={handleTransfer} className="w-full rounded-md py-2 px-4 text-lg font-semibold" disabled={loading || transferAmount <= 0}>
                  {loading ? 'Processing...' : 'Withdraw Funds'}
                </Button>
              )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WalletSection


 