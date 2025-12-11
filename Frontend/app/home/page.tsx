"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Plus, Settings, Leaf, Info } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuthGuard } from "@/hooks/use-auth-guard"

interface Farm {
  id: string
  name: string
  type?: string | null
  size: string
}

export default function HomePage() {
  const router = useRouter()
  useAuthGuard()
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const data = await apiClient.get<
          Array<{ id: string; name: string; type?: string | null; size: string }>
        >("/farms")
        setFarms(
          (data ?? []).map((farm) => ({
            id: farm.id,
            name: farm.name,
            type: farm.type,
            size: farm.size,
          })),
        )
        setError(null)
      } catch (err) {
        console.error("[v0] Error fetching farms:", err)
        setError("Failed to load farms. Make sure backend is running.")
        setFarms([])
      } finally {
        setLoading(false)
      }
    }

    fetchFarms()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Farm Management
          </h1>
          <p className="text-muted-foreground mb-6">Track your farms, monitor expenses, and optimize profits</p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => router.push("/farm/register")}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Farm
            </Button>
            <Button onClick={() => router.push("/farmer/edit")} variant="outline" className="font-semibold">
              <Settings className="w-4 h-4 mr-2" />
              Edit Farmer Details
            </Button>
            <Button onClick={() => router.push("/farmer/details")} variant="outline" className="font-semibold">
              <Info className="w-4 h-4 mr-2" />
              Farmer Details
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
              <p className="text-muted-foreground font-medium">Loading farms...</p>
            </div>
          </div>
        ) : farms.length === 0 ? (
          <Card className="shadow-md border-border/50">
            <CardContent className="pt-12 text-center">
              <div className="bg-primary/10 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground font-semibold mb-2">No farms yet</p>
              <p className="text-muted-foreground mb-6">
                Click "Add Farm" to get started with tracking your agricultural operations
              </p>
              <Button
                onClick={() => router.push("/farm/register")}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Farm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {farms.map((farm) => (
              <Card
                key={farm.id}
                className="cursor-pointer hover:shadow-lg transition-all border-border/50 overflow-hidden group"
                onClick={() => router.push(`/farm/${farm.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Leaf className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{farm.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {farm.type ? farm.type : "General farm"}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Farm Size</p>
                    <p className="font-semibold text-foreground">{farm.size}</p>
                  </div>
                  <Button
                    onClick={() => router.push(`/farm/${farm.id}`)}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold"
                  >
                    View Farm Details →
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
