"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Plus, Phone, TrendingUp, TrendingDown, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function InvestorsSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const investors = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 234-5678",
      portfolioValue: 125000,
      totalReturn: 15.2,
      riskProfile: "Moderate",
      status: "Active",
      joinDate: "2023-01-15",
      lastActivity: "2024-01-20",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 (555) 345-6789",
      portfolioValue: 89500,
      totalReturn: -3.1,
      riskProfile: "Conservative",
      status: "Active",
      joinDate: "2023-03-22",
      lastActivity: "2024-01-19",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      phone: "+1 (555) 456-7890",
      portfolioValue: 234000,
      totalReturn: 22.8,
      riskProfile: "Aggressive",
      status: "Active",
      joinDate: "2022-11-08",
      lastActivity: "2024-01-21",
    },
    {
      id: 4,
      name: "David Thompson",
      email: "david.thompson@email.com",
      phone: "+1 (555) 567-8901",
      portfolioValue: 67800,
      totalReturn: 8.4,
      riskProfile: "Moderate",
      status: "Inactive",
      joinDate: "2023-06-12",
      lastActivity: "2024-01-10",
    },
  ]

  const filteredInvestors = investors.filter((investor) => {
    const matchesSearch =
      investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedFilter === "all" || investor.status.toLowerCase() === selectedFilter
    return matchesSearch && matchesFilter
  })

  const totalPortfolioValue = investors.reduce((sum, investor) => sum + investor.portfolioValue, 0)
  const activeInvestors = investors.filter((investor) => investor.status === "Active").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investors</h1>
          <p className="text-gray-600 mt-1">Manage your investor relationships and portfolios.</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Investor
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investors.length}</div>
            <p className="text-xs text-muted-foreground">{activeInvestors} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AUM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Assets under management</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(totalPortfolioValue / investors.length).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Per investor</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search investors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "active", "inactive"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className="capitalize"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investors List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInvestors.map((investor) => (
          <Card key={investor.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={`/placeholder-user.jpg`} alt={investor.name} />
                    <AvatarFallback>
                      {investor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{investor.name}</CardTitle>
                    <CardDescription>{investor.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={investor.status === "Active" ? "default" : "secondary"}>{investor.status}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Portfolio Value</p>
                    <p className="text-lg font-semibold">${investor.portfolioValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Return</p>
                    <div className="flex items-center">
                      {investor.totalReturn >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <p
                        className={`text-lg font-semibold ${
                          investor.totalReturn >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {investor.totalReturn >= 0 ? "+" : ""}
                        {investor.totalReturn}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-500">
                      <Phone className="w-4 h-4 mr-1" />
                      {investor.phone}
                    </div>
                  </div>
                  <Badge variant="outline">{investor.riskProfile}</Badge>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Joined: {new Date(investor.joinDate).toLocaleDateString()}</span>
                  <span>Last active: {new Date(investor.lastActivity).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvestors.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No investors found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
