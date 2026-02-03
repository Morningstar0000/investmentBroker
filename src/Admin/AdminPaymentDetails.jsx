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
  Globe,
  MapPin
} from "../components/ui/Icons";
import { Eye, EyeOff } from "lucide-react";

export default function AdminPaymentDetails({ supabase }) {
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [formData, setFormData] = useState({
    payment_type: "bank_us",
    currency: "",
    bank_name: "",
    account_name: "",
    account_number: "",
    iban: "",
    swift_bic: "",
    routing_number: "",
    bank_country: "",
    bank_address: "",
    wallet_address: "",
    network: "",
    is_active: true,
    display_order: 0,
    notes: "",
    account_type: "checking",
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
      iban: detail.iban || "",
      swift_bic: detail.swift_bic || "",
      routing_number: detail.routing_number || "",
      bank_country: detail.bank_country || "",
      bank_address: detail.bank_address || "",
      account_type: detail.account_type || "checking", // Add this
      wallet_address: detail.wallet_address || "",
      network: detail.network || "",
      is_active: detail.is_active,
      display_order: detail.display_order || 0,
      notes: detail.notes || "",
    });
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (formData.payment_type === "bank") {
        if (!formData.bank_name?.trim() || !formData.account_name?.trim()) {
          alert("Bank Name and Account Name are required for bank transfers");
          return;
        }
        // Either account number or IBAN is required
        if (!formData.account_number?.trim() && !formData.iban?.trim()) {
          alert("Either Account Number or IBAN is required for bank transfers");
          return;
        }
      } else if (formData.payment_type === "crypto") {
        if (
          !formData.currency?.trim() ||
          !formData.wallet_address?.trim() ||
          !formData.network?.trim()
        ) {
          alert(
            "Currency, Wallet Address, and Network are required for cryptocurrency"
          );
          return;
        }
      }

      // Prepare updates
      const updates = {
        payment_type: formData.payment_type,
        currency: formData.currency || null,
        bank_name: formData.bank_name || null,
        account_name: formData.account_name || null,
        account_number: formData.account_number || null,
        iban: formData.iban || null,
        swift_bic: formData.swift_bic || null,
        routing_number: formData.routing_number || null,
        bank_country: formData.bank_country || null,
        bank_address: formData.bank_address || null,
        wallet_address: formData.wallet_address || null,
        network: formData.network || null,
        is_active: formData.is_active,
        display_order: formData.display_order || 0,
        notes: formData.notes || null,
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
        const { id, ...newRecord } = updates;
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

      alert(
        `Payment method ${editingId === "new" ? "added" : "updated"
        } successfully!`
      );

      setEditingId(null);
      setFormData({
        payment_type: "bank_us",
        currency: "",
        bank_name: "",
        account_name: "",
        account_number: "",
        iban: "",
        swift_bic: "",
        routing_number: "",
        bank_country: "",
        bank_address: "",
        wallet_address: "",
        network: "",
        is_active: true,
        display_order: 0,
        notes: "",
        account_type: "checking",
      });

      await fetchPaymentDetails();
    } catch (error) {
      console.error("Error saving payment detail:", error);
      alert("Error saving: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this payment method? This action cannot be undone."
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("payment_details")
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("Payment method deleted successfully!");
      fetchPaymentDetails();
    } catch (error) {
      console.error("Error deleting payment detail:", error);
      alert("Error deleting: " + error.message);
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

      alert(
        `Payment method ${!currentStatus ? "activated" : "deactivated"
        } successfully!`
      );
      fetchPaymentDetails();
    } catch (error) {
      console.error("Error toggling active status:", error);
      alert("Error updating status: " + error.message);
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
                payment_type: "bank_us",
                currency: "",
                bank_name: "",
                account_name: "",
                account_number: "",
                iban: "",
                swift_bic: "",
                routing_number: "",
                bank_country: "",
                bank_address: "",
                wallet_address: "",
                network: "",
                is_active: true,
                display_order: 0,
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
                      currency: e.target.value === "crypto" ? formData.currency : "",
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bank_us">US Bank Transfer</option>
                  <option value="bank_europe">European Bank Transfer</option>
                  <option value="crypto">Cryptocurrency</option>
                </select>
              </div>

              {formData.payment_type === "crypto" ? (
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
              ) : (
                <div className="flex items-center gap-2">
                  {formData.payment_type === "bank_us" ? (
                    <MapPin className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Globe className="w-5 h-5 text-green-600" />
                  )}
                  <span className="text-sm font-medium">
                    {formData.payment_type === "bank_us" ? "US Bank" : "European Bank"}
                  </span>
                </div>
              )}

              {(formData.payment_type === "bank_us" || formData.payment_type === "bank_europe") ? (
                <>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {formData.payment_type === "bank_us" ? "US Bank Account Details" : "European Bank Account Details"}
                    </h3>
                  </div>

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
                      required
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
                      placeholder="Enter account holder name"
                      required
                    />
                  </div>

                  {/* Show different fields based on bank type */}
                  {formData.payment_type === "bank_us" ? (
                    <>
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
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Routing Number (ABA) *
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
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Type *
                        </label>
                        <select
                          value={formData.account_type}
                          onChange={(e) =>
                            setFormData({ ...formData, account_type: e.target.value })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="checking">Checking Account</option>
                          <option value="savings">Savings Account</option>
                          <option value="business">Business Account</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Country
                        </label>
                        <Input
                          type="text"
                          value={formData.bank_country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bank_country: e.target.value,
                            })
                          }
                          placeholder="e.g., United States"
                        />
                      </div>
                    </>

                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          IBAN *
                        </label>
                        <Input
                          type="text"
                          value={formData.iban}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              iban: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="DE89 3704 0044 0532 0130 00"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">International Bank Account Number</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SWIFT/BIC Code *
                        </label>
                        <Input
                          type="text"
                          value={formData.swift_bic}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              swift_bic: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="DEUTDEFFXXX"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Country
                        </label>
                        <Input
                          type="text"
                          value={formData.bank_country}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bank_country: e.target.value,
                            })
                          }
                          placeholder="e.g., Germany, France, UK"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Address
                    </label>
                    <Input
                      type="text"
                      value={formData.bank_address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bank_address: e.target.value,
                        })
                      }
                      placeholder="Bank street address"
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
                      required
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
                      required
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
                <p className="text-xs text-gray-500 mt-1">
                  Lower numbers show first
                </p>
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
                  placeholder="Additional instructions, processing times, etc."
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
                    {detail.payment_type === "bank_us" || detail.payment_type === "bank_europe"
                      ? detail.bank_name || `${detail.payment_type === "bank_us" ? "US Bank" : "European Bank"} Account`
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
                {detail.payment_type === "bank_us" ? (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>US Bank Transfer</span>
                  </div>
                ) : detail.payment_type === "bank_europe" ? (
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-green-600" />
                    <span>European Bank Transfer</span>
                  </div>
                ) : (
                  `Cryptocurrency - ${detail.network}`
                )}
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

                    {detail.iban ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">IBAN:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {showSensitive[`iban_${detail.id}`]
                              ? detail.iban
                              : `${detail.iban?.substring(
                                0,
                                4
                              )}...${detail.iban?.substring(
                                detail.iban?.length - 4
                              )}`}
                          </span>
                          <button
                            onClick={() => toggleSensitive(`iban_${detail.id}`)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSensitive[`iban_${detail.id}`] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
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
                    )}

                    {detail.swift_bic && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">SWIFT/BIC:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            {showSensitive[`swift_${detail.id}`]
                              ? detail.swift_bic
                              : `${detail.swift_bic?.substring(
                                0,
                                4
                              )}...${detail.swift_bic?.substring(
                                detail.swift_bic?.length - 3
                              )}`}
                          </span>
                          <button
                            onClick={() =>
                              toggleSensitive(`swift_${detail.id}`)
                            }
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSensitive[`swift_${detail.id}`] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

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

                    {detail.bank_country && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">
                          {detail.bank_country}
                        </span>
                      </div>
                    )}

                    {detail.bank_address && (
                      <div className="text-sm">
                        <span className="text-gray-600">Bank Address:</span>
                        <p className="text-xs mt-1">{detail.bank_address}</p>
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
                    onClick={() => handleDelete(detail.id)}
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
