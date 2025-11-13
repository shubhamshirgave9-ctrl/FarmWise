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

export default function YieldEntryPage() {
  const router = useRouter()
  const params = useParams()
  const farmId = params.id

  const [formData, setFormData] = useState({
    quantity: "",
    unit: "kg",
    rate: "",
    soldPrice: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/farms/${farmId}/yield`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push(`/farm/${farmId}`)
      }
    } catch (error) {
      console.error("Error adding yield:", error)
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
