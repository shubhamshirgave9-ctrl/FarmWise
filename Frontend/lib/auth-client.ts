import { API_BASE_URL } from "@/lib/config"

const ACCESS_TOKEN_KEY = "agris_access_token"
const REFRESH_TOKEN_KEY = "agris_refresh_token"
const USER_KEY = "agris_user"

const isBrowser = () => typeof window !== "undefined"

export const authStorage = {
  setTokens(accessToken: string, refreshToken: string) {
    if (!isBrowser()) return
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  getAccessToken() {
    if (!isBrowser()) return null
    return window.localStorage.getItem(ACCESS_TOKEN_KEY)
  },
  getRefreshToken() {
    if (!isBrowser()) return null
    return window.localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  clearTokens() {
    if (!isBrowser()) return
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
  },
  setUser(user: any) {
    if (!isBrowser()) return
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  getUser<T = any>() {
    if (!isBrowser()) return null
    const raw = window.localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

export async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  const refreshToken = authStorage.getRefreshToken()
  if (!refreshToken) {
    authStorage.clearTokens()
    return null
  }

  isRefreshing = true
  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error("Unable to refresh token")
      }
      const data = await res.json()
      if (data?.access_token && data?.refresh_token) {
        authStorage.setTokens(data.access_token, data.refresh_token)
        return data.access_token as string
      }
      throw new Error("Invalid refresh token response")
    })
    .catch((error) => {
      console.error("Token refresh failed:", error)
      authStorage.clearTokens()
      return null
    })
    .finally(() => {
      isRefreshing = false
      refreshPromise = null
    })

  return refreshPromise
}


