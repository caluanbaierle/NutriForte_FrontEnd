import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { adminApi } from '@/api/adminApi'
import type { AdminLinkListItem, AdminPatientResponse } from '@/types/admin'
import type { PageResponse } from '@/types/api'
import type { UserResponse } from '@/types/auth'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SelectField } from '@/components/forms/SelectField'
import { Button } from '@/components/forms/Button'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { SuccessAlert } from '@/components/feedback/SuccessAlert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { getErrorMessage } from '@/utils/errors'
import { formatDateTime } from '@/utils/format'

type StatusFilter = 'all' | 'active' | 'inactive'

const PAGE_SIZE = 20

interface Filters {
  status: StatusFilter
  nutritionistUserId: string
  search: string
}

function Person({ name, email, fallbackId }: { name?: string | null; email?: string | null; fallbackId: string }) {
  return (
    <div>
      <div className="font-medium">{name || '—'}</div>
      <div className="text-xs text-charcoal-muted">{email || fallbackId}</div>
    </div>
  )
}

export function AdminLinksPage() {
  const [nutritionists, setNutritionists] = useState<UserResponse[]>([])
  const [patients, setPatients] = useState<AdminPatientResponse[]>([])
  const [nutritionistUserId, setNutritionistUserId] = useState('')
  const [patientUserId, setPatientUserId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [filters, setFilters] = useState<Filters>({ status: 'active', nutritionistUserId: '', search: '' })
  const [searchDraft, setSearchDraft] = useState('')
  const [page, setPage] = useState(0)
  const [links, setLinks] = useState<PageResponse<AdminLinkListItem> | null>(null)
  const [listLoading, setListLoading] = useState(true)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deactivateTarget, setDeactivateTarget] = useState<AdminLinkListItem | null>(null)
  const [deactivating, setDeactivating] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const [n, p] = await Promise.all([adminApi.listNutritionists(), adminApi.listPatients()])
        setNutritionists(n)
        setPatients(p)
      } catch (err) {
        setError(getErrorMessage(err))
      }
    })()
  }, [])

  const loadLinks = useCallback(async () => {
    setListLoading(true)
    try {
      setLinks(
        await adminApi.listLinks({
          active: filters.status === 'all' ? undefined : filters.status === 'active',
          nutritionistUserId: filters.nutritionistUserId || undefined,
          search: filters.search || undefined,
          page,
          size: PAGE_SIZE,
        }),
      )
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar os vínculos.'))
    } finally {
      setListLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    void loadLinks()
  }, [loadLinks])

  function updateFilters(change: Partial<Filters>) {
    setFilters((current) => ({ ...current, ...change }))
    setPage(0)
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await adminApi.createLink({ nutritionistUserId, patientUserId })
      const patient = patients.find((p) => p.userId === patientUserId)
      const nutritionist = nutritionists.find((n) => n.id === nutritionistUserId)
      setSuccess(`Vínculo criado: ${patient?.fullName ?? 'paciente'} → ${nutritionist?.name ?? 'nutricionista'}.`)
      setNutritionistUserId('')
      setPatientUserId('')
      setPage(0)
      await loadLinks()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return
    setDeactivating(true)
    setError('')
    try {
      await adminApi.deleteLink(deactivateTarget.id)
      setSuccess(
        `Vínculo desativado: ${deactivateTarget.patientFullName ?? 'paciente'} → ${deactivateTarget.nutritionistName ?? 'nutricionista'}.`,
      )
      setDeactivateTarget(null)
      await loadLinks()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeactivating(false)
    }
  }

  const totalPages = links?.totalPages ?? 0

  return (
    <div className="nf-page">
      <PageHeader
        title="Vínculos nutricionista–paciente"
        description="Cada paciente pode ter um vínculo ativo por vez. O nutricionista só vê os pacientes com vínculo ativo."
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />

      <form onSubmit={handleCreate} className="nf-card grid gap-4 md:grid-cols-2">
        <h2 className="font-display text-lg text-forest md:col-span-2">Novo vínculo</h2>
        <SelectField
          label="Nutricionista"
          required
          value={nutritionistUserId}
          onChange={(e) => setNutritionistUserId(e.target.value)}
          placeholder="Selecione"
          options={nutritionists.map((n) => ({ value: n.id, label: `${n.name} (${n.email})` }))}
        />
        <SelectField
          label="Paciente"
          required
          value={patientUserId}
          onChange={(e) => setPatientUserId(e.target.value)}
          placeholder="Selecione"
          options={patients.map((p) => ({ value: p.userId, label: `${p.fullName} · CPF ${p.cpf}` }))}
        />
        <div className="md:col-span-2">
          <Button type="submit" disabled={submitting || !nutritionistUserId || !patientUserId}>
            {submitting ? 'Criando...' : 'Criar vínculo'}
          </Button>
        </div>
      </form>

      <div className="nf-card grid gap-4 md:grid-cols-[10rem_1fr_1fr]">
        <SelectField
          label="Situação"
          name="filter-status"
          value={filters.status}
          onChange={(e) => updateFilters({ status: e.target.value as StatusFilter })}
          options={[
            { value: 'active', label: 'Ativos' },
            { value: 'inactive', label: 'Inativos' },
            { value: 'all', label: 'Todos' },
          ]}
        />
        <SelectField
          label="Nutricionista"
          name="filter-nutritionist"
          value={filters.nutritionistUserId}
          onChange={(e) => updateFilters({ nutritionistUserId: e.target.value })}
          options={[{ value: '', label: 'Todos' }, ...nutritionists.map((n) => ({ value: n.id, label: n.name }))]}
        />
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            updateFilters({ search: searchDraft.trim() })
          }}
        >
          <div className="flex-1">
            <label htmlFor="filter-search" className="nf-label">
              Buscar
            </label>
            <input
              id="filter-search"
              className="nf-input"
              placeholder="Nome ou e-mail"
              maxLength={100}
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
      </div>

      {listLoading && !links ? (
        <LoadingState />
      ) : !links || links.content.length === 0 ? (
        <EmptyState
          title="Nenhum vínculo encontrado"
          description={
            filters.search || filters.nutritionistUserId || filters.status !== 'all'
              ? 'Ajuste os filtros ou crie um vínculo acima.'
              : 'Crie o primeiro vínculo acima.'
          }
        />
      ) : (
        <>
          <div className="nf-table-wrap">
            <table className="nf-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Nutricionista</th>
                  <th>Situação</th>
                  <th>Criado em</th>
                  <th>Desativado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {links.content.map((link) => (
                  <tr key={link.id}>
                    <td>
                      <Person name={link.patientFullName} email={link.patientEmail} fallbackId={link.patientUserId} />
                    </td>
                    <td>
                      <Person
                        name={link.nutritionistName}
                        email={link.nutritionistEmail}
                        fallbackId={link.nutritionistUserId}
                      />
                    </td>
                    <td>
                      <StatusBadge
                        status={link.active ? 'ACTIVE' : 'INACTIVE'}
                        label={link.active ? 'Ativo' : 'Inativo'}
                      />
                    </td>
                    <td>{formatDateTime(link.createdAt)}</td>
                    <td>{link.deactivatedAt ? formatDateTime(link.deactivatedAt) : '—'}</td>
                    <td>
                      {link.active ? (
                        <Button variant="danger" onClick={() => setDeactivateTarget(link)}>
                          Desativar
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-charcoal-muted">
            <span>
              {links.totalElements} vínculo{links.totalElements === 1 ? '' : 's'} · página {links.page + 1} de{' '}
              {Math.max(totalPages, 1)}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page === 0 || listLoading} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <Button
                variant="secondary"
                disabled={page + 1 >= totalPages || listLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        title="Desativar vínculo"
        description={
          deactivateTarget
            ? `${deactivateTarget.nutritionistName ?? 'O nutricionista'} deixará de ver ${deactivateTarget.patientFullName ?? 'o paciente'}. O histórico do vínculo é mantido.`
            : ''
        }
        confirmLabel="Desativar"
        danger
        loading={deactivating}
        onConfirm={() => void handleDeactivate()}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  )
}
