import { YieldTracker } from "@/components/yield-tracker"
import { Navigation } from "@/components/navigation"

export default function YieldsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Yield Tracker</h1>
          <p className="text-muted-foreground mt-2">Record harvest data and calculate revenue</p>
        </div>
        <YieldTracker />
      </main>
    </div>
  )
}
