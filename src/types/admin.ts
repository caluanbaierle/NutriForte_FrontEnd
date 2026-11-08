import type { UserResponse } from './auth'
import type { SubscriptionStatus, PaymentStatus, PaymentMethod, BillingPeriod, PlanStatus } from './subscription'

export interface AdminPlanRequest {
  name: string
  description?: string | null
  price: number
  billingPeriod: BillingPeriod
}

export interface AdminPlanStatusRequest {
  status: PlanStatus
}

export interface AdminLinkRequest {
  nutritionistUserId: string
  patientUserId: string
}

export interface AdminLinkResponse {
  id: string
  nutritionistUserId: string
  patientUserId: string
  active: boolean
  createdAt: string
  deactivatedAt?: string | null
}

/** Vínculo com nomes, retornado pela listagem administrativa. */
export interface AdminLinkListItem {
  id: string
  nutritionistUserId: string
  nutritionistName?: string | null
  nutritionistEmail?: string | null
  patientUserId: string
  patientId?: string | null
  patientFullName?: string | null
  patientEmail?: string | null
  active: boolean
  createdAt: string
  deactivatedAt?: string | null
}

export interface AdminLinkListParams {
  active?: boolean
  nutritionistUserId?: string
  search?: string
  page?: number
  size?: number
}

export interface AdminPatientResponse {
  id: string
  userId: string
  fullName: string
  cpf: string
  createdAt: string
}

export interface AdminPaymentResponse {
  id: string
  subscriptionId: string
  userId: string
  userEmail: string
  planId: string
  planName: string
  subscriptionStatus: SubscriptionStatus
  amount: number
  currency: string
  status: PaymentStatus
  method: PaymentMethod
  pixPayload: string
  createdAt: string
  paidAt?: string | null
}

export type AdminNutritionistResponse = UserResponse
