import React from 'react'

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', text = 'Cargando información...' }) => {
  const dim = size === 'sm' ? 24 : size === 'lg' ? 48 : 36

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
        gap: 'var(--space-3)',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: `${dim}px`,
          height: `${dim}px`,
          border: '3px solid var(--border-medium)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
        aria-hidden="true"
      />
      {text && <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{text}</span>}
    </div>
  )
}

export const Skeleton: React.FC<{ width?: string; height?: string; borderRadius?: string }> = ({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--radius-md)',
}) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg-surface-muted)',
        animation: 'pulseGlow 1.5s ease-in-out infinite',
      }}
      aria-hidden="true"
    />
  )
}
