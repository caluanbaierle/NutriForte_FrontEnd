import { useState, type FormEvent } from 'react'
import { nutritionistApi } from '@/api/nutritionistApi'
import type { MesocycleResponse } from '@/types/assessment'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/forms/Button'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { getErrorMessage } from '@/utils/errors'
import { formatNumber } from '@/utils/format'

function toNumber(value: string): number {
  return Number(value.replace(',', '.'))
}

/** Calculadora dos blocos de mesociclo (aba "fórmulas peso" da planilha). Nada é gravado. */
export function MesocycleCalculator() {
  const [form, setForm] = useState({
    block: '1',
    muscleDeficit: '',
    caloricExpenditureKcal: '',
    sessionTrainingKcal: '',
    mealsPerDay: '7',
    weightKg: '',
  })
  const [result, setResult] = useState<MesocycleResponse | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      setResult(
        await nutritionistApi.mesocycle({
          block: Number(form.block),
          muscleDeficit: toNumber(form.muscleDeficit),
          caloricExpenditureKcal: toNumber(form.caloricExpenditureKcal),
          sessionTrainingKcal: toNumber(form.sessionTrainingKcal),
          mealsPerDay: Math.round(toNumber(form.mealsPerDay)),
          weightKg: form.weightKg.trim() ? toNumber(form.weightKg) : undefined,
        }),
      )
    } catch (err) {
      setResult(null)
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const r = result?.result
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [key]: e.target.value })

  return (
    <form className="nf-card space-y-3" onSubmit={submit}>
      <h3 className="font-display text-lg text-forest">Calculadora de mesociclo (planilha, aba “fórmulas peso”)</h3>
      <p className="text-xs text-charcoal-muted">
        Total = carência × 40 ÷ 453 × 1000 + gasto calórico + treino da sessão. Blocos 2 (40/35/25) e 3 (30/45/25)
        calculam gramas por refeição com 4,3 / 4,1 / 9,3 kcal/g. Nada é gravado.
      </p>
      <ErrorAlert message={error} onClose={() => setError('')} />
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="meso-block" className="nf-label">
            Mesociclo
          </label>
          <select id="meso-block" className="nf-input" value={form.block} onChange={set('block')}>
            {[1, 2, 3, 4].map((b) => (
              <option key={b} value={b}>
                {b}º mesociclo
              </option>
            ))}
          </select>
        </div>
        <TextField label="Carência muscular" name="meso-deficit" inputMode="decimal" required
          value={form.muscleDeficit} onChange={set('muscleDeficit')} hint="Mesmo valor usado na planilha (ex.: 9,1)" />
        <TextField label="Gasto calórico (kcal)" name="meso-expenditure" inputMode="decimal" required
          value={form.caloricExpenditureKcal} onChange={set('caloricExpenditureKcal')} />
        <TextField label="Treino da sessão (kcal)" name="meso-training" inputMode="decimal" required
          value={form.sessionTrainingKcal} onChange={set('sessionTrainingKcal')} />
        <TextField label="Refeições por dia" name="meso-meals" inputMode="numeric" required
          value={form.mealsPerDay} onChange={set('mealsPerDay')} />
        <TextField label="Peso para água (kg, opcional)" name="meso-weight" inputMode="decimal"
          value={form.weightKg} onChange={set('weightKg')} />
      </div>
      <Button type="submit" variant="secondary" disabled={busy}>
        Calcular
      </Button>
      {r ? (
        <div className="space-y-1 text-sm">
          <p>
            Carência: <strong>{formatNumber(r.muscleDeficitKcal, 2)} kcal</strong> · Total:{' '}
            <strong>{formatNumber(r.totalKcal, 2)} kcal</strong>
          </p>
          <p>
            Valor proteínas (total ÷ 4,3 ÷ {r.mealsPerDay}): <strong>{formatNumber(r.proteinValuePerMeal, 2)}</strong>
          </p>
          {r.macrosPerMeal ? (
            <p>
              Por refeição: proteína {formatNumber(r.macrosPerMeal.proteinGrams, 2)} g · carboidratos{' '}
              {formatNumber(r.macrosPerMeal.carbohydrateGrams, 2)} g · lipídios {formatNumber(r.macrosPerMeal.fatGrams, 2)} g
              · total <strong>{formatNumber(r.macrosPerMeal.totalGrams, 2)} g</strong>
            </p>
          ) : (
            <p className="text-charcoal-muted">Este bloco não tem distribuição de macros na planilha.</p>
          )}
          {r.waterMl != null ? <p>Água: {formatNumber(r.waterMl, 0)} ml/dia</p> : null}
          <ul className="list-disc pl-5 text-xs text-charcoal-muted">
            {result?.pendingValidation.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  )
}
