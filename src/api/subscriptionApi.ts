import api from './axios'
import type {
  CreateSubscriptionRequest,
  SubscriptionPlanResponse,
  SubscriptionResponse,
} from '@/types/subscription'

export const subscriptionApi = {
  listPlans() {
    return api.get<SubscriptionPlanResponse[]>('/api/v1/subscription-plans').then((r) => r.data)
  },
  getSubscription() {
    return api.get<SubscriptionResponse>('/api/v1/subscription').then((r) => r.data)
  },
  createSubscription(payload: CreateSubscriptionRequest) {
    return api.post<SubscriptionResponse>('/api/v1/subscription', payload).then((r) => r.data)
  },
  cancelSubscription() {
    return api.post<SubscriptionResponse>('/api/v1/subscription/cancel').then((r) => r.data)
  },
}
