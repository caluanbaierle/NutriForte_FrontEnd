import { useEffect, useState, type FormEvent } from 'react'
import { adminApi } from '@/api/adminApi'
import type { AuditAction, AuditLogResponse, AuditResourceType, AuditResult } from '@/types/audit'
import {
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_LABELS,
  AUDIT_RESULT_LABELS,
} from '@/types/audit'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SelectField } from '@/components/forms/SelectField'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/forms/Button'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { getErrorMessage } from '@/utils/errors'
import { formatDateTime } from '@/utils/format'

const ACTIONS = Object.keys(AUDIT_ACTION_LABELS) as AuditAction[]
const RESOURCES = Object.keys(AUDIT_RESOURCE_LABELS) as AuditResourceType[]
const RESULTS = Object.keys(AUDIT_RESULT_LABELS) as AuditResult[]

export function AdminAuditPage() {
  const [items, setItems] = useState<AuditLogResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [action, setAction] = useState<AuditAction | ''>('')
  const [resourceType, setResourceType] = useState<AuditResourceType | ''>('')
  const [result, setResult] = useState<AuditResult | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selected, setSelected] = useState<AuditLogResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load(nextPage = page) {
    setLoading(true)
    setError('')
    try {
      const data = await adminApi.listAuditLogs({
        action: action || undefined,
        resourceType: resourceType || undefined,
        result: result || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        page: nextPage,
        size: 20,
      })
      setItems(data.content)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFilter(e: FormEvent) {
    e.preventDefault()
    void load(0)
  }

  async function openDetail(id: string) {
    setError('')
    try {
      setSelected(await adminApi.getAuditLog(id))
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <div className="nf-page nf-page-wide">
      <PageHeader
        title="Auditoria"
        description="Eventos administrativos reais da API. Autor e horário vêm do backend."
      />
      <ErrorAlert message={error} onClose={() => setError('')} />

      <form className="nf-card mb-6 grid gap-3 md:grid-cols-3 lg:grid-cols-6" onSubmit={handleFilter}>
        <SelectField
          label="Ação"
          value={action}
          onChange={(e) => setAction(e.target.value as AuditAction | '')}
          options={[
            { value: '', label: 'Todas' },
            ...ACTIONS.map((a) => ({ value: a, label: AUDIT_ACTION_LABELS[a] })),
          ]}
        />
        <SelectField
          label="Recurso"
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value as AuditResourceType | '')}
          options={[
            { value: '', label: 'Todos' },
            ...RESOURCES.map((r) => ({ value: r, label: AUDIT_RESOURCE_LABELS[r] })),
          ]}
        />
        <SelectField
          label="Resultado"
          value={result}
          onChange={(e) => setResult(e.target.value as AuditResult | '')}
          options={[
            { value: '', label: 'Todos' },
            ...RESULTS.map((r) => ({ value: r, label: AUDIT_RESULT_LABELS[r] })),
          ]}
        />
        <TextField
          label="Data inicial"
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          label="Data final"
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <div className="flex items-end">
          <Button type="submit">Filtrar</Button>
        </div>
      </form>

      {selected ? (
        <div className="nf-card mb-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-xl text-forest">Detalhe do evento</h2>
            <Button type="button" variant="secondary" onClick={() => setSelected(null)}>
              Fechar
            </Button>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-charcoal-muted">Ação</dt>
              <dd className="font-medium">{AUDIT_ACTION_LABELS[selected.action]} ({selected.action})</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-charcoal-muted">Recurso</dt>
              <dd className="font-medium">
                {AUDIT_RESOURCE_LABELS[selected.resourceType]} ({selected.resourceType})
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-charcoal-muted">ID do recurso</dt>
              <dd className="font-mono text-sm">{selected.resourceId ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-charcoal-muted">Resultado</dt>
              <dd>
                <StatusBadge
                  status={selected.result}
                  label={AUDIT_RESULT_LABELS[selected.result]}
                  tone={selected.result === 'SUCCESS' ? 'success' : 'danger'}
                />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-charcoal-muted">Usuário responsável</dt>
              <dd className="font-medium">
                {selected.actorName ?? '—'}
                {selected.actorEmail ? ` (${selected.actorEmail})` : ''}
              </dd>
              <dd className="font-mono text-xs text-charcoal-muted">{selected.actorUserId}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-charcoal-muted">Data/hora</dt>
              <dd className="font-medium">{formatDateTime(selected.createdAt)}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum evento" description="Não há registros de auditoria para os filtros." />
      ) : (
        <>
          <div className="nf-table-wrap">
            <table className="nf-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>Recurso</th>
                  <th>Resultado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td>
                      <div>{item.actorName ?? item.actorUserId}</div>
                      {item.actorEmail ? (
                        <div className="text-xs text-charcoal-muted">{item.actorEmail}</div>
                      ) : null}
                    </td>
                    <td>{item.action}</td>
                    <td>
                      <div>{item.resourceType}</div>
                      <div className="font-mono text-xs text-charcoal-muted">
                        {item.resourceId ?? '—'}
                      </div>
                    </td>
                    <td>
                      <StatusBadge
                        status={item.result}
                        label={AUDIT_RESULT_LABELS[item.result]}
                        tone={item.result === 'SUCCESS' ? 'success' : 'danger'}
                      />
                    </td>
                    <td>
                      <Button type="button" variant="secondary" onClick={() => void openDetail(item.id)}>
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button type="button" variant="secondary" disabled={page <= 0} onClick={() => void load(page - 1)}>
              Anterior
            </Button>
            <span className="text-sm text-charcoal-muted">
              Página {page + 1} de {Math.max(totalPages, 1)}
            </span>
            <Button
              type="button"
              variant="secondary"
              disabled={page + 1 >= totalPages}
              onClick={() => void load(page + 1)}
            >
              Próxima
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
