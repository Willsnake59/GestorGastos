import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { DebtsPage } from '../pages/DebtsPage'
import { DataProvider } from '../context/DataContext'
import { ToastProvider } from '../context/ToastContext'
import { LanguageProvider } from '../context/LanguageContext'

function renderDebtsPage() {
  return render(
    <LanguageProvider>
      <ToastProvider>
        <DataProvider>
          <DebtsPage />
        </DataProvider>
      </ToastProvider>
    </LanguageProvider>
  )
}

describe('Control de Deudas - Entrada de Monto', () => {
  it('permite escribir múltiples dígitos en el campo de monto de la deuda sin perder el foco ni truncar', async () => {
    await act(async () => {
      renderDebtsPage()
    })

    // Abrir modal de nueva deuda
    const newDebtBtn = screen.getByRole('button', { name: /Nueva Deuda \/ Préstamo/i })
    await act(async () => {
      fireEvent.click(newDebtBtn)
    })

    // El input de Monto Total debe estar presente
    const amountInput = screen.getByLabelText(/Monto Total \*/i) as HTMLInputElement
    expect(amountInput).toBeInTheDocument()

    // Simular que el usuario hace focus y escribe múltiples dígitos sucesivamente
    amountInput.focus()
    expect(document.activeElement).toBe(amountInput)

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '1' } })
    })
    expect(amountInput.value).toBe('1')

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '15' } })
    })
    expect(amountInput.value).toBe('15')

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '150000' } })
    })
    expect(amountInput.value).toBe('150000')

    // El foco no debe haber sido robado por el modal
    expect(document.activeElement).toBe(amountInput)
  })
})
