import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { nutritionistApi } from '@/api/nutritionistApi'
import type { NutritionistPatientSummary } from '@/types/nutritionist'
import type { CheckinResponse } from '@/types/checkin'
import type { QuestionnaireResponse } from '@/types/questionnaire'
import type { NutritionPlanResponse } from '@/types/plan'
import {
  ACTIVITY_LEVEL_LABELS,
  GOAL_LABELS,
  MEAL_TYPE_LABELS,
} from '@/types/questionnaire'
import { SEX_LABELS } from '@/types/patient'
import { NUTRITION_PLAN_STATUS_LABELS } from '@/types/plan'
import type { AssessmentHistoryResponse } from '@/types/assessment'
import { PlanView } from '@/components/plan/PlanView'
import { PlanEditor } from '@/components/plan/PlanEditor'
import { AssessmentHistory } from '@/components/assessment/AssessmentHistory'
import { AssessmentForms } from '@/components/assessment/AssessmentForms'
import { SuccessAlert } from '@/components/feedback/SuccessAlert'
import { Button } from '@/components/forms/Button'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { getErrorMessage } from '@/utils/errors'
import { formatDate, formatDateTime, formatNumber } from '@/utils/format'

type Tab = 'resumo' | 'questionario' | 'plano' | 'avaliacoes' | 'checkins'

export function NutritionistPatientDetailPage() {
  const { patientId = '' } = useParams()
  const [tab, setTab] = useState<Tab>('resumo')
  const [summary, setSummary] = useState<NutritionistPatientSummary | null>(null)
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireResponse | null>(null)
  const [plan, setPlan] = useState<NutritionPlanResponse | null>(null)
  const [planHistory, setPlanHistory] = useState<NutritionPlanResponse[]>([])
  const [editingPlan, setEditingPlan] = useState(false)
  const [assessments, setAssessments] = useState<AssessmentHistoryResponse | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [success, setSuccess] = useState('')
  const [checkins, setCheckins] = useState<CheckinResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!patientId) return
    void (async () => {
      setLoading(true)
      setError('')
      try {
        setSummary(await nutritionistApi.getPatient(patientId))
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [patientId])

  useEffect(() => {
    if (!patientId || tab === 'resumo') return
    void (async () => {
      setTabLoading(true)
      setError('')
      try {
        if (tab === 'questionario') {
          setQuestionnaire(await nutritionistApi.getPatientQuestionnaire(patientId))
        } else if (tab === 'plano') {
          const versions = await nutritionistApi.listNutritionPlans(patientId)
          setPlanHistory(versions)
          setPlan(versions.find((v) => v.status === 'ACTIVE') ?? null)
        } else if (tab === 'avaliacoes') {
          setAssessments(await nutritionistApi.getAssessments(patientId))
        } else if (tab === 'checkins') {
          const page = await nutritionistApi.getPatientCheckins(patientId, { page: 0, size: 50 })
          setCheckins(page.content)
        }
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setTabLoading(false)
      }
    })()
  }, [tab, patientId, reloadKey])

  if (loading) {
    return (
      <div className="nf-page">
        <LoadingState />
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="nf-page">
        <ErrorAlert message={error || 'Paciente não encontrado.'} />
        <Link to="/nutritionist/patients" className="nf-btn-secondary">
          Voltar
        </Link>
      </div>
    )
  }

  const { patient } = summary

  return (
    <div className="nf-page">
      <PageHeader
        title={patient.fullName}
        description={`${SEX_LABELS[patient.sex]} · ${patient.city}/${patient.state} · nasc. ${formatDate(patient.birthDate)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to={`/nutritionist/patients/${patientId}/assessment`} className="nf-btn-primary">
              Avaliação nutricional
            </Link>
            <Link to="/nutritionist/patients" className="nf-btn-secondary">
              Voltar
            </Link>
          </div>
        }
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />

      <div className="nf-tabs">
        {(
          [
            ['resumo', 'Resumo'],
            ['questionario', 'Questionário'],
            ['plano', 'Plano alimentar'],
            ['avaliacoes', 'Avaliações'],
            ['checkins', 'Check-ins'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`nf-tab ${tab === key ? 'nf-tab-active' : ''}`}
            onClick={() => {
              setTab(key)
              setEditingPlan(false)
              setSuccess('')
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tabLoading ? <LoadingState /> : null}

      {!tabLoading && tab === 'resumo' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="nf-card">
            <h3 className="font-display text-lg text-forest">Contato</h3>
            <p className="mt-2 text-sm">WhatsApp: {patient.whatsapp}</p>
            <p className="text-sm">CPF: {patient.cpf}</p>
          </div>
          <div className="nf-card">
            <h3 className="font-display text-lg text-forest">Último check-in</h3>
            {summary.latestCheckin ? (
              <>
                <p className="mt-2 text-sm">Peso: {formatNumber(summary.latestCheckin.weightKg)} kg</p>
                <p className="text-sm">
                  Adesão: {formatNumber(summary.latestCheckin.dietAdherencePercent, 0)}%
                </p>
                <p className="text-xs text-charcoal-muted">{formatDateTime(summary.latestCheckin.createdAt)}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-charcoal-muted">Sem check-in.</p>
            )}
          </div>
          <div className="nf-card">
            <h3 className="font-display text-lg text-forest">Plano atual</h3>
            {summary.currentNutritionPlan ? (
              <>
                <p className="mt-2 text-sm">Versão {summary.currentNutritionPlan.version}</p>
                <StatusBadge
                  status={summary.currentNutritionPlan.status}
                  label={NUTRITION_PLAN_STATUS_LABELS[summary.currentNutritionPlan.status]}
                />
              </>
            ) : (
              <p className="mt-2 text-sm text-charcoal-muted">Sem plano ativo.</p>
            )}
          </div>
          <div className="nf-card md:col-span-3">
            <h3 className="font-display text-lg text-forest">Questionário (resumo)</h3>
            {summary.questionnaire ? (
              <p className="mt-2 text-sm">
                Objetivo: {GOAL_LABELS[summary.questionnaire.goal]} · Atividade:{' '}
                {ACTIVITY_LEVEL_LABELS[summary.questionnaire.activityLevel]} · Meta:{' '}
                {formatNumber(summary.questionnaire.desiredWeightKg)} kg
              </p>
            ) : (
              <p className="mt-2 text-sm text-charcoal-muted">Questionário ainda não preenchido.</p>
            )}
          </div>
        </div>
      ) : null}

      {!tabLoading && tab === 'questionario' ? (
        questionnaire ? (
          <div className="nf-card space-y-2 text-sm">
            <p>Altura: {formatNumber(questionnaire.heightCm)} cm</p>
            <p>Peso atual: {formatNumber(questionnaire.currentWeightKg)} kg</p>
            <p>Peso desejado: {formatNumber(questionnaire.desiredWeightKg)} kg</p>
            <p>Objetivo: {GOAL_LABELS[questionnaire.goal]}</p>
            <p>Atividade: {ACTIVITY_LEVEL_LABELS[questionnaire.activityLevel]}</p>
            <p>Frequência semanal: {questionnaire.weeklyFrequency}</p>
            <p>
              Refeições: {questionnaire.availableMeals.map((m) => MEAL_TYPE_LABELS[m]).join(', ')}
            </p>
          </div>
        ) : (
          <EmptyState title="Sem questionário" />
        )
      ) : null}

      {!tabLoading && tab === 'plano' ? (
        editingPlan ? (
          <PlanEditor
            patientId={patientId}
            basePlan={plan}
            onCancel={() => setEditingPlan(false)}
            onPublished={(published) => {
              setEditingPlan(false)
              setSuccess(`Plano publicado (versão ${published.version}).`)
              setReloadKey((k) => k + 1)
            }}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setEditingPlan(true)}>
                {plan ? 'Criar nova versão a partir da atual' : 'Montar plano alimentar'}
              </Button>
            </div>
            {plan ? <PlanView plan={plan} /> : <EmptyState title="Sem plano alimentar ativo" />}
            {planHistory.length > 1 ? (
              <div className="nf-card">
                <h3 className="font-display text-lg text-forest">Histórico de versões</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {planHistory.map((version) => (
                    <li key={version.id} className="flex flex-wrap items-center gap-2">
                      <span>Versão {version.version}</span>
                      <StatusBadge status={version.status} label={NUTRITION_PLAN_STATUS_LABELS[version.status]} />
                      <span className="text-charcoal-muted">
                        {formatDateTime(version.createdAt)} ·{' '}
                        {version.totals ? `${formatNumber(version.totals.caloriesKcal, 0)} kcal` : '—'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )
      ) : null}

      {!tabLoading && tab === 'avaliacoes' ? (
        <div className="space-y-4">
          <AssessmentForms
            patientId={patientId}
            onSaved={(message) => {
              setSuccess(message)
              setReloadKey((k) => k + 1)
            }}
          />
          {assessments ? <AssessmentHistory history={assessments} /> : null}
        </div>
      ) : null}

      {!tabLoading && tab === 'checkins' ? (
        checkins.length === 0 ? (
          <EmptyState title="Sem check-ins" />
        ) : (
          <div className="nf-table-wrap">
            <table className="nf-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Peso (kg)</th>
                  <th>Cintura (cm)</th>
                  <th>Adesão (%)</th>
                </tr>
              </thead>
              <tbody>
                {checkins.map((c) => (
                  <tr key={c.id}>
                    <td>{formatDateTime(c.createdAt)}</td>
                    <td>{formatNumber(c.weightKg)}</td>
                    <td>{formatNumber(c.waistCm)}</td>
                    <td>{formatNumber(c.dietAdherencePercent, 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  )
}
