import api from './axios'
import type { AssessmentHistoryResponse } from '@/types/assessment'

export const assessmentApi = {
  /** Histórico do paciente autenticado (somente leitura). */
  mine() {
    return api.get<AssessmentHistoryResponse>('/api/v1/assessments').then((r) => r.data)
  },
}
