import api from './axios'
import type { PageResponse } from '@/types/api'
import type { CheckinRequest, CheckinResponse } from '@/types/checkin'

export const checkinApi = {
  create(payload: CheckinRequest) {
    return api.post<CheckinResponse>('/api/v1/checkins', payload).then((r) => r.data)
  },
  list(params: { page?: number; size?: number } = {}) {
    return api.get<PageResponse<CheckinResponse>>('/api/v1/checkins', { params }).then((r) => r.data)
  },
  latest() {
    return api.get<CheckinResponse>('/api/v1/checkins/latest').then((r) => r.data)
  },
  get(id: string) {
    return api.get<CheckinResponse>(`/api/v1/checkins/${id}`).then((r) => r.data)
  },
}
