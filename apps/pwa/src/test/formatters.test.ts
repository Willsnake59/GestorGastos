import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, getPaymentMethodLabel, getTodayString } from '../utils/formatters'

describe('Utilidades de Formato (formatters)', () => {
  it('formatea montos en moneda COP correctamente', () => {
    const formatted = formatCurrency(50000, 'COP')
    expect(formatted).toContain('$')
    expect(formatted).toContain('50.000')
  })

  it('formatea montos en moneda USD con símbolo US$', () => {
    const formatted = formatCurrency(120, 'USD')
    expect(formatted).toContain('US$')
  })

  it('formatea métodos de pago a texto legible', () => {
    expect(getPaymentMethodLabel('cash')).toBe('Efectivo')
    expect(getPaymentMethodLabel('credit_card')).toBe('Tarjeta de Crédito')
    expect(getPaymentMethodLabel('debit_card')).toBe('Tarjeta Débito')
    expect(getPaymentMethodLabel('transfer')).toBe('Transferencia / PSE')
    expect(getPaymentMethodLabel('other')).toBe('Otro')
  })

  it('formatea fechas relativas como Hoy y Ayer cuando corresponde', () => {
    const today = getTodayString(0)
    expect(formatDate(today)).toBe('Hoy')

    const yesterday = getTodayString(-1)
    expect(formatDate(yesterday)).toBe('Ayer')
  })
})
