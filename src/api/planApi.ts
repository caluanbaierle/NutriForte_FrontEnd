import api from './axios'
import type { NutritionPlanResponse, SubstitutionCheckResponse } from '@/types/plan'

export const planApi = {
  list() {
    return api.get<NutritionPlanResponse[]>('/api/v1/nutrition-plans').then((r) => r.data)
  },
  current() {
    return api.get<NutritionPlanResponse>('/api/v1/nutrition-plans/current').then((r) => r.data)
  },
  get(id: string) {
    return api.get<NutritionPlanResponse>(`/api/v1/nutrition-plans/${id}`).then((r) => r.data)
  },
  checkSubstitution(mealItemId: string, foodId: string) {
    return api
      .get<SubstitutionCheckResponse>('/api/v1/nutrition-plans/current/substitutions/check', {
        params: { mealItemId, foodId },
      })
      .then((r) => r.data)
  },
}
