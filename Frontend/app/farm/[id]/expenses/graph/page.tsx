"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileDown } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { apiClient } from "@/lib/api-client"

interface ExpenseData {
  category: string
  amount: number
}

interface TimeSeriesData {
  month: string
  expenses: number
}

export default function ExpenseGraphPage() {
  const router = useRouter()
  const params = useParams()
  const farmId = params.id

  const [expenseData, setExpenseData] = useState<ExpenseData[]>([])
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExpenseGraphs = async () => {
      try {
        const categoryData = await apiClient.get(`/farms/${farmId}/expenses/by-category`)
        const trendData = await apiClient.get(`/farms/${farmId}/expenses/trend`)
        setExpenseData(categoryData)
        setTimeSeriesData(trendData)
        setError(null)
      } catch (err) {
        console.error("[v0] Error fetching expense data:", err)
        setError("Failed to load expense data")
      } finally {
        setLoading(false)
      }
    }

    if (farmId) {
      fetchExpenseGraphs()
    }
  }, [farmId])

  const handleGeneratePDF = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/farms/${farmId}/expenses/graph/pdf`,
      )
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `expense-graph-${farmId}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error("[v0] Error generating PDF:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading expense data...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Expense Analysis</h1>

        <div className="grid grid-cols-1 gap-6">
          {expenseData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Category-wise Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {timeSeriesData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expense Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="expenses" stroke="#16a34a" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {expenseData.length === 0 && timeSeriesData.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No expense data available yet</p>
              </CardContent>
            </Card>
          )}

          <Button onClick={handleGeneratePDF} className="bg-green-600 hover:bg-green-700">
            <FileDown className="w-4 h-4 mr-2" />
            Generate PDF Summary
          </Button>
        </div>
      </main>
    </div>
  )
}
