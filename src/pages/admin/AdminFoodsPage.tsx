import { useEffect, useState, type FormEvent } from 'react'
import { foodApi } from '@/api/foodApi'
import type { FoodCategory, FoodPortionUnit, FoodRequest, FoodResponse, FoodStatus } from '@/types/food'
import {
  FOOD_CATEGORY_LABELS,
  FOOD_PORTION_UNIT_LABELS,
} from '@/types/food'
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
import { formatNumber } from '@/utils/format'

const emptyForm: FoodRequest = {
  name: '',
  category: 'PROTEINS',
  portionQuantity: 100,
  portionUnit: 'GRAM',
  caloriesKcal: 0,
  proteinG: 0,
  carbohydrateG: 0,
  fatG: 0,
  fiberG: 0,
}

export function AdminFoodsPage() {
  const [items, setItems] = useState<FoodResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [nameFilter, setNameFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | ''>('')
  const [statusFilter, setStatusFilter] = useState<FoodStatus | ''>('')
  const [form, setForm] = useState<FoodRequest>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load(nextPage = page) {
    setLoading(true)
    setError('')
    try {
      const data = await foodApi.list({
        name: nameFilter || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      if (editingId) {
        await foodApi.update(editingId, form)
        setSuccess('Alimento atualizado.')
      } else {
        await foodApi.create(form)
        setSuccess('Alimento cadastrado.')
      }
      setForm(emptyForm)
      setEditingId(null)
      await load(0)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleStatus(item: FoodResponse) {
    setError('')
    try {
      await foodApi.changeStatus(item.id, item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
      setSuccess('Status atualizado.')
      await load(page)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  function startEdit(item: FoodResponse) {
    setEditingId(item.id)
    setForm({
      name: item.name,
      category: item.category,
      portionQuantity: item.portionQuantity,
      portionUnit: item.portionUnit,
      caloriesKcal: item.caloriesKcal,
      proteinG: item.proteinG,
      carbohydrateG: item.carbohydrateG,
      fatG: item.fatG,
      fiberG: item.fiberG,
    })
  }

  return (
    <div className="nf-page">
      <PageHeader title="Alimentos" description="Catálogo administrativo. Valores nutricionais vêm do backend." />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />

      <div className="nf-card grid gap-3 md:grid-cols-4">
        <TextField label="Buscar nome" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
        <SelectField
          label="Categoria"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as FoodCategory | '')}
          options={[
            { value: '', label: 'Todas' },
            ...Object.entries(FOOD_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
          ]}
        />
        <SelectField
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FoodStatus | '')}
          options={[
            { value: '', label: 'Todos' },
            { value: 'ACTIVE', label: 'Ativo' },
            { value: 'INACTIVE', label: 'Inativo' },
          ]}
        />
        <div className="flex items-end">
          <Button type="button" onClick={() => void load(0)}>
            Filtrar
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="nf-card grid gap-3 md:grid-cols-3">
        <h2 className="font-display text-xl text-forest md:col-span-3">
          {editingId ? 'Editar alimento' : 'Novo alimento'}
        </h2>
        <TextField
          label="Nome"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <SelectField
          label="Categoria"
          required
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as FoodCategory }))}
          options={Object.entries(FOOD_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <SelectField
          label="Unidade da porção"
          required
          value={form.portionUnit}
          onChange={(e) => setForm((f) => ({ ...f, portionUnit: e.target.value as FoodPortionUnit }))}
          options={Object.entries(FOOD_PORTION_UNIT_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <TextField
          label="Qtd. porção"
          type="number"
          step="any"
          required
          value={form.portionQuantity}
          onChange={(e) => setForm((f) => ({ ...f, portionQuantity: Number(e.target.value) }))}
        />
        <TextField
          label="Calorias (kcal)"
          type="number"
          step="any"
          required
          value={form.caloriesKcal}
          onChange={(e) => setForm((f) => ({ ...f, caloriesKcal: Number(e.target.value) }))}
        />
        <TextField
          label="Proteína (g)"
          type="number"
          step="any"
          required
          value={form.proteinG}
          onChange={(e) => setForm((f) => ({ ...f, proteinG: Number(e.target.value) }))}
        />
        <TextField
          label="Carboidrato (g)"
          type="number"
          step="any"
          required
          value={form.carbohydrateG}
          onChange={(e) => setForm((f) => ({ ...f, carbohydrateG: Number(e.target.value) }))}
        />
        <TextField
          label="Gordura (g)"
          type="number"
          step="any"
          required
          value={form.fatG}
          onChange={(e) => setForm((f) => ({ ...f, fatG: Number(e.target.value) }))}
        />
        <TextField
          label="Fibra (g)"
          type="number"
          step="any"
          required
          value={form.fiberG}
          onChange={(e) => setForm((f) => ({ ...f, fiberG: Number(e.target.value) }))}
        />
        <div className="flex gap-2 md:col-span-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Cadastrar'}
          </Button>
          {editingId ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingId(null)
                setForm(emptyForm)
              }}
            >
              Cancelar edição
            </Button>
          ) : null}
        </div>
      </form>

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum alimento encontrado" />
      ) : (
        <>
          <div className="nf-table-wrap">
            <table className="nf-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Porção</th>
                  <th>kcal</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{FOOD_CATEGORY_LABELS[item.category]}</td>
                    <td>
                      {formatNumber(item.portionQuantity)} {FOOD_PORTION_UNIT_LABELS[item.portionUnit]}
                    </td>
                    <td>{formatNumber(item.caloriesKcal, 0)}</td>
                    <td>
                      <StatusBadge
                        status={item.status}
                        label={item.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      />
                    </td>
                    <td className="space-x-2">
                      <Button variant="ghost" onClick={() => startEdit(item)}>
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-charcoal-muted">
              Página {page + 1} de {Math.max(totalPages, 1)}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 0} onClick={() => void load(page - 1)}>
                Anterior
              </Button>
              <Button
                variant="secondary"
                disabled={page + 1 >= totalPages}
                onClick={() => void load(page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
