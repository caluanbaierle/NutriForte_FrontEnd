import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { storage } from '@/utils/storage'
import type { TokenResponse } from '@/types/auth'

// Sem VITE_API_BASE_URL a API é chamada no mesmo host (relativo): em dev o proxy do Vite
// encaminha /api para o backend local. Nunca cair em produção por omissão.
const baseURL = (import.meta.env.VITE_API_BASE_URL?.trim() ?? '').replace(/\/+$/, '')

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = storage.getRefreshToken()
  if (!refreshToken) return null

  try {
    const { data } = await axios.post<TokenResponse>(`${baseURL}/api/v1/auth/refresh`, {
      refreshToken,
    })
    storage.setTokens(data.accessToken, data.refreshToken)
    return data.accessToken
  } catch {
    storage.clearTokens()
    return null
  }
}

api.interceptors.request.use((config) => {
  const token = storage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    const url = original.url ?? ''
    if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/register')) {
      return Promise.reject(error)
    }

    original._retry = true

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }

    const newToken = await refreshPromise
    if (!newToken) {
      storage.clearTokens()
      return Promise.reject(error)
    }

    original.headers.Authorization = `Bearer ${newToken}`
    return api(original)
  },
)

export default api
