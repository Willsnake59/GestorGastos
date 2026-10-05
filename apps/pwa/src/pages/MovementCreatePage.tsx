import React, { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
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
import { triggerHaptic } from '../utils/haptics'
import { MobileReceiptScannerModal, type ScannedReceiptData } from '../components/mobile/MobileReceiptScannerModal'

export const MovementCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as { scannedData?: ScannedReceiptData } | null
  const { t, formatCategoryName, getPaymentMethodLabel } = useLanguage()
  const [searchParams] = useSearchParams()
  const initialType: MovementType = searchParams.get('type') === 'income' ? 'income' : 'expense'

  const { categories, createMovement } = useData()
  const { success, error: toastError } = useToast()

  const [type, setType] = useState<MovementType>(initialType)
  const [title, setTitle] = useState(locationState?.scannedData?.title ?? '')
  const [amount, setAmount] = useState(
    locationState?.scannedData?.amount ? String(locationState.scannedData.amount) : ''
  )
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'debit_card' | 'transfer' | 'other'>('cash')
  const [notes, setNotes] = useState(locationState?.scannedData?.notes ?? '')
  const [receiptImage, setReceiptImage] = useState<string | null>(
    locationState?.scannedData?.image ?? null
  )
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Categorías filtradas por tipo seleccionado
  const availableCategories = categories.filter((c) => c.type === type || c.type === 'both')

  // Validación en tiempo real
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

  const handleScanComplete = (scannedData: ScannedReceiptData) => {
    setReceiptImage(scannedData.image)
    if (scannedData.amount) {
      setAmount(String(scannedData.amount))
    }
    if (scannedData.title && !title) {
      setTitle(scannedData.title)
    }
    if (scannedData.notes && !notes) {
      setNotes(scannedData.notes)
    }
    setIsScannerOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValidTitle = validateField('title', title)
    const isValidAmount = validateField('amount', amount)
    const selectedCat = categoryId || (availableCategories[0]?.id ?? '')
    const isValidCategory = validateField('categoryId', selectedCat)
    const isValidDate = validateField('date', date)

    if (!isValidTitle || !isValidAmount || !isValidCategory || !isValidDate) {
      triggerHaptic('error')
      toastError(t('forms.fixErrors'))
      return
    }

    setIsSubmitting(true)
    try {
      const created = await createMovement({
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        categoryId: selectedCat,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
        receiptImage: receiptImage || undefined,
      })

      triggerHaptic('success')
      success(t('forms.savedSuccess', { type: type === 'income' ? t('forms.income') : t('forms.expense') }))
      navigate(`/movements/${created.id}`)
    } catch {
      triggerHaptic('error')
      toastError(t('forms.saveError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Botón Volver y Título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={18} />} onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('movements.newBtn')}</h1>
      </div>

      {/* Botón de Escáner de Cámara Exclusivo Móvil */}
      <div className="mobile-only-feature">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium')
            setIsScannerOpen(true)
          }}
          className="quick-action-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(212, 160, 23, 0.04) 100%)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            textAlign: 'left',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(234, 179, 8, 0.2)',
              border: '1px solid rgba(234, 179, 8, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#facc15',
              flexShrink: 0,
            }}
          >
            <Camera size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {t('mobileFeatures.scannerBtn')}
              </span>
              <span className="mobile-exclusive-badge">{t('mobileFeatures.exclusiveBadge')}</span>
            </div>
            <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
              {t('mobileFeatures.scannerBtnDesc')}
            </span>
          </div>
        </button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          {/* Previsualización del Ticket Capturado */}
          {receiptImage && (
            <div
              style={{
                marginBottom: 'var(--space-6)',
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
                  alt="Ticket Escaneado"
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
                    <span className="mobile-exclusive-badge">{t('mobileFeatures.exclusiveBadge')}</span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Foto lista para ser guardada con este gasto
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light')
                  setReceiptImage(null)
                }}
                aria-label="Eliminar comprobante"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-expense)',
                  cursor: 'pointer',
                  padding: '6px',
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
          {/* Selector de Tipo (Gasto vs Ingreso) */}
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
                onClick={() => {
                  triggerHaptic('light')
                  setType('expense')
                  setCategoryId('')
                }}
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
                onClick={() => {
                  triggerHaptic('light')
                  setType('income')
                  setCategoryId('')
                }}
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

          {/* Campo Monto */}
          <Input
            label={t('forms.amount')}
            type="number"
            inputMode="decimal"
            pattern="[0-9]*"
            step="any"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              validateField('amount', e.target.value)
            }}
            error={errors.amount}
            leftIcon={<DollarSign size={18} />}
            helperText={t('forms.amountHelp')}
            required
          />

          {/* Campo Descripción */}
          <Input
            label={t('forms.description')}
            type="text"
            placeholder={t('forms.descPlaceholder')}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              validateField('title', e.target.value)
            }}
            error={errors.title}
            required
          />

          {/* Campo Categoría */}
          <Select
            label={t('forms.category')}
            value={categoryId || availableCategories[0]?.id || ''}
            onChange={(e) => {
              setCategoryId(e.target.value)
              validateField('categoryId', e.target.value)
            }}
            error={errors.categoryId}
            options={availableCategories.map((c) => ({ value: c.id, label: formatCategoryName(c) }))}
            required
          />

          {/* Campo Fecha */}
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

          {/* Método de pago */}
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

          {/* Notas u observaciones */}
          <Textarea
            label={t('forms.notes')}
            placeholder={t('forms.notesPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
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
              {t('forms.saveMovement')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Modal Escáner Móvil */}
      <MobileReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />
    </div>
  )
}
