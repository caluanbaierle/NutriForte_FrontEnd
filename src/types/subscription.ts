export type BillingPeriod = 'MONTHLY' | 'YEARLY'
export type PlanStatus = 'ACTIVE' | 'INACTIVE'
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED'
export type PaymentMethod = 'PIX'

export interface CreateSubscriptionRequest {
  planId: string
}

export interface SubscriptionPlanResponse {
  id: string
  name: string
  description?: string | null
  price: number
  currency: string
  billingPeriod: BillingPeriod
  status: PlanStatus
}

export interface SubscriptionResponse {
  id: string
  planId: string
  planName: string
  status: SubscriptionStatus
  startedAt: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelledAt?: string | null
  accessGranted: boolean
  paymentId?: string | null
  paymentMethod?: PaymentMethod | null
  paymentStatus?: PaymentStatus | null
  paymentAmount?: number | null
  paymentCurrency?: string | null
  pixPayload?: string | null
}

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  MONTHLY: 'Mensal',
  YEARLY: 'Anual',
}

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  PENDING: 'Pendente',
  ACTIVE: 'Ativa',
  PAST_DUE: 'Em atraso',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  REJECTED: 'Rejeitado',
}

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
}
