import api from './axios'
import type { PageResponse } from '@/types/api'
import type { CheckinResponse } from '@/types/checkin'
import type {
  NutritionistDashboardResponse,
  NutritionistPatientListItem,
  NutritionistPatientSummary,
} from '@/types/nutritionist'
import type { QuestionnaireResponse } from '@/types/questionnaire'
import type { AuthoredPlanRequest, NutritionPlanResponse } from '@/types/plan'
import type {
  AssessmentHistoryResponse,
  LipidAssessmentRequest,
  LipidAssessmentResponse,
  Vo2AssessmentRequest,
  Vo2AssessmentResponse,
  WeightLossEnergyResponse,
  MesocycleResponse,
} from '@/types/assessment'
import type { NutritionCalculationResult } from '@/types/nutrition'

export const nutritionistApi = {
  getDashboard() {
    return api.get<NutritionistDashboardResponse>('/api/v1/nutritionist/dashboard').then((r) => r.data)
  },
  listPatients(params: { name?: string; page?: number; size?: number } = {}) {
    return api
      .get<PageResponse<NutritionistPatientListItem>>('/api/v1/nutritionist/patients', { params })
      .then((r) => r.data)
  },
  getPatient(patientId: string) {
    return api
      .get<NutritionistPatientSummary>(`/api/v1/nutritionist/patients/${patientId}`)
      .then((r) => r.data)
  },
  getPatientCheckins(patientId: string, params: { page?: number; size?: number } = {}) {
    return api
      .get<PageResponse<CheckinResponse>>(`/api/v1/nutritionist/patients/${patientId}/checkins`, { params })
      .then((r) => r.data)
  },
  getPatientQuestionnaire(patientId: string) {
    return api
      .get<QuestionnaireResponse>(`/api/v1/nutritionist/patients/${patientId}/questionnaire`)
      .then((r) => r.data)
  },
  getPatientNutritionPlan(patientId: string) {
    return api
      .get<NutritionPlanResponse>(`/api/v1/nutritionist/patients/${patientId}/nutrition-plan`)
      .then((r) => r.data)
  },
  /** kcalPerKg opcional: escolhido pelo nutricionista dentro da faixa do objetivo. */
  calculatePatientNutrition(patientId: string, kcalPerKg?: number) {
    return api
      .post<NutritionCalculationResult>(
        `/api/v1/nutritionist/patients/${patientId}/nutrition/calculate`,
        kcalPerKg != null ? { kcalPerKg } : undefined,
      )
      .then((r) => r.data)
  },
  /** Salva o kcal/kg para o paciente; passa a valer também na tela do paciente. */
  saveEnergyTarget(patientId: string, kcalPerKg: number) {
    return api
      .put<NutritionCalculationResult>(`/api/v1/nutritionist/patients/${patientId}/energy-target`, { kcalPerKg })
      .then((r) => r.data)
  },
  mesocycle(payload: {
    block: number
    muscleDeficit: number
    caloricExpenditureKcal: number
    sessionTrainingKcal: number
    mealsPerDay: number
    weightKg?: number
  }) {
    return api.post<MesocycleResponse>('/api/v1/nutritionist/calculators/mesocycle', payload).then((r) => r.data)
  },
  publishNutritionPlan(patientId: string, payload: AuthoredPlanRequest) {
    return api
      .post<NutritionPlanResponse>(`/api/v1/nutritionist/patients/${patientId}/nutrition-plans`, payload)
      .then((r) => r.data)
  },
  listNutritionPlans(patientId: string) {
    return api
      .get<NutritionPlanResponse[]>(`/api/v1/nutritionist/patients/${patientId}/nutrition-plans`)
      .then((r) => r.data)
  },
  getAssessments(patientId: string) {
    return api
      .get<AssessmentHistoryResponse>(`/api/v1/nutritionist/patients/${patientId}/assessments`)
      .then((r) => r.data)
  },
  createVo2Assessment(patientId: string, payload: Vo2AssessmentRequest) {
    return api
      .post<Vo2AssessmentResponse>(`/api/v1/nutritionist/patients/${patientId}/assessments/vo2`, payload)
      .then((r) => r.data)
  },
  createLipidAssessment(patientId: string, payload: LipidAssessmentRequest) {
    return api
      .post<LipidAssessmentResponse>(`/api/v1/nutritionist/patients/${patientId}/assessments/lipids`, payload)
      .then((r) => r.data)
  },
  weightLossEnergy(payload: { weightKg: number; days: number }) {
    return api
      .post<WeightLossEnergyResponse>('/api/v1/nutritionist/calculators/weight-loss-energy', payload)
      .then((r) => r.data)
  },
}
