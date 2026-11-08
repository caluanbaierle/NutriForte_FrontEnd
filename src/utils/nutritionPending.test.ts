import { describe, expect, it } from 'vitest'
import { asDisplayPercent, pendingRuleLabel } from './nutritionPending'

describe('nutritionPending utils', () => {
  it('converte fração 0.3 em percentual de exibição', () => {
    expect(asDisplayPercent(0.3)).toBe('30%')
    expect(asDisplayPercent(40)).toBe('40%')
    expect(asDisplayPercent(null)).toBeNull()
  })

  it('mapeia códigos de pendência conhecidos', () => {
    expect(pendingRuleLabel('GET_FORMULA_CONFIRMATION')).toContain('P01')
    expect(pendingRuleLabel('UNKNOWN_CODE')).toBe('UNKNOWN_CODE')
  })
})
