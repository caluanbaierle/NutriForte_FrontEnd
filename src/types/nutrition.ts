import type { MealType } from './questionnaire'

export interface GoalCalorieRange {
  clinicGoal: string
  minKcalPerKg: number
  maxKcalPerKg: number
}

export interface MacroDistribution {
  proteinPercent: number
  fatPercent: number
  carbohydratePercent: number
  proteinKcalPerGram: number
  fatKcalPerGram: number
  carbohydrateKcalPerGram: number
}

export interface MealCaloriePercent {
  meal: MealType
  percent: number
}

export interface MacronutrientGrams {
  proteinKcal: number
  fatKcal: number
  carbohydrateKcal: number
  proteinGrams: number
  fatGrams: number
  carbohydrateGrams: number
}

export interface MealTarget {
  meal: MealType
  percent: number
  kcal: number
  proteinGrams: number
  fatGrams: number
  carbohydrateGrams: number
}

/** Alvo calculado no backend a partir do kcal/kg escolhido pelo nutricionista. */
export interface EnergyTarget {
  kcalPerKg: number
  totalKcal: number
  macros: MacronutrientGrams
  proteinGramsPerKg: number
  fatGramsPerKg: number
  carbohydrateGramsPerKg: number
  meals: MealTarget[]
}

export interface NutritionCalculationResult {
  complete: boolean
  ruleSource?: string | null
  bmrKcal?: number | null
  activityFactor?: number | null
  tdeeKcal?: number | null
  bmi?: number | null
  calorieRange?: GoalCalorieRange | null
  energyTarget?: EnergyTarget | null
  waterMl?: number | null
  identifiedMacroDistribution?: MacroDistribution | null
  identifiedMealCaloriePercents?: MealCaloriePercent[] | null
  pendingRules: string[]
  /** Data em que o nutricionista salvou o kcal/kg usado no alvo. */
  energyTargetDefinedAt?: string | null
}
