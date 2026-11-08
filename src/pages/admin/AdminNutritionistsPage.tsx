import { useEffect, useState, type FormEvent } from 'react'
import { adminApi } from '@/api/adminApi'
import type { UserResponse } from '@/types/auth'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/forms/Button'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { SuccessAlert } from '@/components/feedback/SuccessAlert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { getErrorMessage } from '@/utils/errors'

export function AdminNutritionistsPage() {
  const [items, setItems] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await adminApi.listNutritionists())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await adminApi.createNutritionist({ name, email, password })
      setName('')
      setEmail('')
      setPassword('')
      setSuccess('Nutricionista cadastrado com sucesso.')
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="nf-page">
      <PageHeader title="Nutricionistas" description="Cadastro e listagem via API administrativa." />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />

      <form onSubmit={handleSubmit} className="nf-card grid gap-4 md:grid-cols-3">
        <TextField label="Nome" required value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="E-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField
          label="Senha"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="md:col-span-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Cadastrar nutricionista'}
          </Button>
        </div>
      </form>

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum nutricionista" description="Cadastre o primeiro profissional acima." />
      ) : (
        <div className="nf-table-wrap">
          <table className="nf-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>
                    <StatusBadge status={item.status} label={item.status === 'ACTIVE' ? 'Ativo' : 'Inativo'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
