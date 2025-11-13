"use client"
import { useRouter, useParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, BarChart3, FileText, Users, Sprout, ShoppingCart, Truck } from "lucide-react"

const EXPENSE_CATEGORIES = [
  { id: "worker", name: "Worker", icon: Users, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-50 dark:bg-blue-950/20", borderColor: "border-blue-200 dark:border-blue-900/50" },
  { id: "fertilizer", name: "Fertilizer", icon: Sprout, color: "from-green-500 to-emerald-500", bgColor: "bg-green-50 dark:bg-green-950/20", borderColor: "border-green-200 dark:border-green-900/50" },
  { id: "shop", name: "Shop/Equipment", icon: ShoppingCart, color: "from-orange-500 to-amber-500", bgColor: "bg-orange-50 dark:bg-orange-950/20", borderColor: "border-orange-200 dark:border-orange-900/50" },
  { id: "transport", name: "Transport", icon: Truck, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-50 dark:bg-purple-950/20", borderColor: "border-purple-200 dark:border-purple-900/50" },
]

export default function ExpensesCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const farmId = params.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 dark:via-green-950/10 to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-muted/50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-10 space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Expense Categories
          </h1>
          <p className="text-lg text-muted-foreground">Select a category to add or view expenses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {EXPENSE_CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
            <Card
              key={category.id}
                className={`cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 ${category.borderColor} ${category.bgColor} overflow-hidden relative group`}
              onClick={() => router.push(`/farm/${farmId}/expenses/${category.id}`)}
            >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.color} opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
                <CardContent className="pt-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${category.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {category.name}
                      </h3>
                    <p className="text-sm text-muted-foreground">Click to add expense</p>
                  </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => router.push(`/farm/${farmId}/expenses/report`)}
            variant="outline"
            size="lg"
            className="border-2 hover:bg-muted/50 group"
          >
            <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            View Expense Report
          </Button>
          <Button
            onClick={() => router.push(`/farm/${farmId}/expenses/graph`)}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all group"
          >
            <BarChart3 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            View Graph
          </Button>
        </div>
      </main>
    </div>
  )
}
