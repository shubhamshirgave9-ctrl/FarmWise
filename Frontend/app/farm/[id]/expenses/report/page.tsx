"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, FileJson, FileText } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function ExpensesReportPage() {
  const router = useRouter()
  const params = useParams()
  useAuthGuard()
  const farmId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined)

  const [expensesData, setExpensesData] = useState({
    farmName: "Main Farm",
    totalExpenses: 0,
    expenses: [] as Array<{ id: number; category: string; amount: number; date: string; description: string }>,
  })

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        if (!farmId) return
        const [farm, data] = await Promise.all([
          apiClient.get<{ name: string; size: string }>(`/farms/${farmId}`),
          apiClient.get<Array<{ id: string; category: string; amount: number; date: string; description?: string | null }>>(
            `/farms/${farmId}/expenses`,
          ),
        ])
        const totalExpenses = (data ?? []).reduce((sum, exp) => sum + Number(exp.amount || 0), 0)
        setExpensesData({
          farmName: farm?.name ?? "Farm Expenses",
          totalExpenses,
          expenses:
            data?.map((expense) => ({
              id: Number.isNaN(Number(expense.id)) ? Date.now() : Number(expense.id),
              category: expense.category,
              amount: Number(expense.amount || 0),
              date: expense.date,
              description: expense.description || "",
            })) ?? [],
        })
      } catch (error) {
        console.error("Error fetching expenses:", error)
      }
    }
    fetchExpenses()
  }, [farmId])

  const downloadJSON = () => {
    const dataStr = JSON.stringify(expensesData, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expenses-report-${farmId}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadCSV = () => {
    let csv = "Category,Amount,Date,Description\n"
    expensesData.expenses.forEach((expense) => {
      csv += `${expense.category},${expense.amount},${expense.date},"${expense.description}"\n`
    })
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expenses-report-${farmId}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadPDF = async () => {
    try {
      const blob = await apiClient.getBlob(`/farms/${farmId}/expenses/report/pdf`)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `expenses-report-${farmId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Unable to download PDF right now.")
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Expenses Report</h1>
          <p className="text-muted-foreground">{expensesData.farmName}</p>
        </div>

        <Card className="mb-8 border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-600">${expensesData.totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Category</th>
                    <th className="text-left py-2 px-2">Amount</th>
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesData.expenses.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">{expense.category}</td>
                      <td className="py-3 px-2 font-semibold">${expense.amount.toFixed(2)}</td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">{expense.date}</td>
                      <td className="py-3 px-2 text-sm">{expense.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Download Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={downloadJSON} className="bg-blue-600 hover:bg-blue-700 h-auto py-4 flex flex-col">
              <FileJson className="w-6 h-6 mb-2" />
              <span>Download JSON</span>
            </Button>

            <Button onClick={downloadCSV} className="bg-green-600 hover:bg-green-700 h-auto py-4 flex flex-col">
              <FileText className="w-6 h-6 mb-2" />
              <span>Download CSV</span>
            </Button>

            <Button onClick={downloadPDF} className="bg-red-600 hover:bg-red-700 h-auto py-4 flex flex-col">
              <Download className="w-6 h-6 mb-2" />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
