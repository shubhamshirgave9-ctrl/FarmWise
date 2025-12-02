"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, ArrowRight } from "lucide-react"
import { unauthenticatedClient } from "@/lib/api-client"
import { authStorage } from "@/lib/auth-client"
import { API_BASE_URL } from "@/lib/config"

export function AuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [otpValue, setOtpValue] = useState("")
  const [phoneForVerification, setPhoneForVerification] = useState("")

  const [loginData, setLoginData] = useState({ phone: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    phone: "",
    email: "",
    language: "en",
  })

  useEffect(() => {
    const token = authStorage.getAccessToken()
    if (token) {
      router.replace("/home")
    }
  }, [router])

  useEffect(() => {
    setOtpSent(false)
    setOtpValue("")
    setStatusMessage(null)
    setErrorMessage(null)
    setPhoneForVerification("")
  }, [activeTab])

  const sendLoginOtp = async () => {
    if (!loginData.phone) {
      setErrorMessage("Please enter your phone number.")
      return
    }
    setIsLoading(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      await unauthenticatedClient.post("/auth/request-otp", {
        phone: loginData.phone,
      })
      setOtpSent(true)
      setPhoneForVerification(loginData.phone)
      setStatusMessage(`OTP sent to ${loginData.phone}. Please enter the 6-digit code.`)
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendLoginOtp()
  }

  const sendRegisterOtp = async () => {
    if (!registerData.phone || !registerData.name) {
      setErrorMessage("Please provide name and phone number.")
      return
    }
    setIsLoading(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      await unauthenticatedClient.post("/auth/register", {
        name: registerData.name,
        phone: registerData.phone,
        email: registerData.email || undefined,
        language: registerData.language || "en",
      })
      setOtpSent(true)
      setPhoneForVerification(registerData.phone)
      setStatusMessage(`OTP sent to ${registerData.phone}. Please enter the 6-digit code to verify.`)
    } catch (error: any) {
      setErrorMessage(error?.message || "Failed to register. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendRegisterOtp()
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneForVerification) {
      setErrorMessage("Phone number missing. Please restart the process.")
      return
    }
    if (!otpValue || otpValue.length !== 6) {
      setErrorMessage("Please enter the 6-digit OTP.")
      return
    }
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const data = await unauthenticatedClient.post<{
        status: string
        user: any
        access_token: string
        refresh_token: string
      }>("/auth/verify-otp", {
        phone: phoneForVerification,
        otp: otpValue,
      })

      authStorage.setTokens(data.access_token, data.refresh_token)
      authStorage.setUser(data.user)
      setStatusMessage("OTP verified successfully. Redirecting to dashboard...")
      router.push("/home")
    } catch (error: any) {
      setErrorMessage(error?.message || "Invalid or expired OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <Card className="shadow-xl border-border/50 backdrop-blur-sm transition-smooth hover:shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-primary to-accent p-4 rounded-2xl shadow-lg transition-smooth hover:scale-110 active:scale-95">
                <Leaf className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FarmTracker
              </CardTitle>
              <CardDescription className="text-base">
                Optimize your farm finances with intelligent expense tracking
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6 transition-smooth">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white transition-smooth"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white transition-smooth"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-5 mt-4 animate-fade-in-up">
                {statusMessage && <p className="text-sm text-green-600 bg-green-100/60 border border-green-200 px-3 py-2 rounded">{statusMessage}</p>}
                {errorMessage && <p className="text-sm text-red-600 bg-red-100/60 border border-red-200 px-3 py-2 rounded">{errorMessage}</p>}

                {!otpSent ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-phone" className="text-sm font-semibold">
                        Phone Number
                      </Label>
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="+911234567890"
                        value={loginData.phone}
                        onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                        className="h-11 bg-input/50 border-border/50 transition-smooth focus:bg-input hover:bg-input/75 focus:scale-105"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold flex items-center justify-center gap-2 transition-smooth hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                    <p className="text-[11px] text-muted-foreground text-center">
                      The OTP will be sent via Twilio SMS. Ensure the backend is running at {API_BASE_URL}.
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-sm font-semibold">
                        Enter OTP
                      </Label>
                      <Input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit OTP"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        className="h-11 bg-input/50 border-border/50 transition-smooth focus:bg-input hover:bg-input/75 focus:scale-105 tracking-widest text-center"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setOtpSent(false)
                          setOtpValue("")
                          setStatusMessage(null)
                        }}
                        className="text-sm"
                        disabled={isLoading}
                      >
                        Change number
                      </Button>
                      <Button type="button" variant="ghost" onClick={sendLoginOtp} className="text-sm" disabled={isLoading}>
                        Resend OTP
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold flex items-center justify-center gap-2 transition-smooth hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="register" className="space-y-5 mt-4 animate-fade-in-up">
                {statusMessage && <p className="text-sm text-green-600 bg-green-100/60 border border-green-200 px-3 py-2 rounded">{statusMessage}</p>}
                {errorMessage && <p className="text-sm text-red-600 bg-red-100/60 border border-red-200 px-3 py-2 rounded">{errorMessage}</p>}

                {!otpSent ? (
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-sm font-semibold">
                        Full Name
                      </Label>
                      <Input
                        id="register-name"
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        className="h-11 bg-input/50 border-border/50 transition-smooth focus:bg-input hover:bg-input/75 focus:scale-105"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-phone" className="text-sm font-semibold">
                        Phone Number
                      </Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="+911234567890"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        className="h-11 bg-input/50 border-border/50 transition-smooth focus:bg-input hover:bg-input/75 focus:scale-105"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-sm font-semibold">
                        Email Address (optional)
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="h-11 bg-input/50 border-border/50 transition-smooth focus:bg-input hover:bg-input/75 focus:scale-105"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-language" className="text-sm font-semibold">
                        Preferred Language
                      </Label>
                      <Input
                        id="register-language"
                        placeholder="en"
                        value={registerData.language}
                        onChange={(e) => setRegisterData({ ...registerData, language: e.target.value })}
                        className="h-11 bg-input/50 border-border/50 transition-smooth focus:bg-input hover:bg-input/75 focus:scale-105"
                        disabled={isLoading}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold flex items-center justify-center gap-2 transition-smooth hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? "Sending OTP..." : "Register & Send OTP"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="register-otp" className="text-sm font-semibold">
                        Enter OTP
                      </Label>
                      <Input
                        id="register-otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="6-digit OTP"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        className="h-11 bg-input/50 border-border/50 transition-smooth focus:bg-input hover:bg-input/75 focus:scale-105 tracking-widest text-center"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setOtpSent(false)
                          setOtpValue("")
                          setStatusMessage(null)
                        }}
                        className="text-sm"
                        disabled={isLoading}
                      >
                        Change details
                      </Button>
                      <Button type="button" variant="ghost" onClick={sendRegisterOtp} className="text-sm" disabled={isLoading}>
                        Resend OTP
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold flex items-center justify-center gap-2 transition-smooth hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? "Verifying..." : "Verify & Create Account"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Secure, reliable farm management for modern agriculture
        </p>
      </div>
    </main>
  )
}
