import { useEffect, useState, type FormEvent } from 'react'
import { adminApi } from '@/api/adminApi'
import type { BillingPeriod, PlanStatus, SubscriptionPlanResponse } from '@/types/subscription'
import { BILLING_PERIOD_LABELS, PLAN_STATUS_LABELS } from '@/types/subscription'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TextField } from '@/components/forms/TextField'
import { SelectField } from '@/components/forms/SelectField'
import { Button } from '@/components/forms/Button'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { SuccessAlert } from '@/components/feedback/SuccessAlert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { getErrorMessage } from '@/utils/errors'
import { formatMoney } from '@/utils/format'

export function AdminPlansPage() {
  const [items, setItems] = useState<SubscriptionPlanResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(99.9)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('MONTHLY')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      setItems(await adminApi.listPlans())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function resetForm() {
    setEditingId(null)
    setName('')
    setDescription('')
    setPrice(99.9)
    setBillingPeriod('MONTHLY')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    const payload = { name, description: description || null, price, billingPeriod }
    try {
      if (editingId) {
        await adminApi.updatePlan(editingId, payload)
        setSuccess('Plano atualizado.')
      } else {
        await adminApi.createPlan(payload)
        setSuccess('Plano criado.')
      }
      resetForm()
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleStatus(item: SubscriptionPlanResponse) {
    const next: PlanStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await adminApi.updatePlanStatus(item.id, { status: next })
      setSuccess('Status do plano atualizado.')
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="nf-page">
      <PageHeader title="Planos de assinatura" description="Preços e períodos definidos apenas pelo backend." />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />

      <form onSubmit={handleSubmit} className="nf-card grid gap-3 md:grid-cols-2">
        <h2 className="font-display text-xl text-forest md:col-span-2">
          {editingId ? 'Editar plano' : 'Novo plano'}
        </h2>
        <TextField label="Nome" required value={name} onChange={(e) => setName(e.target.value)} />
        <TextField
          label="Preço"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <SelectField
          label="Período"
          value={billingPeriod}
          onChange={(e) => setBillingPeriod(e.target.value as BillingPeriod)}
          options={Object.entries(BILLING_PERIOD_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <TextField label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar plano'}
          </Button>
          {editingId ? (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancelar
            </Button>
          ) : null}
        </div>
      </form>

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum plano cadastrado" />
      ) : (
        <div className="nf-table-wrap">
          <table className="nf-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço</th>
                <th>Período</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="font-medium">{item.name}</div>
                    {item.description ? (
                      <div className="text-xs text-charcoal-muted">{item.description}</div>
                    ) : null}
                  </td>
                  <td>{formatMoney(item.price, item.currency)}</td>
                  <td>{BILLING_PERIOD_LABELS[item.billingPeriod]}</td>
                  <td>
                    <StatusBadge status={item.status} label={PLAN_STATUS_LABELS[item.status]} />
                  </td>
                  <td className="space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditingId(item.id)
                        setName(item.name)
                        setDescription(item.description ?? '')
                        setPrice(item.price)
                        setBillingPeriod(item.billingPeriod)
                      }}
                    >
                      Editar
                    </Button>
                    <Button variant="secondary" onClick={() => void toggleStatus(item)}>
                      {item.status === 'ACTIVE' ? 'Inativar' : 'Ativar'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
