"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function YieldEntryPage() {
  const router = useRouter()
  const params = useParams()
  useAuthGuard()
  const farmId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined)

  const [formData, setFormData] = useState({
    cropName: "",
    quantity: "",
    unit: "kg",
    rate: "",
    soldPrice: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (!farmId) throw new Error("Missing farm id.")
      const quantityValue = Number.parseFloat(formData.quantity)
      const soldPriceValue = Number.parseFloat(formData.soldPrice)
      const rateValue = Number.parseFloat(formData.rate)

      if (Number.isNaN(quantityValue) || Number.isNaN(soldPriceValue) || Number.isNaN(rateValue)) {
        throw new Error("Please provide valid numeric values for quantity, rate, and total price.")
      }

      await apiClient.post(`/farms/${farmId}/yield`, {
        cropName: formData.cropName || undefined,
        quantity: quantityValue,
        unit: formData.unit,
        rate: rateValue,
        soldPrice: soldPriceValue,
        date: formData.date,
        notes: formData.notes || undefined,
      })

      router.push(`/farm/${farmId}`)
    } catch (error) {
      console.error("Error adding yield:", error)
      setError(error instanceof Error ? error.message : "Failed to add yield.")
    } finally {
      setLoading(false)
    }
  }

  const totalSoldPrice = formData.soldPrice ? Number.parseFloat(formData.soldPrice) : 0

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
            <CardTitle>Add Yield</CardTitle>
            <CardDescription>Record harvest and yield details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="crop">Crop Name</Label>
                <Input
                  id="crop"
                  placeholder="e.g., Corn"
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="ton">Metric Tons (ton)</option>
                  <option value="bag">Bags</option>
                  <option value="box">Boxes</option>
                </select>
              </div>

              <div>
                <Label htmlFor="rate">Rate per Unit ($)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="soldPrice">Total Sold Price ($)</Label>
                <Input
                  id="soldPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.soldPrice}
                  onChange={(e) => setFormData({ ...formData, soldPrice: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Total amount received after selling crops</p>
              </div>

              <div>
                <Label htmlFor="date">Harvest Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="Add any remarks"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-100/60 border border-red-200 px-3 py-2 rounded">{error}</p>}

              {totalSoldPrice > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${totalSoldPrice.toFixed(2)}</p>
                  </CardContent>
                </Card>
              )}

              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                {loading ? "Adding..." : "Add Yield"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
