import React from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '../common/Button'
import { usePWA } from '../../hooks/usePWA'
import { useLanguage } from '../../context/LanguageContext'

export const UpdateAvailableBanner: React.FC = () => {
  const { needRefresh, updateServiceWorker, closeNeedRefresh } = usePWA()
  const { t } = useLanguage()

  if (!needRefresh) return null

  return (
    <div
      className="pwa-banner pwa-update-banner animate-fade-in"
      role="alert"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Sparkles size={18} color="var(--color-primary)" />
        <span>{t('pwa.updateAvailable')}</span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button
          size="sm"
          variant="outline"
          onClick={closeNeedRefresh}
        >
          {t('pwa.updateLater')}
        </Button>
        <Button
          size="sm"
          variant="primary"
          icon={<RefreshCw size={14} />}
          onClick={() => updateServiceWorker(true)}
        >
          {t('pwa.updateNow')}
        </Button>
      </div>
    </div>
  )
}
