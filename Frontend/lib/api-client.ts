import { API_BASE_URL } from "@/lib/config"
import { authStorage, refreshAccessToken } from "@/lib/auth-client"

type RequestOptions = {
  body?: any
  headers?: Record<string, string>
  auth?: boolean
  expectBlob?: boolean
}

async function request<T = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  options: RequestOptions = {},
  retry = true,
): Promise<T> {
  const { body, headers = {}, auth = true, expectBlob = false } = options
  const isBrowser = typeof window !== "undefined"
  const requestHeaders: Record<string, string> = {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...headers,
  }

  if (auth && isBrowser) {
    const accessToken = authStorage.getAccessToken()
    if (accessToken) {
      requestHeaders.Authorization = `Bearer ${accessToken}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && auth && retry) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      return request(endpoint, method, options, false)
    }
    throw new Error("Unauthorized")
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "")
    throw new Error(errorText || `API error: ${response.status}`)
  }

  if (expectBlob) {
    return (await response.blob()) as T
  }

  if (response.status === 204) {
    return null as T
  }

  const data = (await response.json().catch(() => null)) as T
  return data
}

export const apiClient = {
  get<T = unknown>(endpoint: string, options?: RequestOptions) {
    return request<T>(endpoint, "GET", options)
  },
  getBlob(endpoint: string, options?: RequestOptions) {
    return request<Blob>(endpoint, "GET", { ...(options || {}), expectBlob: true })
  },
  post<T = unknown>(endpoint: string, body?: any, options?: RequestOptions) {
    return request<T>(endpoint, "POST", { ...(options || {}), body })
  },
  put<T = unknown>(endpoint: string, body?: any, options?: RequestOptions) {
    return request<T>(endpoint, "PUT", { ...(options || {}), body })
  },
  delete<T = unknown>(endpoint: string, options?: RequestOptions) {
    return request<T>(endpoint, "DELETE", options)
  },
}

export const unauthenticatedClient = {
  post<T = unknown>(endpoint: string, body?: any) {
    return request<T>(endpoint, "POST", { body, auth: false })
  },
  get<T = unknown>(endpoint: string) {
    return request<T>(endpoint, "GET", { auth: false })
  },
}
