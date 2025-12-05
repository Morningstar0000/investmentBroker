"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Banknote,
  Bitcoin,
  MessageCircle,
} from "../components/ui/Icons";
import { Eye, EyeOff } from "lucide-react";

export default function AdminPaymentDetails({ supabase }) {
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState({
    payment_type: "bank",
    currency: "",
    bank_name: "",
    account_name: "",
    account_number: "",
    routing_number: "",
    wallet_address: "",
    network: "",
    is_active: true,
    display_order: 0,
    min_deposit_amount: "",
    max_deposit_amount: 500000,
    notes: "",
  });
  const [showSensitive, setShowSensitive] = useState({});

  useEffect(() => {
    fetchPaymentDetails();
  }, [supabase]);

  const fetchPaymentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_details")
        .select("*")
        .order("display_order", { ascending: true })
        .order("payment_type", { ascending: true });

      if (error) throw error;
      setPaymentDetails(data || []);
    } catch (error) {
      console.error("Error fetching payment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (detail) => {
    setEditingId(detail.id);
    setFormData({
      payment_type: detail.payment_type,
      currency: detail.currency || "",
      bank_name: detail.bank_name || "",
      account_name: detail.account_name || "",
      account_number: detail.account_number || "",
      routing_number: detail.routing_number || "",
      wallet_address: detail.wallet_address || "",
      network: detail.network || "",
      is_active: detail.is_active,
      display_order: detail.display_order || 0,
      min_deposit_amount: detail.min_deposit_amount || "",
      max_deposit_amount: detail.max_deposit_amount || 100000,
      notes: detail.notes || "",
    });
  };

  const handleSave = async () => {
    try {
      const updates = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      let error;

      if (editingId && editingId !== "new") {
        // Update existing record
        const { error: updateError } = await supabase
          .from("payment_details")
          .update(updates)
          .eq("id", editingId);

        error = updateError;
      } else {
        // Insert new record - remove id if it exists and add created_at
        const { id, ...newRecord } = updates; // Remove id for new records
        const recordToInsert = {
          ...newRecord,
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from("payment_details")
          .insert([recordToInsert]);

        error = insertError;
      }

      if (error) throw error;

      const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this payment method? This action cannot be undone.')) return

        try {
          const { error } = await supabase
            .from('payment_details')
            .delete()
            .eq('id', id)

          if (error) throw error

          // Show success message
          alert('Payment method deleted successfully!')
          fetchPaymentDetails()
        } catch (error) {
          console.error('Error deleting payment detail:', error)
          alert('Error deleting: ' + error.message)
        }
      }

      // Reset form and fetch updated data
      setEditingId(null);
      setFormData({
        payment_type: "bank",
        currency: "",
        bank_name: "",
        account_name: "",
        account_number: "",
        routing_number: "",
        wallet_address: "",
        network: "",
        is_active: true,
        display_order: 0,
        min_deposit_amount: '',
        max_deposit_amount: 100000,
        notes: "",
      });

      // Refresh the payment details list
      await fetchPaymentDetails();
    } catch (error) {
      console.error("Error saving payment detail:", error);
      alert("Error saving: " + error.message);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from("payment_details")
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      fetchPaymentDetails();
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const toggleSensitive = (field) => {
    setShowSensitive((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const filteredDetails = showInactive
    ? paymentDetails
    : paymentDetails.filter((detail) => detail.is_active);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">Loading payment details...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Payment Details Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage bank accounts and cryptocurrency wallets for deposits
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showInactive ? "default" : "outline"}
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? (
              <EyeOff className="w-4 h-4 mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {showInactive ? "Hide Inactive" : "Show Inactive"}
          </Button>

          <Button
            onClick={() => {
              setEditingId("new");
              setFormData({
                payment_type: "bank",
                currency: "",
                bank_name: "",
                account_name: "",
                account_number: "",
                routing_number: "",
                wallet_address: "",
                network: "",
                is_active: true,
                display_order: 0,
                min_deposit_amount: '',
                max_deposit_amount: 100000,
                notes: "",
              });
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {(editingId === "new" || editingId) && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {editingId === "new"
                ? "Add New Payment Method"
                : "Edit Payment Method"}
              <Button variant="outline" onClick={() => setEditingId(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type *
                </label>
                <select
                  value={formData.payment_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_type: e.target.value,
                      currency:
                        e.target.value === "bank" ? "" : formData.currency,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="crypto">Cryptocurrency</option>
                </select>
              </div>

              {formData.payment_type === "crypto" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Currency</option>
                    <option value="btc">Bitcoin (BTC)</option>
                    <option value="eth">Ethereum (ETH)</option>
                    <option value="usdt">Tether (USDT)</option>
                    <option value="usdc">USD Coin (USDC)</option>
                    <option value="bnb">Binance Coin (BNB)</option>
                  </select>
                </div>
              )}

              {formData.payment_type === "bank" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) =>
                        setFormData({ ...formData, bank_name: e.target.value })
                      }
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.account_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          account_name: e.target.value,
                        })
                      }
                      placeholder="Enter account name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number *
                    </label>
                    <Input
                      type="text"
                      value={formData.account_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          account_number: e.target.value,
                        })
                      }
                      placeholder="Enter account number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Routing Number
                    </label>
                    <Input
                      type="text"
                      value={formData.routing_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          routing_number: e.target.value,
                        })
                      }
                      placeholder="Enter routing number"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Address *
                    </label>
                    <Input
                      type="text"
                      value={formData.wallet_address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          wallet_address: e.target.value,
                        })
                      }
                      placeholder="Enter wallet address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Network *
                    </label>
                    <Input
                      type="text"
                      value={formData.network}
                      onChange={(e) =>
                        setFormData({ ...formData, network: e.target.value })
                      }
                      placeholder="e.g., Bitcoin Mainnet, ERC20, TRC20"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Deposit
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.min_deposit_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_deposit_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Deposit
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.max_deposit_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_deposit_amount: parseFloat(e.target.value) || 100000,
                    })
                  }
                  placeholder="100000.00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes or instructions..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 text-sm text-gray-700"
                >
                  Active (visible to users)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDetails.map((detail) => (
          <Card
            key={detail.id}
            className={`relative ${!detail.is_active ? "opacity-60" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {detail.payment_type === "bank" ? (
                    <Banknote className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Bitcoin className="w-5 h-5 text-orange-500" />
                  )}
                  <CardTitle className="text-lg">
                    {detail.payment_type === "bank"
                      ? detail.bank_name
                      : `${detail.currency?.toUpperCase()} Wallet`}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  <Badge variant={detail.is_active ? "success" : "secondary"}>
                    {detail.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">Order: {detail.display_order}</Badge>
                </div>
              </div>
              <CardDescription>
                {detail.payment_type === "bank"
                  ? "Bank Transfer"
                  : `Cryptocurrency - ${detail.network}`}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {detail.payment_type === "bank" ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-medium">{detail.account_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Account Number:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {showSensitive[`account_${detail.id}`]
                            ? detail.account_number
                            : "••••••••"}
                        </span>
                        <button
                          onClick={() =>
                            toggleSensitive(`account_${detail.id}`)
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showSensitive[`account_${detail.id}`] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    {detail.routing_number && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Routing Number:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {showSensitive[`routing_${detail.id}`]
                              ? detail.routing_number
                              : "••••••••"}
                          </span>
                          <button
                            onClick={() =>
                              toggleSensitive(`routing_${detail.id}`)
                            }
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSensitive[`routing_${detail.id}`] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Currency:</span>
                      <span className="font-medium">
                        {detail.currency?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Network:</span>
                      <span className="font-medium">{detail.network}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Wallet Address:</span>
                      <div className="flex items-center gap-1 mt-1">
                        <code className="text-xs bg-gray-100 p-1 rounded break-all flex-1">
                          {showSensitive[`wallet_${detail.id}`]
                            ? detail.wallet_address
                            : `${detail.wallet_address?.substring(
                              0,
                              8
                            )}...${detail.wallet_address?.substring(
                              detail.wallet_address.length - 8
                            )}`}
                        </code>
                        <button
                          onClick={() => toggleSensitive(`wallet_${detail.id}`)}
                          className="text-gray-400 hover:text-gray-600 shrink-0"
                        >
                          {showSensitive[`wallet_${detail.id}`] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Min: ${detail.min_deposit_amount}</div>
                <div>Max: ${detail.max_deposit_amount}</div>
              </div>

              {detail.notes && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>Notes:</strong> {detail.notes}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(detail.id, detail.is_active)}
                >
                  {detail.is_active ? "Deactivate" : "Activate"}
                </Button>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(detail)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(detail.id)} // Make sure it's calling handleDelete
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDetails.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No payment methods found.</p>
            <Button
              onClick={() => setEditingId("new")}
              className="mt-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
