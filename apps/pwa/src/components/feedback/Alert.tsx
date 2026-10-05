import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  onDismiss?: () => void
  action?: React.ReactNode
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onDismiss,
  action,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} color="var(--color-income)" />
      case 'warning':
        return <AlertTriangle size={20} color="var(--color-debt)" />
      case 'error':
        return <AlertCircle size={20} color="var(--color-expense)" />
      default:
        return <Info size={20} color="var(--color-primary)" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: 'var(--color-income-bg)', border: 'rgba(16, 185, 129, 0.3)' }
      case 'warning':
        return { bg: 'var(--color-debt-bg)', border: 'rgba(245, 158, 11, 0.3)' }
      case 'error':
        return { bg: 'var(--color-expense-bg)', border: 'rgba(239, 68, 68, 0.3)' }
      default:
        return { bg: 'rgba(5, 150, 105, 0.12)', border: 'rgba(5, 150, 105, 0.3)' }
    }
  }

  const { bg, border } = getColors()

  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-4)',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{getIcon()}</div>
      <div style={{ flex: 1 }}>
        {title && (
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.2rem' }}>
            {title}
          </h3>
        )}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          {children}
        </div>
        {action && <div style={{ marginTop: 'var(--space-3)' }}>{action}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar aviso"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
