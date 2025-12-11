import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authStorage } from "@/lib/auth-client"

export function useAuthGuard() {
  const router = useRouter()

  useEffect(() => {
    const token = authStorage.getAccessToken()
    if (!token) {
      router.replace("/")
    }
  }, [router])
}


