import api from './axios'
import type { LoginRequest, RegisterRequest, TokenResponse, UserResponse } from '@/types/auth'

export const authApi = {
  login(payload: LoginRequest) {
    return api.post<TokenResponse>('/api/v1/auth/login', payload).then((r) => r.data)
  },
  registerPatient(payload: RegisterRequest) {
    return api.post<TokenResponse>('/api/v1/auth/register-patient', payload).then((r) => r.data)
  },
  refresh(refreshToken: string) {
    return api.post<TokenResponse>('/api/v1/auth/refresh', { refreshToken }).then((r) => r.data)
  },
  logout(refreshToken: string) {
    return api.post('/api/v1/auth/logout', { refreshToken })
  },
  me() {
    return api.get<UserResponse>('/api/v1/auth/me').then((r) => r.data)
  },
}
