import React from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--color-income)" />
      case 'error':
        return <AlertCircle size={18} color="var(--color-expense)" />
      case 'warning':
        return <AlertTriangle size={18} color="var(--color-debt)" />
      default:
        return <Info size={18} color="var(--color-primary)" />
    }
  }

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
          <div style={{ flexShrink: 0 }}>{getIcon(toast.type)}</div>
          <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{toast.message}</div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            aria-label="Cerrar notificación"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
