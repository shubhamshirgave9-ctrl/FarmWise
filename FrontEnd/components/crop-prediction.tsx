"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import { CloudSun, Droplets, Leaf, ThermometerSun, Sprout, Wheat } from "lucide-react"

const soilTypes = ["Sandy", "Clay", "Loamy", "Peaty", "Silty", "Chalky"]
const irrigationTypes = ["Drip", "Sprinkler", "Flood", "Rainfed"]
const datasets = [
  { id: "india-kharif", label: "India - Kharif Season Dataset" },
  { id: "india-rabi", label: "India - Rabi Season Dataset" },
  { id: "india-zaid", label: "India - Zaid Season Dataset" },
  { id: "global-cereals", label: "Global Cereals Dataset" },
]
const seasons = [
  { id: "kharif", label: "Kharif (June–September)" },
  { id: "rabi", label: "Rabi (October–February)" },
  { id: "summer", label: "Summer (March–May)" },
  { id: "whole-year", label: "Whole Year" },
]

interface PredictionResult {
  crop: string
  confidence?: number
  description?: string
  recommendations?: string[]
}

export function CropPrediction() {
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic")
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [history, setHistory] = useState<PredictionResult[][]>([])

  const [formData, setFormData] = useState({
    season: seasons[0].id,
    dataset: datasets[0].id,
    region: "",
    rainfall: "",
    temperature: "",
    humidity: "",
    soilType: soilTypes[2],
    nitrogen: "",
    phosphorous: "",
    potassium: "",
    ph: "",
    irrigation: irrigationTypes[0],
    sowingMonth: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await apiClient.post("/crop-prediction", formData)
      const parsed: PredictionResult[] = (() => {
        if (Array.isArray(response)) {
          return response.map((item) =>
            typeof item === "string"
              ? { crop: item }
              : {
                  crop: (item as PredictionResult).crop ?? "Unknown crop",
                  confidence: (item as PredictionResult).confidence,
                  description: (item as PredictionResult).description,
                  recommendations: (item as PredictionResult).recommendations,
                },
          )
        }

        if (response && typeof response === "object" && "crops" in response && Array.isArray((response as any).crops)) {
          return (response as { crops: any[] }).crops.map((item) =>
            typeof item === "string"
              ? { crop: item }
              : {
                  crop: (item as PredictionResult).crop ?? "Unknown crop",
                  confidence: (item as PredictionResult).confidence,
                  description: (item as PredictionResult).description,
                  recommendations: (item as PredictionResult).recommendations,
                },
          )
        }

        if (response && typeof response === "object" && "crop" in response) {
          return [
            {
              crop: (response as PredictionResult).crop,
              confidence: (response as PredictionResult).confidence,
              description: (response as PredictionResult).description,
              recommendations: (response as PredictionResult).recommendations,
            },
          ]
        }

        return [{ crop: String(response ?? "No crop suggestion") }]
      })()

      const topTwo = parsed.slice(0, 2)
      setPredictions(topTwo)
      setHistory((prev) => [topTwo, ...prev].slice(0, 5))
      toast.success("Crop suggestions ready", {
        description: topTwo.map((item) => item.crop).join(" • "),
      })
    } catch (error) {
      console.error("[v0] Crop prediction error:", error)
      toast.error("Failed to fetch crop prediction", {
        description: "Please verify backend connection and try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-2xl bg-background/80 backdrop-blur-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            AI Crop Predictor
          </CardTitle>
          <CardDescription className="text-base">
            Provide seasonal and farm context to get AI-driven crop recommendations from your trained model.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-6">
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Sprout className="w-4 h-4 text-green-600" />
                        Growing Season
                      </Label>
                      <Select
                        value={formData.season}
                        onValueChange={(season) => setFormData((prev) => ({ ...prev, season }))}
                      >
                        <SelectTrigger className="h-11 border-2">
                          <SelectValue placeholder="Select season" />
                        </SelectTrigger>
                        <SelectContent>
                          {seasons.map((season) => (
                            <SelectItem key={season.id} value={season.id}>
                              {season.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Sprout className="w-4 h-4 text-green-600" />
                        Training Dataset
                      </Label>
                      <Select
                        value={formData.dataset}
                        onValueChange={(dataset) => setFormData((prev) => ({ ...prev, dataset }))}
                      >
                        <SelectTrigger className="h-11 border-2">
                          <SelectValue placeholder="Select dataset" />
                        </SelectTrigger>
                        <SelectContent>
                          {datasets.map((dataset) => (
                            <SelectItem key={dataset.id} value={dataset.id}>
                              {dataset.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="region">Region / District</Label>
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        placeholder="e.g., Nashik, Maharashtra"
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sowingMonth">Sowing Month</Label>
                      <Input
                        id="sowingMonth"
                        value={formData.sowingMonth}
                        onChange={(e) => setFormData({ ...formData, sowingMonth: e.target.value })}
                        placeholder="e.g., June"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "basic" | "advanced")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Weather & Soil</TabsTrigger>
                    <TabsTrigger value="advanced">Nutrient Profile</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rainfall" className="flex items-center gap-2">
                          <CloudSun className="w-4 h-4 text-blue-500" />
                          Rainfall (mm)
                        </Label>
                        <Input
                          id="rainfall"
                          type="number"
                          placeholder="e.g., 220"
                          value={formData.rainfall}
                          onChange={(e) => setFormData({ ...formData, rainfall: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="temperature" className="flex items-center gap-2">
                          <ThermometerSun className="w-4 h-4 text-red-500" />
                          Temperature (°C)
                        </Label>
                        <Input
                          id="temperature"
                          type="number"
                          placeholder="e.g., 32"
                          value={formData.temperature}
                          onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="humidity" className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-sky-500" />
                          Humidity (%)
                        </Label>
                        <Input
                          id="humidity"
                          type="number"
                          placeholder="e.g., 70"
                          value={formData.humidity}
                          onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-green-500" />
                          Soil Type
                        </Label>
                        <Select
                          value={formData.soilType}
                          onValueChange={(soilType) => setFormData((prev) => ({ ...prev, soilType }))}
                        >
                          <SelectTrigger className="h-11 border-2">
                            <SelectValue placeholder="Choose soil type" />
                          </SelectTrigger>
                          <SelectContent>
                            {soilTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="flex items-center gap-2">
                          <Wheat className="w-4 h-4 text-amber-600" />
                          Irrigation Method
                        </Label>
                        <Select
                          value={formData.irrigation}
                          onValueChange={(irrigation) => setFormData((prev) => ({ ...prev, irrigation }))}
                        >
                          <SelectTrigger className="h-11 border-2">
                            <SelectValue placeholder="Select irrigation" />
                          </SelectTrigger>
                          <SelectContent>
                            {irrigationTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="ph">Soil pH</Label>
                        <Input
                          id="ph"
                          type="number"
                          step="0.1"
                          placeholder="e.g., 6.5"
                          value={formData.ph}
                          onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="nitrogen">Nitrogen (N)</Label>
                        <Input
                          id="nitrogen"
                          type="number"
                          placeholder="e.g., 90"
                          value={formData.nitrogen}
                          onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phosphorous">Phosphorous (P)</Label>
                        <Input
                          id="phosphorous"
                          type="number"
                          placeholder="e.g., 40"
                          value={formData.phosphorous}
                          onChange={(e) => setFormData({ ...formData, phosphorous: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="potassium">Potassium (K)</Label>
                        <Input
                          id="potassium"
                          type="number"
                          placeholder="e.g., 30"
                          value={formData.potassium}
                          onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tip: If you don&apos;t have lab values, leave the fields blank and the model will use dataset
                      defaults.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-6">
                <Card className="border border-green-200/60 dark:border-green-900/40 bg-green-50/60 dark:bg-green-950/20">
                  <CardHeader>
                    <CardTitle className="text-lg">AI Recommendations</CardTitle>
                    <CardDescription className="text-sm">
                      Up to two crops returned by your backend for the selected season and inputs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {predictions.length > 0 ? (
                      predictions.map((item, index) => (
                        <div
                          key={`${item.crop}-${index}`}
                          className="rounded-lg border border-green-300/60 bg-background px-4 py-3 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <Badge className="px-3 py-1 text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600">
                              {item.crop}
                            </Badge>
                            {item.confidence !== undefined && (
                              <span className="text-xs text-muted-foreground">
                                {(item.confidence * 100).toFixed(0)}% confidence
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed mt-2">{item.description}</p>
                          )}
                          {item.recommendations && item.recommendations.length > 0 && (
                            <ul className="mt-3 list-disc list-inside text-xs text-muted-foreground space-y-1">
                              {item.recommendations.map((recommendation, idx) => (
                                <li key={idx}>{recommendation}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Fill in the season and optional farm metrics, then hit “Suggest crops” to see AI results here.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {history.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent predictions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {history.map((items, index) => (
                        <div
                          key={index}
                          className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground"
                        >
                          {items.map((item) => item.crop).join(" • ")}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Leaf className="w-4 h-4 mr-2 animate-spin" />
                  Predicting crop...
                </>
              ) : (
                "Suggest crops"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

