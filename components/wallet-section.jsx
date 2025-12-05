"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  BanknoteIcon as Bank,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  Settings,
} from "lucide-react"

export default function WalletSection() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferType, setTransferType] = useState("deposit")

  const walletData = {
    availableBalance: 15420.3,
    pendingTransfers: 2500.0,
    totalDeposits: 125000.0,
    totalWithdrawals: 87500.0,
    monthlyInflow: 8500.0,
    monthlyOutflow: 3200.0,
  }

  const recentTransactions = [
    {
      id: 1,
      type: "deposit",
      amount: 5000.0,
      description: "Bank Transfer - Chase ****1234",
      date: "2024-01-20",
      status: "completed",
      reference: "TXN-001234",
    },
    {
      id: 2,
      type: "withdrawal",
      amount: 2500.0,
      description: "Investment Purchase - AAPL",
      date: "2024-01-19",
      status: "completed",
      reference: "TXN-001233",
    },
    {
      id: 3,
      type: "deposit",
      amount: 1200.0,
      description: "Dividend Payment - Portfolio",
      date: "2024-01-18",
      status: "completed",
      reference: "TXN-001232",
    },
    {
      id: 4,
      type: "withdrawal",
      amount: 3000.0,
      description: "Bank Transfer - Wells Fargo ****5678",
      date: "2024-01-17",
      status: "pending",
      reference: "TXN-001231",
    },
    {
      id: 5,
      type: "deposit",
      amount: 7500.0,
      description: "Wire Transfer - Client Payment",
      date: "2024-01-16",
      status: "completed",
      reference: "TXN-001230",
    },
  ]

  const connectedAccounts = [
    {
      id: 1,
      bankName: "Chase Bank",
      accountNumber: "****1234",
      accountType: "Checking",
      status: "verified",
      isDefault: true,
    },
    {
      id: 2,
      bankName: "Wells Fargo",
      accountNumber: "****5678",
      accountType: "Savings",
      status: "verified",
      isDefault: false,
    },
    {
      id: 3,
      bankName: "Bank of America",
      accountNumber: "****9012",
      accountType: "Checking",
      status: "pending",
      isDefault: false,
    },
  ]

  const handleTransfer = () => {
    // Handle transfer logic here
    console.log(`${transferType}: $${transferAmount}`)
    setTransferAmount("")
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getTransactionIcon = (type) => {
    return type === "deposit" ? (
      <ArrowDownLeft className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowUpRight className="w-4 h-4 text-red-500" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your funds and track transactions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Funds
          </Button>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletData.availableBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ready for investment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletData.pendingTransfers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Inflow</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+${walletData.monthlyInflow.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Outflow</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-${walletData.monthlyOutflow.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transfer">Transfer Funds</TabsTrigger>
          <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest wallet activity</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{transaction.reference}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            transaction.type === "deposit" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "deposit" ? "+" : "-"}${transaction.amount.toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(transaction.status)}
                          <span className="text-sm text-gray-500 capitalize">{transaction.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transfer Form */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Funds</CardTitle>
                <CardDescription>Deposit or withdraw money from your wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={transferType === "deposit" ? "default" : "outline"}
                    onClick={() => setTransferType("deposit")}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Deposit
                  </Button>
                  <Button
                    variant={transferType === "withdrawal" ? "default" : "outline"}
                    onClick={() => setTransferType("withdrawal")}
                    className="flex-1"
                  >
                    <Minus className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account">Bank Account</Label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Chase Bank ****1234 (Default)</option>
                    <option>Wells Fargo ****5678</option>
                  </select>
                </div>

                <Button onClick={handleTransfer} className="w-full">
                  {transferType === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
                </Button>
              </CardContent>
            </Card>

            {/* Transfer Limits */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Limits</CardTitle>
                <CardDescription>Your current transfer restrictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Daily Limit</span>
                    <span className="font-medium">$50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Limit</span>
                    <span className="font-medium">$500,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Used Today</span>
                    <span className="font-medium">$5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Used This Month</span>
                    <span className="font-medium">$45,000</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Processing Times</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>ACH Transfer</span>
                      <span>1-3 business days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wire Transfer</span>
                      <span>Same day</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Connected Bank Accounts</CardTitle>
                  <CardDescription>Manage your linked bank accounts for transfers</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Bank className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{account.bankName}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{account.accountType}</span>
                          <span>•</span>
                          <span>{account.accountNumber}</span>
                          {account.isDefault && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs">
                                Default
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={account.status === "verified" ? "default" : "secondary"}>{account.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
