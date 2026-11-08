import type { CheckinResponse } from './checkin'
import type { QuestionnaireResponse } from './questionnaire'
import type { DashboardPlanSummary } from './patient'
import type { Sex } from './patient'

export interface NutritionistDashboardResponse {
  totalPatients: number
}

export interface NutritionistPatientListItem {
  id: string
  fullName: string
  createdAt: string
}

export interface NutritionistPatientIdentity {
  id: string
  fullName: string
  cpf: string
  birthDate: string
  sex: Sex
  whatsapp: string
  city: string
  state: string
  createdAt: string
}

export interface NutritionistPatientSummary {
  patient: NutritionistPatientIdentity
  questionnaire?: QuestionnaireResponse | null
  latestCheckin?: CheckinResponse | null
  currentNutritionPlan?: DashboardPlanSummary | null
}
