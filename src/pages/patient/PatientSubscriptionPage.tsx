import { useEffect, useState } from 'react'
import { subscriptionApi } from '@/api/subscriptionApi'
import type { SubscriptionPlanResponse, SubscriptionResponse } from '@/types/subscription'
import {
  BILLING_PERIOD_LABELS,
  PAYMENT_STATUS_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
} from '@/types/subscription'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/forms/Button'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { SuccessAlert } from '@/components/feedback/SuccessAlert'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { EmptyState } from '@/components/feedback/EmptyState'
import { getErrorMessage } from '@/utils/errors'
import { formatDateTime, formatMoney } from '@/utils/format'

export function PatientSubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlanResponse[]>([])
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const planList = await subscriptionApi.listPlans()
      setPlans(planList)
      try {
        setSubscription(await subscriptionApi.getSubscription())
      } catch {
        setSubscription(null)
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function subscribe(planId: string) {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const created = await subscriptionApi.createSubscription({ planId })
      setSubscription(created)
      setSuccess('Assinatura criada. O acesso é determinado pelo backend (accessGranted).')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function cancel() {
    setBusy(true)
    setError('')
    try {
      const updated = await subscriptionApi.cancelSubscription()
      setSubscription(updated)
      setSuccess('Cancelamento solicitado.')
      setCancelOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="nf-page">
      <PageHeader
        title="Assinatura"
        description="Planos, preços e liberação de acesso são definidos pelo backend."
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />

      {loading ? (
        <LoadingState />
      ) : (
        <>
          {subscription ? (
            <div className="nf-card space-y-2">
              <h2 className="font-display text-xl text-forest">Assinatura atual</h2>
              <p className="text-sm">{subscription.planName}</p>
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  status={subscription.status}
                  label={SUBSCRIPTION_STATUS_LABELS[subscription.status]}
                />
                <StatusBadge
                  status={subscription.accessGranted ? 'ACTIVE' : 'INACTIVE'}
                  label={subscription.accessGranted ? 'Acesso liberado' : 'Acesso não liberado'}
                />
                {subscription.paymentStatus ? (
                  <StatusBadge
                    status={subscription.paymentStatus}
                    label={PAYMENT_STATUS_LABELS[subscription.paymentStatus]}
                  />
                ) : null}
              </div>
              <p className="text-sm text-charcoal-muted">
                Período: {formatDateTime(subscription.currentPeriodStart)} —{' '}
                {formatDateTime(subscription.currentPeriodEnd)}
              </p>
              {subscription.pixPayload ? (
                <div className="rounded-[var(--radius-md)] bg-cream p-3 text-sm">
                  <p className="font-medium">PIX (referência MVP)</p>
                  <p className="mt-1 break-all font-mono text-xs">{subscription.pixPayload}</p>
                  {subscription.paymentAmount != null ? (
                    <p className="mt-2">
                      Valor: {formatMoney(subscription.paymentAmount, subscription.paymentCurrency ?? 'BRL')}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {subscription.status !== 'CANCELLED' ? (
                <Button variant="danger" onClick={() => setCancelOpen(true)} disabled={busy}>
                  Cancelar assinatura
                </Button>
              ) : null}
            </div>
          ) : (
            <EmptyState title="Sem assinatura ativa" description="Escolha um plano abaixo." />
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <div key={plan.id} className="nf-card">
                <h3 className="font-display text-xl text-forest">{plan.name}</h3>
                {plan.description ? (
                  <p className="mt-1 text-sm text-charcoal-muted">{plan.description}</p>
                ) : null}
                <p className="mt-3 text-2xl font-semibold text-charcoal">
                  {formatMoney(plan.price, plan.currency)}
                  <span className="ml-1 text-sm font-normal text-charcoal-muted">
                    / {BILLING_PERIOD_LABELS[plan.billingPeriod].toLowerCase()}
                  </span>
                </p>
                <Button className="mt-4" onClick={() => void subscribe(plan.id)} disabled={busy}>
                  Assinar
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={cancelOpen}
        title="Cancelar assinatura"
        description="O cancelamento será processado pelo backend. O acesso segue as regras do servidor."
        confirmLabel="Confirmar cancelamento"
        danger
        loading={busy}
        onConfirm={() => void cancel()}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  )
}
