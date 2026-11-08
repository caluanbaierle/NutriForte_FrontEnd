import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { ApiError, getErrorMessage, toApiError } from '@/utils/errors'

describe('errors utils', () => {
  it('extrai mensagem de ApiError com fieldErrors', () => {
    const err = new ApiError({
      message: 'Validação',
      fieldErrors: [
        { field: 'email', message: 'inválido' },
        { field: 'password', message: 'curta' },
      ],
    })
    expect(getErrorMessage(err)).toContain('email: inválido')
    expect(getErrorMessage(err)).toContain('password: curta')
  })

  it('mapeia AxiosError para ApiError', () => {
    const axiosError = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
        data: {
          status: 400,
          error: 'Bad Request',
          message: 'E-mail já cadastrado',
          path: '/api/v1/auth/register-patient',
        },
      },
    )
    const apiError = toApiError(axiosError)
    expect(apiError).toBeInstanceOf(ApiError)
    expect(apiError.message).toBe('E-mail já cadastrado')
    expect(apiError.status).toBe(400)
  })

  it('usa fallback quando erro é desconhecido', () => {
    expect(getErrorMessage({}, 'fallback')).toBe('fallback')
  })
})
