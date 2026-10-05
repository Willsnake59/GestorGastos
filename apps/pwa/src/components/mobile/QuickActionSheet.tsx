import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  X,
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { triggerHaptic } from '../../utils/haptics'

export interface QuickActionSheetProps {
  isOpen: boolean
  onClose: () => void
}

export const QuickActionSheet: React.FC<QuickActionSheetProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef<number | null>(null)
  const currentTranslateY = useRef<number>(0)

  useEffect(() => {
    if (isOpen) {
      triggerHaptic('medium')
      document.body.style.overflow = 'hidden'

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handleKeyDown)

      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleAction = (path: string) => {
    triggerHaptic('light')
    onClose()
    navigate(path)
  }

  // Gestos táctiles para arrastrar hacia abajo y cerrar
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY
    currentTranslateY.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null || !sheetRef.current) return
    const deltaY = e.touches[0].clientY - dragStartY.current
    if (deltaY > 0) {
      // Solo permitir arrastrar hacia abajo
      currentTranslateY.current = deltaY
      sheetRef.current.style.transform = `translateY(${deltaY}px)`
      sheetRef.current.style.transition = 'none'
    }
  }

  const handleTouchEnd = () => {
    if (dragStartY.current === null || !sheetRef.current) return
    const shouldClose = currentTranslateY.current > 80

    sheetRef.current.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'

    if (shouldClose) {
      triggerHaptic('light')
      sheetRef.current.style.transform = 'translateY(100%)'
      setTimeout(onClose, 200)
    } else {
      sheetRef.current.style.transform = 'translateY(0px)'
    }

    dragStartY.current = null
    currentTranslateY.current = 0
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          triggerHaptic('light')
          onClose()
        }
      }}
      role="presentation"
      style={{
        alignItems: 'flex-end',
        padding: 0,
      }}
    >
      <div
        ref={sheetRef}
        className="drawer-content mobile-quick-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Acciones rápidas financieras"
        tabIndex={-1}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '100%',
          borderRadius: '24px 24px 0 0',
          padding: '1.25rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom, 0px)) 1.25rem',
          backgroundColor: 'var(--bg-surface)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.36)',
          borderTop: '1px solid var(--border-subtle)',
          touchAction: 'pan-y',
        }}
      >
        {/* Manija táctil de arrastre */}
        <div
          className="drawer-drag-handle"
          style={{
            width: '44px',
            height: '5px',
            backgroundColor: 'var(--border-medium)',
            borderRadius: '9999px',
            margin: '0 auto 1.25rem auto',
            cursor: 'grab',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
              {t('quick.title')}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {t('quick.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light')
              onClose()
            }}
            aria-label={t('common.cancel')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuadrícula de opciones tipo App Nativa */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          }}
        >
          {/* 1. Registrar Gasto */}
          <button
            type="button"
            onClick={() => handleAction('/movements/new?type=expense')}
            className="quick-action-btn"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.22)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 0.1s ease, background-color 0.15s ease',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-expense)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
              }}
            >
              <ArrowDownRight size={22} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block', color: 'var(--text-primary)' }}>
                {t('quick.newExpense')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('quick.newExpenseDesc')}
              </span>
            </div>
          </button>

          {/* 2. Registrar Ingreso */}
          <button
            type="button"
            onClick={() => handleAction('/movements/new?type=income')}
            className="quick-action-btn"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(5, 150, 105, 0.08)',
              border: '1px solid rgba(5, 150, 105, 0.22)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 0.1s ease, background-color 0.15s ease',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-income)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
              }}
            >
              <ArrowUpRight size={22} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block', color: 'var(--text-primary)' }}>
                {t('quick.newIncome')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('quick.newIncomeDesc')}
              </span>
            </div>
          </button>

          {/* 3. Registrar Deuda / Préstamo */}
          <button
            type="button"
            onClick={() => handleAction('/debts')}
            className="quick-action-btn"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(37, 99, 235, 0.22)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 0.1s ease, background-color 0.15s ease',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              }}
            >
              <CreditCard size={22} strokeWidth={2} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block', color: 'var(--text-primary)' }}>
                {t('quick.debtControl')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('quick.debtControlDesc')}
              </span>
            </div>
          </button>

          {/* 4. Metas de Ahorro */}
          <button
            type="button"
            onClick={() => handleAction('/savings')}
            className="quick-action-btn"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(217, 119, 6, 0.08)',
              border: '1px solid rgba(217, 119, 6, 0.22)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 0.1s ease, background-color 0.15s ease',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-savings)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
              }}
            >
              <PiggyBank size={22} strokeWidth={2} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block', color: 'var(--text-primary)' }}>
                {t('quick.savingsGoal')}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('quick.savingsGoalDesc')}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
