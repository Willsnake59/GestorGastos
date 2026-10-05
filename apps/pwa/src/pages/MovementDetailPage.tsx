import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Pencil,
  PiggyBank,
  Share2,
  Tag,
  Trash2,
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
