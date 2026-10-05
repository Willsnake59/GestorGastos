import React from 'react'
import { WifiOff } from 'lucide-react'
import { usePWA } from '../../hooks/usePWA'
import { useLanguage } from '../../context/LanguageContext'

export const OfflineBanner: React.FC = () => {
  const { isOnline } = usePWA()
  const { t } = useLanguage()

  if (isOnline) return null

  return (
    <div
      className="pwa-banner pwa-offline-banner animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <WifiOff size={18} color="var(--color-expense)" />
        <span>{t('pwa.offlineBanner')}</span>
      </div>
    </div>
  )
}
