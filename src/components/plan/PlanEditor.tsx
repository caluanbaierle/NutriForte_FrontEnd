import { useEffect, useMemo, useState } from 'react'
import { foodApi } from '@/api/foodApi'
import { nutritionistApi } from '@/api/nutritionistApi'
import type { FoodResponse } from '@/types/food'
import { FOOD_PORTION_UNIT_LABELS } from '@/types/food'
import type { AuthoredPlanRequest, NutritionPlanResponse } from '@/types/plan'
import type { MealType } from '@/types/questionnaire'
import { MEAL_TYPE_LABELS } from '@/types/questionnaire'
import { Button } from '@/components/forms/Button'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { LoadingState } from '@/components/feedback/LoadingState'
import { getErrorMessage } from '@/utils/errors'
import { formatNumber } from '@/utils/format'

const MEAL_ORDER: MealType[] = ['BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER', 'LATE_SNACK']

interface DraftSubstitution {
  key: string
  foodId: string
  quantity: string
}

interface DraftItem {
  key: string
  foodId: string
  quantity: string
  substitutions: DraftSubstitution[]
}

interface DraftMeal {
  mealType: MealType
  items: DraftItem[]
}

let keySeq = 0
const newKey = () => `k${++keySeq}`

function fromPlan(plan: NutritionPlanResponse | null): DraftMeal[] {
  if (!plan) return []
  return plan.meals.map((meal) => ({
    mealType: meal.mealType,
    items: meal.items.map((item) => ({
      key: newKey(),
      foodId: item.foodId,
      quantity: String(item.quantity),
      substitutions: (item.substitutions ?? []).map((sub) => ({
        key: newKey(),
        foodId: sub.foodId,
        quantity: String(sub.quantity),
      })),
    })),
  }))
}

async function loadAllActiveFoods(): Promise<FoodResponse[]> {
  const all: FoodResponse[] = []
  for (let page = 0; page < 50; page++) {
    const result = await foodApi.list({ status: 'ACTIVE', page, size: 100 })
    all.push(...result.content)
    if (page + 1 >= result.totalPages) break
  }
  return all
}

function parseQuantity(value: string): number | null {
  const n = Number(value.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : null
}

interface PlanEditorProps {
  patientId: string
  basePlan: NutritionPlanResponse | null
  onPublished: (plan: NutritionPlanResponse) => void
  onCancel: () => void
}

/**
 * Editor do plano alimentar. O nutricionista escolhe alimentos do catálogo, quantidades e substituições.
 * A unidade é sempre a da porção cadastrada do alimento. Calorias e macros são calculados pelo backend.
 */
export function PlanEditor({ patientId, basePlan, onPublished, onCancel }: PlanEditorProps) {
  const [foods, setFoods] = useState<FoodResponse[]>([])
  const [loadingFoods, setLoadingFoods] = useState(true)
  const [meals, setMeals] = useState<DraftMeal[]>(() => fromPlan(basePlan))
  const [notes, setNotes] = useState(basePlan?.notes ?? '')
  const [newMealType, setNewMealType] = useState<MealType | ''>('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        setFoods(await loadAllActiveFoods())
      } catch (err) {
        setError(getErrorMessage(err, 'Não foi possível carregar o catálogo de alimentos.'))
      } finally {
        setLoadingFoods(false)
      }
    })()
  }, [])

  const foodById = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods])
  const foodOptions = useMemo(
    () => [...foods].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [foods],
  )
  const availableMealTypes = MEAL_ORDER.filter((type) => !meals.some((m) => m.mealType === type))

  function updateMeal(mealType: MealType, change: (meal: DraftMeal) => DraftMeal) {
    setMeals((current) => current.map((m) => (m.mealType === mealType ? change(m) : m)))
  }

  function updateItem(mealType: MealType, key: string, change: (item: DraftItem) => DraftItem) {
    updateMeal(mealType, (meal) => ({ ...meal, items: meal.items.map((i) => (i.key === key ? change(i) : i)) }))
  }

  function addMeal() {
    if (!newMealType) return
    setMeals((current) =>
      [...current, { mealType: newMealType, items: [{ key: newKey(), foodId: '', quantity: '', substitutions: [] }] }].sort(
        (a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType),
      ),
    )
    setNewMealType('')
  }

  function validate(): string | null {
    if (meals.length === 0) return 'Adicione pelo menos uma refeição.'
    for (const meal of meals) {
      const label = MEAL_TYPE_LABELS[meal.mealType]
      if (meal.items.length === 0) return `${label}: adicione pelo menos um alimento.`
      for (const item of meal.items) {
        if (!item.foodId) return `${label}: selecione o alimento de todos os itens.`
        if (parseQuantity(item.quantity) == null) return `${label}: informe quantidades maiores que zero.`
        for (const sub of item.substitutions) {
          if (!sub.foodId || parseQuantity(sub.quantity) == null) {
            return `${label}: complete alimento e quantidade de todas as substituições.`
          }
          if (sub.foodId === item.foodId) return `${label}: um alimento não pode substituir ele mesmo.`
        }
      }
    }
    return null
  }

  async function publish() {
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    const payload: AuthoredPlanRequest = {
      notes: notes.trim() || undefined,
      meals: meals.map((meal) => ({
        mealType: meal.mealType,
        items: meal.items.map((item) => ({
          foodId: item.foodId,
          quantity: parseQuantity(item.quantity) as number,
          unit: foodById.get(item.foodId)!.portionUnit,
          substitutions: item.substitutions.map((sub) => ({
            foodId: sub.foodId,
            quantity: parseQuantity(sub.quantity) as number,
            unit: foodById.get(sub.foodId)!.portionUnit,
          })),
        })),
      })),
    }
    setSaving(true)
    setError('')
    try {
      onPublished(await nutritionistApi.publishNutritionPlan(patientId, payload))
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível publicar o plano.'))
    } finally {
      setSaving(false)
    }
  }

  if (loadingFoods) return <LoadingState />

  const portionHint = (foodId: string) => {
    const food = foodById.get(foodId)
    if (!food) return null
    return `Porção cadastrada: ${formatNumber(food.portionQuantity, 3)} ${FOOD_PORTION_UNIT_LABELS[food.portionUnit]} = ${formatNumber(food.caloriesKcal, 0)} kcal`
  }

  const foodSelect = (value: string, onChange: (id: string) => void, label: string) => (
    <select className="nf-input" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      <option value="">Selecione o alimento</option>
      {foodOptions.map((food) => (
        <option key={food.id} value={food.id}>
          {food.name} ({FOOD_PORTION_UNIT_LABELS[food.portionUnit]})
        </option>
      ))}
    </select>
  )

  return (
    <div className="space-y-4">
      <div className="nf-card text-sm text-charcoal-muted">
        Monte o plano com alimentos <strong>ativos</strong> do catálogo. A quantidade usa a mesma unidade da porção
        cadastrada do alimento (não há conversão de unidades). Calorias e macros são calculados pelo sistema a partir
        do cadastro. Publicar cria uma nova versão e arquiva a anterior.
      </div>
      {foods.length === 0 ? (
        <ErrorAlert message="O catálogo não tem alimentos ativos. Peça ao administrador para cadastrar os alimentos com dados oficiais." />
      ) : null}
      <ErrorAlert message={error} onClose={() => setError('')} />

      {meals.map((meal) => (
        <div key={meal.mealType} className="nf-card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg text-forest">{MEAL_TYPE_LABELS[meal.mealType]}</h3>
            <button
              type="button"
              className="text-sm text-[var(--color-danger)] hover:underline"
              onClick={() => setMeals((current) => current.filter((m) => m.mealType !== meal.mealType))}
            >
              Remover refeição
            </button>
          </div>
          {meal.items.map((item, index) => (
            <div key={item.key} className="space-y-2 rounded-[var(--radius-md)] border border-sage-muted/40 p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_9rem_auto]">
                {foodSelect(
                  item.foodId,
                  (id) => updateItem(meal.mealType, item.key, (i) => ({ ...i, foodId: id })),
                  `Alimento ${index + 1} de ${MEAL_TYPE_LABELS[meal.mealType]}`,
                )}
                <input
                  className="nf-input"
                  inputMode="decimal"
                  placeholder="Quantidade"
                  aria-label="Quantidade"
                  value={item.quantity}
                  onChange={(e) => updateItem(meal.mealType, item.key, (i) => ({ ...i, quantity: e.target.value }))}
                />
                <button
                  type="button"
                  className="nf-btn-secondary"
                  onClick={() =>
                    updateMeal(meal.mealType, (m) => ({ ...m, items: m.items.filter((i) => i.key !== item.key) }))
                  }
                >
                  Remover
                </button>
              </div>
              {portionHint(item.foodId) ? <p className="text-xs text-charcoal-muted">{portionHint(item.foodId)}</p> : null}

              {item.substitutions.map((sub) => (
                <div key={sub.key} className="ml-4 grid gap-2 sm:grid-cols-[1fr_9rem_auto]">
                  {foodSelect(
                    sub.foodId,
                    (id) =>
                      updateItem(meal.mealType, item.key, (i) => ({
                        ...i,
                        substitutions: i.substitutions.map((s) => (s.key === sub.key ? { ...s, foodId: id } : s)),
                      })),
                    'Alimento substituto',
                  )}
                  <input
                    className="nf-input"
                    inputMode="decimal"
                    placeholder="Quantidade"
                    aria-label="Quantidade do substituto"
                    value={sub.quantity}
                    onChange={(e) =>
                      updateItem(meal.mealType, item.key, (i) => ({
                        ...i,
                        substitutions: i.substitutions.map((s) =>
                          s.key === sub.key ? { ...s, quantity: e.target.value } : s,
                        ),
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="nf-btn-secondary"
                    onClick={() =>
                      updateItem(meal.mealType, item.key, (i) => ({
                        ...i,
                        substitutions: i.substitutions.filter((s) => s.key !== sub.key),
                      }))
                    }
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="ml-4 text-sm font-medium text-forest hover:underline"
                onClick={() =>
                  updateItem(meal.mealType, item.key, (i) => ({
                    ...i,
                    substitutions: [...i.substitutions, { key: newKey(), foodId: '', quantity: '' }],
                  }))
                }
              >
                + Autorizar substituição
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm font-medium text-forest hover:underline"
            onClick={() =>
              updateMeal(meal.mealType, (m) => ({
                ...m,
                items: [...m.items, { key: newKey(), foodId: '', quantity: '', substitutions: [] }],
              }))
            }
          >
            + Adicionar alimento
          </button>
        </div>
      ))}

      {availableMealTypes.length > 0 ? (
        <div className="nf-card flex flex-wrap items-end gap-2">
          <div className="min-w-[12rem] flex-1">
            <label htmlFor="new-meal" className="nf-label">
              Adicionar refeição
            </label>
            <select
              id="new-meal"
              className="nf-input"
              value={newMealType}
              onChange={(e) => setNewMealType(e.target.value as MealType | '')}
            >
              <option value="">Selecione</option>
              {availableMealTypes.map((type) => (
                <option key={type} value={type}>
                  {MEAL_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="secondary" onClick={addMeal} disabled={!newMealType}>
            Adicionar
          </Button>
        </div>
      ) : null}

      <div className="nf-card">
        <label htmlFor="plan-notes" className="nf-label">
          Orientações ao paciente (opcional)
        </label>
        <textarea
          id="plan-notes"
          className="nf-input min-h-[6rem]"
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <p className="mt-1 text-xs text-charcoal-muted">{notes.length}/2000</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void publish()} disabled={saving || foods.length === 0}>
          {saving ? 'Publicando...' : 'Publicar nova versão'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
