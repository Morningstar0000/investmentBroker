"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/Card"
import {Button} from "./ui/Button"
import {Badge} from "./ui/Badge"
import { Plus, Settings, Percent, Users, DollarSign } from "lucide-react" // Removed TrendingUp as it's not used here

export default function AccountTypeSection({
  userId,
  accountTypes,
  selectedAccountTypeId,
  onAccountTypeSelect,
  profileSaving,
  dataError,
}) {
  const [warningMessage, setWarningMessage] = useState(null); // State for the warning message

  // Ensure accountTypes is an array before accessing its length or reducing
  const isAccountTypesArray = Array.isArray(accountTypes);

  // Calculate total accounts and total AUM (mock/placeholder values for display)
  const totalAccounts = isAccountTypesArray && accountTypes.length > 0 ? 1500 : 0;
  const totalAUM = isAccountTypesArray && accountTypes.length > 0 ? 50000000 : 0;

  // Calculate average management fee
  const avgManagementFee = isAccountTypesArray && accountTypes.length > 0
    ? (accountTypes.reduce((sum, type) => sum + type.management_fee, 0) / accountTypes.length).toFixed(2)
    : "0.00";

  // Handler for when an account type card or its "Configure" button is clicked
  const handleAccountSelectionAttempt = (accountTypeIdClicked) => {
    // If an account is already selected AND the clicked account is NOT the currently selected one
    if (selectedAccountTypeId !== null && accountTypeIdClicked !== selectedAccountTypeId) {
      setWarningMessage("Can't able to select multiple account. In order to make any changes, contact our support management or customer care.");
      // Clear the message after 7 seconds
      setTimeout(() => setWarningMessage(null), 7000);
      return; // Stop further execution
    }

    // If an account is already selected AND the clicked account IS the currently selected one
    if (selectedAccountTypeId !== null && accountTypeIdClicked === selectedAccountTypeId) {
        setWarningMessage("This account is already selected. In order to make any changes, contact our support management or customer care.");
        setTimeout(() => setWarningMessage(null), 7000);
        return; // Stop further execution
    }

    // If no account is selected, proceed with selection
    onAccountTypeSelect(accountTypeIdClicked);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Account Types</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage different investment account categories and their configurations.</p>
        </div>
     
      </div>

      {dataError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {dataError}</span>
        </div>
      )}

      {/* Warning Message Display */}
      {warningMessage && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Warning!</strong>
          <span className="block sm:inline"> {warningMessage}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Account Types</CardTitle>
            <Settings className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {/* Added defensive check for accountTypes.length */}
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{isAccountTypesArray ? accountTypes.length : 0}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active configurations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAccounts.toLocaleString()}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Across all types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AUM</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${(totalAUM / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Assets under management</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Management Fee</CardTitle>
            <Percent className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {avgManagementFee}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Weighted average</p>
          </CardContent>
        </Card>
      </div>

      {/* Account Types Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Added defensive check for accountTypes before mapping */}
        {isAccountTypesArray && accountTypes.length > 0 ? (
          accountTypes.map((accountType) => (
            <Card
              key={accountType.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedAccountTypeId === accountType.id
                  ? "border-2 border-blue-500 shadow-lg" // Highlight selected card
                  : "border border-gray-200 dark:border-gray-700"
              }`}
              onClick={() => handleAccountSelectionAttempt(accountType.id)} // Use the new handler
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{accountType.name}</CardTitle>
                    <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">{accountType.description}</CardDescription>
                  </div>
                  {/* Display "Selected" badge if this is the chosen account type */}
                  {selectedAccountTypeId === accountType.id && (
                    <Badge variant="default" className="bg-blue-500 text-white">Selected</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Min. Investment</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">${accountType.min_investment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Management Fee</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{accountType.management_fee}%</p>
                    </div>
                  </div>

                  {/* Risk Levels */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Supported Risk Levels</p>
                    <div className="flex flex-wrap gap-1">
                      {/* Added defensive check for accountType.risk_levels */}
                      {Array.isArray(accountType.risk_levels) && accountType.risk_levels.map((risk, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {risk}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Key Features</p>
                    <ul className="space-y-1">
                      {/* Added defensive check for accountType.features */}
                      {Array.isArray(accountType.features) && accountType.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-sm flex items-center text-gray-900 dark:text-gray-100">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant={selectedAccountTypeId === accountType.id ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAccountSelectionAttempt(accountType.id)} // Use the new handler for the button too
                      disabled={profileSaving || (selectedAccountTypeId !== null && selectedAccountTypeId !== accountType.id)} // Disable if another is selected
                    >
                      {profileSaving && selectedAccountTypeId === accountType.id ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        <>
                          <Settings className="w-4 h-4 mr-2" />
                          {selectedAccountTypeId === accountType.id ? "Selected" : "Configure"}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Plus className="w-4 h-4 mr-2" /> {/* Changed to Plus as TrendingUp was removed */}
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8 col-span-full">No account types available. Please ensure your Supabase 'account_types' table is populated.</p>
        )}
      </div>
    </div>
  )
}
