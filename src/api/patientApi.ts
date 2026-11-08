import api from './axios'
import type { PatientDashboardResponse, PatientRequest, PatientResponse } from '@/types/patient'
import type { NutritionCalculationResult } from '@/types/nutrition'

export const patientApi = {
  create(payload: PatientRequest) {
    return api.post<PatientResponse>('/api/v1/patients', payload).then((r) => r.data)
  },
  getMe() {
    return api.get<PatientResponse>('/api/v1/patients/me').then((r) => r.data)
  },
  updateMe(payload: PatientRequest) {
    return api.put<PatientResponse>('/api/v1/patients/me', payload).then((r) => r.data)
  },
  getDashboard() {
    return api.get<PatientDashboardResponse>('/api/v1/patients/dashboard').then((r) => r.data)
  },
  calculateNutrition() {
    return api.post<NutritionCalculationResult>('/api/v1/nutrition/calculate').then((r) => r.data)
  },
}
