import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { patientApi } from '@/api/patientApi'
import { questionnaireApi } from '@/api/questionnaireApi'
import type { PatientResponse } from '@/types/patient'
import type { QuestionnaireResponse } from '@/types/questionnaire'
import type { NutritionCalculationResult } from '@/types/nutrition'
import { NutritionalAssessmentView } from '@/components/assessment/NutritionalAssessmentView'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { Button } from '@/components/forms/Button'
import { getErrorMessage } from '@/utils/errors'

export function PatientAssessmentPage() {
  const [patient, setPatient] = useState<PatientResponse | null>(null)
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireResponse | null>(null)
  const [calculation, setCalculation] = useState<NutritionCalculationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [calcLoading, setCalcLoading] = useState(false)
  const [error, setError] = useState('')
  const [calcError, setCalcError] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const [me, q] = await Promise.all([
          patientApi.getMe(),
          questionnaireApi.getMe().catch(() => null),
        ])
        setPatient(me)
        setQuestionnaire(q)
        if (q) {
          setCalcLoading(true)
          try {
            setCalculation(await patientApi.calculateNutrition())
          } catch (err) {
            setCalcError(getErrorMessage(err, 'Não foi possível calcular a avaliação.'))
          } finally {
            setCalcLoading(false)
          }
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Complete o perfil de paciente para ver a avaliação.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function refreshCalculation() {
    setCalcLoading(true)
    setCalcError('')
    try {
      setCalculation(await patientApi.calculateNutrition())
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

  if (!patient) {
    return (
      <div className="nf-page">
        <ErrorAlert message={error || 'Paciente não encontrado.'} />
        <Link to="/patient/profile" className="nf-btn-primary">
          Ir para perfil
        </Link>
      </div>
    )
  }

  return (
    <div className="nf-page nf-page-wide">
      <PageHeader
        title="Avaliação nutricional"
        description="Valores calculados pelo backend. Nenhum resultado da planilha é inventado nesta tela."
        actions={
          <Button type="button" onClick={() => void refreshCalculation()} disabled={calcLoading || !questionnaire}>
            {calcLoading ? 'Calculando...' : 'Recalcular'}
          </Button>
        }
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <ErrorAlert message={calcError} onClose={() => setCalcError('')} />
      {!questionnaire ? (
        <div className="nf-card">
          <p className="text-sm text-charcoal-muted">
            Preencha o questionário para que o motor nutricional possa calcular TMB, hidratação e demais
            regras já definidas.
          </p>
          <Link to="/patient/questionnaire" className="nf-btn-primary mt-4 inline-flex">
            Abrir questionário
          </Link>
        </div>
      ) : calcLoading && !calculation ? (
        <LoadingState message="Calculando regras disponíveis..." />
      ) : (
        <NutritionalAssessmentView
          patient={{
            fullName: patient.fullName,
            sex: patient.sex,
            birthDate: patient.birthDate,
          }}
          questionnaire={questionnaire}
          calculation={calculation}
          showInternalPendingPanel
        />
      )}
    </div>
  )
}
