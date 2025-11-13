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
import { TrendingUp, DollarSign, Leaf, TrendingDown } from "lucide-react"

export function Dashboard() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [yields, setYields] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [animateCards, setAnimateCards] = useState(false)

  useEffect(() => {
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
    setTimeout(() => {
      setAnimateCards(true)
      setLoading(false)
    }, 100)
  }, [])

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalRevenue = yields.reduce((sum, y) => sum + y.revenue, 0)
  const netProfit = totalRevenue - totalExpenses

  const expensesByCategory = expenses.reduce((acc: any, exp: any) => {
    const existing = acc.find((e: any) => e.category === exp.category)
    if (existing) {
      existing.value += exp.amount
    } else {
      acc.push({ category: exp.category, value: exp.amount })
    }
    return acc
  }, [])

  const chartData = [
    { name: "Corn", expenses: 350, revenue: 5000 },
    { name: "Wheat", expenses: 175, revenue: 2400 },
  ]

  const colors = ["#52a76e", "#f59e0b", "#3b82f6", "#8b5cf6"]

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-shimmer text-lg font-medium">Loading dashboard...</div>
      </div>
    )
  }

  const metricCards = [
    {
      title: "Total Expenses",
      icon: DollarSign,
      color: "destructive",
      bgColor: "from-destructive/10 to-destructive/5",
      value: `$${totalExpenses}`,
      description: "All recorded expenses",
    },
    {
      title: "Total Revenue",
      icon: Leaf,
      color: "primary",
      bgColor: "from-primary/10 to-primary/5",
      value: `$${totalRevenue}`,
      description: "Yield sales total",
    },
    {
      title: "Net Profit",
      icon: TrendingUp,
      color: netProfit >= 0 ? "primary" : "destructive",
      bgColor: netProfit >= 0 ? "from-primary/10 to-primary/5" : "from-destructive/10 to-destructive/5",
      value: `$${netProfit}`,
      description: `${((netProfit / totalRevenue) * 100 || 0).toFixed(1)}% margin`,
    },
    {
      title: "Active Crops",
      icon: Leaf,
      color: "chart-1",
      bgColor: "from-chart-1/10 to-chart-1/5",
      value: yields.length.toString(),
      description: "Tracked varieties",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => (
          <Card
            key={idx}
            className={`bg-gradient-to-br ${card.bgColor} border-primary/20 transition-smooth cursor-pointer group hover:shadow-xl hover:scale-105 ${
              animateCards ? "animate-fade-in-up" : "opacity-0"
            }`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">{card.title}</CardTitle>
              <div className={`bg-${card.color}/10 p-2 rounded-lg transition-smooth group-hover:scale-110`}>
                <card.icon className={`h-4 w-4 text-${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold text-${card.color} transition-smooth`}>{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className={`shadow-md border-border/50 transition-smooth ${animateCards ? "animate-slide-in-right" : "opacity-0"}`}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Profit vs Expenses</CardTitle>
            <CardDescription>Revenue and expenses comparison by crop</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
                <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    transition: "all 0.2s ease-out",
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                />
                <Legend />
                <Bar dataKey="expenses" fill="var(--color-destructive)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revenue" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card
          className={`shadow-md border-border/50 transition-smooth ${animateCards ? "animate-slide-in-right" : "opacity-0"}`}
          style={{ animationDelay: "100ms" }}
        >
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Expense Distribution</CardTitle>
            <CardDescription>Breakdown by expense category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                >
                  {expensesByCategory.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card
        className={`shadow-md border-border/50 transition-smooth ${animateCards ? "animate-fade-in-up" : "opacity-0"}`}
        style={{ animationDelay: "200ms" }}
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Expenses</CardTitle>
          <CardDescription>Last 5 expense entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {expenses.slice(0, 5).map((exp, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-4 border border-border/30 rounded-lg transition-smooth hover:bg-primary/5 hover:border-primary/30 hover:shadow-md ${
                  animateCards ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${300 + idx * 50}ms` }}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {exp.category} - {exp.crop}
                  </p>
                  <p className="text-xs text-muted-foreground">{exp.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-destructive opacity-60 transition-smooth group-hover:scale-125" />
                  <p className="font-semibold text-destructive text-sm">${exp.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
