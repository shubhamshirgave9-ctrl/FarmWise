"use client"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, BarChart3 } from "lucide-react"
import { useAuthGuard } from "@/hooks/use-auth-guard"

const EXPENSE_CATEGORIES = [
  { id: "worker", name: "Worker", icon: "👷", color: "bg-blue-100 text-blue-700" },
  { id: "fertilizer", name: "Fertilizer", icon: "🌱", color: "bg-green-100 text-green-700" },
  { id: "shop", name: "Shop/Equipment", icon: "🛠️", color: "bg-orange-100 text-orange-700" },
  { id: "transport", name: "Transport", icon: "🚛", color: "bg-purple-100 text-purple-700" },
]

export default function ExpensesCategoryPage() {
  const router = useRouter()
  const params = useParams()
  useAuthGuard()
  const farmId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string | undefined)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-8">Select Expense Category</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {EXPENSE_CATEGORIES.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/farm/${farmId}/expenses/${category.id}`)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`text-4xl p-4 rounded-lg ${category.color}`}>{category.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">Click to add expense</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={() => router.push(`/farm/${farmId}/expenses/report`)} variant="outline">
            View Expense Report
          </Button>
          <Button
            onClick={() => router.push(`/farm/${farmId}/expenses/graph`)}
            className="bg-green-600 hover:bg-green-700"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Graph
          </Button>
        </div>
      </main>
    </div>
  )
}
