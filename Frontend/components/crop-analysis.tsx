"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export function CropAnalysis() {
  // Mock data - in production, fetch from API
  const expenses = [
    { crop: "Corn", category: "Fertilizer", amount: 200 },
    { crop: "Corn", category: "Seeds", amount: 100 },
    { crop: "Corn", category: "Fuel", amount: 50 },
    { crop: "Wheat", category: "Fertilizer", amount: 100 },
    { crop: "Wheat", category: "Seeds", amount: 75 },
  ]

  const yields = [
    { crop: "Corn", quantity: 500, pricePerUnit: 10, revenue: 5000 },
    { crop: "Wheat", quantity: 300, pricePerUnit: 8, revenue: 2400 },
  ]

  const cropAnalysis = useMemo(() => {
    const analysis: any = {}

    expenses.forEach((exp) => {
      if (!analysis[exp.crop]) {
        analysis[exp.crop] = { crop: exp.crop, totalExpenses: 0, totalRevenue: 0 }
      }
      analysis[exp.crop].totalExpenses += exp.amount
    })

    yields.forEach((y) => {
      if (!analysis[y.crop]) {
        analysis[y.crop] = { crop: y.crop, totalExpenses: 0, totalRevenue: 0 }
      }
      analysis[y.crop].totalRevenue = y.revenue
    })

    return Object.values(analysis).map((crop: any) => ({
      ...crop,
      netProfit: crop.totalRevenue - crop.totalExpenses,
      profitMargin:
        crop.totalRevenue > 0 ? (((crop.totalRevenue - crop.totalExpenses) / crop.totalRevenue) * 100).toFixed(1) : 0,
      roi:
        crop.totalExpenses > 0 ? (((crop.totalRevenue - crop.totalExpenses) / crop.totalExpenses) * 100).toFixed(1) : 0,
    }))
  }, [])

  const expensesByCategory = useMemo(() => {
    const result: any = {}
    expenses.forEach((exp) => {
      if (!result[exp.category]) {
        result[exp.category] = { category: exp.category, Corn: 0, Wheat: 0 }
      }
      result[exp.category][exp.crop] = (result[exp.category][exp.crop] || 0) + exp.amount
    })
    return Object.values(result)
  }, [])

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cropAnalysis.map((crop: any) => (
          <Card key={crop.crop}>
            <CardHeader>
              <CardTitle className="text-lg">{crop.crop}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold text-destructive">${crop.totalExpenses.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold text-primary">${crop.totalRevenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Net Profit</p>
                <p className={`text-xl font-bold ${crop.netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                  ${crop.netProfit.toFixed(2)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Margin</p>
                  <p className="font-semibold">{crop.profitMargin}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ROI</p>
                  <p className="font-semibold">{crop.roi}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profitability Comparison</CardTitle>
            <CardDescription>Revenue vs Expenses per crop</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cropAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="crop" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Legend />
                <Bar dataKey="totalExpenses" fill="var(--color-destructive)" name="Expenses" />
                <Bar dataKey="totalRevenue" fill="var(--color-primary)" name="Revenue" />
                <Bar dataKey="netProfit" fill="var(--color-chart-2)" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown by Category</CardTitle>
            <CardDescription>Costs by crop and type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expensesByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="category" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Legend />
                <Bar dataKey="Corn" fill="var(--color-chart-1)" />
                <Bar dataKey="Wheat" fill="var(--color-chart-2)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
          <CardDescription>Complete breakdown for each crop</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Crop</th>
                  <th className="text-right py-3 px-4 font-semibold">Expenses</th>
                  <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                  <th className="text-right py-3 px-4 font-semibold">Profit</th>
                  <th className="text-right py-3 px-4 font-semibold">Margin</th>
                  <th className="text-right py-3 px-4 font-semibold">ROI</th>
                </tr>
              </thead>
              <tbody>
                {cropAnalysis.map((crop: any) => (
                  <tr key={crop.crop} className="border-b border-border hover:bg-muted">
                    <td className="py-3 px-4">{crop.crop}</td>
                    <td className="text-right py-3 px-4 text-destructive">${crop.totalExpenses.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 text-primary">${crop.totalRevenue.toFixed(2)}</td>
                    <td
                      className={`text-right py-3 px-4 font-semibold ${crop.netProfit >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      ${crop.netProfit.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4">{crop.profitMargin}%</td>
                    <td className="text-right py-3 px-4">{crop.roi}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
