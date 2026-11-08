export type FoodCategory =
  | 'PROTEINS'
  | 'CARBOHYDRATES'
  | 'FATS'
  | 'FRUITS'
  | 'VEGETABLES'
  | 'LEGUMES'
  | 'BEVERAGES'

export type FoodPortionUnit = 'GRAM' | 'UNIT' | 'SLICE' | 'TABLESPOON'
export type FoodStatus = 'ACTIVE' | 'INACTIVE'

export interface FoodRequest {
  name: string
  category: FoodCategory
  portionQuantity: number
  portionUnit: FoodPortionUnit
  caloriesKcal: number
  proteinG: number
  carbohydrateG: number
  fatG: number
  fiberG: number
}

export interface FoodStatusRequest {
  status: FoodStatus
}

export interface FoodResponse {
  id: string
  name: string
  category: FoodCategory
  status: FoodStatus
  portionQuantity: number
  portionUnit: FoodPortionUnit
  caloriesKcal: number
  proteinG: number
  carbohydrateG: number
  fatG: number
  fiberG: number
}

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  PROTEINS: 'Proteínas',
  CARBOHYDRATES: 'Carboidratos',
  FATS: 'Gorduras',
  FRUITS: 'Frutas',
  VEGETABLES: 'Vegetais',
  LEGUMES: 'Leguminosas',
  BEVERAGES: 'Bebidas',
}

export const FOOD_PORTION_UNIT_LABELS: Record<FoodPortionUnit, string> = {
  GRAM: 'Grama',
  UNIT: 'Unidade',
  SLICE: 'Fatia',
  TABLESPOON: 'Colher de sopa',
}
