/** Rótulos de pendências do motor para apresentação interna (não são regras clínicas). */
export const PENDING_RULE_LABELS: Record<string, string> = {
  GET_FORMULA_CONFIRMATION: 'P01 — Confirmação formal do GET (BMR × fator ainda é inferência)',
  KCAL_PER_KG_SELECTION: 'P02 — Escolha do ponto dentro da faixa kcal/kg',
  GOAL_CATEGORY_MAPPING: 'P03 — Mapeamento de objetivos do questionário ↔ Clínica',
  MACRO_DISTRIBUTION_APPLICABILITY: 'P04 — Quando usar 40/35/25 e 30/45/25',
  KCAL_PER_GRAM_FACTORS: 'P05 — Fatores kcal/g alternativos (4,3 / 4,1 / 9,3)',
  MEAL_MACRO_SPLIT: 'P06 — % refeição vs divisão de macros pelo nº de refeições',
  ROUNDING_POLICY: 'Arredondamento — política ainda não definida pela Clínica',
  ENERGY_TARGET_NEEDS_REVIEW: 'kcal/kg salvo está fora da faixa do objetivo atual — o nutricionista precisa revisar',
  WATER_FORMULA_CONFIRMATION: 'P12 — Hidratação: uma célula da planilha omite o +1000 ml',
}

export const CLINIC_PENDING_TOPICS = [
  { code: 'P07', title: 'Perda de peso', detail: 'Fórmula da célula B12 implementada (7700 × kg ÷ dias); interpretação clínica a validar.' },
  { code: 'P09', title: 'Castelli I e II', detail: 'Fórmulas das células implementadas; unidade e significado das referências a validar.' },
  { code: 'P10', title: 'Carência muscular', detail: 'Calculadora com × 1000 (células); significado e unidade da carência a documentar.' },
  { code: 'P11', title: 'Mesociclos', detail: 'Fórmulas dos 4 blocos disponíveis; quando usar cada bloco, duração e transição pendentes.' },
] as const

export function pendingRuleLabel(code: string): string {
  return PENDING_RULE_LABELS[code] ?? code
}

/** Converte 0.30 → 30 para exibição; não inventa valores. */
export function asDisplayPercent(fractionOrPercent: number | null | undefined): string | null {
  if (fractionOrPercent == null || Number.isNaN(fractionOrPercent)) return null
  const value = fractionOrPercent <= 1 ? fractionOrPercent * 100 : fractionOrPercent
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`
}
