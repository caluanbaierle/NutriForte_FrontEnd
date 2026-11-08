import type { Sex } from './patient'

export interface Vo2AssessmentRequest {
  weightKg: number
  mileMinutes: number
  heartRateBpm: number
}

export interface LipidAssessmentRequest {
  totalCholesterol: number
  hdl: number
  ldl: number
  triglycerides: number
}

export interface Vo2AssessmentResponse {
  id: string
  createdAt: string
  createdByUserId: string
  sex: Sex
  ageYears: number
  weightKg: number
  mileMinutes: number
  heartRateBpm: number
  vo2Max: number
  ruleSource: string
}

export interface LipidAssessmentResponse {
  id: string
  createdAt: string
  createdByUserId: string
  sex: Sex
  totalCholesterol: number
  hdl: number
  ldl: number
  triglycerides: number
  castelliI: number
  castelliII: number
  estimatedLdl: number
  castelliIReference: number
  castelliIIReference: number
  ruleSource: string
}

export interface AssessmentHistoryResponse {
  vo2: Vo2AssessmentResponse[]
  lipids: LipidAssessmentResponse[]
}

export interface WeightLossEnergyResponse {
  kcalPerKg: number
  weightKg: number
  days: number
  kcalPerDay: number
  ruleSource: string
  pendingValidation: string
}

export interface MesocycleResponse {
  result: {
    block: number
    muscleDeficit: number
    muscleDeficitKcal: number
    caloricExpenditureKcal: number
    sessionTrainingKcal: number
    totalKcal: number
    mealsPerDay: number
    proteinValuePerMeal: number
    macrosPerMeal?: {
      proteinPercent: number
      carbohydratePercent: number
      fatPercent: number
      proteinGrams: number
      carbohydrateGrams: number
      fatGrams: number
      totalGrams: number
    } | null
    waterMl?: number | null
  }
  ruleSource: string
  pendingValidation: string[]
}
