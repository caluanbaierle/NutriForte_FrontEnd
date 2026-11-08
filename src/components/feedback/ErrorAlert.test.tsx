import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'

describe('ErrorAlert', () => {
  it('renderiza mensagem', () => {
    render(<ErrorAlert message="Falha ao salvar" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao salvar')
  })

  it('não renderiza quando mensagem vazia', () => {
    const { container } = render(<ErrorAlert message="" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('chama onClose ao fechar', async () => {
    const onClose = vi.fn()
    render(<ErrorAlert message="Erro" onClose={onClose} />)
    await userEvent.click(screen.getByLabelText('Fechar'))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
