import { useEffect, useState } from 'react'
import { adminApi } from '@/api/adminApi'
import type { AdminPaymentResponse } from '@/types/admin'
import { PAYMENT_STATUS_LABELS, SUBSCRIPTION_STATUS_LABELS } from '@/types/subscription'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/forms/Button'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { SuccessAlert } from '@/components/feedback/SuccessAlert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { getErrorMessage } from '@/utils/errors'
import { formatDateTime, formatMoney } from '@/utils/format'

export function AdminPaymentsPage() {
  const [items, setItems] = useState<AdminPaymentResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await adminApi.listPayments())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleConfirm() {
    if (!confirmId) return
    setConfirming(true)
    setError('')
    try {
      await adminApi.confirmPayment(confirmId)
      setSuccess('Pagamento confirmado.')
      setConfirmId(null)
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="nf-page">
      <PageHeader
        title="Pagamentos"
        description="Confirmação manual de pagamentos PIX. Acesso e status são definidos pelo backend."
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum pagamento" description="Não há registros retornados pela API." />
      ) : (
        <div className="nf-table-wrap">
          <table className="nf-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Plano</th>
                <th>Valor</th>
                <th>Pagamento</th>
                <th>Assinatura</th>
                <th>Criado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div>{item.userEmail}</div>
                    <div className="font-mono text-xs text-charcoal-muted">{item.userId}</div>
                  </td>
                  <td>{item.planName}</td>
                  <td>{formatMoney(item.amount, item.currency)}</td>
                  <td>
                    <StatusBadge status={item.status} label={PAYMENT_STATUS_LABELS[item.status]} />
                  </td>
                  <td>
                    <StatusBadge
                      status={item.subscriptionStatus}
                      label={SUBSCRIPTION_STATUS_LABELS[item.subscriptionStatus]}
                    />
                  </td>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td>
                    {item.status === 'PENDING' ? (
                      <Button onClick={() => setConfirmId(item.id)}>Confirmar</Button>
                    ) : (
                      <span className="text-xs text-charcoal-muted">{formatDateTime(item.paidAt)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Confirmar pagamento"
        description="Esta ação confirma o pagamento no backend. O acesso do paciente será atualizado pelo servidor."
        confirmLabel="Confirmar pagamento"
        loading={confirming}
        onConfirm={() => void handleConfirm()}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
