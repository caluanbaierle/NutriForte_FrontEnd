import type { ReactNode } from 'react'
import type { NutritionCalculationResult } from '@/types/nutrition'
import type { QuestionnaireResponse } from '@/types/questionnaire'
import {
  ACTIVITY_LEVEL_LABELS,
  GOAL_LABELS,
  MEAL_TYPE_LABELS,
} from '@/types/questionnaire'
import type { Sex } from '@/types/patient'
import { SEX_LABELS } from '@/types/patient'
import { AssessmentMetricCard, DataOriginBadge } from './DataOriginBadge'
import { asDisplayPercent, CLINIC_PENDING_TOPICS, pendingRuleLabel } from '@/utils/nutritionPending'
import { formatDateTime, formatNumber } from '@/utils/format'

export interface AssessmentPatientInfo {
  fullName: string
  sex: Sex
  birthDate: string
}

interface NutritionalAssessmentViewProps {
  patient: AssessmentPatientInfo
  questionnaire: QuestionnaireResponse | null
  calculation: NutritionCalculationResult | null
  /** Quando presente, o cálculo não pôde ser obtido (ex.: falha de API). */
  calculationUnavailableReason?: string | null
  showInternalPendingPanel?: boolean
  /** Controle para o nutricionista escolher o kcal/kg (só na visão do nutricionista). */
  kcalPerKgControl?: ReactNode
}

function displayOrDash(value: string | number | null | undefined, suffix = ''): string {
  if (value == null || value === '') return '—'
  return `${value}${suffix}`
}

export function NutritionalAssessmentView({
  patient,
  questionnaire,
  calculation,
  calculationUnavailableReason,
  showInternalPendingPanel = true,
  kcalPerKgControl,
}: NutritionalAssessmentViewProps) {
  const macros = calculation?.identifiedMacroDistribution
  const target = calculation?.energyTarget ?? null
  const mealTargets = new Map((target?.meals ?? []).map((m) => [m.meal, m]))
  const meals = calculation?.identifiedMealCaloriePercents ?? []
  const range = calculation?.calorieRange
  const pendingFromEngine = calculation?.pendingRules ?? []

  return (
    <div className="space-y-6">
      {calculationUnavailableReason ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-warning)]">
          {calculationUnavailableReason}
        </div>
      ) : null}

      {calculation && !calculation.complete ? (
        <div className="rounded-[var(--radius-md)] border border-sage-muted/50 bg-cream px-4 py-3 text-sm text-charcoal-muted">
          Resultado parcial do motor ({calculation.ruleSource ?? 'regras da Clínica'}). O campo{' '}
          <code className="text-xs">complete=false</code> indica pendências oficiais.
        </div>
      ) : null}

      <section className="nf-card">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl text-forest">Dados do paciente</h2>
          <DataOriginBadge origin="backend" />
        </header>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs uppercase text-charcoal-muted">Nome</dt>
            <dd className="font-medium">{patient.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-charcoal-muted">Sexo</dt>
            <dd className="font-medium">{SEX_LABELS[patient.sex]}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-charcoal-muted">Nascimento</dt>
            <dd className="font-medium">{patient.birthDate}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-charcoal-muted">Peso atual</dt>
            <dd className="font-medium">
              {questionnaire ? `${formatNumber(questionnaire.currentWeightKg)} kg` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-charcoal-muted">Altura</dt>
            <dd className="font-medium">
              {questionnaire ? `${formatNumber(questionnaire.heightCm)} cm` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-charcoal-muted">Objetivo</dt>
            <dd className="font-medium">
              {questionnaire ? GOAL_LABELS[questionnaire.goal] : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-charcoal-muted">Atividade</dt>
            <dd className="font-medium">
              {questionnaire ? ACTIVITY_LEVEL_LABELS[questionnaire.activityLevel] : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-charcoal-muted">Peso desejado</dt>
            <dd className="font-medium">
              {questionnaire ? `${formatNumber(questionnaire.desiredWeightKg)} kg` : '—'}
            </dd>
          </div>
        </dl>
        {!questionnaire ? (
          <p className="mt-4 text-sm text-charcoal-muted">Questionário não disponível para este paciente.</p>
        ) : null}
      </section>

      <section>
        <h2 className="mb-3 font-display text-2xl text-forest">Necessidades energéticas</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <AssessmentMetricCard
            label="TMB / BMR"
            value={
              calculation?.bmrKcal != null
                ? `${formatNumber(calculation.bmrKcal)} kcal`
                : 'Regra ainda não disponível'
            }
            origin={calculation?.bmrKcal != null ? 'backend' : 'unavailable'}
            hint="Retornado pelo endpoint de cálculo nutricional do backend"
          />
          <AssessmentMetricCard
            label="Fator de atividade"
            value={
              calculation?.activityFactor != null
                ? formatNumber(calculation.activityFactor, 3)
                : '—'
            }
            origin={calculation?.activityFactor != null ? 'backend' : 'unavailable'}
          />
          <AssessmentMetricCard
            label="GET"
            value={
              calculation?.tdeeKcal != null
                ? `${formatNumber(calculation.tdeeKcal)} kcal`
                : 'Regra ainda não disponível'
            }
            origin={calculation?.tdeeKcal != null ? 'backend' : 'unavailable'}
            hint="TMB × fator de atividade (planilha, A33–A37)"
          />
          <AssessmentMetricCard
            label="Calorias da dieta"
            value={target ? `${formatNumber(target.totalKcal)} kcal` : 'Aguardando kcal/kg do nutricionista'}
            origin={target ? 'backend' : 'pending'}
            hint={
              target
                ? `Peso × ${formatNumber(target.kcalPerKg, 2)} kcal/kg${
                    calculation?.energyTargetDefinedAt
                      ? ` · definido pelo nutricionista em ${formatDateTime(calculation.energyTargetDefinedAt)}`
                      : ' · pré-visualização (não salvo)'
                  }`
                : 'Peso × kcal/kg escolhido na faixa do objetivo'
            }
          />
          <AssessmentMetricCard
            label="IMC"
            value={calculation?.bmi != null ? `${formatNumber(calculation.bmi, 2)} kg/m²` : '—'}
            origin={calculation?.bmi != null ? 'backend' : 'unavailable'}
            hint="Peso ÷ altura (m)². Sem classificação."
          />
        </div>
      </section>

      <section className="nf-card">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl text-forest">Objetivo / estratégia (kcal/kg)</h2>
            <p className="mt-1 text-sm text-charcoal-muted">
              Faixas definidas pela Clínica. O valor dentro da faixa é escolhido pelo nutricionista.
            </p>
          </div>
          <DataOriginBadge origin={range ? 'backend' : 'unavailable'} />
        </header>
        {range ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[var(--radius-md)] bg-cream px-4 py-3">
              <p className="text-xs uppercase text-charcoal-muted">Categoria (Clínica)</p>
              <p className="mt-1 font-semibold text-forest">{range.clinicGoal}</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-cream px-4 py-3">
              <p className="text-xs uppercase text-charcoal-muted">Faixa mínima</p>
              <p className="mt-1 font-semibold">{formatNumber(range.minKcalPerKg)} kcal/kg</p>
            </div>
            <div className="rounded-[var(--radius-md)] bg-cream px-4 py-3">
              <p className="text-xs uppercase text-charcoal-muted">Faixa máxima</p>
              <p className="mt-1 font-semibold">{formatNumber(range.maxKcalPerKg)} kcal/kg</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-charcoal-muted">
            Faixa não retornada (objetivo sem mapeamento ou cálculo indisponível).
          </p>
        )}
        <p className="mt-3 text-sm text-charcoal-muted">
          Emagrecimento 18–25 · Manutenção 25–30 · Hipertrofia 30–35 — limites documentados;{' '}
          <strong>o sistema não escolhe o ponto sozinho</strong>.
        </p>
        {kcalPerKgControl ? <div className="mt-4">{kcalPerKgControl}</div> : null}
      </section>

      <section>
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl text-forest">Macronutrientes</h2>
            <p className="text-sm text-charcoal-muted">
              Distribuição 30/30/40 com 4/9/4 kcal/g. kcal, gramas e g/kg aparecem quando o nutricionista define o
              kcal/kg.
            </p>
          </div>
          <DataOriginBadge origin={macros ? 'backend' : 'unavailable'} />
        </header>
        <div className="nf-table-wrap">
          <table className="nf-table">
            <thead>
              <tr>
                <th>Nutriente</th>
                <th>%</th>
                <th>kcal</th>
                <th>kcal/g</th>
                <th>gramas</th>
                <th>g/kg</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: 'Proteína',
                  percent: macros?.proteinPercent,
                  kcalPerG: macros?.proteinKcalPerGram,
                  kcal: target?.macros.proteinKcal,
                  grams: target?.macros.proteinGrams,
                  perKg: target?.proteinGramsPerKg,
                },
                {
                  name: 'Lipídios',
                  percent: macros?.fatPercent,
                  kcalPerG: macros?.fatKcalPerGram,
                  kcal: target?.macros.fatKcal,
                  grams: target?.macros.fatGrams,
                  perKg: target?.fatGramsPerKg,
                },
                {
                  name: 'Carboidratos',
                  percent: macros?.carbohydratePercent,
                  kcalPerG: macros?.carbohydrateKcalPerGram,
                  kcal: target?.macros.carbohydrateKcal,
                  grams: target?.macros.carbohydrateGrams,
                  perKg: target?.carbohydrateGramsPerKg,
                },
              ].map((row) => (
                <tr key={row.name}>
                  <td className="font-medium">{row.name}</td>
                  <td>{asDisplayPercent(row.percent) ?? '—'}</td>
                  <td>{row.kcal != null ? formatNumber(row.kcal, 2) : <span className="text-charcoal-muted">—</span>}</td>
                  <td>{row.kcalPerG != null ? formatNumber(row.kcalPerG) : '—'}</td>
                  <td>{row.grams != null ? `${formatNumber(row.grams, 2)} g` : <span className="text-charcoal-muted">—</span>}</td>
                  <td>{row.perKg != null ? formatNumber(row.perKg, 2) : <span className="text-charcoal-muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="nf-card">
          <header className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-2xl text-forest">Hidratação</h2>
            <DataOriginBadge origin={calculation?.waterMl != null ? 'backend' : 'unavailable'} />
          </header>
          <p className="font-display text-4xl text-forest">
            {calculation?.waterMl != null
              ? `${formatNumber(calculation.waterMl, 0)} ml/dia`
              : 'Regra ainda não disponível'}
          </p>
          <p className="mt-2 text-xs text-charcoal-muted">
            Valor somente se retornado pela API. O frontend não recalcula.
          </p>
        </article>

        <article className="nf-card">
          <header className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-display text-2xl text-forest">Avaliações complementares</h2>
            <DataOriginBadge origin="backend" />
          </header>
          <ul className="space-y-2 text-sm text-charcoal-muted">
            <li>VO₂ / Rockport e Castelli I/II — registrados na aba de avaliações / em “Exames e testes”.</li>
            <li>Perda de peso (7700 × kg ÷ dias) e mesociclos — calculadoras na aba de avaliações do nutricionista.</li>
          </ul>
        </article>
      </section>

      <section>
        <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl text-forest">Distribuição das refeições</h2>
            <p className="text-sm text-charcoal-muted">
              Percentuais da planilha. Metas por refeição = valores do dia × percentual da refeição, calculadas no
              backend quando há kcal/kg.
            </p>
          </div>
          <DataOriginBadge origin={meals.length ? 'backend' : 'unavailable'} />
        </header>
        <div className="nf-table-wrap">
          <table className="nf-table">
            <thead>
              <tr>
                <th>Refeição</th>
                <th>Percentual</th>
                <th>kcal</th>
                <th>Proteína</th>
                <th>Lipídios</th>
                <th>Carboidratos</th>
              </tr>
            </thead>
            <tbody>
              {meals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-charcoal-muted">
                    Distribuição não disponível.
                  </td>
                </tr>
              ) : (
                meals.map((meal) => {
                  const mt = mealTargets.get(meal.meal)
                  const cell = (v?: number) =>
                    v != null ? formatNumber(v, 2) : '—'
                  return (
                    <tr key={meal.meal}>
                      <td className="font-medium">{MEAL_TYPE_LABELS[meal.meal] ?? meal.meal}</td>
                      <td>{asDisplayPercent(meal.percent) ?? displayOrDash(meal.percent)}</td>
                      <td>{mt ? `${cell(mt.kcal)} kcal` : '—'}</td>
                      <td>{mt ? `${cell(mt.proteinGrams)} g` : '—'}</td>
                      <td>{mt ? `${cell(mt.fatGrams)} g` : '—'}</td>
                      <td>{mt ? `${cell(mt.carbohydrateGrams)} g` : '—'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showInternalPendingPanel ? (
        <section className="nf-card border-dashed border-sage">
          <h2 className="font-display text-xl text-forest">Regras pendentes de validação</h2>
          <p className="mt-1 text-sm text-charcoal-muted">
            Painel interno para alinhamento com a Clínica. Não indica implementação.
          </p>
          {pendingFromEngine.length > 0 ? (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
              {pendingFromEngine.map((code) => (
                <li key={code}>{pendingRuleLabel(code)}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-charcoal-muted">
              Nenhuma lista <code>pendingRules</code> retornada neste contexto.
            </p>
          )}
          <ul className="mt-4 space-y-2 border-t border-sage-muted/40 pt-4 text-sm text-charcoal-muted">
            {CLINIC_PENDING_TOPICS.map((topic) => (
              <li key={topic.code}>
                <strong className="text-charcoal">
                  {topic.code} — {topic.title}:
                </strong>{' '}
                {topic.detail}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
