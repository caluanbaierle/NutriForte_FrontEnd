export interface CheckinRequest {
  weightKg: number
  waistCm?: number | null
  dietAdherencePercent: number
}

export interface CheckinResponse {
  id: string
  weightKg: number
  waistCm?: number | null
  dietAdherencePercent: number
  createdAt: string
}
