import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, act } from '@testing-library/react'
import { App } from '../App'

describe('Aplicación y Navegación', () => {
  it('renderiza la cabecera con el nombre de la app y el resumen financiero', async () => {
    await act(async () => {
      render(<App />)
    })

    // Verificar marca de la aplicación en el Header
    const brandElements = screen.getAllByText(/Gestor de gastos/i)
    expect(brandElements.length).toBeGreaterThan(0)

    // Verificar que el contenedor de balance esté presente
    expect(screen.getByText(/Saldo:/i)).toBeInTheDocument()

    // Verificar navegación principal
    const dashboardElements = screen.getAllByText(/Panel Financiero/i)
    expect(dashboardElements.length).toBeGreaterThan(0)
  })

  it('muestra botones de acción rápida para registrar gastos e ingresos', async () => {
    await act(async () => {
      render(<App />)
    })

    expect(screen.getByRole('button', { name: /Gasto/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ingreso/i })).toBeInTheDocument()
  })

  it('renderiza la barra de navegación móvil inferior y abre la hoja de acciones rápidas', async () => {
    await act(async () => {
      render(<App />)
    })

    // Barra de navegación móvil presente
    const mobileNav = screen.getByLabelText(/Navegación móvil/i)
    expect(mobileNav).toBeInTheDocument()

    // Botón flotante central de nueva operación
    const fabButton = screen.getByLabelText(/Registrar nueva operación financiera/i)
    expect(fabButton).toBeInTheDocument()

    // Abrir hoja de acciones rápidas al hacer clic en el botón flotante
    await act(async () => {
      fabButton.click()
    })

    // La hoja de acciones rápidas debe aparecer
    expect(screen.getByText(/¿Qué deseas registrar\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Nuevo Gasto/i)).toBeInTheDocument()
    expect(screen.getByText(/Nuevo Ingreso/i)).toBeInTheDocument()
    expect(screen.getByText(/Control Deuda/i)).toBeInTheDocument()
    expect(screen.getByText(/Meta Ahorro/i)).toBeInTheDocument()
  })
})
