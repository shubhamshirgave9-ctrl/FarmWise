"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuthGuard } from "@/hooks/use-auth-guard"

interface FarmSummary {
  id: string
  name: string
  type?: string | null
  size: string
  totalExpenses: number
  totalYield: number
  netProfit: number
  profitMargin: number
}

export default function FarmSummaryPage() {
  const router = useRouter()
  const params = useParams()
  useAuthGuard()
  const farmId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined)

  const [farmSummary, setFarmSummary] = useState<FarmSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        if (!farmId) return
        const summary = await apiClient.get<FarmSummary>(`/farms/${farmId}/summary`)
        setFarmSummary(summary)
        setError(null)
      } catch (err) {
        console.error("[v0] Error fetching summary:", err)
        setError("Failed to load farm summary")
      } finally {
        setLoading(false)
      }
    }

    if (farmId) {
      fetchSummary()
    }
  }, [farmId])

  const handleDownloadPDF = async () => {
    try {
      if (!farmId) return
      const blob = await apiClient.getBlob(`/farms/${farmId}/summary/pdf`)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `farm-summary-${farmId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error downloading PDF:", err)
      alert("Unable to download summary PDF at the moment.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading farm summary...</p>
        </main>
      </div>
    )
  }

  if (error || !farmSummary) {
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

  const details = [
    { label: "Farm Size", value: farmSummary.size },
    { label: "Farm Type", value: farmSummary.type ?? "General farm" },
    { label: "Total Expenses", value: `$${farmSummary.totalExpenses.toFixed(2)}` },
    { label: "Total Yield Revenue", value: `$${farmSummary.totalYield.toFixed(2)}` },
    { label: "Net Profit", value: `$${farmSummary.netProfit.toFixed(2)}` },
    { label: "Profit Margin", value: `${farmSummary.profitMargin.toFixed(1)}%` },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{farmSummary.name}</h1>
          <p className="text-lg text-muted-foreground">
            {farmSummary.type} • {farmSummary.size}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {details.map((detail, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-1">{detail.label}</p>
                <p className="text-2xl font-bold">{detail.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={handleDownloadPDF} className="bg-green-600 hover:bg-green-700 w-full">
          <Download className="w-4 h-4 mr-2" />
          Download Complete Farm Summary PDF
        </Button>
      </main>
    </div>
  )
}
