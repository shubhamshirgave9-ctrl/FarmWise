"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, DollarSign, Leaf, TrendingUp as Trending } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface FarmData {
  id: string | number
  name: string
  type: string
  size: string
  totalExpenses?: number
  totalYield?: number
  netProfit?: number
}

export default function FarmDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const farmId = params.id

  const [farmData, setFarmData] = useState<FarmData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        const data = await apiClient.get(`/farms/${farmId}`)
        setFarmData(data)
        setError(null)
      } catch (err) {
        console.error("[v0] Error fetching farm details:", err)
        setError("Failed to load farm details")
        setFarmData(null)
      } finally {
        setLoading(false)
      }
    }

    if (farmId) {
      fetchFarmData()
    }
  }, [farmId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading farm details...</p>
        </main>
      </div>
    )
  }

  if (error || !farmData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.push("/home")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Farms
          </Button>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error || "Farm not found"}</p>
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
        <Button variant="ghost" onClick={() => router.push("/home")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Farms
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{farmData.name}</h1>
          <p className="text-muted-foreground">
            {farmData.type} • {farmData.size}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-600" />
                <span className="text-2xl font-bold">${(farmData.totalExpenses || 0).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Yield Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold">${(farmData.totalYield || 0).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trending className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold">${(farmData.netProfit || 0).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => router.push(`/farm/${farmId}/expenses`)}
            className="bg-green-600 hover:bg-green-700 h-12"
          >
            Add Expenses
          </Button>
          <Button onClick={() => router.push(`/farm/${farmId}/yield`)} className="bg-green-600 hover:bg-green-700 h-12">
            Add Yield
          </Button>
          <Button onClick={() => router.push(`/farm/${farmId}/profit`)} variant="outline" className="h-12">
            View Profit Summary
          </Button>
          <Button onClick={() => router.push(`/farm/${farmId}/summary`)} variant="outline" className="h-12">
            View Farm Summary
          </Button>
        </div>
      </main>
    </div>
  )
}
