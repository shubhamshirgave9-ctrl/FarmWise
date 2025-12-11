"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function ProfitSummaryPage() {
  const router = useRouter()
  const params = useParams()
  useAuthGuard()
  const farmId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined)

  const [profitData, setProfitData] = useState({
    totalExpenses: 0,
    totalProfit: 0,
    netProfit: 0,
    profitMargin: 0,
    expenses: [] as Array<{ category: string; amount: number }>,
  })

  useEffect(() => {
    const fetchProfitData = async () => {
      try {
        if (!farmId) return
        const [summary, expensesByCategory] = await Promise.all([
          apiClient.get<{ totalExpenses: number; totalYield: number; netProfit: number; profitMargin: number }>(`/farms/${farmId}/summary`),
          apiClient.get<Array<{ category: string; amount: number }>>(`/farms/${farmId}/expenses/by-category`),
        ])

        setProfitData({
          totalExpenses: summary.totalExpenses ?? 0,
          totalProfit: summary.totalYield ?? 0,
          netProfit: summary.netProfit ?? 0,
          profitMargin: summary.profitMargin ?? 0,
          expenses: expensesByCategory ?? [],
        })
      } catch (error) {
        console.error("Error fetching profit data:", error)
        setProfitData({
          totalExpenses: 0,
          totalProfit: 0,
          netProfit: 0,
          profitMargin: 0,
          expenses: [],
        })
      }
    }

    fetchProfitData()
  }, [farmId])

  const downloadPDF = async () => {
    try {
      const blob = await apiClient.getBlob(`/farms/${farmId}/profit/report/pdf`)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `profit-summary-${farmId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Unable to download profit report right now.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Profit Summary</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">${profitData.totalExpenses.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Revenue (Yield)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">${profitData.totalProfit.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${profitData.netProfit >= 0 ? "text-blue-600" : "text-red-600"}`}>
                ${profitData.netProfit.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Profit Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{profitData.profitMargin.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profitData.expenses.map((expense, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b last:border-b-0">
                  <span className="text-muted-foreground">{expense.category}</span>
                  <span className="font-semibold">${expense.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Download PDF Report
        </Button>
      </main>
    </div>
  )
}
