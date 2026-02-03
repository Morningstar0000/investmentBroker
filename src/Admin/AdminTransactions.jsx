"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Receipt, RefreshCw, Search, Filter, Download, CheckCircle, XCircle, Clock, DollarSign, User, Edit, Save } from '../components/ui/Icons';
import { supabase } from '../client';

const AdminTransactions = ({ user, onNavigate }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [userProfiles, setUserProfiles] = useState({});
  const [userWallets, setUserWallets] = useState({});
  const [editingBalance, setEditingBalance] = useState(null);
  const [editBalanceValue, setEditBalanceValue] = useState(''); // Renamed for clarity

  // Fetch user wallets from Supabase
  const fetchUserWallets = async () => {
    try {
      const { data: walletsData, error } = await supabase
        .from('wallets')
        .select('user_id, available_balance, pending_transfers, completed_transfers, declined_transfers')
        .order('available_balance', { ascending: false });

      if (error) {
        console.error('Error fetching wallets:', error);
        return;
      }

      console.log('Raw wallets data:', walletsData);
      
      const walletsMap = {};
      walletsData?.forEach(wallet => {
        walletsMap[wallet.user_id] = {
          available_balance: parseFloat(wallet.available_balance) || 0,
          pending_transfers: parseFloat(wallet.pending_transfers) || 0,
          completed_transfers: parseFloat(wallet.completed_transfers) || 0,
          declined_transfers: parseFloat(wallet.declined_transfers) || 0,
        };
      });
      
      setUserWallets(walletsMap);
      console.log('Updated wallets map:', walletsMap);
      console.log(`Loaded ${walletsData?.length || 0} user wallets`);
    } catch (error) {
      console.error('Error fetching user wallets:', error);
    }
  };

  // Fetch user profiles from Supabase
  const fetchUserProfiles = async () => {
    try {
      console.log('Fetching user profiles from profiles table...');
      
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, profile_picture_url, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      console.log(`Loaded ${profilesData?.length || 0} user profiles`);

      const profilesMap = {};
      profilesData?.forEach(profile => {
        const firstName = profile.first_name || '';
        const lastName = profile.last_name || '';
        const userName = firstName || lastName 
          ? `${firstName} ${lastName}`.trim()
          : profile.email?.split('@')[0] || `User ${profile.id.substring(0, 8)}...`;
        
        profilesMap[profile.id] = {
          id: profile.id,
          email: profile.email || `User ${profile.id.substring(0, 8)}...`,
          name: userName,
          first_name: profile.first_name,
          last_name: profile.last_name,
          profile_picture_url: profile.profile_picture_url
        };
      });
      
      setUserProfiles(profilesMap);
      return profilesMap;
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      
      const uniqueUserIds = [...new Set(transactions.map(t => t.user_id).filter(id => id))];
      const profilesMap = {};
      uniqueUserIds.forEach(id => {
        profilesMap[id] = { 
          id, 
          email: `User ${id.substring(0, 8)}...`,
          name: `User ${id.substring(0, 8)}...`
        };
      });
      setUserProfiles(profilesMap);
      return profilesMap;
    }
  };

  // Fetch transactions from Supabase
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching transactions...');
      
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (transactionsError) throw transactionsError;

      console.log('Fetched transactions:', transactionsData);
      setTransactions(transactionsData || []);

      // Fetch profiles and wallets
      await Promise.all([fetchUserProfiles(), fetchUserWallets()]);

    } catch (error) {
      console.error('Error in fetchTransactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Calculate statistics
  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    completed: transactions.filter(t => t.status === 'completed' || t.status === 'approved').length,
    declined: transactions.filter(t => t.status === 'declined' || t.status === 'failed' || t.status === 'rejected').length,
    totalAmount: transactions
      .filter(t => t.status === 'completed' || t.status === 'approved')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    const profile = transaction.profiles || userProfiles[transaction.user_id];
    const userName = profile?.name || profile?.email || 'Unknown User';
    const userEmail = profile?.email || '';
    
    const matchesSearch = searchTerm === '' || 
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id?.toLowerCase().includes(searchTerm) ||
      transaction.amount?.toString().includes(searchTerm) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesType = filterType === 'all' || getTransactionType(transaction.description) === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Get transaction type from description
  const getTransactionType = (description) => {
    if (!description) return 'other';
    const desc = description.toLowerCase();
    if (desc.includes('deposit')) return 'deposit';
    if (desc.includes('withdrawal')) return 'withdrawal';
    if (desc.includes('trade')) return 'trade';
    if (desc.includes('commission')) return 'commission';
    if (desc.includes('btc') || desc.includes('bitcoin') || desc.includes('crypto')) return 'crypto';
    if (desc.includes('bank')) return 'bank';
    return 'other';
  };

  // SIMPLIFIED: Update user wallet balance
  const updateUserWalletBalance = async (userId, newBalanceValue) => {
    try {
      const balance = parseFloat(newBalanceValue);
      if (isNaN(balance)) {
        throw new Error('Invalid balance amount');
      }

      console.log(`Updating wallet for user ${userId} to balance: ${balance}`);
      
      // First, check if wallet exists
      const { data: existingWallet, error: checkError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle to avoid throwing on no rows

      let result;
      
      if (checkError) {
        console.error('Error checking wallet:', checkError);
        throw checkError;
      }

      if (!existingWallet) {
        // Wallet doesn't exist, create it with just available_balance
        console.log('Wallet does not exist, creating new wallet...');
        result = await supabase
          .from('wallets')
          .insert([{
            user_id: userId,
            available_balance: balance
            // Only include available_balance since other columns might not exist
          }]);
      } else {
        // Wallet exists, update just available_balance
        console.log('Wallet exists, updating...');
        result = await supabase
          .from('wallets')
          .update({ 
            available_balance: balance
          })
          .eq('user_id', userId);
      }

      const { error, data } = result;

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Wallet updated/created successfully:', data);
      
      // Update local state
      setUserWallets(prev => ({
        ...prev,
        [userId]: {
          ...(prev[userId] || {}),
          available_balance: balance
        }
      }));
      
      // Refresh wallets to ensure we have the latest data
      await fetchUserWallets();
      
      return true;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  };

  // Handle status update
  const updateTransactionStatus = async (transactionId, newStatus) => {
    try {
      console.log(`Updating transaction ${transactionId} to status: ${newStatus}`);
      
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      // Update transaction status
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: newStatus
        })
        .eq('id', transactionId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Transaction updated successfully');
      
      // If approving a deposit, update user's wallet balance
      if (newStatus === 'completed' && transaction.type === 'deposit') {
        const currentWallet = userWallets[transaction.user_id];
        const currentBalance = currentWallet?.available_balance || 0;
        const transactionAmount = parseFloat(transaction.amount) || 0;
        const newBalance = currentBalance + transactionAmount;
        
        await updateUserWalletBalance(transaction.user_id, newBalance);
      }
      
      // If approving a withdrawal, update user's wallet balance
      if (newStatus === 'completed' && transaction.type === 'withdrawal') {
        const currentWallet = userWallets[transaction.user_id];
        const currentBalance = currentWallet?.available_balance || 0;
        const transactionAmount = parseFloat(transaction.amount) || 0;
        const newBalance = currentBalance - transactionAmount;
        
        if (newBalance < 0) {
          alert('Warning: User balance would go negative!');
        }
        
        await updateUserWalletBalance(transaction.user_id, newBalance);
      }
      
      // Update local state for immediate UI feedback
      setTransactions(prev => prev.map(t => 
        t.id === transactionId ? { ...t, status: newStatus } : t
      ));
      
      // Show success message
      alert(`Transaction ${newStatus === 'completed' ? 'approved' : 'declined'} successfully! User wallet balance updated.`);
      
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert(`Error updating transaction: ${error.message}`);
    }
  };

  // Start editing balance
  const startEditBalance = (userId) => {
    const currentWallet = userWallets[userId];
    const currentBalance = currentWallet?.available_balance || 0;
    setEditingBalance(userId);
    setEditBalanceValue(currentBalance.toString());
  };

  // Save edited balance
  const saveEditBalance = async (userId) => {
    if (!editBalanceValue || isNaN(parseFloat(editBalanceValue))) {
      alert('Please enter a valid balance amount');
      return;
    }
    
    try {
      await updateUserWalletBalance(userId, editBalanceValue);
      alert('Wallet balance updated successfully!');
      
      // Exit edit mode
      setEditingBalance(null);
      setEditBalanceValue('');
      
    } catch (error) {
      alert(`Error updating balance: ${error.message}`);
    }
  };

  // Cancel editing
  const cancelEditBalance = () => {
    setEditingBalance(null);
    setEditBalanceValue('');
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'declined':
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'declined':
      case 'failed':
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user display info
  const getUserDisplayInfo = (transaction) => {
    const profile = transaction.profiles || userProfiles[transaction.user_id];
    const wallet = userWallets[transaction.user_id];
    const walletBalance = wallet?.available_balance || 0;
    
    if (!profile) {
      return {
        name: `User ${transaction.user_id?.substring(0, 8)}...`,
        email: `ID: ${transaction.user_id?.substring(0, 8)}...`,
        hasProfile: false,
        walletBalance: walletBalance
      };
    }
    
    return {
      name: profile.name || profile.email?.split('@')[0] || `User ${profile.id.substring(0, 8)}...`,
      email: profile.email || `User ${profile.id.substring(0, 8)}...`,
      hasProfile: true,
      profile_picture_url: profile.profile_picture_url,
      walletBalance: walletBalance
    };
  };

  // Handle approve button click
  const handleApprove = (transactionId) => {
    if (window.confirm('Are you sure you want to approve this transaction? This will update the user\'s wallet balance.')) {
      updateTransactionStatus(transactionId, 'completed');
    }
  };

  // Handle decline button click
  const handleDecline = (transactionId) => {
    if (window.confirm('Are you sure you want to decline this transaction?')) {
      updateTransactionStatus(transactionId, 'declined');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Receipt className="w-8 h-8 mr-3 text-red-600" />
                Transaction Management
              </h1>
              <p className="text-gray-600 mt-2">View and manage all user transactions & wallet balances</p>
            </div>
            <Button
              onClick={fetchTransactions}
              variant="outline"
              className="flex items-center"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">All transactions</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Awaiting action</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Verified payments</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Declined/Failed</p>
                <p className="text-3xl font-bold text-red-600">{stats.declined}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Rejected transactions</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">All transaction value</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6 p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by user, amount, or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="crypto">Crypto</option>
                <option value="bank">Bank Transfer</option>
                <option value="other">Other</option>
              </select>

              <Button variant="outline" className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500 mb-4">Try changing your search or filters</p>
              <Button onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterType('all');
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wallet Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => {
                    const userInfo = getUserDisplayInfo(transaction);
                    const transactionType = getTransactionType(transaction.description);
                    
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {transaction.id?.substring(0, 10)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {userInfo.profile_picture_url ? (
                              <img 
                                src={userInfo.profile_picture_url} 
                                alt={userInfo.name}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {userInfo.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {userInfo.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingBalance === transaction.user_id ? (
                            <div className="flex items-center space-x-2">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                  type="number"
                                  value={editBalanceValue}
                                  onChange={(e) => setEditBalanceValue(e.target.value)}
                                  className="pl-6 pr-2 py-1 border border-gray-300 rounded text-sm w-32"
                                  step="0.01"
                                  min="0"
                                />
                              </div>
                              <Button
                                size="sm"
                                onClick={() => saveEditBalance(transaction.user_id)}
                                className="bg-green-600 hover:bg-green-700 h-8"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditBalance}
                                className="h-8"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-bold text-gray-900">
                                {formatCurrency(userInfo.walletBalance)}
                              </div>
                              <button
                                onClick={() => startEditBalance(transaction.user_id)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit balance"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{transaction.description || 'No description'}</div>
                          <div className="text-xs text-gray-500">
                            Type: <span className="font-semibold">{transactionType.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(transaction.status)}
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                              {transaction.status?.toUpperCase() || 'UNKNOWN'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.transaction_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {(transaction.status === 'pending' || transaction.status === 'processing') && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(transaction.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDecline(transaction.id)}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                alert(`Transaction Details:\n\nID: ${transaction.id}\nAmount: ${formatCurrency(transaction.amount)}\nStatus: ${transaction.status}\nDescription: ${transaction.description}\nDate: ${formatDate(transaction.transaction_date)}\nUser: ${userInfo.name} (${userInfo.email})\nCurrent Balance: ${formatCurrency(userInfo.walletBalance)}`);
                              }}
                            >
                              Details
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Transaction Count */}
          {filteredTransactions.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 text-sm text-gray-500 border-t border-gray-200">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;