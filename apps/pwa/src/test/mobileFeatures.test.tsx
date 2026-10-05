import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { LanguageProvider } from '../context/LanguageContext'
import { ToastProvider } from '../context/ToastContext'
import { MobileReceiptScannerModal } from '../components/mobile/MobileReceiptScannerModal'
import { MobileShareReceiptCard } from '../components/mobile/MobileShareReceiptCard'
import type { Movement } from '../types'

describe('Funciones Exclusivas de Móvil (Cámara de Recibos y Compartir Nativo)', () => {
  const mockMovement: Movement = {
    id: 'mov-test-101',
    title: 'Cena de Celebración Proyecto',
    amount: 125000,
    type: 'expense',
    categoryId: 'cat-food',
    date: '2026-10-04',
    paymentMethod: 'debit_card',
    notes: 'Pago con tarjeta débito en restaurante.',
    createdAt: '2026-10-04T12:00:00.000Z',
    updatedAt: '2026-10-04T12:00:00.000Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('MobileReceiptScannerModal se renderiza con insignias y controles de cámara móvil', () => {
    const handleClose = vi.fn()
    const handleScanComplete = vi.fn()

    render(
      <LanguageProvider>
        <MobileReceiptScannerModal
          isOpen={true}
          onClose={handleClose}
          onScanComplete={handleScanComplete}
        />
      </LanguageProvider>
    )

    expect(screen.getByText(/Exclusivo Móvil/i)).toBeInTheDocument()
    expect(screen.getByText(/Escáner Móvil de Tickets/i)).toBeInTheDocument()
    expect(screen.getByText(/Abrir Cámara del Celular/i)).toBeInTheDocument()
  })

  it('MobileShareReceiptCard invoca navigator.share cuando está disponible en el dispositivo móvil', async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', {
      writable: true,
      configurable: true,
      value: shareMock,
    })

    render(
      <LanguageProvider>
        <ToastProvider>
          <MobileShareReceiptCard
            movement={mockMovement}
            categoryName="Alimentación"
            currency="COP"
          />
        </ToastProvider>
      </LanguageProvider>
    )

    expect(screen.getByText(/Compartir Comprobante Oficial/i)).toBeInTheDocument()
    expect(screen.getByText(/Exclusivo Móvil/i)).toBeInTheDocument()

    const shareBtn = screen.getByRole('button', { name: /Compartir vía WhatsApp \/ Sistema/i })
    fireEvent.click(shareBtn)

    expect(shareMock).toHaveBeenCalledTimes(1)
    const callArgs = shareMock.mock.calls[0][0]
    expect(callArgs.text).toContain('COMPROBANTE FINANCIERO OFICIAL')
    expect(callArgs.text).toContain('Cena de Celebración Proyecto')
    expect(callArgs.text).toMatch(/125\.000/)
    expect(callArgs.text).toContain('TX-TEST-101')
  })

  it('MobileShareReceiptCard usa fallback de portapapeles si navigator.share no está disponible', async () => {
    // Eliminar navigator.share
    Object.defineProperty(navigator, 'share', {
      writable: true,
      configurable: true,
      value: undefined,
    })

    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      configurable: true,
      value: { writeText: writeTextMock },
    })

    render(
      <LanguageProvider>
        <ToastProvider>
          <MobileShareReceiptCard
            movement={mockMovement}
            categoryName="Alimentación"
            currency="COP"
          />
        </ToastProvider>
      </LanguageProvider>
    )

    const shareBtn = screen.getByRole('button', { name: /Compartir vía WhatsApp \/ Sistema/i })
    fireEvent.click(shareBtn)

    expect(writeTextMock).toHaveBeenCalledTimes(1)
    const copiedText = writeTextMock.mock.calls[0][0]
    expect(copiedText).toContain('COMPROBANTE FINANCIERO OFICIAL')
    expect(copiedText).toMatch(/125\.000/)
  })
})
