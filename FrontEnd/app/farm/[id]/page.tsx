"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, DollarSign, Leaf, TrendingUp, Plus, BarChart3, FileText, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"

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
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 dark:via-green-950/10 to-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
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
          </div>
        </main>
      </div>
    )
  }

  if (error || !farmData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 dark:via-green-950/10 to-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Button variant="ghost" onClick={() => router.push("/home")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Farms
          </Button>
          <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <p className="text-red-700 dark:text-red-300">{error || "Farm not found"}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const stats = [
    {
      label: "Total Expenses",
      value: `$${(farmData.totalExpenses || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-900/50",
    },
    {
      label: "Total Yield Value",
      value: `$${(farmData.totalYield || 0).toFixed(2)}`,
      icon: Leaf,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-900/50",
    },
    {
      label: "Net Profit",
      value: `$${(farmData.netProfit || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: farmData.netProfit && farmData.netProfit >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400",
      bgColor: farmData.netProfit && farmData.netProfit >= 0 ? "bg-blue-50 dark:bg-blue-950/20" : "bg-red-50 dark:bg-red-950/20",
      borderColor: farmData.netProfit && farmData.netProfit >= 0 ? "border-blue-200 dark:border-blue-900/50" : "border-red-200 dark:border-red-900/50",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 dark:via-green-950/10 to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/home")}
          className="mb-6 hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Farms
        </Button>

        {/* Farm Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {farmData.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            {farmData.type} • {farmData.size} acres
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => router.push(`/farm/${farmId}/expenses`)}
            size="lg"
            className="h-auto py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all group"
          >
            <div className="flex flex-col items-center gap-2 w-full">
              <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Add Expenses</span>
            </div>
          </Button>

          <Button
            onClick={() => router.push(`/farm/${farmId}/yield`)}
            size="lg"
            className="h-auto py-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all group"
          >
            <div className="flex flex-col items-center gap-2 w-full">
              <Leaf className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Add Yield</span>
            </div>
          </Button>

          <Button
            onClick={() => router.push(`/farm/${farmId}/profit`)}
            variant="outline"
            size="lg"
            className="h-auto py-6 border-2 hover:bg-muted/50 group"
          >
            <div className="flex flex-col items-center gap-2 w-full">
              <BarChart3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">View Profit</span>
            </div>
          </Button>

          <Button
            onClick={() => router.push(`/farm/${farmId}/summary`)}
            variant="outline"
            size="lg"
            className="h-auto py-6 border-2 hover:bg-muted/50 group"
          >
            <div className="flex flex-col items-center gap-2 w-full">
              <FileText className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Farm Summary</span>
            </div>
          </Button>
        </div>
      </main>
    </div>
  )
}
