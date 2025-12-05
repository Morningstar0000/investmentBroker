"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowUpDown, TrendingUp, TrendingDown, RefreshCw, Calculator, Star } from "lucide-react"

export default function CurrencyExchangeSection() {
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [amount, setAmount] = useState("1000")
  const [convertedAmount, setConvertedAmount] = useState("875.50")

  const exchangeRates = [
    { from: "USD", to: "EUR", rate: 0.8755, change: 0.0023, changePercent: 0.26, spread: 0.0002 },
    { from: "USD", to: "GBP", rate: 0.7901, change: -0.0034, changePercent: -0.43, spread: 0.0003 },
    { from: "USD", to: "JPY", rate: 149.85, change: 0.67, changePercent: 0.45, spread: 0.05 },
    { from: "USD", to: "CHF", rate: 0.8923, change: -0.0012, changePercent: -0.13, spread: 0.0002 },
    { from: "USD", to: "CAD", rate: 1.3567, change: -0.0021, changePercent: -0.15, spread: 0.0004 },
    { from: "USD", to: "AUD", rate: 1.5178, change: 0.0052, changePercent: 0.34, spread: 0.0005 },
    { from: "EUR", to: "GBP", rate: 0.8625, change: -0.0018, changePercent: -0.21, spread: 0.0003 },
    { from: "EUR", to: "JPY", rate: 163.45, change: 0.89, changePercent: 0.55, spread: 0.08 },
    { from: "GBP", to: "JPY", rate: 189.67, change: 1.23, changePercent: 0.65, spread: 0.12 },
  ]

  const popularPairs = [
    { pair: "EUR/USD", rate: 1.0875, isFavorite: true },
    { pair: "GBP/USD", rate: 1.2654, isFavorite: true },
    { pair: "USD/JPY", rate: 149.85, isFavorite: false },
    { pair: "USD/CHF", rate: 0.8923, isFavorite: true },
    { pair: "AUD/USD", rate: 0.6587, isFavorite: false },
    { pair: "USD/CAD", rate: 1.3567, isFavorite: false },
  ]

  const recentExchanges = [
    { id: 1, from: "USD", to: "EUR", amount: 5000, converted: 4377.5, rate: 0.8755, date: "2024-01-20T10:30:00Z" },
    { id: 2, from: "GBP", to: "USD", amount: 2000, converted: 2530.8, rate: 1.2654, date: "2024-01-20T09:15:00Z" },
    { id: 3, from: "USD", to: "JPY", amount: 1500, converted: 224775, rate: 149.85, date: "2024-01-19T16:45:00Z" },
    { id: 4, from: "EUR", to: "GBP", amount: 3000, converted: 2587.5, rate: 0.8625, date: "2024-01-19T14:20:00Z" },
  ]

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    // Recalculate converted amount
    const rate = exchangeRates.find((r) => r.from === toCurrency && r.to === fromCurrency)?.rate || 1
    setConvertedAmount((Number.parseFloat(amount) * rate).toFixed(2))
  }

  const handleAmountChange = (value) => {
    setAmount(value)
    const rate = exchangeRates.find((r) => r.from === fromCurrency && r.to === toCurrency)?.rate || 1
    setConvertedAmount((Number.parseFloat(value || 0) * rate).toFixed(2))
  }

  const currencies = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD", "SEK", "NOK"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Currency Exchange</h1>
          <p className="text-gray-600 mt-1">Convert currencies at live market rates with competitive spreads.</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Rates
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currency Converter */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Currency Converter
            </CardTitle>
            <CardDescription>Convert between major currencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromCurrency">From</Label>
              <select
                id="fromCurrency"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={handleSwapCurrencies}>
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toCurrency">To</Label>
              <select
                id="toCurrency"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600">You will receive</p>
                <p className="text-2xl font-bold text-green-600">
                  {convertedAmount} {toCurrency}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Rate: 1 {fromCurrency} ={" "}
                  {exchangeRates.find((r) => r.from === fromCurrency && r.to === toCurrency)?.rate || 1} {toCurrency}
                </p>
              </div>
            </div>

            <Button className="w-full">Exchange Now</Button>
          </CardContent>
        </Card>

        {/* Exchange Rates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Exchange Rates</CardTitle>
            <CardDescription>Real-time currency exchange rates with spreads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exchangeRates.map((rate, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">{rate.from}</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {rate.from}/{rate.to}
                      </p>
                      <p className="text-sm text-gray-500">Spread: {rate.spread}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{rate.rate}</p>
                    <div
                      className={`flex items-center text-sm ${rate.change >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {rate.change >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {rate.change >= 0 ? "+" : ""}
                      {rate.change} ({rate.changePercent >= 0 ? "+" : ""}
                      {rate.changePercent}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Pairs & Recent Exchanges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Currency Pairs */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Currency Pairs</CardTitle>
            <CardDescription>Most traded currency pairs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularPairs.map((pair, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm" className="p-0">
                      <Star
                        className={`w-4 h-4 ${pair.isFavorite ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                      />
                    </Button>
                    <span className="font-medium">{pair.pair}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{pair.rate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Exchanges */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Exchanges</CardTitle>
            <CardDescription>Your latest currency conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExchanges.map((exchange) => (
                <div key={exchange.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <ArrowUpDown className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {exchange.from} → {exchange.to}
                      </p>
                      <p className="text-sm text-gray-500">Rate: {exchange.rate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {exchange.amount} {exchange.from}
                    </p>
                    <p className="text-sm text-gray-500">
                      {exchange.converted} {exchange.to}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
