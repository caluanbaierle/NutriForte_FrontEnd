import axios from 'axios'
import type { ErrorResponse } from '@/types/api'

export class ApiError extends Error {
  status?: number
  error?: string
  path?: string
  fieldErrors?: ErrorResponse['fieldErrors']

  constructor(payload: ErrorResponse & { fallbackMessage?: string }) {
    super(payload.message || payload.error || payload.fallbackMessage || 'Ocorreu um erro inesperado.')
    this.name = 'ApiError'
    this.status = payload.status
    this.error = payload.error
    this.path = payload.path
    this.fieldErrors = payload.fieldErrors
  }
}

export function getErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (error instanceof ApiError) {
    if (error.fieldErrors?.length) {
      return error.fieldErrors.map((f) => `${f.field}: ${f.message}`).join(' · ')
    }
    return error.message || fallback
  }
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ErrorResponse | undefined
    if (data?.message) return data.message
    if (data?.error) return data.error
    if (error.message) return error.message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (axios.isAxiosError(error)) {
    const data = (error.response?.data ?? {}) as ErrorResponse
    return new ApiError({
      ...data,
      status: data.status ?? error.response?.status,
      fallbackMessage: error.message,
    })
  }
  if (error instanceof Error) {
    return new ApiError({ message: error.message })
  }
  return new ApiError({ message: 'Ocorreu um erro inesperado.' })
}
