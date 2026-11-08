export type Sex = 'MALE' | 'FEMALE'

export interface PatientRequest {
  fullName: string
  cpf: string
  birthDate: string
  sex: Sex
  whatsapp: string
  city: string
  state: string
}

export interface PatientResponse {
  id: string
  fullName: string
  cpf: string
  birthDate: string
  sex: Sex
  whatsapp: string
  email: string
  city: string
  state: string
}

export interface WeightPoint {
  recordedAt: string
  weightKg: number
}

export interface WaistPoint {
  recordedAt: string
  waistCm: number
}

export interface DashboardPatient {
  id: string
  fullName: string
}

export interface DashboardPlanSummary {
  id: string
  version: number
  status: 'ACTIVE' | 'ARCHIVED'
  createdAt: string
}

export interface PatientDashboardResponse {
  patient: DashboardPatient
  targetWeightKg?: number | null
  currentWeightKg?: number | null
  bodyFatPercent?: number | null
  weightHistory: WeightPoint[]
  waistHistory: WaistPoint[]
  latestCheckin?: import('./checkin').CheckinResponse | null
  currentNutritionPlan?: DashboardPlanSummary | null
}

export const SEX_LABELS: Record<Sex, string> = {
  MALE: 'Masculino',
  FEMALE: 'Feminino',
}

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const
