import type { CurrencyCode } from '../types'
import { CURRENCY_SYMBOLS } from '../services/settingsService'

export function formatCurrency(amount: number, currency: CurrencyCode = 'COP'): string {
  const symbolInfo = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.COP

  // Formato para monedas enteras como COP o con centavos según el valor
  const hasDecimals = amount % 1 !== 0 && currency !== 'COP' && currency !== 'CLP'

  const formatted = new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${symbolInfo.symbol} ${formatted}`
}

export function getTodayString(daysOffset = 0): string {
  const d = new Date()
  if (daysOffset !== 0) {
    d.setDate(d.getDate() + daysOffset)
  }
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate(dateString: string): string {
  if (!dateString) return ''

  try {
    const [year, month, day] = dateString.split('-').map(Number)
    if (!year || !month || !day) return dateString

    const d = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const targetDate = new Date(d)
    targetDate.setHours(0, 0, 0, 0)

    const diffTime = today.getTime() - targetDate.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays === -1) return 'Mañana'

    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    }).format(d)
  } catch {
    return dateString
  }
}

export function formatFullDate(dateString: string): string {
  if (!dateString) return ''
  try {
    const [year, month, day] = dateString.split('-').map(Number)
    if (!year || !month || !day) return dateString
    const d = new Date(year, month - 1, day)
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch {
    return dateString
  }
}

export function getPaymentMethodLabel(method: string): string {
  switch (method) {
    case 'cash':
      return 'Efectivo'
    case 'credit_card':
      return 'Tarjeta de Crédito'
    case 'debit_card':
      return 'Tarjeta Débito'
    case 'transfer':
      return 'Transferencia / PSE'
    default:
      return 'Otro'
  }
}
