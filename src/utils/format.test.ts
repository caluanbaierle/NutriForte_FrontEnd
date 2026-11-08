import { describe, expect, it } from 'vitest'
import { formatDate } from './format'

describe('formatDate', () => {
  it('não desloca datas sem horário (data de nascimento)', () => {
    expect(formatDate('1991-03-10')).toBe('10/03/1991')
  })

  it('trata vazio', () => {
    expect(formatDate(null)).toBe('—')
  })
})
