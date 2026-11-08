import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-4xl text-forest">Página não encontrada</h1>
      <p className="text-sm text-charcoal-muted">O endereço solicitado não existe.</p>
      <Link to="/" className="nf-btn-primary">
        Voltar ao início
      </Link>
    </div>
  )
}
