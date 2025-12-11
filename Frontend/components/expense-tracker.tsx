"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState<any[]>([
    { id: 1, date: "2024-01-01", category: "Fertilizer", amount: 150, crop: "Corn", notes: "NPK blend" },
    { id: 2, date: "2024-01-05", category: "Seeds", amount: 75, crop: "Wheat", notes: "Hybrid seeds" },
  ])

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Fertilizer",
    amount: "",
    crop: "",
    notes: "",
  })

  const handleAddExpense = () => {
    if (!formData.amount || !formData.crop) {
      alert("Please fill in all required fields")
      return
    }

    const newExpense = {
      id: Math.max(...expenses.map((e) => e.id), 0) + 1,
      ...formData,
      amount: Number.parseFloat(formData.amount),
    }

    setExpenses([...expenses, newExpense])
    setFormData({
      date: new Date().toISOString().split("T")[0],
      category: "Fertilizer",
      amount: "",
      crop: "",
      notes: "",
    })
  }

  const handleDelete = (id: number) => {
    setExpenses(expenses.filter((e) => e.id !== id))
  }

  const categories = ["Fertilizer", "Seeds", "Fuel", "Pesticides", "Equipment", "Labor", "Other"]
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Add Expense</CardTitle>
          <CardDescription>Record a new farm expense</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="crop">Crop</Label>
            <Input
              id="crop"
              placeholder="e.g., Corn, Wheat"
              value={formData.crop}
              onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="resize-none"
            />
          </div>

          <Button onClick={handleAddExpense} className="w-full bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense Log</CardTitle>
              <CardDescription>All recorded farm expenses</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-destructive">${totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No expenses yet. Add one to get started!</p>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-sm">{expense.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.date} • {expense.crop}
                        </p>
                      </div>
                    </div>
                    {expense.notes && <p className="text-xs text-muted-foreground mt-1">{expense.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <p className="font-semibold text-destructive">${expense.amount.toFixed(2)}</p>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 hover:bg-destructive/10 rounded-md transition-colors text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
