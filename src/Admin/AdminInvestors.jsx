"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Plus, RefreshCw, Edit, Trash2, Search, Filter } from '../components/ui/Icons';
import Input from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { supabase } from '../client';
import { useToast } from '../context/ToastContext';
import EditInvestorDialog from './EditInvestorsDialog';
import CreateInvestorDialog from './CreateInvestorsDialog';

export default function AdminInvestorsPage() {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false); // ADD THIS STATE
    const [selectedInvestorId, setSelectedInvestorId] = useState(null);
    const { addToast } = useToast();

    const [investors, setInvestors] = useState([]);
    const [filteredInvestors, setFilteredInvestors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRisk, setFilterRisk] = useState('all');


    console.log('📋 All investors:', investors.map(inv => ({
        id: inv.id,
        name: inv.name,
        type: typeof inv.id
    })));

useEffect(() => {
  console.log('🎯 Component mounted, fetching investors');
  fetchInvestors();
}, []);

    useEffect(() => {
        filterInvestors();
    }, [searchTerm, filterRisk, investors]);

    useEffect(() => {
        console.log('🔄 Investors state changed:', investors.length, 'investors');
    }, [investors]);

    // And in the fetchInvestors function:
    const fetchInvestors = async () => {
  try {
    console.log('🔄 START: fetchInvestors called');
    setLoading(true);

    // Simple standard query
    const { data, error } = await supabase
      .from('investors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }

    console.log('✅ END: fetchInvestors completed, got', data?.length || 0, 'investors');

    // Log the first investor to see if it's updated
    if (data && data.length > 0) {
      console.log('🔍 First investor details:', {
        id: data[0].id,
        name: data[0].name,
        username: data[0].username,
        updated_at: data[0].updated_at
      });
    }

    // Force React to see this as new data
    const investorsCopy = JSON.parse(JSON.stringify(data || []));
    setInvestors(investorsCopy);
    setFilteredInvestors(investorsCopy);

  } catch (error) {
    console.error('❌ Error in fetchInvestors:', error);
    addToast(`Error loading investors: ${error.message}`, 'error');
  } finally {
    setLoading(false);
  }
};
    const filterInvestors = () => {
        let filtered = investors;

        if (searchTerm) {
            filtered = filtered.filter(investor =>
                investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                investor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (investor.trading_style && investor.trading_style.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (filterRisk !== 'all') {
            filtered = filtered.filter(investor => investor.risk_level === filterRisk);
        }

        setFilteredInvestors(filtered);
    };

    const handleEditClick = (investorId) => {
        setSelectedInvestorId(investorId);
        setEditDialogOpen(true);
    };

    // ADD THIS FUNCTION
    const handleAddClick = () => {
        setCreateDialogOpen(true);
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete investor "${name}"?`)) return;

        try {
            const { error } = await supabase
                .from('investors')
                .delete()
                .eq('id', id);

            if (error) throw error;

            addToast(`Investor "${name}" deleted successfully`, 'success');
            fetchInvestors();
        } catch (error) {
            addToast(`Error deleting investor: ${error.message}`, 'error');
        }
    };

    const getRiskBadge = (risk) => {
        const colors = {
            low: 'bg-green-100 text-green-800 border-green-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            high: 'bg-red-100 text-red-800 border-red-200'
        };

        return (
            <Badge className={`${colors[risk] || 'bg-gray-100 text-gray-800'} border`}>
                {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
            </Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-gray-600">Loading investors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Investor Management</h1>
                    <p className="text-gray-600">Create, edit, and manage trading investors</p>
                </div>

                <div className="flex gap-2">
                    <Button onClick={fetchInvestors} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    {/* FIXED THIS BUTTON - removed router.push */}
                    <Button onClick={handleAddClick}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Investor
                    </Button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Search investors by name, username, or style..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            value={filterRisk}
                            onChange={(e) => setFilterRisk(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                        >
                            <option value="all">All Risk Levels</option>
                            <option value="low">Low Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="high">High Risk</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-2xl font-bold text-gray-900">{investors.length}</div>
                    <div className="text-sm text-gray-600">Total Investors</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-2xl font-bold text-green-600">
                        {investors.filter(i => i.verified).length}
                    </div>
                    <div className="text-sm text-gray-600">Verified</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-2xl font-bold text-blue-600">
                        {investors.filter(i => i.risk_level === 'high').length}
                    </div>
                    <div className="text-sm text-gray-600">High Risk</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-2xl font-bold text-purple-600">
                        {investors.reduce((sum, i) => sum + (i.followers || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Followers</div>
                </div>
            </div>

            {/* Investors Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Investor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stats
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Risk
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredInvestors.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        {investors.length === 0 ? 'No investors found. Add your first investor!' : 'No investors match your search criteria.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredInvestors.map((investor) => (
                                    <tr key={investor.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img
                                                    src={investor.avatar_url || '/placeholder-avatar.jpg'}
                                                    alt={investor.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div className="ml-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {investor.name}
                                                        </div>
                                                        {investor.verified && (
                                                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                                                                Verified
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        @{investor.username}
                                                    </div>
                                                    <div className="text-xs text-gray-400 truncate max-w-xs">
                                                        {investor.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Trades:</span>{' '}
                                                    <span className="font-medium">{investor.total_trades?.toLocaleString() || 0}</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Win Rate:</span>{' '}
                                                    <span className="font-medium text-green-600">{investor.win_rate}%</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Followers:</span>{' '}
                                                    <span className="font-medium">{investor.followers?.toLocaleString() || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-2">
                                                {getRiskBadge(investor.risk_level)}
                                                <div className="text-xs text-gray-500">
                                                    {investor.trading_style}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {investor.experience}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Total Return:</span>{' '}
                                                    <span className="font-medium text-green-600">+{investor.total_return}%</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-500">This Month:</span>{' '}
                                                    <span className="font-medium text-blue-600">+{investor.monthly_return}%</span>
                                                </div>
                                                <div className="text-sm">
                                                    <span className="text-gray-500">Drawdown:</span>{' '}
                                                    <span className="font-medium text-red-600">{investor.max_drawdown}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleEditClick(investor.id)}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => handleDelete(investor.id, investor.name)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination or additional info */}
            <div className="text-center text-sm text-gray-500">
                Showing {filteredInvestors.length} of {investors.length} investors
            </div>

            {/* Edit Dialog */}
            <EditInvestorDialog
                investorId={selectedInvestorId}
                isOpen={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onInvestorUpdated={fetchInvestors}
            />

            {/* Create Dialog - ADD THIS */}
            <CreateInvestorDialog
                isOpen={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onInvestorCreated={fetchInvestors}
            />
        </div>
    );
}