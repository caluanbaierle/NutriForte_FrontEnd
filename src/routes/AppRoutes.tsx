import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingState } from '@/components/feedback/LoadingState'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPatientPage } from '@/pages/auth/RegisterPatientPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminNutritionistsPage } from '@/pages/admin/AdminNutritionistsPage'
import { AdminPatientsPage } from '@/pages/admin/AdminPatientsPage'
import { AdminFoodsPage } from '@/pages/admin/AdminFoodsPage'
import { AdminPlansPage } from '@/pages/admin/AdminPlansPage'
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage'
import { AdminSubscriptionsPage } from '@/pages/admin/AdminSubscriptionsPage'
import { AdminLinksPage } from '@/pages/admin/AdminLinksPage'
import { AdminAuditPage } from '@/pages/admin/AdminAuditPage'
import { NutritionistDashboardPage } from '@/pages/nutritionist/NutritionistDashboardPage'
import { NutritionistPatientsPage } from '@/pages/nutritionist/NutritionistPatientsPage'
import { NutritionistPatientDetailPage } from '@/pages/nutritionist/NutritionistPatientDetailPage'
import { NutritionistPatientAssessmentPage } from '@/pages/nutritionist/NutritionistPatientAssessmentPage'
import { PatientDashboardPage } from '@/pages/patient/PatientDashboardPage'
import { PatientProfilePage } from '@/pages/patient/PatientProfilePage'
import { PatientQuestionnairePage } from '@/pages/patient/PatientQuestionnairePage'
import { PatientAssessmentPage } from '@/pages/patient/PatientAssessmentPage'
import { PatientPlanPage } from '@/pages/patient/PatientPlanPage'
import { PatientEvaluationsPage } from '@/pages/patient/PatientEvaluationsPage'
import { PatientCheckinsPage } from '@/pages/patient/PatientCheckinsPage'
import { PatientSubscriptionPage } from '@/pages/patient/PatientSubscriptionPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import type { UserRole } from '@/types/auth'

function HomeRedirect() {
  const { user, loading, isAuthenticated } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState />
      </div>
    )
  }
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  return <Navigate to={homeForRole(user.role)} replace />
}

function homeForRole(role: UserRole) {
  if (role === 'ADMIN') return '/admin'
  if (role === 'NUTRITIONIST') return '/nutritionist'
  return '/patient'
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPatientPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomeRedirect />} />

          <Route element={<RoleRoute roles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/nutritionists" element={<AdminNutritionistsPage />} />
            <Route path="/admin/patients" element={<AdminPatientsPage />} />
            <Route path="/admin/foods" element={<AdminFoodsPage />} />
            <Route path="/admin/plans" element={<AdminPlansPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="/admin/links" element={<AdminLinksPage />} />
            <Route path="/admin/audit" element={<AdminAuditPage />} />
          </Route>

          <Route element={<RoleRoute roles={['NUTRITIONIST']} />}>
            <Route path="/nutritionist" element={<NutritionistDashboardPage />} />
            <Route path="/nutritionist/patients" element={<NutritionistPatientsPage />} />
            <Route path="/nutritionist/patients/:patientId" element={<NutritionistPatientDetailPage />} />
            <Route
              path="/nutritionist/patients/:patientId/assessment"
              element={<NutritionistPatientAssessmentPage />}
            />
          </Route>

          <Route element={<RoleRoute roles={['PATIENT']} />}>
            <Route path="/patient" element={<PatientDashboardPage />} />
            <Route path="/patient/profile" element={<PatientProfilePage />} />
            <Route path="/patient/questionnaire" element={<PatientQuestionnairePage />} />
            <Route path="/patient/assessment" element={<PatientAssessmentPage />} />
            <Route path="/patient/plan" element={<PatientPlanPage />} />
            <Route path="/patient/evaluations" element={<PatientEvaluationsPage />} />
            <Route path="/patient/checkins" element={<PatientCheckinsPage />} />
            <Route path="/patient/subscription" element={<PatientSubscriptionPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
