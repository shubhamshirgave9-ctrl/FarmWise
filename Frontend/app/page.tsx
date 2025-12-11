import { Navigation } from "@/components/navigation"
import { AuthPage } from "@/components/auth-page"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation showAuthOnly={true} />
      <AuthPage />
    </div>
  )
}
