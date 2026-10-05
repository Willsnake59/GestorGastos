import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Camera,
  CreditCard,
  Eye,
  Pencil,
  PiggyBank,
  Share2,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import type { Movement } from '../types'
import { formatCurrency } from '../utils/formatters'
import { Button } from '../components/common/Button'
import { IconButton } from '../components/common/IconButton'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Loader } from '../components/feedback/Loader'
import { MobileShareReceiptCard } from '../components/mobile/MobileShareReceiptCard'

export const MovementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getMovementById, categories, deleteMovement, settings } = useData()
  const {
    t,
    formatFullDate,
    getPaymentMethodLabel,
    formatMovementTitle,
    formatCategoryName,
    formatNotes,
  } = useLanguage()
  const { success, error: toastError, info } = useToast()

  const [movement, setMovement] = useState<Movement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    getMovementById(id)
      .then((res) => {
        setMovement(res)
      })
      .finally(() => setIsLoading(false))
  }, [id, getMovementById])

  if (isLoading) {
    return <Loader text={t('details.loading')} />
  }

  if (!movement) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-4)' }}>
        <h2>{t('details.notFound')}</h2>
        <p style={{ color: 'var(--text-muted)', margin: 'var(--space-4) 0' }}>
          {t('details.notFoundDesc')}
        </p>
        <Button variant="primary" onClick={() => navigate('/movements')}>
          {t('details.backBtn')}
        </Button>
      </div>
    )
  }

  const category = categories.find((c) => c.id === movement.categoryId)
  const isSavings = movement.type === 'savings_transfer'
  const isIncome = movement.type === 'income'
  const isDeposit = movement.transferDirection !== 'in'

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMovement(movement.id)
      success(t('details.deletedSuccess'))
      navigate('/movements')
    } catch {
      toastError(t('details.deleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleShare = async () => {
    const typeLabel = isIncome ? t('movements.income') : t('movements.expense')
    const shareText = `${typeLabel}: ${formatMovementTitle(movement.title)}\n${t('movements.colAmount')}: ${formatCurrency(movement.amount, settings.currency)}\n${t('movements.colDate')}: ${movement.date}\n${t('details.category')}: ${formatCategoryName(category) || 'General'}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: formatMovementTitle(movement.title),
          text: shareText,
        })
      } catch {
        // Ignored if cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      info(t('details.copiedClipboard'))
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Botón Volver y Acciones de Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={18} />} onClick={() => navigate('/movements')}>
          {t('common.back')}
        </Button>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <IconButton icon={<Share2 size={18} />} aria-label={t('details.shareAria')} onClick={handleShare} />
          <Link to={`/movements/${movement.id}/edit`}>
            <IconButton icon={<Pencil size={18} />} aria-label={t('details.editAria')} />
          </Link>
          <IconButton
            icon={<Trash2 size={18} />}
            aria-label={t('details.deleteAria')}
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          />
        </div>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: isSavings
                ? 'rgba(192, 132, 252, 0.15)'
                : isIncome
                ? 'var(--color-income-bg)'
                : 'var(--color-expense-bg)',
              color: isSavings
                ? 'var(--color-savings)'
                : isIncome
                ? 'var(--color-income)'
                : 'var(--color-expense)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isSavings ? (
              <PiggyBank size={28} />
            ) : isIncome ? (
              <ArrowUpRight size={28} />
            ) : (
              <ArrowDownRight size={28} />
            )}
          </div>
          <div>
            {isSavings ? (
              <Badge variant="savings">
                {isDeposit ? t('movements.savingsDeposit') : t('movements.savingsWithdrawal')}
              </Badge>
            ) : (
              <Badge variant={isIncome ? 'income' : 'expense'}>
                {isIncome ? t('movements.income') : t('movements.expense')}
              </Badge>
            )}
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>
              {formatMovementTitle(movement.title)}
            </h1>
          </div>
        </div>

        {/* Monto Destacado */}
        <div
          style={{
            padding: 'var(--space-5)',
            backgroundColor: 'var(--bg-surface-muted)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
            marginBottom: 'var(--space-6)',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            {t('details.txValue')}
          </span>
          <span
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: isSavings
                ? 'var(--color-savings)'
                : isIncome
                ? 'var(--color-income)'
                : 'var(--color-expense)',
            }}
          >
            {isSavings
              ? `${isDeposit ? '➔' : '↵'} ${formatCurrency(movement.amount, settings.currency)}`
              : `${isIncome ? '+' : '-'} ${formatCurrency(movement.amount, settings.currency)}`}
          </span>
        </div>

        {/* Atributos y Detalles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Tag size={16} />
              <span>{t('details.category')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {category && (
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: category.color,
                  }}
                />
              )}
              <strong style={{ fontSize: '0.95rem' }}>{formatCategoryName(category) || 'General'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <Calendar size={16} />
              <span>{t('details.effectiveDate')}</span>
            </div>
            <strong style={{ fontSize: '0.95rem' }}>{formatFullDate(movement.date)}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <CreditCard size={16} />
              <span>{t('details.paymentMethod')}</span>
            </div>
            <strong style={{ fontSize: '0.95rem' }}>
              {getPaymentMethodLabel(movement.paymentMethod)}
            </strong>
          </div>

          {movement.notes && (
            <div style={{ marginTop: 'var(--space-2)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
                {t('details.notes')}
              </span>
              <p
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--bg-surface-muted)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {formatNotes(movement.notes)}
              </p>
            </div>
          )}

          {/* Comprobante Físico Escaneado con Cámara Móvil */}
          {movement.receiptImage && (
            <div
              style={{
                marginTop: 'var(--space-2)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--bg-surface-muted)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={16} color="#eab308" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    {t('mobileFeatures.receiptAttached')}
                  </span>
                </div>
                <span className="mobile-exclusive-badge">{t('mobileFeatures.exclusiveBadge')}</span>
              </div>

              <div
                onClick={() => setIsZoomOpen(true)}
                style={{
                  position: 'relative',
                  width: '100%',
                  maxHeight: '220px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  backgroundColor: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={movement.receiptImage}
                  alt="Comprobante Físico"
                  style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Eye size={14} />
                  <span>{t('mobileFeatures.viewReceipt')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acciones al pie */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-8)' }}>
          <Button
            variant="outline"
            isFullWidth
            icon={<Pencil size={16} />}
            onClick={() => navigate(`/movements/${movement.id}/edit`)}
          >
            {t('details.editBtn')}
          </Button>
          <Button
            variant="danger"
            icon={<Trash2 size={16} />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            {t('details.deleteBtn')}
          </Button>
        </div>
      </Card>

      {/* Tarjeta de Compartir Comprobante Exclusiva para Móvil */}
      <MobileShareReceiptCard
        movement={movement}
        categoryName={formatCategoryName(category)}
        currency={settings.currency}
      />

      {/* Modal Zoom de Comprobante */}
      {isZoomOpen && movement.receiptImage && (
        <div
          className="modal-overlay"
          role="presentation"
          onClick={() => setIsZoomOpen(false)}
          style={{ zIndex: 1200, padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          <div
            className="modal-content"
            role="dialog"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              aria-label="Cerrar vista previa"
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#fff',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>
            <img
              src={movement.receiptImage}
              alt="Comprobante Ampliado"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8)',
              }}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={t('details.deleteConfirmTitle')}
        message={t('details.deleteConfirmMsg', { title: formatMovementTitle(movement.title) })}
        confirmText={t('details.deleteConfirmAction')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
