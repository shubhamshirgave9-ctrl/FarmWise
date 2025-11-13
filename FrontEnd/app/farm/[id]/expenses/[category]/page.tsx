"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mic, Square, AudioLines, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

type SpeechRecognitionInstance = null | any

export default function AddExpensePage() {
  const router = useRouter()
  const params = useParams()
  const farmId = Array.isArray(params.id) ? params.id[0] : params.id
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category
  const formattedCategory =
    categoryParam?.toString().charAt(0).toUpperCase() + categoryParam?.toString().slice(1) || "Expense"

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [speechSupported, setSpeechSupported] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState("")
  const [voiceResponse, setVoiceResponse] = useState<string | null>(null)
  const [voiceSending, setVoiceSending] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechSupported(false)
    }
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await apiClient.post(`/farms/${farmId}/expenses`, {
        ...formData,
        category: categoryParam,
        amount: Number.parseFloat(formData.amount),
      })
      toast.success("Expense added successfully", {
        description: "Your expense has been recorded.",
      })
      router.push(`/farm/${farmId}/expenses`)
    } catch (err) {
      console.error("[v0] Error adding expense:", err)
      setError("Failed to add expense. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const startListening = () => {
    if (typeof window === "undefined") return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechSupported(false)
      toast.error("Voice commands are not supported in this browser.")
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceTranscript("")
      setVoiceResponse(null)
    }

    recognition.onerror = (event: any) => {
      console.error("[v0] Speech recognition error:", event.error)
      toast.error("Voice command error", {
        description: event.error === "not-allowed" ? "Microphone access was denied." : event.error,
      })
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0]?.transcript
      if (transcript) {
        setVoiceTranscript(transcript)
        sendVoiceCommand(transcript)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
  }

  const sendVoiceCommand = async (transcript: string) => {
    if (!farmId || !categoryParam) return
    setVoiceSending(true)
    try {
      const response = await apiClient.post(`/farms/${farmId}/expenses/voice`, {
        category: categoryParam,
        transcript,
      })
      const message =
        typeof response === "object" && response !== null && "message" in response
          ? (response as { message?: string }).message
          : "Command processed successfully."
      setVoiceResponse(message ?? "Command processed successfully.")
      toast.success("Voice command sent", {
        description: message,
      })
    } catch (err) {
      console.error("[v0] Error sending voice command:", err)
      setVoiceResponse("Failed to process voice command.")
      toast.error("Failed to process voice command. Please try again.")
    } finally {
      setVoiceSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50/30 dark:via-green-950/10 to-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 hover:bg-muted/50">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr,0.85fr] gap-6">
          <Card className="shadow-2xl border-0 bg-background/80 backdrop-blur-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Add {formattedCategory} Expense
            </CardTitle>
              <CardDescription className="text-base">
                Record a new expense for your farm with manual entry.
              </CardDescription>
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
                    className="h-11"
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
                    className="h-11"
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
                    className="h-11"
                />
              </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Expense"
                  )}
              </Button>
            </form>
          </CardContent>
        </Card>

          <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-2xl">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <AudioLines className="w-5 h-5 text-green-600" />
                Voice Expense Assistant
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Speak naturally to add, edit, or delete expenses. We&apos;ll send the command to your backend and display
                the response.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!speechSupported ? (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
                  Voice commands are not supported in this browser. Try using the latest version of Chrome or Edge.
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-dashed border-green-300 bg-green-50/70 dark:border-green-900/40 dark:bg-green-950/20 p-4 text-sm leading-relaxed text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">Try saying:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>“Add a {formattedCategory.toLowerCase()} expense of 250 dollars for fertilizer delivery”</li>
                      <li>“Edit the last expense to 300 dollars”</li>
                      <li>“Delete the worker expense from yesterday”</li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      className={`flex-1 h-12 ${isListening ? "bg-red-600 hover:bg-red-700" : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"} text-white shadow-lg transition-all`}
                    >
                      {isListening ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Stop Listening
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Start Voice Command
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => voiceTranscript && sendVoiceCommand(voiceTranscript)}
                      disabled={!voiceTranscript || voiceSending}
                      className="h-12 w-12 p-0 border-2"
                    >
                      {voiceSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <AudioLines className="w-5 h-5" />}
                      <span className="sr-only">Send transcript again</span>
                    </Button>
                  </div>

                  {voiceTranscript && (
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Recognized command</p>
                      <p className="text-sm font-medium text-foreground">{voiceTranscript}</p>
                    </div>
                  )}

                  {voiceResponse && (
                    <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-300">
                      <p className="font-semibold mb-1">Backend response</p>
                      <p className="leading-relaxed whitespace-pre-wrap text-sm">{voiceResponse}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
