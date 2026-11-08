export function formatDate(value?: string | null): string {
  if (!value) return '—'
  // Datas puras (AAAA-MM-DD) não têm fuso: formatar direto evita voltar um dia no horário de Brasília.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR')
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('pt-BR')
}

export function formatMoney(amount?: number | null, currency = 'BRL'): string {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(Number(amount))
}

export function formatNumber(value?: number | null, digits = 1): string {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(Number(value))
}
