import type { NutrientTotals, NutritionPlanResponse } from '@/types/plan'
import { NUTRITION_PLAN_STATUS_LABELS } from '@/types/plan'
import { MEAL_TYPE_LABELS } from '@/types/questionnaire'
import { FOOD_PORTION_UNIT_LABELS } from '@/types/food'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDateTime, formatNumber } from '@/utils/format'

function Totals({ totals, label }: { totals: NutrientTotals | null; label: string }) {
  if (!totals) return null
  return (
    <p className="text-sm text-charcoal-muted">
      {label}: <strong className="text-charcoal">{formatNumber(totals.caloriesKcal, 0)} kcal</strong> · P{' '}
      {formatNumber(totals.proteinG)} g · C {formatNumber(totals.carbohydrateG)} g · G {formatNumber(totals.fatG)} g
    </p>
  )
}

/** Exibe o plano exatamente como gravado: alimentos, quantidades, substituições e orientações do nutricionista. */
export function PlanView({ plan }: { plan: NutritionPlanResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status={plan.status} label={NUTRITION_PLAN_STATUS_LABELS[plan.status]} />
        <span className="text-sm text-charcoal-muted">
          Versão {plan.version} · {formatDateTime(plan.createdAt)}
        </span>
      </div>
      <Totals totals={plan.totals} label="Total do dia (itens prescritos)" />
      {plan.notes ? (
        <div className="nf-card">
          <h3 className="font-display text-lg text-forest">Orientações do nutricionista</h3>
          <p className="mt-2 whitespace-pre-line text-sm">{plan.notes}</p>
        </div>
      ) : null}
      {plan.meals.map((meal) => (
        <div key={meal.mealType} className="nf-card">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg text-forest">{MEAL_TYPE_LABELS[meal.mealType]}</h3>
            <Totals totals={meal.totals} label="Refeição" />
          </div>
          <ul className="mt-3 divide-y divide-sage-muted/30">
            {meal.items.map((item) => (
              <li key={item.id ?? `${item.foodId}-${item.foodName}`} className="py-2 text-sm">
                <div className="font-medium">{item.foodName}</div>
                <div className="text-charcoal-muted">
                  {formatNumber(item.quantity, 3)} {FOOD_PORTION_UNIT_LABELS[item.unit]} ·{' '}
                  {formatNumber(item.caloriesKcal, 0)} kcal · P {formatNumber(item.proteinG)} g · C{' '}
                  {formatNumber(item.carbohydrateG)} g · G {formatNumber(item.fatG)} g
                </div>
                {item.substitutions?.length ? (
                  <div className="mt-1 rounded-[var(--radius-md)] bg-sage-muted/15 px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-forest">
                      Substituições autorizadas
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {item.substitutions.map((sub) => (
                        <li key={sub.foodId} className="text-charcoal-muted">
                          {sub.foodName} — {formatNumber(sub.quantity, 3)} {FOOD_PORTION_UNIT_LABELS[sub.unit]} (
                          {formatNumber(sub.caloriesKcal, 0)} kcal)
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
