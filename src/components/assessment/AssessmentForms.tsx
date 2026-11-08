import { useState, type FormEvent } from 'react'
import { nutritionistApi } from '@/api/nutritionistApi'
import type { WeightLossEnergyResponse } from '@/types/assessment'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/forms/Button'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { SuccessAlert } from '@/components/feedback/SuccessAlert'
import { getErrorMessage } from '@/utils/errors'
import { formatNumber } from '@/utils/format'
import { MesocycleCalculator } from './MesocycleCalculator'

function toNumber(value: string): number {
  return Number(value.replace(',', '.'))
}

/** Formulários de registro de avaliações (nutricionista). Sexo e idade vêm do cadastro do paciente. */
export function AssessmentForms({ patientId, onSaved }: { patientId: string; onSaved: (message: string) => void }) {
  const [vo2, setVo2] = useState({ weightKg: '', mileMinutes: '', heartRateBpm: '' })
  const [lipids, setLipids] = useState({ totalCholesterol: '', hdl: '', ldl: '', triglycerides: '' })
  const [loss, setLoss] = useState({ weightKg: '', days: '' })
  const [lossResult, setLossResult] = useState<WeightLossEnergyResponse | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  async function run(action: () => Promise<unknown>, message: string) {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await action()
      setSuccess(message)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  function submitVo2(event: FormEvent) {
    event.preventDefault()
    void run(async () => {
      await nutritionistApi.createVo2Assessment(patientId, {
        weightKg: toNumber(vo2.weightKg),
        mileMinutes: toNumber(vo2.mileMinutes),
        heartRateBpm: Math.round(toNumber(vo2.heartRateBpm)),
      })
      setVo2({ weightKg: '', mileMinutes: '', heartRateBpm: '' })
      onSaved('Teste de VO₂ registrado.')
    }, '')
  }

  function submitLipids(event: FormEvent) {
    event.preventDefault()
    void run(async () => {
      await nutritionistApi.createLipidAssessment(patientId, {
        totalCholesterol: toNumber(lipids.totalCholesterol),
        hdl: toNumber(lipids.hdl),
        ldl: toNumber(lipids.ldl),
        triglycerides: toNumber(lipids.triglycerides),
      })
      setLipids({ totalCholesterol: '', hdl: '', ldl: '', triglycerides: '' })
      onSaved('Perfil lipídico registrado.')
    }, '')
  }

  function submitLoss(event: FormEvent) {
    event.preventDefault()
    void run(async () => {
      setLossResult(
        await nutritionistApi.weightLossEnergy({ weightKg: toNumber(loss.weightKg), days: Math.round(toNumber(loss.days)) }),
      )
    }, '')
  }

  return (
    <div className="space-y-4">
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />
      <div className="grid gap-4 lg:grid-cols-2">
        <form className="nf-card space-y-3" onSubmit={submitVo2}>
          <h3 className="font-display text-lg text-forest">Novo teste de Rockport</h3>
          <TextField label="Peso no dia do teste (kg)" name="vo2-weight" inputMode="decimal" required
            value={vo2.weightKg} onChange={(e) => setVo2({ ...vo2, weightKg: e.target.value })} />
          <TextField label="Tempo para caminhar 1 milha (minutos, decimal)" name="vo2-minutes" inputMode="decimal" required
            hint="Ex.: 17 min 30 s = 17,5" value={vo2.mileMinutes}
            onChange={(e) => setVo2({ ...vo2, mileMinutes: e.target.value })} />
          <TextField label="Frequência cardíaca ao final (bpm)" name="vo2-hr" inputMode="numeric" required
            value={vo2.heartRateBpm} onChange={(e) => setVo2({ ...vo2, heartRateBpm: e.target.value })} />
          <Button type="submit" disabled={busy}>Registrar</Button>
        </form>

        <form className="nf-card space-y-3" onSubmit={submitLipids}>
          <h3 className="font-display text-lg text-forest">Novo perfil lipídico</h3>
          <p className="text-xs text-charcoal-muted">Informe todos os valores na mesma unidade do laudo.</p>
          <TextField label="Colesterol total" name="ct" inputMode="decimal" required value={lipids.totalCholesterol}
            onChange={(e) => setLipids({ ...lipids, totalCholesterol: e.target.value })} />
          <TextField label="HDL" name="hdl" inputMode="decimal" required value={lipids.hdl}
            onChange={(e) => setLipids({ ...lipids, hdl: e.target.value })} />
          <TextField label="LDL" name="ldl" inputMode="decimal" required value={lipids.ldl}
            onChange={(e) => setLipids({ ...lipids, ldl: e.target.value })} />
          <TextField label="Triglicerídeos" name="tg" inputMode="decimal" required value={lipids.triglycerides}
            onChange={(e) => setLipids({ ...lipids, triglycerides: e.target.value })} />
          <Button type="submit" disabled={busy}>Registrar</Button>
        </form>
      </div>

      <form className="nf-card space-y-3" onSubmit={submitLoss}>
        <h3 className="font-display text-lg text-forest">Calculadora de perda de peso (planilha, célula B12)</h3>
        <p className="text-xs text-charcoal-muted">
          kcal por dia = 7700 × kg ÷ dias. A interpretação clínica deste valor ainda aguarda validação da Clínica (P07).
          Nada é gravado.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Peso a perder (kg)" name="loss-kg" inputMode="decimal" required value={loss.weightKg}
            onChange={(e) => setLoss({ ...loss, weightKg: e.target.value })} />
          <TextField label="Dias da dieta" name="loss-days" inputMode="numeric" required value={loss.days}
            onChange={(e) => setLoss({ ...loss, days: e.target.value })} />
        </div>
        <Button type="submit" variant="secondary" disabled={busy}>Calcular</Button>
        {lossResult ? (
          <p className="text-sm">
            Resultado: <strong>{formatNumber(lossResult.kcalPerDay, 2)} kcal/dia</strong> (7700 ×{' '}
            {formatNumber(lossResult.weightKg, 2)} kg ÷ {lossResult.days} dias)
          </p>
        ) : null}
      </form>
      <MesocycleCalculator />
    </div>
  )
}
