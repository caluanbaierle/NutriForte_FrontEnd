import api from './axios'
import type {
  AdminLinkListItem,
  AdminLinkListParams,
  AdminLinkRequest,
  AdminLinkResponse,
  AdminPatientResponse,
  AdminPaymentResponse,
  AdminPlanRequest,
  AdminPlanStatusRequest,
} from '@/types/admin'
import type { RegisterRequest, UserResponse } from '@/types/auth'
import type { SubscriptionPlanResponse } from '@/types/subscription'
import type { PageResponse } from '@/types/api'
import type { AuditAction, AuditLogResponse, AuditResourceType, AuditResult } from '@/types/audit'

export const adminApi = {
  listPlans() {
    return api.get<SubscriptionPlanResponse[]>('/api/v1/admin/subscription-plans').then((r) => r.data)
  },
  createPlan(payload: AdminPlanRequest) {
    return api.post<SubscriptionPlanResponse>('/api/v1/admin/subscription-plans', payload).then((r) => r.data)
  },
  updatePlan(id: string, payload: AdminPlanRequest) {
    return api.put<SubscriptionPlanResponse>(`/api/v1/admin/subscription-plans/${id}`, payload).then((r) => r.data)
  },
  updatePlanStatus(id: string, payload: AdminPlanStatusRequest) {
    return api
      .patch<SubscriptionPlanResponse>(`/api/v1/admin/subscription-plans/${id}/status`, payload)
      .then((r) => r.data)
  },
  listNutritionists() {
    return api.get<UserResponse[]>('/api/v1/admin/nutritionists').then((r) => r.data)
  },
  createNutritionist(payload: RegisterRequest) {
    return api.post<UserResponse>('/api/v1/admin/nutritionists', payload).then((r) => r.data)
  },
  listPatients() {
    return api.get<AdminPatientResponse[]>('/api/v1/admin/patients').then((r) => r.data)
  },
  listLinks(params: AdminLinkListParams = {}) {
    return api
      .get<PageResponse<AdminLinkListItem>>('/api/v1/admin/nutritionist-patient-links', { params })
      .then((r) => r.data)
  },
  createLink(payload: AdminLinkRequest) {
    return api
      .post<AdminLinkResponse>('/api/v1/admin/nutritionist-patient-links', payload)
      .then((r) => r.data)
  },
  deleteLink(id: string) {
    return api.delete(`/api/v1/admin/nutritionist-patient-links/${id}`)
  },
  listPayments() {
    return api.get<AdminPaymentResponse[]>('/api/v1/admin/payments').then((r) => r.data)
  },
  confirmPayment(paymentId: string) {
    return api.post<AdminPaymentResponse>(`/api/v1/admin/payments/${paymentId}/confirm`).then((r) => r.data)
  },
  listAuditLogs(params: {
    action?: AuditAction
    resourceType?: AuditResourceType
    actorUserId?: string
    result?: AuditResult
    startDate?: string
    endDate?: string
    page?: number
    size?: number
  } = {}) {
    return api.get<PageResponse<AuditLogResponse>>('/api/v1/admin/audit-logs', { params }).then((r) => r.data)
  },
  getAuditLog(id: string) {
    return api.get<AuditLogResponse>(`/api/v1/admin/audit-logs/${id}`).then((r) => r.data)
  },
}
