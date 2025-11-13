"use client"

import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"

export default function FarmerDetailsPage() {
  const router = useRouter()

  const farmerData = {
    name: "John Doe",
    email: "john@farm.com",
    phone: "+1234567890",
    address: "123 Farm Lane, Farmville, CA 95959",
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-md">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardContent className="pt-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center mb-4">
                <span className="text-4xl">👨‍🌾</span>
              </div>
              <h1 className="text-3xl font-bold">{farmerData.name}</h1>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Mail className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{farmerData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{farmerData.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-semibold">{farmerData.address}</p>
                </div>
              </div>
            </div>

            <Button onClick={() => router.push("/farmer/edit")} className="w-full mt-6 bg-green-600 hover:bg-green-700">
              Edit Details
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
