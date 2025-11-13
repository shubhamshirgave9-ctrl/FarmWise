import { ReportsPage } from "@/components/reports-page"
import { Navigation } from "@/components/navigation"

export default function Reports() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Reports & Export</h1>
          <p className="text-muted-foreground mt-2">Generate and export farm reports</p>
        </div>
        <ReportsPage />
      </main>
    </div>
  )
}
