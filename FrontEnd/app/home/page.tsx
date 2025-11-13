"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Plus, Settings, Leaf, Info, TrendingUp, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

interface Farm {
  id: string | number
  name: string
  type: string
  size: string
}

export default function HomePage() {
  const router = useRouter()
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await apiClient.get("/farms")
        setFarms(data)
        setError(null)
      } catch (err) {
        console.error("[v0] Error fetching farms:", err)
        setError("Failed to load farms. Make sure backend is running.")
        setFarms([])
        toast.error("Connection Error", {
          description: "Unable to connect to backend. Please check if it's running.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFarms()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 dark:via-green-950/10 to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-10 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Farm Management
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your farms, track expenses, and analyze profitability
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => router.push("/farm/register")}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Farm
            </Button>
            <Button
              onClick={() => router.push("/farmer/edit")}
              variant="outline"
              size="lg"
              className="border-2 hover:bg-muted/50"
            >
              <Settings className="w-5 h-5 mr-2" />
              Edit Farmer Details
            </Button>
            <Button
              onClick={() => router.push("/farmer/details")}
              variant="outline"
              size="lg"
              className="border-2 hover:bg-muted/50"
            >
              <Info className="w-5 h-5 mr-2" />
              Farmer Details
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : farms.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                  <Leaf className="w-16 h-16 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-2">No farms yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by adding your first farm to track expenses and yields
              </p>
              <Button
                onClick={() => router.push("/farm/register")}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Farm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm, index) => (
              <Card
                key={farm.id}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-500/50 dark:hover:border-green-500/30 overflow-hidden relative"
                onClick={() => router.push(`/farm/${farm.id}`)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="flex items-center gap-2 text-xl group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                          <Leaf className="w-5 h-5 text-white" />
                        </div>
                        {farm.name}
                      </CardTitle>
                      <CardDescription className="text-base font-medium">{farm.type}</CardDescription>
                    </div>
                    <TrendingUp className="w-5 h-5 text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Farm Size</span>
                    <span className="font-semibold">{farm.size} acres</span>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/farm/${farm.id}`)
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md group-hover:shadow-lg transition-all"
                  >
                    View Details
                    <TrendingUp className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
