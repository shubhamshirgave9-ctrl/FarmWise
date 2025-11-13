import { Navigation } from "@/components/navigation"
import { CropPrediction } from "@/components/crop-prediction"

export default function CropPredictionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 dark:via-green-950/10 to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Intelligent Crop Prediction
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Predict the most suitable crop based on your farm&apos;s environmental conditions and soil profile. Powered by
            pre-trained datasets and your AI backend.
          </p>
        </div>

        <CropPrediction />
      </main>
    </div>
  )
}

