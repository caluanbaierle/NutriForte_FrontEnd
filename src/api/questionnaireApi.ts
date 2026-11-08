import api from './axios'
import type { QuestionnaireRequest, QuestionnaireResponse } from '@/types/questionnaire'

export const questionnaireApi = {
  create(payload: QuestionnaireRequest) {
    return api.post<QuestionnaireResponse>('/api/v1/questionnaire', payload).then((r) => r.data)
  },
  getMe() {
    return api.get<QuestionnaireResponse>('/api/v1/questionnaire/me').then((r) => r.data)
  },
  updateMe(payload: QuestionnaireRequest) {
    return api.put<QuestionnaireResponse>('/api/v1/questionnaire/me', payload).then((r) => r.data)
  },
}
