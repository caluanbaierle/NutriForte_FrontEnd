import type { MealType } from './questionnaire'
import type { FoodPortionUnit } from './food'

export type NutritionPlanStatus = 'ACTIVE' | 'ARCHIVED'

export interface NutrientTotals {
  caloriesKcal: number
  proteinG: number
  carbohydrateG: number
  fatG: number
}

export interface SubstitutionResponse {
  foodId: string
  foodName: string
  quantity: number
  unit: FoodPortionUnit
  caloriesKcal: number
  proteinG: number
  carbohydrateG: number
  fatG: number
}

export interface MealItemResponse {
  id: string
  foodId: string
  foodName: string
  quantity: number
  unit: FoodPortionUnit
  caloriesKcal: number
  proteinG: number
  carbohydrateG: number
  fatG: number
  substitutions: SubstitutionResponse[]
}

export interface MealResponse {
  mealType: MealType
  items: MealItemResponse[]
  totals: NutrientTotals | null
}

export interface NutritionPlanResponse {
  id: string
  version: number
  status: NutritionPlanStatus
  createdAt: string
  meals: MealResponse[]
  createdByUserId: string | null
  notes: string | null
  totals: NutrientTotals | null
}

/** Corpo de publicação. Calorias e macros não são enviados: o backend calcula pelo catálogo. */
export interface AuthoredPlanRequest {
  notes?: string
  meals: {
    mealType: MealType
    items: {
      foodId: string
      quantity: number
      unit: FoodPortionUnit
      substitutions: { foodId: string; quantity: number; unit: FoodPortionUnit }[]
    }[]
  }[]
}

export interface SubstitutionCheckResponse {
  authorized: boolean
  mealItemId: string
  foodId: string
  substitution: SubstitutionResponse | null
  message: string
}

export const NUTRITION_PLAN_STATUS_LABELS: Record<NutritionPlanStatus, string> = {
  ACTIVE: 'Ativo',
  ARCHIVED: 'Arquivado',
}
