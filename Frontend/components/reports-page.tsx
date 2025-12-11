"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Download, FileJson, Sheet } from "lucide-react"

export function ReportsPage() {
  const [reportData] = useState({
    expenses: [
      { date: "2024-01-01", amount: 150 },
      { date: "2024-01-05", amount: 75 },
      { date: "2024-01-10", amount: 200 },
      { date: "2024-01-15", amount: 100 },
      { date: "2024-01-20", amount: 125 },
    ],
    monthlyData: [
      { month: "January", expenses: 650, revenue: 7400, profit: 6750 },
      { month: "February", expenses: 500, revenue: 6800, profit: 6300 },
      { month: "March", expenses: 700, revenue: 8200, profit: 7500 },
    ],
  })

  const handleExportPDF = () => {
    // Placeholder - would use jsPDF or similar library
    alert("PDF export functionality would be implemented with backend support")
    console.log("[v0] PDF export triggered")
  }

  const handleExportExcel = () => {
    // Placeholder - would generate Excel file
    alert("Excel export functionality would be implemented with backend support")
    console.log("[v0] Excel export triggered")
  }

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "farm-report.json"
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export as PDF</CardTitle>
            <CardDescription>Professional report document</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportPDF} className="w-full bg-primary text-primary-foreground">
              <Download className="w-4 h-4 mr-2" />
              PDF Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export as Excel</CardTitle>
            <CardDescription>Spreadsheet format</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportExcel} className="w-full bg-primary text-primary-foreground">
              <Sheet className="w-4 h-4 mr-2" />
              Excel File
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export as JSON</CardTitle>
            <CardDescription>Data interchange format</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportJSON} className="w-full bg-primary text-primary-foreground">
              <FileJson className="w-4 h-4 mr-2" />
              JSON File
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Trend</CardTitle>
            <CardDescription>Expense tracking over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.expenses}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-destructive)"
                  strokeWidth={2}
                  name="Expense Amount"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Revenue, expenses, and profit comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Legend />
                <Bar dataKey="expenses" fill="var(--color-destructive)" />
                <Bar dataKey="revenue" fill="var(--color-primary)" />
                <Bar dataKey="profit" fill="var(--color-chart-2)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
          <CardDescription>Overview of your farm performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-destructive">$1,850</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-primary">$22,400</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className="text-2xl font-bold text-chart-2">$20,550</p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <p className="text-2xl font-bold">91.8%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
