import { useEffect, useState, type FormEvent } from 'react'
import { checkinApi } from '@/api/checkinApi'
import type { CheckinResponse } from '@/types/checkin'
import { PageHeader } from '@/components/common/PageHeader'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/forms/Button'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { SuccessAlert } from '@/components/feedback/SuccessAlert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { getErrorMessage } from '@/utils/errors'
import { formatDateTime, formatNumber } from '@/utils/format'

export function PatientCheckinsPage() {
  const [items, setItems] = useState<CheckinResponse[]>([])
  const [weightKg, setWeightKg] = useState(70)
  const [waistCm, setWaistCm] = useState<number | ''>('')
  const [dietAdherencePercent, setDietAdherencePercent] = useState(80)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const page = await checkinApi.list({ page: 0, size: 50 })
      setItems(page.content)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await checkinApi.create({
        weightKg,
        waistCm: waistCm === '' ? null : Number(waistCm),
        dietAdherencePercent,
      })
      setSuccess('Check-in registrado.')
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="nf-page">
      <PageHeader title="Check-ins" description="Registre peso, cintura e adesão à dieta." />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />

      <form onSubmit={handleSubmit} className="nf-card grid gap-3 md:grid-cols-3">
        <TextField
          label="Peso (kg)"
          type="number"
          step="any"
          required
          value={weightKg}
          onChange={(e) => setWeightKg(Number(e.target.value))}
        />
        <TextField
          label="Cintura (cm, opcional)"
          type="number"
          step="any"
          value={waistCm}
          onChange={(e) => setWaistCm(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <TextField
          label="Adesão à dieta (%)"
          type="number"
          min={0}
          max={100}
          required
          value={dietAdherencePercent}
          onChange={(e) => setDietAdherencePercent(Number(e.target.value))}
        />
        <div className="md:col-span-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Registrar check-in'}
          </Button>
        </div>
      </form>

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum check-in ainda" />
      ) : (
        <div className="nf-table-wrap">
          <table className="nf-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Peso</th>
                <th>Cintura</th>
                <th>Adesão</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td>{formatNumber(item.weightKg)} kg</td>
                  <td>{item.waistCm != null ? `${formatNumber(item.waistCm)} cm` : '—'}</td>
                  <td>{formatNumber(item.dietAdherencePercent, 0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
