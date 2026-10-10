import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Camera, Check, DollarSign, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import type { Movement, MovementType } from '../types'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Select } from '../components/common/Select'
import { Textarea } from '../components/common/Textarea'
import { Card } from '../components/common/Card'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Loader } from '../components/feedback/Loader'

export const MovementEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getMovementById, categories, updateMovement } = useData()
  const { t, formatCategoryName, getPaymentMethodLabel } = useLanguage()
  const { success, error: toastError } = useToast()

  const [initialMovement, setInitialMovement] = useState<Movement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [type, setType] = useState<MovementType>('expense')
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'debit_card' | 'transfer' | 'other'>('cash')
  const [notes, setNotes] = useState('')
  const [receiptImage, setReceiptImage] = useState<string | null>(null)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    if (!id) return
    getMovementById(id)
      .then((mov) => {
        if (mov) {
          setInitialMovement(mov)
          setType(mov.type)
          setTitle(mov.title)
          setAmount(mov.amount.toString())
          setCategoryId(mov.categoryId)
          setDate(mov.date)
          setPaymentMethod(mov.paymentMethod)
          setNotes(mov.notes || '')
          setReceiptImage(mov.receiptImage || null)
        }
      })
      .finally(() => setIsLoading(false))
  }, [id, getMovementById])

  const hasChanges = Boolean(
    initialMovement &&
      (type !== initialMovement.type ||
        title !== initialMovement.title ||
        amount !== initialMovement.amount.toString() ||
        categoryId !== initialMovement.categoryId ||
        date !== initialMovement.date ||
        paymentMethod !== initialMovement.paymentMethod ||
        notes !== (initialMovement.notes || '') ||
        receiptImage !== (initialMovement.receiptImage || null))
  )

  const handleCancel = () => {
    if (hasChanges) {
      setShowExitConfirm(true)
    } else {
      navigate(-1)
    }
  }

  const validateField = (field: string, value: string) => {
    const nextErrors = { ...errors }

    switch (field) {
      case 'title':
        if (!value.trim()) {
          nextErrors.title = t('forms.valTitleRequired')
        } else if (value.trim().length < 3) {
          nextErrors.title = t('forms.valTitleMin')
        } else {
          delete nextErrors.title
        }
        break

      case 'amount': {
        const num = parseFloat(value)
        if (!value || isNaN(num)) {
          nextErrors.amount = t('forms.valAmountValid')
        } else if (num <= 0) {
          nextErrors.amount = t('forms.valAmountPositive')
        } else {
          delete nextErrors.amount
        }
        break
      }

      case 'categoryId':
        if (!value) {
          nextErrors.categoryId = t('forms.valCategoryRequired')
        } else {
          delete nextErrors.categoryId
        }
        break

      case 'date':
        if (!value) {
          nextErrors.date = t('forms.valDateRequired')
        } else {
          delete nextErrors.date
        }
        break

      default:
        break
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !initialMovement) return

    const isValidTitle = validateField('title', title)
    const isValidAmount = validateField('amount', amount)
    const isValidCategory = validateField('categoryId', categoryId)
    const isValidDate = validateField('date', date)

    if (!isValidTitle || !isValidAmount || !isValidCategory || !isValidDate) {
      toastError(t('forms.fixErrors'))
      return
    }

    setIsSubmitting(true)
    try {
      await updateMovement(id, {
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        categoryId,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
        receiptImage: receiptImage || undefined,
      })

      success(t('forms.updatedSuccess'))
      navigate(`/movements/${id}`)
    } catch {
      toastError(t('forms.updateError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <Loader text={t('forms.loadingEdit')} />
  }

  if (!initialMovement) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-4)' }}>
        <h2>{t('details.notFound')}</h2>
        <Button variant="primary" onClick={() => navigate('/movements')}>
          {t('details.backBtn')}
        </Button>
      </div>
    )
  }

  const availableCategories = categories.filter((c) => c.type === type || c.type === 'both')

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={18} />} onClick={handleCancel}>
          {t('common.cancel')}
        </Button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('common.edit')}</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          {/* Selector de Tipo */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              {t('forms.movementType')}
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-2)',
                backgroundColor: 'var(--bg-surface-muted)',
                padding: '4px',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <button
                type="button"
                onClick={() => setType('expense')}
                style={{
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  backgroundColor: type === 'expense' ? 'var(--color-expense)' : 'transparent',
                  color: type === 'expense' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {t('forms.expense')}
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                style={{
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  backgroundColor: type === 'income' ? 'var(--color-income)' : 'transparent',
                  color: type === 'income' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {t('forms.income')}
              </button>
            </div>
          </div>

          <Input
            label={t('forms.amount')}
            type="number"
            inputMode="decimal"
            pattern="[0-9]*"
            step="any"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              validateField('amount', e.target.value)
            }}
            error={errors.amount}
            leftIcon={<DollarSign size={18} />}
            required
          />

          <Input
            label={t('forms.descriptionEdit')}
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              validateField('title', e.target.value)
            }}
            error={errors.title}
            required
          />

          <Select
            label={t('forms.category')}
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              validateField('categoryId', e.target.value)
            }}
            error={errors.categoryId}
            options={availableCategories.map((c) => ({ value: c.id, label: formatCategoryName(c) }))}
            required
          />

          <Input
            label={t('forms.date')}
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              validateField('date', e.target.value)
            }}
            error={errors.date}
            required
          />

          <Select
            label={t('forms.paymentMethod')}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as Movement['paymentMethod'])}
            options={[
              { value: 'cash', label: getPaymentMethodLabel('cash') },
              { value: 'debit_card', label: getPaymentMethodLabel('debit_card') },
              { value: 'credit_card', label: getPaymentMethodLabel('credit_card') },
              { value: 'transfer', label: getPaymentMethodLabel('transfer') },
              { value: 'other', label: getPaymentMethodLabel('other') },
            ]}
          />

          <Textarea
            label={t('forms.notesEdit')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          {receiptImage && (
            <div
              style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface-muted)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={receiptImage}
                  alt="Comprobante"
                  style={{
                    width: '56px',
                    height: '56px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {t('mobileFeatures.receiptAttached')}
                    </span>
                    <span className="mobile-exclusive-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Camera size={12} />
                      {t('mobileFeatures.exclusiveBadge')}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Comprobante digitalizado vinculado a este movimiento
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Trash2 size={16} />}
                onClick={() => setReceiptImage(null)}
                aria-label="Quitar foto de comprobante"
              >
                {t('common.delete')}
              </Button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isFullWidth
              isLoading={isSubmitting}
              icon={<Check size={18} />}
            >
              {t('forms.saveChanges')}
            </Button>
          </div>
        </form>
      </Card>

      <ConfirmDialog
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={() => navigate(-1)}
        title={t('forms.discardTitle')}
        message={t('forms.discardMsg')}
        confirmText={t('forms.discardConfirm')}
        cancelText={t('forms.discardCancel')}
        variant="danger"
      />
    </div>
  )
}
