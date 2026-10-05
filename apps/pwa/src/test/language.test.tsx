import { describe, expect, it, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { App } from '../App'
import { SettingsPage } from '../pages/SettingsPage'
import { HelpPage } from '../pages/HelpPage'
import { SavingsPage } from '../pages/SavingsPage'
import { LanguageProvider, useLanguage } from '../context/LanguageContext'
import { DataProvider } from '../context/DataContext'
import { ToastProvider } from '../context/ToastContext'

const LanguageToggleBtn = () => {
  const { language, setLanguage } = useLanguage()
  return (
    <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}>
      Toggle to {language === 'es' ? 'en' : 'es'}
    </button>
  )
}

describe('Sistema de Idiomas (i18n)', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem(
      'gestor_gastos_session',
      JSON.stringify({
        user: {
          id: 'usr_evaluator_academic',
          email: 'evaluador@universidad.edu',
          name: 'Prof. Evaluador Académico',
          role: 'evaluator',
          university: 'Comité de Evaluación de Proyecto',
          createdAt: '2026-01-15T08:00:00.000Z',
          lastLoginAt: '2026-10-04T17:00:00.000Z',
        },
        token: 'test_token_123',
        expiresAt: '2099-01-01T00:00:00.000Z',
      })
    )
    document.documentElement.lang = 'es'
  })

  it('no muestra la opción de cambiar moneda y sí muestra el selector de idioma en Ajustes', async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <ToastProvider>
            <DataProvider>
              <SettingsPage />
            </DataProvider>
          </ToastProvider>
        </LanguageProvider>
      )
    })

    // No debe existir el selector de moneda
    expect(screen.queryByText(/Moneda principal/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/COP - Peso Colombiano/i)).not.toBeInTheDocument()

    // Debe existir el selector de idioma funcional
    expect(screen.getByText(/Idioma de la aplicación/i)).toBeInTheDocument()
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Español \(ES\)/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /English \(US\)/i })).toBeInTheDocument()
  })

  it('permite cambiar de español a inglés de forma totalmente reactiva y persistente', async () => {
    await act(async () => {
      render(<App />)
    })

    // En español por defecto
    const brandEs = screen.getAllByText(/Gestor de gastos/i)
    expect(brandEs.length).toBeGreaterThan(0)
    expect(screen.getByText(/Saldo:/i)).toBeInTheDocument()

    // Navegar a ajustes
    const settingsButtons = screen.getAllByText(/Configuración/i)
    expect(settingsButtons.length).toBeGreaterThan(0)

    await act(async () => {
      fireEvent.click(settingsButtons[0])
    })

    // Localizar el selector de idioma y cambiar a inglés
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()

    await act(async () => {
      fireEvent.change(select, { target: { value: 'en' } })
    })

    // Debe cambiar la marca y textos a inglés
    expect(document.documentElement.lang).toBe('en')
    const brandEn = screen.getAllByText(/Expense Manager/i)
    expect(brandEn.length).toBeGreaterThan(0)
    expect(screen.getByText(/Balance:/i)).toBeInTheDocument()
    expect(screen.getByText(/Appearance Preferences/i)).toBeInTheDocument()

    // Comprobar persistencia en localStorage
    const savedSettings = JSON.parse(localStorage.getItem('gestor_gastos_settings') || '{}')
    expect(savedSettings.language).toBe('en')
  })

  it('permite alternar el idioma con el acceso directo en la cabecera superior y traduce el botón de nuevo movimiento', async () => {
    await act(async () => {
      render(<App />)
    })

    // Botón en la barra superior con el idioma actual
    const langHeaderBtn = screen.getByRole('button', { name: /Cambiar a inglés/i })
    expect(langHeaderBtn).toBeInTheDocument()
    expect(langHeaderBtn).toHaveTextContent('ES')

    // El botón de nuevo movimiento debe estar en español
    expect(screen.getAllByText(/Nuevo Movimiento/i).length).toBeGreaterThan(0)

    // Clic en el acceso directo de la cabecera
    await act(async () => {
      fireEvent.click(langHeaderBtn)
    })

    // Debe cambiar a inglés inmediatamente
    expect(langHeaderBtn).toHaveTextContent('EN')
    expect(document.documentElement.lang).toBe('en')
    expect(screen.getAllByText(/New Transaction/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/Nuevo Movimiento/i)).not.toBeInTheDocument()

    // Clic de nuevo para volver a español
    await act(async () => {
      fireEvent.click(langHeaderBtn)
    })

    expect(langHeaderBtn).toHaveTextContent('ES')
    expect(document.documentElement.lang).toBe('es')
    expect(screen.getAllByText(/Nuevo Movimiento/i).length).toBeGreaterThan(0)
  })

  it('traduce los títulos de los movimientos, categorías y badges al cambiar de idioma', async () => {
    window.history.pushState({}, '', '/movements')
    await act(async () => {
      render(<App />)
    })

    const langHeaderBtn = screen.getByRole('button', { name: /Cambiar a inglés/i })
    expect(langHeaderBtn).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(langHeaderBtn)
    })

    expect(langHeaderBtn).toHaveTextContent('EN')

    // Títulos de movimientos deben traducirse a inglés
    expect(screen.getAllByText(/Goal Contribution: Emergency Fund/i).length).toBeGreaterThan(0)

    // Badges de tipo deben traducirse
    const savingsBadges = screen.getAllByText(/Savings Deposit/i)
    expect(savingsBadges.length).toBeGreaterThan(0)
  })

  it('traduce completamente la sección de Ayuda (HelpPage)', async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <LanguageToggleBtn />
          <HelpPage />
        </LanguageProvider>
      )
    })

    // En español inicialmente
    expect(screen.getByText('Ayuda & Preguntas Frecuentes')).toBeInTheDocument()
    expect(screen.getByText('Guía de Inicio Rápido')).toBeInTheDocument()
    expect(screen.getByText('¿Mis datos financieros son privados y seguros?')).toBeInTheDocument()

    // Alternar a inglés
    const toggleBtn = screen.getByRole('button', { name: /Toggle to en/i })
    await act(async () => {
      fireEvent.click(toggleBtn)
    })

    // En inglés ahora
    expect(screen.getByText('Help & FAQs')).toBeInTheDocument()
    expect(screen.getByText('Quick Start Guide')).toBeInTheDocument()
    expect(screen.getByText('Record your Transactions')).toBeInTheDocument()
    expect(screen.getByText('Are my financial data private and secure?')).toBeInTheDocument()
    expect(screen.getByText('Privacy by Design')).toBeInTheDocument()
  })

  it('traduce completamente la sección de Metas de Ahorro (SavingsPage)', async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <ToastProvider>
            <DataProvider>
              <LanguageToggleBtn />
              <SavingsPage />
            </DataProvider>
          </ToastProvider>
        </LanguageProvider>
      )
    })

    // En español
    expect(screen.getByRole('heading', { level: 1, name: 'Metas de Ahorro' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nueva Meta de Ahorro' })).toBeInTheDocument()
    expect(screen.getByText('Fondo de Emergencia (3 meses)')).toBeInTheDocument()

    // Alternar a inglés
    const toggleBtn = screen.getByRole('button', { name: /Toggle to en/i })
    await act(async () => {
      fireEvent.click(toggleBtn)
    })

    // En inglés
    expect(screen.getByRole('heading', { level: 1, name: 'Savings Goals' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New Savings Goal' })).toBeInTheDocument()
    expect(screen.getByText('Total Accumulated in Reserves')).toBeInTheDocument()
    expect(screen.getByText('Emergency Fund (3 months)')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Deposit' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Withdraw' }).length).toBeGreaterThan(0)
  })
})
