export type UserRole = 'ADMIN' | 'NUTRITIONIST' | 'PATIENT'
export type UserStatus = 'ACTIVE' | 'INACTIVE'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface UserResponse {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface RefreshRequest {
  refreshToken: string
}
