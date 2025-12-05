"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Settings, TrendingUp, Percent, Users, DollarSign } from "lucide-react"

export default function AccountTypeSection() {
  const [selectedAccount, setSelectedAccount] = useState(null)

  const accountTypes = [
    {
      id: 1,
      name: "Individual Taxable",
      description: "Standard investment account for individual investors",
      minInvestment: 1000,
      managementFee: 1.0,
      features: ["Tax-loss harvesting", "Dividend reinvestment", "Fractional shares"],
      totalAccounts: 28,
      totalAUM: 2450000,
      status: "Active",
      riskLevels: ["Conservative", "Moderate", "Aggressive"],
    },
    {
      id: 2,
      name: "Traditional IRA",
      description: "Tax-deferred retirement account",
      minInvestment: 500,
      managementFee: 0.75,
      features: ["Tax-deferred growth", "Required distributions at 72", "Tax deductible contributions"],
      totalAccounts: 15,
      totalAUM: 1850000,
      status: "Active",
      riskLevels: ["Conservative", "Moderate"],
    },
    {
      id: 3,
      name: "Roth IRA",
      description: "Tax-free retirement account",
      minInvestment: 500,
      managementFee: 0.75,
      features: ["Tax-free growth", "No required distributions", "Tax-free withdrawals in retirement"],
      totalAccounts: 22,
      totalAUM: 1650000,
      status: "Active",
      riskLevels: ["Conservative", "Moderate", "Aggressive"],
    },
    {
      id: 4,
      name: "Joint Account",
      description: "Shared investment account for couples",
      minInvestment: 2000,
      managementFee: 1.25,
      features: ["Joint ownership", "Survivorship rights", "Shared access"],
      totalAccounts: 8,
      totalAUM: 980000,
      status: "Active",
      riskLevels: ["Conservative", "Moderate"],
    },
    {
      id: 5,
      name: "Trust Account",
      description: "Investment account for trust entities",
      minInvestment: 10000,
      managementFee: 1.5,
      features: ["Fiduciary management", "Estate planning", "Tax optimization"],
      totalAccounts: 5,
      totalAUM: 2100000,
      status: "Active",
      riskLevels: ["Conservative", "Moderate", "Aggressive"],
    },
    {
      id: 6,
      name: "Corporate Account",
      description: "Investment account for business entities",
      minInvestment: 25000,
      managementFee: 2.0,
      features: ["Business investment", "Corporate treasury", "Institutional pricing"],
      totalAccounts: 3,
      totalAUM: 1500000,
      status: "Limited",
      riskLevels: ["Conservative", "Moderate"],
    },
  ]

  const totalAccounts = accountTypes.reduce((sum, type) => sum + type.totalAccounts, 0)
  const totalAUM = accountTypes.reduce((sum, type) => sum + type.totalAUM, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Types</h1>
          <p className="text-gray-600 mt-1">Manage different investment account categories and their configurations.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Account Type
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Account Types</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountTypes.length}</div>
            <p className="text-xs text-muted-foreground">Active configurations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
            <p className="text-xs text-muted-foreground">Across all types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AUM</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalAUM / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Assets under management</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Management Fee</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(accountTypes.reduce((sum, type) => sum + type.managementFee, 0) / accountTypes.length).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">Weighted average</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Types Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accountTypes.map((accountType) => (
          <Card key={accountType.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{accountType.name}</CardTitle>
                  <CardDescription className="mt-1">{accountType.description}</CardDescription>
                </div>
                <Badge variant={accountType.status === "Active" ? "default" : "secondary"}>{accountType.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Min. Investment</p>
                    <p className="text-lg font-semibold">${accountType.minInvestment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Management Fee</p>
                    <p className="text-lg font-semibold">{accountType.managementFee}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Accounts</p>
                    <p className="text-lg font-semibold">{accountType.totalAccounts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">AUM</p>
                    <p className="text-lg font-semibold">${(accountType.totalAUM / 1000000).toFixed(1)}M</p>
                  </div>
                </div>

                {/* Risk Levels */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Supported Risk Levels</p>
                  <div className="flex flex-wrap gap-1">
                    {accountType.riskLevels.map((risk) => (
                      <Badge key={risk} variant="outline" className="text-xs">
                        {risk}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Key Features</p>
                  <ul className="space-y-1">
                    {accountType.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-sm flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
