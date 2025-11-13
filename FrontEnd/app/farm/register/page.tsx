"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Leaf, Loader2 } from "lucide-react"

export default function FarmRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    farmName: "",
    farmSize: "",
    farmType: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      console.log("[v0] Submitting farm data to:", `${BASE_URL}/farms`)
      console.log("[v0] Form data:", formData)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`${BASE_URL}/farms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", response.headers)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[v0] Server error response:", errorData)
        throw new Error(`Server error: ${response.status} - ${errorData.message || response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] Farm created successfully:", data)
      router.push(`/farm/${data.id || 1}`)
    } catch (error) {
      let errorMessage = "Failed to add farm."

      if (error instanceof TypeError) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = `Cannot connect to ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}. Make sure your backend is running and CORS is enabled. Error: Network error`
        } else if (error.message.includes("abort")) {
          errorMessage = "Request timed out. Your backend is not responding."
        } else {
          errorMessage = `Network error: ${error.message}`
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      console.error("[v0] Error details:", error)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 dark:via-green-950/10 to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-md">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-muted/50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-2xl border-0 bg-background/80 backdrop-blur-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Register Farm
              </CardTitle>
            </div>
            <CardDescription className="text-base">Add a new farm to your profile</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
                <div className="font-semibold mb-1">Error:</div>
                <div className="font-mono text-xs whitespace-pre-wrap break-words">{error}</div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="farmName">Farm Name</Label>
                <Input
                  id="farmName"
                  placeholder="e.g., North Field"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="farmSize">Farm Size (acres)</Label>
                <Input
                  id="farmSize"
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.farmSize}
                  onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="farmType">Farm Type</Label>
                <Select
                  value={formData.farmType}
                  onValueChange={(value) => setFormData({ ...formData, farmType: value })}
                >
                  <SelectTrigger id="farmType">
                    <SelectValue placeholder="Select farm type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="corn">Corn</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="cotton">Cotton</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Register Farm"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-xs text-gray-500">
              <div className="font-semibold mb-2">Debug Info:</div>
              <div>API URL: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}</div>
              <div className="mt-1 text-gray-400">Check browser console for detailed logs</div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
