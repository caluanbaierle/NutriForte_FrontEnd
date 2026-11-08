import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/auth'

interface NavItem {
  to: string
  label: string
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin', label: 'Painel', roles: ['ADMIN'] },
  { to: '/admin/nutritionists', label: 'Nutricionistas', roles: ['ADMIN'] },
  { to: '/admin/patients', label: 'Pacientes', roles: ['ADMIN'] },
  { to: '/admin/foods', label: 'Alimentos', roles: ['ADMIN'] },
  { to: '/admin/plans', label: 'Planos', roles: ['ADMIN'] },
  { to: '/admin/payments', label: 'Pagamentos', roles: ['ADMIN'] },
  { to: '/admin/subscriptions', label: 'Assinaturas', roles: ['ADMIN'] },
  { to: '/admin/links', label: 'Vínculos', roles: ['ADMIN'] },
  { to: '/admin/audit', label: 'Auditoria', roles: ['ADMIN'] },
  { to: '/nutritionist', label: 'Painel', roles: ['NUTRITIONIST'] },
  { to: '/nutritionist/patients', label: 'Pacientes', roles: ['NUTRITIONIST'] },
  { to: '/patient', label: 'Painel', roles: ['PATIENT'] },
  { to: '/patient/profile', label: 'Perfil', roles: ['PATIENT'] },
  { to: '/patient/questionnaire', label: 'Questionário', roles: ['PATIENT'] },
  { to: '/patient/assessment', label: 'Avaliação', roles: ['PATIENT'] },
  { to: '/patient/plan', label: 'Plano alimentar', roles: ['PATIENT'] },
  { to: '/patient/evaluations', label: 'Exames e testes', roles: ['PATIENT'] },
  { to: '/patient/checkins', label: 'Check-ins', roles: ['PATIENT'] },
  { to: '/patient/subscription', label: 'Assinatura', roles: ['PATIENT'] },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth()
  const items = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role))

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-charcoal/40 transition lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width)] flex-col border-r border-sage-muted/40 bg-forest text-cream transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-white/10 px-5 py-6">
          <p className="font-display text-2xl tracking-tight text-white">NutriForte</p>
          <p className="mt-1 text-xs text-sage-muted">Nutrição com acompanhamento</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/nutritionist' || item.to === '/patient'}
              onClick={onClose}
              className={({ isActive }) =>
                `block rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-white/15 text-white' : 'text-sage-muted hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
