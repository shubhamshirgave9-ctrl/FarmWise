import { CropAnalysis } from "@/components/crop-analysis"
import { Navigation } from "@/components/navigation"
import { useAuthGuard } from "@/hooks/use-auth-guard"

export default function AnalysisPage() {
  useAuthGuard()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Crop Analysis</h1>
          <p className="text-muted-foreground mt-2">Compare profitability and costs across crops</p>
        </div>
        <CropAnalysis />
      </main>
    </div>
  )
}
