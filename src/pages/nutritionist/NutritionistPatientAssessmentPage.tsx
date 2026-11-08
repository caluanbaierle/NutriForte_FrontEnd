import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { nutritionistApi } from '@/api/nutritionistApi'
import type { NutritionistPatientSummary } from '@/types/nutritionist'
import type { QuestionnaireResponse } from '@/types/questionnaire'
import type { NutritionCalculationResult } from '@/types/nutrition'
import { NutritionalAssessmentView } from '@/components/assessment/NutritionalAssessmentView'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { Button } from '@/components/forms/Button'
import { SuccessAlert } from '@/components/feedback/SuccessAlert'
import { getErrorMessage } from '@/utils/errors'
import { formatDateTime, formatNumber } from '@/utils/format'

export function NutritionistPatientAssessmentPage() {
  const { patientId = '' } = useParams()
  const [summary, setSummary] = useState<NutritionistPatientSummary | null>(null)
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireResponse | null>(null)
  const [calculation, setCalculation] = useState<NutritionCalculationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [calcLoading, setCalcLoading] = useState(false)
  const [error, setError] = useState('')
  const [calcError, setCalcError] = useState('')
  const [kcalPerKg, setKcalPerKg] = useState('')
  const [saved, setSaved] = useState('')
  const [savedTarget, setSavedTarget] = useState<{ kcalPerKg: number; at: string } | null>(null)

  function rememberSaved(result: NutritionCalculationResult) {
    if (result.energyTarget && result.energyTargetDefinedAt) {
      setSavedTarget({ kcalPerKg: result.energyTarget.kcalPerKg, at: result.energyTargetDefinedAt })
    }
  }

  useEffect(() => {
    if (!patientId) return
    void (async () => {
      setLoading(true)
      setError('')
      setCalcError('')
      setCalculation(null)
      try {
        const s = await nutritionistApi.getPatient(patientId)
        setSummary(s)
        let q = s.questionnaire ?? null
        if (!q) {
          try {
            q = await nutritionistApi.getPatientQuestionnaire(patientId)
          } catch {
            q = null
          }
        }
        setQuestionnaire(q)
        if (q) {
          setCalcLoading(true)
          try {
            const result = await nutritionistApi.calculatePatientNutrition(patientId)
            setCalculation(result)
            // Pré-preenche com o valor já salvo para o paciente.
            if (result.energyTarget && result.energyTargetDefinedAt) {
              setKcalPerKg(String(result.energyTarget.kcalPerKg).replace('.', ','))
            }
            rememberSaved(result)
          } catch (err) {
            setCalcError(getErrorMessage(err, 'Não foi possível calcular a avaliação.'))
          } finally {
            setCalcLoading(false)
          }
        }
      } catch (err) {
        setError(getErrorMessage(err))
        setSummary(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [patientId])

  function parsedKcalPerKg(): number | undefined | null {
    if (!kcalPerKg.trim()) return undefined
    const value = Number(kcalPerKg.replace(',', '.'))
    return Number.isFinite(value) && value > 0 ? value : null
  }

  async function saveForPatient() {
    const value = parsedKcalPerKg()
    if (value == null) {
      setCalcError('Informe um kcal/kg válido para salvar.')
      return
    }
    setCalcLoading(true)
    setCalcError('')
    setSaved('')
    try {
      const result = await nutritionistApi.saveEnergyTarget(patientId, value)
      setCalculation(result)
      rememberSaved(result)
      setSaved(`Alvo salvo: ${formatNumber(value, 2)} kcal/kg. O paciente já vê calorias, macros e metas por refeição.`)
    } catch (err) {
      setCalcError(getErrorMessage(err))
    } finally {
      setCalcLoading(false)
    }
  }

  async function refreshCalculation() {
    if (!patientId) return
    const value = parsedKcalPerKg()
    if (value === null) {
      setCalcError('Informe um kcal/kg válido.')
      return
    }
    setSaved('')
    setCalcLoading(true)
    setCalcError('')
    try {
      setCalculation(await nutritionistApi.calculatePatientNutrition(patientId, value))
    } catch (err) {
      setCalcError(getErrorMessage(err))
    } finally {
      setCalcLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="nf-page">
        <LoadingState message="Carregando avaliação..." />
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="nf-page">
        <ErrorAlert message={error || 'Paciente não encontrado ou sem vínculo.'} />
        <Link to="/nutritionist/patients" className="nf-btn-secondary">
          Voltar
        </Link>
      </div>
    )
  }

  const { patient } = summary
  const range = calculation?.calorieRange

  return (
    <div className="nf-page nf-page-wide">
      <PageHeader
        title={`Avaliação — ${patient.fullName}`}
        description="Valores calculados pelo backend para o paciente vinculado. Sem cálculos locais."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void refreshCalculation()} disabled={calcLoading || !questionnaire}>
              {calcLoading ? 'Calculando...' : 'Recalcular'}
            </Button>
            <Link to={`/nutritionist/patients/${patientId}`} className="nf-btn-secondary">
              Voltar ao paciente
            </Link>
          </div>
        }
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <ErrorAlert message={calcError} onClose={() => setCalcError('')} />
      <SuccessAlert message={saved} onClose={() => setSaved('')} />
      {!questionnaire ? (
        <div className="nf-card">
          <p className="text-sm text-charcoal-muted">
            O paciente ainda não preencheu o questionário. Sem questionário o motor nutricional não calcula TMB,
            hidratação e demais regras.
          </p>
        </div>
      ) : calcLoading && !calculation ? (
        <LoadingState message="Calculando regras disponíveis..." />
      ) : (
        <NutritionalAssessmentView
          patient={{ fullName: patient.fullName, sex: patient.sex, birthDate: patient.birthDate }}
          questionnaire={questionnaire}
          calculation={calculation}
          showInternalPendingPanel
          kcalPerKgControl={
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                void refreshCalculation()
              }}
            >
              <div>
                <label htmlFor="kcal-per-kg" className="nf-label">
                  kcal/kg escolhido
                </label>
                <input
                  id="kcal-per-kg"
                  className="nf-input w-32"
                  inputMode="decimal"
                  placeholder={range ? `${range.minKcalPerKg}–${range.maxKcalPerKg}` : ''}
                  value={kcalPerKg}
                  onChange={(e) => setKcalPerKg(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" disabled={calcLoading || !range}>
                Pré-visualizar
              </Button>
              <Button type="button" onClick={() => void saveForPatient()} disabled={calcLoading || !range || !kcalPerKg.trim()}>
                Salvar para o paciente
              </Button>
              {savedTarget ? (
                <p className="w-full text-xs text-charcoal-muted">
                  Valor salvo: {formatNumber(savedTarget.kcalPerKg, 2)} kcal/kg, em {formatDateTime(savedTarget.at)}. O
                  paciente vê este alvo.
                </p>
              ) : (
                <p className="w-full text-xs text-charcoal-muted">
                  Nenhum valor salvo: o paciente ainda não vê o alvo energético.
                </p>
              )}
              {!range ? (
                <p className="text-xs text-charcoal-muted">O objetivo deste paciente não tem faixa definida pela Clínica.</p>
              ) : null}
            </form>
          }
        />
      )}
    </div>
  )
}
