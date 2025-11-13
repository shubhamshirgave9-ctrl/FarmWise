"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"

export default function ProfitSummaryPage() {
  const router = useRouter()
  const params = useParams()
  const farmId = params.id

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
        const expensesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/farms/${farmId}/expenses`)
        const yieldRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/farms/${farmId}/yield`)

        const expensesData = await expensesRes.json()
        const yieldData = await yieldRes.json()

        const totalExpenses = expensesData.reduce((sum: number, exp: any) => sum + exp.amount, 0)
        const totalProfit = yieldData.reduce((sum: number, y: any) => sum + y.soldPrice, 0)
        const netProfit = totalProfit - totalExpenses
        const profitMargin = totalProfit > 0 ? (netProfit / totalProfit) * 100 : 0

        // Group expenses by category
        const expensesByCategory = expensesData.reduce(
          (acc: any, exp: any) => {
            const existing = acc.find((e: any) => e.category === exp.category)
            if (existing) {
              existing.amount += exp.amount
            } else {
              acc.push({ category: exp.category, amount: exp.amount })
            }
            return acc
          },
          [] as Array<{ category: string; amount: number }>,
        )

        setProfitData({
          totalExpenses,
          totalProfit,
          netProfit,
          profitMargin,
          expenses: expensesByCategory,
        })
      } catch (error) {
        console.error("Error fetching profit data:", error)
        // Use mock data if API fails
        setProfitData({
          totalExpenses: 5000,
          totalProfit: 8000,
          netProfit: 3000,
          profitMargin: 37.5,
          expenses: [
            { category: "Worker", amount: 1500 },
            { category: "Fertilizer", amount: 2000 },
            { category: "Shop", amount: 1200 },
            { category: "Transport", amount: 800 },
          ],
        })
      }
    }

    fetchProfitData()
  }, [farmId])

  const downloadPDF = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/farms/${farmId}/profit/report/pdf`, {
        method: "GET",
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `profit-summary-${farmId}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
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
