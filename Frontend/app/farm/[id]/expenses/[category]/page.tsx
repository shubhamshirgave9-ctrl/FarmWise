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

export default function AddExpensePage() {
  const router = useRouter()
  const params = useParams()
  useAuthGuard()
  const farmId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined)
  const category = Array.isArray(params?.category) ? params?.category[0] : (params?.category as string | undefined)

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!farmId || !category) {
        throw new Error("Missing farm information.")
      }
      const amountValue = Number.parseFloat(formData.amount)
      if (Number.isNaN(amountValue)) {
        throw new Error("Please enter a valid amount.")
      }
      await apiClient.post(`/farms/${farmId}/expenses`, {
        amount: amountValue,
        date: formData.date,
        category,
        description: formData.description || undefined,
      })
      router.push(`/farm/${farmId}/expenses`)
    } catch (err) {
      console.error("[v0] Error adding expense:", err)
      setError("Failed to add expense. Please try again.")
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
            <CardTitle>
              Add {category?.toString().charAt(0).toUpperCase() + category?.toString().slice(1)} Expense
            </CardTitle>
            <CardDescription>Record a new expense for your farm</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Fertilizer bag (50kg)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Adding..." : "Add Expense"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
