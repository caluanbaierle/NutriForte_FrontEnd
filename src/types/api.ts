export interface FieldErrorResponse {
  field: string
  message: string
}

export interface ErrorResponse {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  fieldErrors?: FieldErrorResponse[]
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
