import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '@/api/authApi'
import type { LoginRequest, RegisterRequest, UserResponse, UserRole } from '@/types/auth'
import { storage } from '@/utils/storage'
import { toApiError } from '@/utils/errors'

interface AuthContextValue {
  user: UserResponse | null
  loading: boolean
  isAuthenticated: boolean
  login: (payload: LoginRequest) => Promise<UserResponse>
  registerPatient: (payload: RegisterRequest) => Promise<UserResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<UserResponse | null>
  hasRole: (...roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = storage.getAccessToken()
    if (!token) {
      setUser(null)
      return null
    }
    try {
      const me = await authApi.me()
      setUser(me)
      return me
    } catch {
      storage.clearTokens()
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        await refreshUser()
      } finally {
        setLoading(false)
      }
    })()
  }, [refreshUser])

  const login = useCallback(async (payload: LoginRequest) => {
    const tokens = await authApi.login(payload)
    storage.setTokens(tokens.accessToken, tokens.refreshToken)
    const me = await authApi.me()
    setUser(me)
    return me
  }, [])

  const registerPatient = useCallback(async (payload: RegisterRequest) => {
    const tokens = await authApi.registerPatient(payload)
    storage.setTokens(tokens.accessToken, tokens.refreshToken)
    const me = await authApi.me()
    setUser(me)
    return me
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = storage.getRefreshToken()
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken)
      }
    } catch {
      // limpa sessão local mesmo se logout remoto falhar
    } finally {
      storage.clearTokens()
      setUser(null)
    }
  }, [])

  const hasRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: async (payload) => {
        try {
          return await login(payload)
        } catch (error) {
          throw toApiError(error)
        }
      },
      registerPatient: async (payload) => {
        try {
          return await registerPatient(payload)
        } catch (error) {
          throw toApiError(error)
        }
      },
      logout,
      refreshUser,
      hasRole,
    }),
    [user, loading, login, registerPatient, logout, refreshUser, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return ctx
}
