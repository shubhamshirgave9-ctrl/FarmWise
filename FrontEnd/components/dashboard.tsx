"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, DollarSign, Leaf } from "lucide-react"

export function Dashboard() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [yields, setYields] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Placeholder API call - replace with actual backend
    const mockExpenses = [
      { date: "2024-01-01", amount: 150, category: "Fertilizer", crop: "Corn" },
      { date: "2024-01-05", amount: 75, category: "Seeds", crop: "Wheat" },
      { date: "2024-01-10", amount: 200, category: "Fuel", crop: "Corn" },
      { date: "2024-01-15", amount: 100, category: "Fertilizer", crop: "Wheat" },
    ]

    const mockYields = [
      { crop: "Corn", quantity: 500, unit: "kg", revenue: 5000 },
      { crop: "Wheat", quantity: 300, unit: "kg", revenue: 2400 },
    ]

    setExpenses(mockExpenses)
    setYields(mockYields)
    setLoading(false)
  }, [])

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalRevenue = yields.reduce((sum, y) => sum + y.revenue, 0)
  const netProfit = totalRevenue - totalExpenses

  // Aggregate expenses by crop
  const expensesByCategory = expenses.reduce((acc: any, exp: any) => {
    const existing = acc.find((e: any) => e.category === exp.category)
    if (existing) {
      existing.value += exp.amount
    } else {
      acc.push({ category: exp.category, value: exp.amount })
    }
    return acc
  }, [])

  // Data for chart
  const chartData = [
    { name: "Corn", expenses: 350, revenue: 5000 },
    { name: "Wheat", expenses: 175, revenue: 2400 },
  ]

  const colors = ["#6b9e3f", "#d97706", "#3b82f6", "#8b5cf6"]

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Summary Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalExpenses}</div>
            <p className="text-xs text-muted-foreground">All recorded expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Leaf className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground">Yield sales total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
              ${netProfit}
            </div>
            <p className="text-xs text-muted-foreground">
              {((netProfit / totalRevenue) * 100 || 0).toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Crops</CardTitle>
            <Sprout className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yields.length}</div>
            <p className="text-xs text-muted-foreground">Tracked varieties</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profit vs Expenses by Crop</CardTitle>
            <CardDescription>Revenue and expenses comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Legend />
                <Bar dataKey="expenses" fill="var(--color-destructive)" />
                <Bar dataKey="revenue" fill="var(--color-primary)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>By expense category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={expensesByCategory} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={80}>
                  {expensesByCategory.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Last 5 expense entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.slice(0, 5).map((exp, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="font-medium text-sm">
                    {exp.category} - {exp.crop}
                  </p>
                  <p className="text-xs text-muted-foreground">{exp.date}</p>
                </div>
                <p className="font-semibold text-destructive">${exp.amount}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Add missing import
import { Sprout } from "lucide-react"
