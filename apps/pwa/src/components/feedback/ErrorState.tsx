import React from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'
import { Button } from '../common/Button'
import { useLanguage } from '../../context/LanguageContext'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
}) => {
  const { t } = useLanguage()
  const displayTitle = title || t('common.errorTitle')
  const displayMessage = message || t('common.errorDesc')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-10) var(--space-4)',
        textAlign: 'center',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
      }}
      role="alert"
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-expense-bg)',
          color: 'var(--color-expense)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
        }}
        aria-hidden="true"
      >
        <AlertOctagon size={32} />
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
        {displayTitle}
      </h3>
      <p
        style={{
          fontSize: '0.925rem',
          color: 'var(--text-secondary)',
          maxWidth: '420px',
          marginBottom: onRetry ? 'var(--space-6)' : 0,
          lineHeight: 1.5,
        }}
      >
        {displayMessage}
      </p>
      {onRetry && (
        <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}
