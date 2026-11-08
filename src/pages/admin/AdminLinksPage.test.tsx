import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdminLinksPage } from './AdminLinksPage'
import { adminApi } from '@/api/adminApi'

vi.mock('@/api/adminApi', () => ({
  adminApi: {
    listNutritionists: vi.fn(),
    listPatients: vi.fn(),
    listLinks: vi.fn(),
    createLink: vi.fn(),
    deleteLink: vi.fn(),
  },
}))

const mocked = vi.mocked(adminApi)

const activeLink = {
  id: 'l1',
  nutritionistUserId: 'n1',
  nutritionistName: 'Nutri Ana',
  nutritionistEmail: 'ana@nutri.test',
  patientUserId: 'u1',
  patientId: 'p1',
  patientFullName: 'Paciente Bruno',
  patientEmail: 'bruno@pac.test',
  active: true,
  createdAt: '2026-10-22T12:00:00Z',
  deactivatedAt: null,
}

describe('AdminLinksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocked.listNutritionists.mockResolvedValue([
      { id: 'n1', name: 'Nutri Ana', email: 'ana@nutri.test', role: 'NUTRITIONIST', status: 'ACTIVE' } as never,
    ])
    mocked.listPatients.mockResolvedValue([])
    mocked.listLinks.mockResolvedValue({ content: [activeLink], page: 0, size: 20, totalElements: 1, totalPages: 1 })
  })

  it('lista os vínculos salvos no backend com nomes, começando pelos ativos', async () => {
    render(<AdminLinksPage />)

    expect(await screen.findByText('Paciente Bruno')).toBeInTheDocument()
    expect(screen.getByText('ana@nutri.test')).toBeInTheDocument()
    expect(mocked.listLinks).toHaveBeenCalledWith(expect.objectContaining({ active: true, page: 0 }))
    expect(screen.queryByText(/Pendência de API/)).not.toBeInTheDocument()
  })

  it('desativa um vínculo e recarrega a lista', async () => {
    mocked.deleteLink.mockResolvedValue({} as never)
    render(<AdminLinksPage />)
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: 'Desativar' }))
    const dialogButtons = await screen.findAllByRole('button', { name: 'Desativar' })
    await user.click(dialogButtons[dialogButtons.length - 1])

    await waitFor(() => expect(mocked.deleteLink).toHaveBeenCalledWith('l1'))
    await waitFor(() => expect(mocked.listLinks).toHaveBeenCalledTimes(2))
    expect(await screen.findByText(/Vínculo desativado: Paciente Bruno → Nutri Ana/)).toBeInTheDocument()
  })

  it('filtra por situação "Todos" sem enviar active', async () => {
    render(<AdminLinksPage />)
    const user = userEvent.setup()
    await screen.findByText('Paciente Bruno')

    await user.selectOptions(screen.getByLabelText('Situação'), 'all')

    await waitFor(() =>
      expect(mocked.listLinks).toHaveBeenLastCalledWith(expect.objectContaining({ active: undefined, page: 0 })),
    )
  })
})
