import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/auth'
import { LoadingState } from '@/components/feedback/LoadingState'

interface RoleRouteProps {
  roles: UserRole[]
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState message="Verificando permissões..." />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
