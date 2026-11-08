import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/forms/Button'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { getErrorMessage } from '@/utils/errors'
import type { UserRole } from '@/types/auth'

function homeForRole(role: UserRole) {
  if (role === 'ADMIN') return '/admin'
  if (role === 'NUTRITIONIST') return '/nutritionist'
  return '/patient'
}

export function LoginPage() {
  const { login, isAuthenticated, user, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated && user) {
    return <Navigate to={homeForRole(user.role)} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const me = await login({ email, password })
      navigate(homeForRole(me.role), { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Falha ao entrar. Verifique e-mail e senha.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl text-forest">NutriForte</h1>
          <p className="mt-2 text-sm text-charcoal-muted">Acesse sua conta para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="nf-card space-y-4">
          <ErrorAlert message={error} onClose={() => setError('')} />
          <TextField
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Senha"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
          <p className="text-center text-sm text-charcoal-muted">
            Paciente novo?{' '}
            <Link to="/register" className="font-semibold text-forest hover:underline">
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
