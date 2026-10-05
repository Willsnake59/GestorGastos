import React from 'react'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string
  icon: React.ReactNode
  variant?: 'ghost' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md'
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <button
      className={`icon-btn ${variant !== 'ghost' ? `btn-${variant}` : ''} ${size === 'sm' ? 'btn-sm' : ''} ${className}`.trim()}
      aria-label={ariaLabel}
      title={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  )
}
