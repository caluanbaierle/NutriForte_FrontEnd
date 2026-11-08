import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/forms/Button'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { getErrorMessage } from '@/utils/errors'

export function RegisterPatientPage() {
  const { registerPatient, isAuthenticated, user, loading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated && user) {
    return <Navigate to="/patient" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await registerPatient({ name, email, password })
      navigate('/patient/profile', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível criar a conta.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl text-forest">NutriForte</h1>
          <p className="mt-2 text-sm text-charcoal-muted">Cadastro de paciente</p>
        </div>
        <form onSubmit={handleSubmit} className="nf-card space-y-4">
          <ErrorAlert message={error} onClose={() => setError('')} />
          <TextField label="Nome" name="name" required value={name} onChange={(e) => setName(e.target.value)} />
          <TextField
            label="E-mail"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Senha"
            name="password"
            type="password"
            required
            hint="Mínimo 8 caracteres, com letra e número"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar conta'}
          </Button>
          <p className="text-center text-sm text-charcoal-muted">
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold text-forest hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
