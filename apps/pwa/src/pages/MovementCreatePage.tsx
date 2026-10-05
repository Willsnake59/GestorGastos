import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, DollarSign } from 'lucide-react'
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

export const MovementCreatePage: React.FC = () => {
  const navigate = useNavigate()
  const { t, formatCategoryName, getPaymentMethodLabel } = useLanguage()
  const [searchParams] = useSearchParams()
  const initialType: MovementType = searchParams.get('type') === 'income' ? 'income' : 'expense'

  const { categories, createMovement } = useData()
  const { success, error: toastError } = useToast()

  const [type, setType] = useState<MovementType>(initialType)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card' | 'debit_card' | 'transfer' | 'other'>('cash')
  const [notes, setNotes] = useState('')

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

      <Card>
        <form onSubmit={handleSubmit}>
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
    </div>
  )
}
