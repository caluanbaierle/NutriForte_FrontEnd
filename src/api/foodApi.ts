import api from './axios'
import type { PageResponse } from '@/types/api'
import type { FoodCategory, FoodRequest, FoodResponse, FoodStatus } from '@/types/food'

export interface FoodListParams {
  name?: string
  category?: FoodCategory
  status?: FoodStatus
  page?: number
  size?: number
}

export const foodApi = {
  list(params: FoodListParams = {}) {
    return api.get<PageResponse<FoodResponse>>('/api/v1/foods', { params }).then((r) => r.data)
  },
  get(id: string) {
    return api.get<FoodResponse>(`/api/v1/foods/${id}`).then((r) => r.data)
  },
  create(payload: FoodRequest) {
    return api.post<FoodResponse>('/api/v1/foods', payload).then((r) => r.data)
  },
  update(id: string, payload: FoodRequest) {
    return api.put<FoodResponse>(`/api/v1/foods/${id}`, payload).then((r) => r.data)
  },
  changeStatus(id: string, status: FoodStatus) {
    return api.patch<FoodResponse>(`/api/v1/foods/${id}/status`, { status }).then((r) => r.data)
  },
}
