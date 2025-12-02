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
import { ArrowLeft } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function FarmRegisterPage() {
  const router = useRouter()
  useAuthGuard()
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
      const payload = {
        farmName: formData.farmName.trim(),
        farmSize: Number.parseFloat(formData.farmSize),
        farmType: formData.farmType || undefined,
        areaUnit: "acre",
      }

      if (!payload.farmName || Number.isNaN(payload.farmSize) || payload.farmSize <= 0) {
        throw new Error("Please provide a valid farm name and size.")
      }

      const data = await apiClient.post<{ id: string }>("/farms", payload)
      router.push(`/farm/${data.id}`)
    } catch (error) {
      let errorMessage = "Failed to add farm."

      if (error instanceof TypeError) {
        errorMessage = `Network error: ${error.message}`
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-md">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Register Farm</CardTitle>
            <CardDescription>Add a new farm to your profile</CardDescription>
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

              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                {loading ? "Creating..." : "Register Farm"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-xs text-gray-500">
              <div className="font-semibold mb-2">Debug Info:</div>
              <div>API calls require authentication with OTP login.</div>
              <div className="mt-1 text-gray-400">Ensure you are logged in before registering a farm.</div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
