import React, { useState } from 'react'
import {
  Calendar,
  CreditCard,
  DollarSign,
  Plus,
  Trash2,
  User,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import type { Debt, DebtType } from '../types'
import { formatCurrency } from '../utils/formatters'
import { Button } from '../components/common/Button'
import { IconButton } from '../components/common/IconButton'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { Input } from '../components/common/Input'
import { Select } from '../components/common/Select'
import { Textarea } from '../components/common/Textarea'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/feedback/EmptyState'

export const DebtsPage: React.FC = () => {
  const { debts, createDebt, addDebtPayment, deleteDebt, settings } = useData()
  const { t, formatDate, formatDebtTitle, formatNotes } = useLanguage()
  const { success, error: toastError } = useToast()

  const [activeTab, setActiveTab] = useState<DebtType>('payable')

  // Modales
  const [isNewDebtOpen, setIsNewDebtOpen] = useState(false)
  const [debtToPay, setDebtToPay] = useState<Debt | null>(null)
  const [debtToDelete, setDebtToDelete] = useState<Debt | null>(null)

  // Formulario nueva deuda
  const [newTitle, setNewTitle] = useState('')
  const [newContact, setNewContact] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newType, setNewType] = useState<DebtType>('payable')
  const [newNotes, setNewNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Formulario de abono
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)

  const filteredDebts = debts.filter((d) => d.type === activeTab)
  const totalPayable = debts
    .filter((d) => d.type === 'payable' && d.status !== 'paid')
    .reduce((sum, d) => sum + d.remainingAmount, 0)
  const totalReceivable = debts
    .filter((d) => d.type === 'receivable' && d.status !== 'paid')
    .reduce((sum, d) => sum + d.remainingAmount, 0)

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContact.trim() || !newAmount || !newDueDate) {
      toastError(t('debts.requiredFields'))
      return
    }

    const amt = parseFloat(newAmount)
    if (isNaN(amt) || amt <= 0) {
      toastError(t('debts.amountPositive'))
      return
    }

    setIsSubmitting(true)
    try {
      await createDebt({
        title: newTitle.trim(),
        contactName: newContact.trim(),
        contactPhone: newPhone.trim() || undefined,
        totalAmount: amt,
        remainingAmount: amt,
        dueDate: newDueDate,
        type: newType,
        status: 'pending',
        notes: newNotes.trim() || undefined,
      })

      success(t('debts.createdSuccess'))
      setIsNewDebtOpen(false)
      setNewTitle('')
      setNewContact('')
      setNewPhone('')
      setNewAmount('')
      setNewDueDate('')
      setNewNotes('')
    } catch {
      toastError(t('debts.createError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!debtToPay) return

    const amt = parseFloat(paymentAmount)
    if (isNaN(amt) || amt <= 0) {
      toastError(t('debts.paymentPositive'))
      return
    }

    if (amt > debtToPay.remainingAmount) {
      toastError(t('debts.paymentExceeds'))
      return
    }

    setIsSubmittingPayment(true)
    try {
      await addDebtPayment(debtToPay.id, amt, paymentNotes.trim() || undefined)
      success(t('debts.paymentSuccess'))
      setDebtToPay(null)
      setPaymentAmount('')
      setPaymentNotes('')
    } catch {
      toastError(t('debts.paymentError'))
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  const handleDeleteDebt = async () => {
    if (!debtToDelete) return
    try {
      await deleteDebt(debtToDelete.id)
      success(t('debts.deleteSuccess'))
      setDebtToDelete(null)
    } catch {
      toastError(t('debts.deleteError'))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Cabecera */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <span className="category-eyebrow" style={{ display: 'block', marginBottom: '4px' }}>
            {t('debts.eyebrow')}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 2.5rem)',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              color: 'var(--slash-paper-white)',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {t('debts.title')}
          </h1>
          <p style={{ color: 'var(--slash-silver)', fontSize: '0.925rem', marginTop: '6px' }}>
            {t('debts.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={18} />}
          onClick={() => {
            setNewType(activeTab)
            setIsNewDebtOpen(true)
          }}
        >
          {t('debts.newBtn')}
        </Button>
      </div>

      {/* Tarjetas de Resumen KPI */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {t('debts.totalPayable')}
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-debt-bg)',
                color: 'var(--color-debt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={18} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: 'var(--color-debt)',
              }}
            >
              {formatCurrency(totalPayable, settings.currency)}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t('debts.totalPayableDesc')}
          </p>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {t('debts.totalReceivable')}
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-income-bg)',
                color: 'var(--color-income)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                color: 'var(--color-income)',
              }}
            >
              {formatCurrency(totalReceivable, settings.currency)}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t('debts.totalReceivableDesc')}
          </p>
        </Card>
      </div>

      {/* Selector de Pestañas: Por Pagar vs Por Cobrar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'var(--bg-surface-muted)',
          borderRadius: 'var(--radius-lg)',
          padding: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('payable')}
          style={{
            padding: '0.75rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'payable' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'payable' ? 'var(--color-debt)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'payable' ? 'var(--shadow-sm)' : 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          {t('debts.tabPayable')} ({debts.filter((d) => d.type === 'payable' && d.status !== 'paid').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('receivable')}
          style={{
            padding: '0.75rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'receivable' ? 'var(--bg-surface)' : 'transparent',
            color: activeTab === 'receivable' ? 'var(--color-income)' : 'var(--text-secondary)',
            boxShadow: activeTab === 'receivable' ? 'var(--shadow-sm)' : 'none',
            transition: 'all var(--transition-fast)',
          }}
        >
          {t('debts.tabReceivable')} ({debts.filter((d) => d.type === 'receivable' && d.status !== 'paid').length})
        </button>
      </div>

      {/* Listado de Deudas */}
      {filteredDebts.length === 0 ? (
        <EmptyState
          title={activeTab === 'payable' ? t('debts.noDebtsPayable') : t('debts.noDebtsReceivable')}
          description={
            activeTab === 'payable'
              ? t('debts.noDebtsPayableDesc')
              : t('debts.noDebtsReceivableDesc')
          }
          actionLabel={t('debts.registerDebtAction')}
          onAction={() => {
            setNewType(activeTab)
            setIsNewDebtOpen(true)
          }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {filteredDebts.map((debt) => {
            const isPaid = debt.status === 'paid'
            const percentPaid = debt.totalAmount > 0
              ? Math.min(100, Math.round(((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100))
              : 0

            return (
              <Card key={debt.id}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatDebtTitle(debt.title)}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <User size={14} />
                      <span>{formatNotes(debt.contactName)}</span>
                      {debt.contactPhone && <span>({debt.contactPhone})</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <Badge variant={isPaid ? 'income' : debt.status === 'partially_paid' ? 'debt' : 'neutral'}>
                      {isPaid ? t('debts.statusSettled') : debt.status === 'partially_paid' ? t('debts.statusInstallments') : t('debts.statusPending')}
                    </Badge>
                    <IconButton
                      icon={<Trash2 size={16} />}
                      aria-label={t('debts.deleteAria')}
                      size="sm"
                      variant="ghost"
                      onClick={() => setDebtToDelete(debt)}
                    />
                  </div>
                </div>

                {/* Montos y progreso */}
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: 'var(--space-3) 0' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {t('debts.pendingAmount')}
                    </span>
                    <strong style={{ fontSize: '1.25rem', color: isPaid ? 'var(--color-income)' : 'var(--color-debt)' }}>
                      {formatCurrency(debt.remainingAmount, settings.currency)}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {t('debts.initialTotal')}
                    </span>
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      {formatCurrency(debt.totalAmount, settings.currency)}
                    </span>
                  </div>
                </div>

                {/* Barra de Progreso de Pago */}
                <div style={{ margin: 'var(--space-3) 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: 'var(--text-muted)' }}>
                    <span>{t('debts.progress')} ({percentPaid}%)</span>
                    <span>{t('debts.paid')} {formatCurrency(debt.totalAmount - debt.remainingAmount, settings.currency)}</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'var(--bg-surface-muted)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${percentPaid}%`,
                        height: '100%',
                        backgroundColor: isPaid ? 'var(--color-income)' : 'var(--color-debt)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width var(--transition-normal)',
                      }}
                    />
                  </div>
                </div>

                {/* Vencimiento */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginTop: 'var(--space-3)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <Calendar size={14} />
                  <span>{t('debts.dueDate')} <strong>{formatDate(debt.dueDate)}</strong></span>
                </div>

                {/* Historial de abonos */}
                {debt.payments.length > 0 && (
                  <div style={{ marginTop: 'var(--space-3)', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{t('debts.recentPaymentsCount', { count: debt.payments.length })}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      {debt.payments.slice(-3).map((p) => (
                        <div
                          key={p.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            backgroundColor: 'var(--bg-surface-muted)',
                            borderRadius: 'var(--radius-xs)',
                          }}
                        >
                          <span>
                            {formatDate(p.date)}
                            {p.notes ? ` • ${formatNotes(p.notes)}` : ''}
                          </span>
                          <strong style={{ color: 'var(--color-income)' }}>
                            +{formatCurrency(p.amount, settings.currency)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón de abono */}
                {!isPaid && (
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <Button
                      variant="primary"
                      isFullWidth
                      size="sm"
                      icon={<Plus size={16} />}
                      onClick={() => setDebtToPay(debt)}
                    >
                      {activeTab === 'payable' ? t('debts.recordPayment') : t('debts.recordCollection')}
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Nueva Deuda */}
      <Modal
        isOpen={isNewDebtOpen}
        onClose={() => setIsNewDebtOpen(false)}
        title={newType === 'payable' ? t('debts.modalNewPayable') : t('debts.modalNewReceivable')}
      >
        <form onSubmit={handleCreateDebt}>
          <Select
            label={t('debts.fieldDebtType')}
            value={newType}
            onChange={(e) => setNewType(e.target.value as DebtType)}
            options={[
              { value: 'payable', label: t('debts.optionPayable') },
              { value: 'receivable', label: t('debts.optionReceivable') },
            ]}
          />

          <Input
            label={t('debts.fieldTitle')}
            placeholder={t('debts.placeholderTitle')}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <Input
            label={t('debts.fieldContact')}
            placeholder={t('debts.placeholderContact')}
            value={newContact}
            onChange={(e) => setNewContact(e.target.value)}
            required
          />

          <Input
            label={t('debts.fieldPhone')}
            placeholder="+57 300 000 0000"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />

          <Input
            id="debt-amount"
            label={t('debts.fieldAmount')}
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            leftIcon={<DollarSign size={18} />}
            required
          />

          <Input
            label={t('debts.fieldDueDate')}
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            required
          />

          <Textarea
            label={t('debts.fieldNotes')}
            placeholder={t('debts.placeholderNotes')}
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            rows={2}
          />

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button type="button" variant="outline" onClick={() => setIsNewDebtOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" isFullWidth isLoading={isSubmitting}>
              {t('debts.saveBtn')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Registrar Abono */}
      <Modal
        isOpen={!!debtToPay}
        onClose={() => setDebtToPay(null)}
        title={debtToPay?.type === 'payable' ? t('debts.modalPaymentPayable') : t('debts.modalPaymentReceivable')}
      >
        {debtToPay && (
          <form onSubmit={handleAddPayment}>
            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--bg-surface-muted)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('debts.selectedDebt')}</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatDebtTitle(debtToPay.title)}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: '0.9rem' }}>
                <span>{t('debts.remainingBalance')}</span>
                <strong style={{ color: 'var(--color-debt)' }}>
                  {formatCurrency(debtToPay.remainingAmount, settings.currency)}
                </strong>
              </div>
            </div>

            <Input
              id="debt-payment-amount"
              label={t('debts.fieldPaymentAmount')}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="0"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              leftIcon={<DollarSign size={18} />}
              helperText={t('debts.maxPayable', { amount: formatCurrency(debtToPay.remainingAmount, settings.currency) })}
              required
            />

            <Input
              label={t('debts.fieldPaymentNotes')}
              placeholder={t('debts.placeholderPaymentNotes')}
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
            />

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              <Button type="button" variant="outline" onClick={() => setDebtToPay(null)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" isFullWidth isLoading={isSubmittingPayment}>
                {t('debts.confirmPayment')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Diálogo Eliminar */}
      <ConfirmDialog
        isOpen={!!debtToDelete}
        onClose={() => setDebtToDelete(null)}
        onConfirm={handleDeleteDebt}
        title={t('debts.confirmDeleteTitle')}
        message={t('debts.confirmDeleteMsg', { title: debtToDelete ? formatDebtTitle(debtToDelete.title) : '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  )
}
