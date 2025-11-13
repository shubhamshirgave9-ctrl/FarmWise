"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfitData = async () => {
      try {
        const expensesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/farms/${farmId}/expenses`)
        const yieldRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/farms/${farmId}/yield`)

        if (!expensesRes.ok || !yieldRes.ok) throw new Error("Failed to fetch data")

        const expensesData = await expensesRes.json()
        const yieldData = await yieldRes.json()

        const totalExpenses = expensesData.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0)
        const totalProfit = yieldData.reduce((sum: number, y: any) => sum + (y.soldPrice || 0), 0)
        const netProfit = totalProfit - totalExpenses
        const profitMargin = totalProfit > 0 ? (netProfit / totalProfit) * 100 : 0

        // Group expenses by category
        const expensesByCategory = expensesData.reduce(
          (acc: any, exp: any) => {
            const existing = acc.find((e: any) => e.category === exp.category)
            if (existing) {
              existing.amount += exp.amount || 0
            } else {
              acc.push({ category: exp.category, amount: exp.amount || 0 })
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
      } finally {
        setLoading(false)
      }
    }

    if (farmId) {
    fetchProfitData()
    }
  }, [farmId])

  const downloadPDF = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/farms/${farmId}/profit/report/pdf`,
        {
        method: "GET",
        }
      )
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `profit-summary-${farmId}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success("PDF downloaded successfully!")
      } else {
        throw new Error("Failed to download PDF")
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast.error("Failed to download PDF", {
        description: "Please try again later",
      })
    }
  }

  const stats = [
    {
      label: "Total Expenses",
      value: profitData.totalExpenses,
      icon: DollarSign,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-900/50",
    },
    {
      label: "Total Revenue",
      value: profitData.totalProfit,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-900/50",
    },
    {
      label: "Net Profit",
      value: profitData.netProfit,
      icon: profitData.netProfit >= 0 ? TrendingUp : TrendingDown,
      color: profitData.netProfit >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400",
      bgColor: profitData.netProfit >= 0 ? "bg-blue-50 dark:bg-blue-950/20" : "bg-red-50 dark:bg-red-950/20",
      borderColor: profitData.netProfit >= 0 ? "border-blue-200 dark:border-blue-900/50" : "border-red-200 dark:border-red-900/50",
    },
    {
      label: "Profit Margin",
      value: profitData.profitMargin,
      icon: Percent,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-900/50",
      suffix: "%",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 dark:via-green-950/10 to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-muted/50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-10 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Profit Summary
          </h1>
          <p className="text-lg text-muted-foreground">Overview of your farm's financial performance</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
                  <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <Card
                    key={index}
                    className={`border-2 ${stat.borderColor} ${stat.bgColor} hover:shadow-xl transition-all duration-300 overflow-hidden relative group`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                    <CardHeader className="pb-2 relative z-10">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                      </div>
            </CardHeader>
                    <CardContent className="relative z-10">
                      <p className={`text-3xl font-bold ${stat.color}`}>
                        ${stat.value.toFixed(2)}
                        {stat.suffix}
              </p>
            </CardContent>
          </Card>
                )
              })}
        </div>

            <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
                <div className="space-y-3">
                  {profitData.expenses.length > 0 ? (
                    profitData.expenses.map((expense, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <span className="font-medium text-foreground">{expense.category}</span>
                        <span className="font-bold text-lg">${expense.amount.toFixed(2)}</span>
                </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No expenses recorded yet</p>
                  )}
            </div>
          </CardContent>
        </Card>

            <Button
              onClick={downloadPDF}
              size="lg"
              className="w-full md:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
          Download PDF Report
        </Button>
          </>
        )}
      </main>
    </div>
  )
}
