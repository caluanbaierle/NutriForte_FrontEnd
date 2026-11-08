import { useEffect, useState, type FormEvent } from 'react'
import { questionnaireApi } from '@/api/questionnaireApi'
import type {
  ActivityLevel,
  Allergen,
  CookingTime,
  DietaryRestriction,
  Goal,
  MealType,
  QuestionnaireRequest,
  TrainingType,
} from '@/types/questionnaire'
import {
  ACTIVITY_LEVEL_LABELS,
  ALLERGEN_LABELS,
  COOKING_TIME_LABELS,
  DIETARY_RESTRICTION_LABELS,
  GOAL_LABELS,
  MEAL_TYPE_LABELS,
  TRAINING_TYPE_LABELS,
} from '@/types/questionnaire'
import { PageHeader } from '@/components/common/PageHeader'
import { TextField } from '@/components/forms/TextField'
import { SelectField } from '@/components/forms/SelectField'
import { Button } from '@/components/forms/Button'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { SuccessAlert } from '@/components/feedback/SuccessAlert'
import { getErrorMessage } from '@/utils/errors'

const empty: QuestionnaireRequest = {
  heightCm: 170,
  currentWeightKg: 70,
  desiredWeightKg: 65,
  bodyFatPercent: null,
  muscleMassKg: null,
  waistCm: null,
  activityLevel: 'MODERATELY_ACTIVE',
  weeklyFrequency: 3,
  trainingTypes: [],
  goal: 'WEIGHT_LOSS',
  restrictions: [],
  allergies: [],
  likedFoods: [],
  dislikedFoods: [],
  neverEatFoods: [],
  wakeTime: '06:30',
  sleepTime: '22:30',
  availableMeals: ['BREAKFAST', 'LUNCH', 'DINNER'],
  cookingTime: 'FROM_15_TO_30_MINUTES',
}

function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function parseCsv(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function PatientQuestionnairePage() {
  const [form, setForm] = useState<QuestionnaireRequest>(empty)
  const [exists, setExists] = useState(false)
  const [liked, setLiked] = useState('')
  const [disliked, setDisliked] = useState('')
  const [neverEat, setNeverEat] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const me = await questionnaireApi.getMe()
        setExists(true)
        setForm({
          heightCm: me.heightCm,
          currentWeightKg: me.currentWeightKg,
          desiredWeightKg: me.desiredWeightKg,
          bodyFatPercent: me.bodyFatPercent ?? null,
          muscleMassKg: me.muscleMassKg ?? null,
          waistCm: me.waistCm ?? null,
          activityLevel: me.activityLevel,
          weeklyFrequency: me.weeklyFrequency,
          trainingTypes: me.trainingTypes,
          goal: me.goal,
          restrictions: me.restrictions,
          allergies: me.allergies,
          likedFoods: me.likedFoods,
          dislikedFoods: me.dislikedFoods,
          neverEatFoods: me.neverEatFoods,
          wakeTime: me.wakeTime?.slice(0, 5) ?? '06:30',
          sleepTime: me.sleepTime?.slice(0, 5) ?? '22:30',
          availableMeals: me.availableMeals,
          cookingTime: me.cookingTime,
        })
        setLiked(me.likedFoods.join(', '))
        setDisliked(me.dislikedFoods.join(', '))
        setNeverEat(me.neverEatFoods.join(', '))
      } catch {
        setExists(false)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    const payload: QuestionnaireRequest = {
      ...form,
      likedFoods: parseCsv(liked),
      dislikedFoods: parseCsv(disliked),
      neverEatFoods: parseCsv(neverEat),
      bodyFatPercent: form.bodyFatPercent || null,
      muscleMassKg: form.muscleMassKg || null,
      waistCm: form.waistCm || null,
    }
    try {
      if (exists) {
        await questionnaireApi.updateMe(payload)
        setSuccess('Questionário atualizado.')
      } else {
        await questionnaireApi.create(payload)
        setExists(true)
        setSuccess('Questionário salvo.')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="nf-page">
        <LoadingState />
      </div>
    )
  }

  return (
    <div className="nf-page">
      <PageHeader
        title="Questionário clínico"
        description="Informações usadas pelo backend para cálculos e planos. O frontend não calcula metas."
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <SuccessAlert message={success} onClose={() => setSuccess('')} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="nf-card grid gap-3 md:grid-cols-3">
          <TextField
            label="Altura (cm)"
            type="number"
            step="any"
            required
            value={form.heightCm}
            onChange={(e) => setForm((f) => ({ ...f, heightCm: Number(e.target.value) }))}
          />
          <TextField
            label="Peso atual (kg)"
            type="number"
            step="any"
            required
            value={form.currentWeightKg}
            onChange={(e) => setForm((f) => ({ ...f, currentWeightKg: Number(e.target.value) }))}
          />
          <TextField
            label="Peso desejado (kg)"
            type="number"
            step="any"
            required
            value={form.desiredWeightKg}
            onChange={(e) => setForm((f) => ({ ...f, desiredWeightKg: Number(e.target.value) }))}
          />
          <TextField
            label="% gordura (opcional)"
            type="number"
            step="any"
            value={form.bodyFatPercent ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                bodyFatPercent: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
          />
          <TextField
            label="Massa muscular kg (opcional)"
            type="number"
            step="any"
            value={form.muscleMassKg ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                muscleMassKg: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
          />
          <TextField
            label="Cintura cm (opcional)"
            type="number"
            step="any"
            value={form.waistCm ?? ''}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                waistCm: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
          />
        </div>

        <div className="nf-card grid gap-3 md:grid-cols-2">
          <SelectField
            label="Objetivo"
            value={form.goal}
            onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value as Goal }))}
            options={Object.entries(GOAL_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <SelectField
            label="Nível de atividade"
            value={form.activityLevel}
            onChange={(e) => setForm((f) => ({ ...f, activityLevel: e.target.value as ActivityLevel }))}
            options={Object.entries(ACTIVITY_LEVEL_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <TextField
            label="Frequência semanal (1–7)"
            type="number"
            min={1}
            max={7}
            required
            value={form.weeklyFrequency}
            onChange={(e) => setForm((f) => ({ ...f, weeklyFrequency: Number(e.target.value) }))}
          />
          <SelectField
            label="Tempo para cozinhar"
            value={form.cookingTime}
            onChange={(e) => setForm((f) => ({ ...f, cookingTime: e.target.value as CookingTime }))}
            options={Object.entries(COOKING_TIME_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <TextField
            label="Horário de acordar"
            type="time"
            required
            value={form.wakeTime}
            onChange={(e) => setForm((f) => ({ ...f, wakeTime: e.target.value }))}
          />
          <TextField
            label="Horário de dormir"
            type="time"
            required
            value={form.sleepTime}
            onChange={(e) => setForm((f) => ({ ...f, sleepTime: e.target.value }))}
          />
        </div>

        <CheckboxGroup
          title="Tipos de treino"
          options={TRAINING_TYPE_LABELS}
          selected={form.trainingTypes}
          onToggle={(value) =>
            setForm((f) => ({
              ...f,
              trainingTypes: toggleInList(f.trainingTypes, value as TrainingType),
            }))
          }
        />
        <CheckboxGroup
          title="Restrições alimentares"
          options={DIETARY_RESTRICTION_LABELS}
          selected={form.restrictions}
          onToggle={(value) =>
            setForm((f) => ({
              ...f,
              restrictions: toggleInList(f.restrictions, value as DietaryRestriction),
            }))
          }
        />
        <CheckboxGroup
          title="Alergias"
          options={ALLERGEN_LABELS}
          selected={form.allergies}
          onToggle={(value) =>
            setForm((f) => ({
              ...f,
              allergies: toggleInList(f.allergies, value as Allergen),
            }))
          }
        />
        <CheckboxGroup
          title="Refeições disponíveis"
          options={MEAL_TYPE_LABELS}
          selected={form.availableMeals}
          onToggle={(value) =>
            setForm((f) => ({
              ...f,
              availableMeals: toggleInList(f.availableMeals, value as MealType),
            }))
          }
        />

        <div className="nf-card grid gap-3">
          <TextField
            label="Alimentos preferidos (separados por vírgula)"
            value={liked}
            onChange={(e) => setLiked(e.target.value)}
          />
          <TextField
            label="Alimentos que não gosta (vírgula)"
            value={disliked}
            onChange={(e) => setDisliked(e.target.value)}
          />
          <TextField
            label="Alimentos que nunca come (vírgula)"
            value={neverEat}
            onChange={(e) => setNeverEat(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando...' : exists ? 'Atualizar questionário' : 'Salvar questionário'}
        </Button>
      </form>
    </div>
  )
}

function CheckboxGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string
  options: Record<string, string>
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="nf-card">
      <h3 className="font-display text-lg text-forest">{title}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {Object.entries(options).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
              className="accent-forest"
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  )
}
