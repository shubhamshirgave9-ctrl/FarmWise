"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

export function YieldTracker() {
  const [yields, setYields] = useState<any[]>([
    { id: 1, crop: "Corn", quantity: 500, unit: "kg", pricePerUnit: 10, revenue: 5000, harvestDate: "2024-08-15" },
    { id: 2, crop: "Wheat", quantity: 300, unit: "kg", pricePerUnit: 8, revenue: 2400, harvestDate: "2024-08-20" },
  ])

  const [formData, setFormData] = useState({
    crop: "",
    quantity: "",
    unit: "kg",
    pricePerUnit: "",
    harvestDate: new Date().toISOString().split("T")[0],
  })

  const handleAddYield = () => {
    if (!formData.crop || !formData.quantity || !formData.pricePerUnit) {
      alert("Please fill in all required fields")
      return
    }

    const quantity = Number.parseFloat(formData.quantity)
    const pricePerUnit = Number.parseFloat(formData.pricePerUnit)
    const revenue = quantity * pricePerUnit

    const newYield = {
      id: Math.max(...yields.map((y) => y.id), 0) + 1,
      ...formData,
      quantity,
      pricePerUnit,
      revenue,
    }

    setYields([...yields, newYield])
    setFormData({
      crop: "",
      quantity: "",
      unit: "kg",
      pricePerUnit: "",
      harvestDate: new Date().toISOString().split("T")[0],
    })
  }

  const handleDelete = (id: number) => {
    setYields(yields.filter((y) => y.id !== id))
  }

  const totalRevenue = yields.reduce((sum, y) => sum + y.revenue, 0)
  const units = ["kg", "lbs", "tons", "bushels", "gallons"]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Add Yield</CardTitle>
          <CardDescription>Record harvest data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="crop">Crop Name</Label>
            <Input
              id="crop"
              placeholder="e.g., Corn, Wheat"
              value={formData.crop}
              onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="unit">Unit</Label>
            <select
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="price">Price per Unit ($)</Label>
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              value={formData.pricePerUnit}
              onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="harvestDate">Harvest Date</Label>
            <Input
              id="harvestDate"
              type="date"
              value={formData.harvestDate}
              onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
            />
          </div>

          <Button onClick={handleAddYield} className="w-full bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Yield
          </Button>
        </CardContent>
      </Card>

      {/* Yields List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Harvest Records</CardTitle>
              <CardDescription>All recorded yields and revenue</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-primary">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {yields.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No yields recorded yet. Add one to get started!</p>
            ) : (
              yields.map((y) => (
                <div key={y.id} className="p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{y.crop}</p>
                      <p className="text-xs text-muted-foreground">
                        {y.quantity} {y.unit} @ ${y.pricePerUnit}/{y.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">Harvested: {y.harvestDate}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        <p className="font-semibold text-primary">${y.revenue.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(y.id)}
                        className="p-2 hover:bg-destructive/10 rounded-md transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
