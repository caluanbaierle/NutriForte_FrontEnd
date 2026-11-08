import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NutritionalAssessmentView } from './NutritionalAssessmentView'
import type { NutritionCalculationResult } from '@/types/nutrition'
import type { QuestionnaireResponse } from '@/types/questionnaire'

const patient = {
  fullName: 'Ana Souza',
  sex: 'FEMALE' as const,
  birthDate: '1990-01-15',
}

const questionnaire = {
  heightCm: 165,
  currentWeightKg: 70,
  desiredWeightKg: 65,
  activityLevel: 'MODERATELY_ACTIVE',
  goal: 'WEIGHT_LOSS',
} as QuestionnaireResponse

const calculation: NutritionCalculationResult = {
  complete: false,
  ruleSource: 'CLINIC_SPREADSHEET',
  bmrKcal: 1500.5,
  activityFactor: 1.55,
  calorieRange: {
    clinicGoal: 'Emagrecer',
    minKcalPerKg: 18,
    maxKcalPerKg: 25,
  },
  waterMl: 3450,
  identifiedMacroDistribution: {
    proteinPercent: 0.3,
    fatPercent: 0.3,
    carbohydratePercent: 0.4,
    proteinKcalPerGram: 4,
    fatKcalPerGram: 9,
    carbohydrateKcalPerGram: 4,
  },
  identifiedMealCaloriePercents: [
    { meal: 'BREAKFAST', percent: 0.1 },
    { meal: 'LUNCH', percent: 0.3 },
  ],
  pendingRules: ['GET_FORMULA_CONFIRMATION', 'KCAL_PER_KG_SELECTION'],
}

describe('NutritionalAssessmentView', () => {
  it('renderiza dados reais do backend sem hardcodar GET nem kcal da dieta', () => {
    render(
      <NutritionalAssessmentView
        patient={patient}
        questionnaire={questionnaire}
        calculation={calculation}
      />,
    )

    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
    expect(screen.getByText(/1\.500,5 kcal|1500,5 kcal/)).toBeInTheDocument()
    expect(screen.getByText(/3\.450 ml\/dia|3450 ml\/dia/)).toBeInTheDocument()
    expect(screen.getAllByText('Regra ainda não disponível').length).toBeGreaterThan(0)
    expect(screen.queryByText('2264,4')).not.toBeInTheDocument()
    expect(screen.queryByText('2934')).not.toBeInTheDocument()
    expect(screen.getByText(/P01 — Confirmação formal do GET/)).toBeInTheDocument()
  })

  it('mostra estado sem cálculo e aviso de API ausente', () => {
    render(
      <NutritionalAssessmentView
        patient={patient}
        questionnaire={null}
        calculation={null}
        calculationUnavailableReason="API de cálculo indisponível para este perfil."
      />,
    )

    expect(screen.getByText(/API de cálculo indisponível/)).toBeInTheDocument()
    expect(screen.getByText(/Questionário não disponível/)).toBeInTheDocument()
  })

  it('não inventa gramas de macros quando só há percentuais', () => {
    render(
      <NutritionalAssessmentView
        patient={patient}
        questionnaire={questionnaire}
        calculation={calculation}
      />,
    )

    expect(screen.queryByText(/169,83/)).not.toBeInTheDocument()
    expect(screen.getByText('Aguardando kcal/kg do nutricionista')).toBeInTheDocument()
  })

  it('mostra gramas, g/kg e metas por refeição quando o backend devolve o alvo', () => {
    render(
      <NutritionalAssessmentView
        patient={patient}
        questionnaire={questionnaire}
        calculation={{
          ...calculation,
          tdeeKcal: 2325.775,
          bmi: 25.71,
          energyTarget: {
            kcalPerKg: 18,
            totalKcal: 2264.4,
            macros: {
              proteinKcal: 679.32,
              fatKcal: 679.32,
              carbohydrateKcal: 905.76,
              proteinGrams: 169.83,
              fatGrams: 75.48,
              carbohydrateGrams: 226.44,
            },
            proteinGramsPerKg: 1.35,
            fatGramsPerKg: 0.6,
            carbohydrateGramsPerKg: 1.8,
            meals: [{ meal: 'BREAKFAST', percent: 0.1, kcal: 226.44, proteinGrams: 16.983, fatGrams: 7.548, carbohydrateGrams: 22.644 }],
          },
        }}
      />,
    )

    expect(screen.getByText('169,83 g')).toBeInTheDocument()
    expect(screen.getByText('1,35')).toBeInTheDocument()
    expect(screen.getByText('16,98 g')).toBeInTheDocument()
    expect(screen.getByText('25,71 kg/m²')).toBeInTheDocument()
  })
})
