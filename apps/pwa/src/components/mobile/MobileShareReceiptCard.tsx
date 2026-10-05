import React from 'react'
import { Share2, Smartphone } from 'lucide-react'
import type { Movement, CurrencyCode } from '../../types'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../context/ToastContext'
import { triggerHaptic } from '../../utils/haptics'
import { formatCurrency } from '../../utils/formatters'
import { Button } from '../common/Button'

export interface MobileShareReceiptCardProps {
  movement: Movement
  categoryName?: string
  currency: CurrencyCode
}

export const MobileShareReceiptCard: React.FC<MobileShareReceiptCardProps> = ({
  movement,
  categoryName,
  currency,
}) => {
  const { t, formatMovementTitle, getPaymentMethodLabel, formatFullDate } = useLanguage()
  const { success, info } = useToast()

  const handleShare = async () => {
    triggerHaptic('medium')

    const isSavings = movement.type === 'savings_transfer'
    const isDeposit = movement.transferDirection !== 'in'
    const typeLabel =
      movement.type === 'income'
        ? t('movements.income')
        : movement.type === 'expense'
          ? t('movements.expense')
          : isSavings
            ? (isDeposit ? t('movements.savingsDeposit') : t('movements.savingsWithdrawal'))
            : 'Transferencia'

    const formattedAmount = formatCurrency(movement.amount, currency)
    const formattedDate = formatFullDate(movement.date)
    const paymentMethodLabel = getPaymentMethodLabel(movement.paymentMethod)
    const refCode = movement.id.replace('mov-', 'TX-').toUpperCase()

    // Formato de comprobante oficial ejecutivo para WhatsApp / Mensajes
    const receiptText = [
      '🏛️ COMPROBANTE FINANCIERO OFICIAL',
      '────────────────────────────',
      `🏷️ ${t('movements.colDescription')}: ${formatMovementTitle(movement.title)}`,
      `💰 ${t('movements.colAmount')}: ${formattedAmount} (${typeLabel})`,
      `📅 ${t('movements.colDate')}: ${formattedDate}`,
      `💳 ${t('forms.paymentMethod')}: ${paymentMethodLabel}`,
      `📂 ${t('details.category')}: ${categoryName || 'General'}`,
      `🆔 Ref: ${refCode}`,
      movement.notes ? `📝 Nota: ${movement.notes}` : '',
      '────────────────────────────',
      '📱 Gestor Gastos PWA - Finanzas Personales Seguras',
    ]
      .filter(Boolean)
      .join('\n')

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t('mobileFeatures.shareCardTitle')} - ${formatMovementTitle(movement.title)}`,
          text: receiptText,
        })
        triggerHaptic('success')
        success(t('mobileFeatures.sharedSuccess'))
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          await copyToClipboardFallback(receiptText)
        }
      }
    } else {
      await copyToClipboardFallback(receiptText)
    }
  }

  const copyToClipboardFallback = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      triggerHaptic('success')
      info(t('details.copiedClipboard'))
    } catch {
      // Ignored
    }
  }

  return (
    <div className="mobile-exclusive-card mobile-only-feature">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Smartphone size={16} color="#eab308" />
          <span className="mobile-exclusive-badge">{t('mobileFeatures.exclusiveBadge')}</span>
        </div>
      </div>

      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {t('mobileFeatures.shareCardTitle')}
        </h4>
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {t('mobileFeatures.shareCardDesc')}
        </p>
      </div>

      <Button
        variant="primary"
        isFullWidth
        icon={<Share2 size={18} />}
        onClick={handleShare}
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          fontWeight: 700,
          border: 'none',
          boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
        }}
      >
        {t('mobileFeatures.shareBtn')}
      </Button>
    </div>
  )
}
