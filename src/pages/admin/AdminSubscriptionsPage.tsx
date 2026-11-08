import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '@/api/adminApi'
import type { AdminPaymentResponse } from '@/types/admin'
import { SUBSCRIPTION_STATUS_LABELS } from '@/types/subscription'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { getErrorMessage } from '@/utils/errors'
import { formatDateTime, formatMoney } from '@/utils/format'

export function AdminSubscriptionsPage() {
  const [payments, setPayments] = useState<AdminPaymentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        setPayments(await adminApi.listPayments())
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const derived = useMemo(() => {
    const map = new Map<string, AdminPaymentResponse>()
    for (const payment of payments) {
      const current = map.get(payment.subscriptionId)
      if (!current || new Date(payment.createdAt) > new Date(current.createdAt)) {
        map.set(payment.subscriptionId, payment)
      }
    }
    return Array.from(map.values())
  }, [payments])

  return (
    <div className="nf-page">
      <PageHeader
        title="Assinaturas"
        description="Não existe GET /admin/subscriptions na API. Os status abaixo são derivados da lista de pagamentos."
      />
      <div className="rounded-[var(--radius-md)] border border-amber-200 bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning)]">
        Pendência de API: listagem dedicada de assinaturas não está disponível. Use{' '}
        <Link to="/admin/payments" className="font-semibold underline">
          Pagamentos
        </Link>{' '}
        para confirmar PIX e acompanhar o fluxo completo.
      </div>
      <ErrorAlert message={error} onClose={() => setError('')} />
      {loading ? (
        <LoadingState />
      ) : derived.length === 0 ? (
        <EmptyState title="Nenhuma assinatura derivável" description="Sem pagamentos, não há status para exibir." />
      ) : (
        <div className="nf-table-wrap">
          <table className="nf-table">
            <thead>
              <tr>
                <th>Assinatura</th>
                <th>Usuário</th>
                <th>Plano</th>
                <th>Status (via pagamento)</th>
                <th>Último pagamento</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {derived.map((item) => (
                <tr key={item.subscriptionId}>
                  <td className="font-mono text-xs">{item.subscriptionId}</td>
                  <td>{item.userEmail}</td>
                  <td>{item.planName}</td>
                  <td>
                    <StatusBadge
                      status={item.subscriptionStatus}
                      label={SUBSCRIPTION_STATUS_LABELS[item.subscriptionStatus]}
                    />
                  </td>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td>{formatMoney(item.amount, item.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
