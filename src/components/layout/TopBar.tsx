import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/forms/Button'

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-sage-muted/40 bg-cream/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-[var(--radius-md)] border border-sage-muted px-3 py-2 text-sm text-forest lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          Menu
        </button>
        <div>
          <p className="text-sm font-semibold text-charcoal">{user?.name}</p>
          <p className="text-xs text-charcoal-muted">
            {user?.email} · {user?.role}
          </p>
        </div>
      </div>
      <Button variant="secondary" onClick={() => void logout()}>
        Sair
      </Button>
    </header>
  )
}
