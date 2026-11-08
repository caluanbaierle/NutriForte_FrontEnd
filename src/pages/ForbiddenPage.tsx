import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-4xl text-forest">Acesso negado</h1>
      <p className="max-w-md text-sm text-charcoal-muted">
        Seu perfil não tem permissão para esta área. O controle de acesso é definido pelo backend.
      </p>
      <Link to="/" className="nf-btn-primary">
        Ir para o início
      </Link>
    </div>
  )
}
