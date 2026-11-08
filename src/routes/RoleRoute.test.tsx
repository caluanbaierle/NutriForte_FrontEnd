import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { RoleRoute } from '@/routes/RoleRoute'
import { AuthProvider } from '@/contexts/AuthContext'
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

function renderWithRole() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<RoleRoute roles={['ADMIN']} />}>
            <Route path="/admin" element={<div>área admin</div>} />
          </Route>
          <Route path="/forbidden" element={<div>proibido</div>} />
          <Route path="/login" element={<div>login</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('RoleRoute', () => {
  beforeEach(() => {
    storage.clearTokens()
    vi.clearAllMocks()
  })

  it('permite acesso para role correta', async () => {
    storage.setTokens('a', 'r')
    vi.mocked(authApi.me).mockResolvedValue({
      id: '1',
      name: 'Admin',
      email: 'admin@nf.com',
      role: 'ADMIN',
      status: 'ACTIVE',
    })

    renderWithRole()
    await waitFor(() => expect(screen.getByText('área admin')).toBeInTheDocument())
  })

  it('redireciona para forbidden quando role não corresponde', async () => {
    storage.setTokens('a', 'r')
    vi.mocked(authApi.me).mockResolvedValue({
      id: '2',
      name: 'Paciente',
      email: 'p@nf.com',
      role: 'PATIENT',
      status: 'ACTIVE',
    })

    renderWithRole()
    await waitFor(() => expect(screen.getByText('proibido')).toBeInTheDocument())
  })
})
