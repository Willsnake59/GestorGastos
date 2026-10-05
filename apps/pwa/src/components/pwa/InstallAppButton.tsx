import React from 'react'
import { Download, Smartphone } from 'lucide-react'
import { Button } from '../common/Button'
import { IconButton } from '../common/IconButton'
import { usePWA } from '../../hooks/usePWA'
import { useLanguage } from '../../context/LanguageContext'

export const InstallAppButton: React.FC<{
  variant?: 'button' | 'banner' | 'icon'
  className?: string
}> = ({ variant = 'button', className = '' }) => {
  const { canInstall, isInstalled, promptInstall } = usePWA()
  const { t } = useLanguage()

  if (isInstalled || !canInstall) return null

  if (variant === 'icon') {
    return (
      <IconButton
        icon={<Download size={19} />}
        aria-label={t('pwa.installAria')}
        title={t('pwa.installTitle')}
        onClick={promptInstall}
        className={className}
      />
    )
  }

  if (variant === 'banner') {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--color-primary-bg, rgba(5, 150, 105, 0.1))',
          border: '1px solid rgba(5, 150, 105, 0.25)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-4)',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              padding: '8px',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
            }}
          >
            <Smartphone size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('pwa.installBannerTitle')}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('pwa.installBannerDesc')}
            </p>
          </div>
        </div>
        <Button size="sm" variant="primary" icon={<Download size={16} />} onClick={promptInstall}>
          {t('pwa.installNow')}
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      icon={<Download size={16} />}
      onClick={promptInstall}
      title={t('pwa.installAria')}
      className={className}
    >
      {t('pwa.installBtn')}
    </Button>
  )
}
