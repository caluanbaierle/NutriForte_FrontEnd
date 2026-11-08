export type Goal =
  | 'WEIGHT_LOSS'
  | 'HYPERTROPHY'
  | 'DIET_REEDUCATION'
  | 'MUSCLE_DEFINITION'
  | 'METABOLIC_HEALTH'
  | 'WEIGHT_GAIN'
  | 'SPORTS_PERFORMANCE'

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTREMELY_ACTIVE'

export type MealType =
  | 'BREAKFAST'
  | 'MORNING_SNACK'
  | 'LUNCH'
  | 'AFTERNOON_SNACK'
  | 'DINNER'
  | 'LATE_SNACK'

export type CookingTime = 'UNDER_15_MINUTES' | 'FROM_15_TO_30_MINUTES' | 'OVER_30_MINUTES'

export type Allergen = 'PEANUT' | 'TREE_NUTS' | 'SEAFOOD' | 'EGG' | 'MILK' | 'OTHER'

export type DietaryRestriction =
  | 'VEGETARIAN'
  | 'VEGAN'
  | 'LACTOSE_INTOLERANCE'
  | 'GLUTEN_INTOLERANCE'
  | 'DIABETES'
  | 'HYPERTENSION'
  | 'HIGH_CHOLESTEROL'
  | 'KIDNEY_DISEASE'

export type TrainingType =
  | 'WEIGHT_TRAINING'
  | 'RUNNING'
  | 'WALKING'
  | 'CROSSFIT'
  | 'CYCLING'
  | 'OTHER'

export interface QuestionnaireRequest {
  heightCm: number
  currentWeightKg: number
  desiredWeightKg: number
  bodyFatPercent?: number | null
  muscleMassKg?: number | null
  waistCm?: number | null
  activityLevel: ActivityLevel
  weeklyFrequency: number
  trainingTypes: TrainingType[]
  goal: Goal
  restrictions: DietaryRestriction[]
  allergies: Allergen[]
  likedFoods: string[]
  dislikedFoods: string[]
  neverEatFoods: string[]
  wakeTime: string
  sleepTime: string
  availableMeals: MealType[]
  cookingTime: CookingTime
}

export interface QuestionnaireResponse extends QuestionnaireRequest {
  id: string
}

export const GOAL_LABELS: Record<Goal, string> = {
  WEIGHT_LOSS: 'Emagrecimento',
  HYPERTROPHY: 'Hipertrofia',
  DIET_REEDUCATION: 'Reeducação alimentar',
  MUSCLE_DEFINITION: 'Definição muscular',
  METABOLIC_HEALTH: 'Saúde metabólica',
  WEIGHT_GAIN: 'Ganho de peso',
  SPORTS_PERFORMANCE: 'Performance esportiva',
}

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: 'Sedentário',
  LIGHTLY_ACTIVE: 'Levemente ativo',
  MODERATELY_ACTIVE: 'Moderadamente ativo',
  VERY_ACTIVE: 'Muito ativo',
  EXTREMELY_ACTIVE: 'Extremamente ativo',
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Café da manhã',
  MORNING_SNACK: 'Lanche da manhã',
  LUNCH: 'Almoço',
  AFTERNOON_SNACK: 'Lanche da tarde',
  DINNER: 'Jantar',
  LATE_SNACK: 'Ceia',
}

export const COOKING_TIME_LABELS: Record<CookingTime, string> = {
  UNDER_15_MINUTES: 'Até 15 minutos',
  FROM_15_TO_30_MINUTES: 'De 15 a 30 minutos',
  OVER_30_MINUTES: 'Mais de 30 minutos',
}

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  PEANUT: 'Amendoim',
  TREE_NUTS: 'Castanhas',
  SEAFOOD: 'Frutos do mar',
  EGG: 'Ovo',
  MILK: 'Leite',
  OTHER: 'Outro',
}

export const DIETARY_RESTRICTION_LABELS: Record<DietaryRestriction, string> = {
  VEGETARIAN: 'Vegetariano',
  VEGAN: 'Vegano',
  LACTOSE_INTOLERANCE: 'Intolerância à lactose',
  GLUTEN_INTOLERANCE: 'Intolerância ao glúten',
  DIABETES: 'Diabetes',
  HYPERTENSION: 'Hipertensão',
  HIGH_CHOLESTEROL: 'Colesterol alto',
  KIDNEY_DISEASE: 'Doença renal',
}

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  WEIGHT_TRAINING: 'Musculação',
  RUNNING: 'Corrida',
  WALKING: 'Caminhada',
  CROSSFIT: 'Crossfit',
  CYCLING: 'Ciclismo',
  OTHER: 'Outro',
}
