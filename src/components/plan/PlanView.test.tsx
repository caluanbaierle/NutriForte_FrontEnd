import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PlanView } from './PlanView'
import type { NutritionPlanResponse } from '@/types/plan'

// Valores fictícios de teste — não são dados nutricionais reais.
const plan: NutritionPlanResponse = {
  id: 'p1',
  version: 3,
  status: 'ACTIVE',
  createdAt: '2026-10-22T12:00:00Z',
  createdByUserId: 'n1',
  notes: 'Beber água ao longo do dia.',
  totals: { caloriesKcal: 335, proteinG: 7.75, carbohydrateG: 68.15, fatG: 2.45 },
  meals: [
    {
      mealType: 'LUNCH',
      totals: { caloriesKcal: 195, proteinG: 3.75, carbohydrateG: 42.15, fatG: 0.45 },
      items: [
        {
          id: 'i1',
          foodId: 'f1',
          foodName: 'Arroz de teste',
          quantity: 150,
          unit: 'GRAM',
          caloriesKcal: 195,
          proteinG: 3.75,
          carbohydrateG: 42.15,
          fatG: 0.45,
          substitutions: [
            {
              foodId: 'f2',
              foodName: 'Batata de teste',
              quantity: 200,
              unit: 'GRAM',
              caloriesKcal: 160,
              proteinG: 4,
              carbohydrateG: 36,
              fatG: 0.2,
            },
          ],
        },
      ],
    },
  ],
}

describe('PlanView', () => {
  it('mostra itens, substituições autorizadas, orientações e totais do backend', () => {
    render(<PlanView plan={plan} />)
    expect(screen.getByText('Arroz de teste')).toBeInTheDocument()
    expect(screen.getByText('Substituições autorizadas')).toBeInTheDocument()
    expect(screen.getByText(/Batata de teste/)).toBeInTheDocument()
    expect(screen.getByText('Beber água ao longo do dia.')).toBeInTheDocument()
    expect(screen.getByText('335 kcal')).toBeInTheDocument()
    expect(screen.getByText(/Versão 3/)).toBeInTheDocument()
  })

  it('não mostra bloco de substituições quando não há', () => {
    const withoutSubs: NutritionPlanResponse = {
      ...plan,
      notes: null,
      meals: [{ ...plan.meals[0], items: [{ ...plan.meals[0].items[0], substitutions: [] }] }],
    }
    render(<PlanView plan={withoutSubs} />)
    expect(screen.queryByText('Substituições autorizadas')).not.toBeInTheDocument()
    expect(screen.queryByText('Orientações do nutricionista')).not.toBeInTheDocument()
  })
})
