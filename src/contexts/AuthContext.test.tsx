import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/api/authApi'
import { storage } from '@/utils/storage'

vi.mock('@/api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    registerPatient: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    refresh: vi.fn(),
  },
}))

function Probe() {
  const { user, login, logout, isAuthenticated } = useAuth()
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user">{user?.email ?? ''}</span>
      <button type="button" onClick={() => void login({ email: 'a@b.com', password: 'secret12' })}>
        login
      </button>
      <button
        type="button"
        onClick={() =>
          void login({ email: 'bad@b.com', password: 'x' }).catch(() => undefined)
        }
      >
        login-fail
      </button>
      <button type="button" onClick={() => void logout()}>
        logout
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    storage.clearTokens()
    vi.clearAllMocks()
    vi.mocked(authApi.me).mockRejectedValue(new Error('no session'))
  })

  it('faz login com sucesso', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
      tokenType: 'Bearer',
      expiresIn: 3600,
    })
    vi.mocked(authApi.me).mockResolvedValue({
      id: '1',
      name: 'Ana',
      email: 'a@b.com',
      role: 'PATIENT',
      status: 'ACTIVE',
    })

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('no'))
    await userEvent.click(screen.getByText('login'))
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('yes'))
    expect(screen.getByTestId('user')).toHaveTextContent('a@b.com')
    expect(storage.getAccessToken()).toBe('a')
  })

  it('mantém deslogado em falha de login', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('credenciais inválidas'))

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await userEvent.click(screen.getByText('login-fail'))
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('no'))
    expect(storage.getAccessToken()).toBeNull()
  })

  it('faz logout e limpa tokens', async () => {
    storage.setTokens('a', 'r')
    vi.mocked(authApi.me).mockResolvedValue({
      id: '1',
      name: 'Ana',
      email: 'a@b.com',
      role: 'PATIENT',
      status: 'ACTIVE',
    })
    vi.mocked(authApi.logout).mockResolvedValue({} as never)

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('yes'))
    await userEvent.click(screen.getByText('logout'))
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('no'))
    expect(storage.getAccessToken()).toBeNull()
  })
})
