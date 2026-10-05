import React, { useState } from 'react'
import confetti from 'canvas-confetti'
import {
  CheckCircle2,
  DollarSign,
  Minus,
  PiggyBank,
  Plus,
  Target,
  Trash2,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import type { SavingsGoal } from '../types'
import { formatCurrency } from '../utils/formatters'
import { Button } from '../components/common/Button'
import { IconButton } from '../components/common/IconButton'
import { Card } from '../components/common/Card'
import { Badge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { Input } from '../components/common/Input'
import { Textarea } from '../components/common/Textarea'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/feedback/EmptyState'

export const SavingsPage: React.FC = () => {
  const {
    savings,
    createSavingsGoal,
    addSavingsContribution,
    withdrawSavings,
    deleteSavingsGoal,
    totalSavings,
    settings,
  } = useData()
  const { t, formatDate, formatSavingsTitle, formatNotes } = useLanguage()
  const { success, error: toastError } = useToast()

  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false)
  const [goalToContribute, setGoalToContribute] = useState<SavingsGoal | null>(null)
  const [goalToWithdraw, setGoalToWithdraw] = useState<SavingsGoal | null>(null)
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null)

  // Form nueva meta
  const [newTitle, setNewTitle] = useState('')
  const [newTargetAmount, setNewTargetAmount] = useState('')
  const [newTargetDate, setNewTargetDate] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [newColor, setNewColor] = useState('#10b981')
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false)

  // Form aporte
  const [contribAmount, setContribAmount] = useState('')
  const [contribNotes, setContribNotes] = useState('')
  const [isSubmittingContrib, setIsSubmittingContrib] = useState(false)

  // Form retiro
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawNotes, setWithdrawNotes] = useState('')
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false)

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newTargetAmount || !newTargetDate) {
      toastError(t('savings.requiredFields'))
      return
    }

    const amt = parseFloat(newTargetAmount)
    if (isNaN(amt) || amt <= 0) {
      toastError(t('savings.targetPositive'))
      return
    }

    setIsSubmittingGoal(true)
    try {
      await createSavingsGoal({
        title: newTitle.trim(),
        targetAmount: amt,
        currentAmount: 0,
        targetDate: newTargetDate,
        icon: 'PiggyBank',
        color: newColor,
        notes: newNotes.trim() || undefined,
      })

      success(t('savings.createdSuccess'))
      setIsNewGoalOpen(false)
      setNewTitle('')
      setNewTargetAmount('')
      setNewTargetDate('')
      setNewNotes('')
    } catch {
      toastError(t('savings.createError'))
    } finally {
      setIsSubmittingGoal(false)
    }
  }

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalToContribute) return

    const amt = parseFloat(contribAmount)
    if (isNaN(amt) || amt <= 0) {
      toastError(t('savings.validDeposit'))
      return
    }

    setIsSubmittingContrib(true)
    try {
      const updated = await addSavingsContribution(goalToContribute.id, amt, contribNotes.trim() || undefined)

      if (updated.currentAmount >= updated.targetAmount) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        })
        success(t('savings.completedCongrats', { title: formatSavingsTitle(updated.title) }))
      } else {
        success(t('savings.depositSaved'))
      }

      setGoalToContribute(null)
      setContribAmount('')
      setContribNotes('')
    } catch {
      toastError(t('savings.depositError'))
    } finally {
      setIsSubmittingContrib(false)
    }
  }

  const handleWithdrawSavings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalToWithdraw) return

    const amt = parseFloat(withdrawAmount)
    if (isNaN(amt) || amt <= 0) {
      toastError(t('savings.validWithdraw'))
      return
    }

    if (amt > goalToWithdraw.currentAmount) {
      toastError(t('savings.withdrawExceeds'))
      return
    }

    setIsSubmittingWithdraw(true)
    try {
      await withdrawSavings(goalToWithdraw.id, amt, withdrawNotes.trim() || undefined)
      success(t('savings.withdrawSuccess'))
      setGoalToWithdraw(null)
      setWithdrawAmount('')
      setWithdrawNotes('')
    } catch {
      toastError(t('savings.withdrawError'))
    } finally {
      setIsSubmittingWithdraw(false)
    }
  }

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return
    try {
      await deleteSavingsGoal(goalToDelete.id)
      success(t('savings.deletedSuccess'))
      setGoalToDelete(null)
    } catch {
      toastError(t('savings.deleteError'))
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
            {t('savings.eyebrow')}
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
            {t('savings.title')}
          </h1>
          <p style={{ color: 'var(--slash-silver)', fontSize: '0.925rem', marginTop: '6px' }}>
            {t('savings.subtitle')}
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsNewGoalOpen(true)}>
          {t('savings.newBtn')}
        </Button>
      </div>

      {/* KPI Principal */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {t('savings.totalSaved')}
            </span>
            <div style={{ marginTop: 'var(--space-1)' }}>
              <span
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-savings)',
                }}
              >
                {formatCurrency(totalSavings, settings.currency)}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {t('savings.distributedIn', { count: savings.length })}
            </span>
          </div>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-savings-bg)',
              color: 'var(--color-savings)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PiggyBank size={28} />
          </div>
        </div>
      </Card>

      {/* Listado de Metas */}
      {savings.length === 0 ? (
        <EmptyState
          title={t('savings.noGoals')}
          description={t('savings.noGoalsDesc')}
          actionLabel={t('savings.createFirstGoal')}
          onAction={() => setIsNewGoalOpen(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {savings.map((goal) => {
            const percent = goal.targetAmount > 0
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
              : 0
            const isCompleted = goal.currentAmount >= goal.targetAmount
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount)

            return (
              <Card key={goal.id}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: `${goal.color}20`,
                        color: goal.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Target size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{formatSavingsTitle(goal.title)}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {t('savings.targetDate', { date: formatDate(goal.targetDate) })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    {isCompleted && (
                      <Badge variant="income" icon={<CheckCircle2 size={12} />}>
                        {t('savings.completedBadge')}
                      </Badge>
                    )}
                    <IconButton
                      icon={<Trash2 size={16} />}
                      aria-label={t('savings.deleteGoalAria')}
                      size="sm"
                      variant="ghost"
                      onClick={() => setGoalToDelete(goal)}
                    />
                  </div>
                </div>

                {/* Montos */}
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: 'var(--space-4) 0 var(--space-2) 0' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {t('savings.currentAccumulated')}
                    </span>
                    <strong style={{ fontSize: '1.35rem', color: 'var(--color-savings)' }}>
                      {formatCurrency(goal.currentAmount, settings.currency)}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      {t('savings.targetGoal')}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                      {formatCurrency(goal.targetAmount, settings.currency)}
                    </span>
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{percent}% {t('savings.reached')}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {isCompleted ? t('savings.goalCompleted') : t('savings.missingAmount', { amount: formatCurrency(remaining, settings.currency) })}
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '10px',
                      backgroundColor: 'var(--bg-surface-muted)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        backgroundColor: goal.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width var(--transition-normal)',
                      }}
                    />
                  </div>
                </div>

                {goal.notes && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontStyle: 'italic' }}>
                    "{formatNotes(goal.notes)}"
                  </p>
                )}

                {/* Aportes recientes */}
                {goal.contributions.length > 0 && (
                  <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {t('savings.recentMovementsWithCount', { count: goal.contributions.length })}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      {goal.contributions.slice(-3).map((c) => {
                        const isWithdrawal = c.type === 'withdrawal'
                        return (
                          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                            <span>
                              {formatDate(c.date)}
                              {c.notes ? ` • ${formatNotes(c.notes)}` : isWithdrawal ? ` • ${t('savings.withdrawalBadge')}` : ''}
                            </span>
                            <strong style={{ color: isWithdrawal ? 'var(--color-expense)' : 'var(--color-income)' }}>
                              {isWithdrawal ? '-' : '+'}{formatCurrency(c.amount, settings.currency)}
                            </strong>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Botones Aportar y Retirar */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-2)',
                    marginTop: 'var(--space-4)',
                  }}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus size={16} />}
                    onClick={() => setGoalToContribute(goal)}
                  >
                    {t('savings.depositBtn')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Minus size={16} />}
                    disabled={goal.currentAmount <= 0}
                    onClick={() => setGoalToWithdraw(goal)}
                    title={
                      goal.currentAmount <= 0
                        ? t('savings.noFundsWithdraw')
                        : t('savings.withdrawFundsTitle')
                    }
                  >
                    {t('savings.withdrawBtn')}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Nueva Meta */}
      <Modal isOpen={isNewGoalOpen} onClose={() => setIsNewGoalOpen(false)} title={t('savings.modalNewTitle')}>
        <form onSubmit={handleCreateGoal}>
          <Input
            label={t('savings.fieldGoalName')}
            placeholder={t('savings.placeholderGoalName')}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <Input
            label={t('savings.fieldTargetAmount')}
            type="number"
            step="any"
            placeholder="0"
            value={newTargetAmount}
            onChange={(e) => setNewTargetAmount(e.target.value)}
            leftIcon={<DollarSign size={18} />}
            required
          />

          <Input
            label={t('savings.fieldTargetDate')}
            type="date"
            value={newTargetDate}
            onChange={(e) => setNewTargetDate(e.target.value)}
            required
          />

          {/* Selector de color de meta */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              {t('savings.fieldColor')}
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'].map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setNewColor(col)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: col,
                    border: newColor === col ? '3px solid var(--text-primary)' : 'none',
                    cursor: 'pointer',
                  }}
                  aria-label={t('savings.selectColor', { color: col })}
                />
              ))}
            </div>
          </div>

          <Textarea
            label={t('savings.fieldGoalNotes')}
            placeholder={t('savings.placeholderGoalNotes')}
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            rows={2}
          />

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button type="button" variant="outline" onClick={() => setIsNewGoalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" isFullWidth isLoading={isSubmittingGoal}>
              {t('savings.createGoalBtn')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Registrar Aporte */}
      <Modal
        isOpen={!!goalToContribute}
        onClose={() => setGoalToContribute(null)}
        title={t('savings.modalDepositTitle')}
      >
        {goalToContribute && (
          <form onSubmit={handleAddContribution}>
            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--bg-surface-muted)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('savings.destGoal')}</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatSavingsTitle(goalToContribute.title)}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: '0.9rem' }}>
                <span>{t('savings.currentlyAccumulated')}</span>
                <strong style={{ color: 'var(--color-savings)' }}>
                  {formatCurrency(goalToContribute.currentAmount, settings.currency)}
                </strong>
              </div>
            </div>

            <Input
              id="savings-contrib-amount"
              label={t('savings.fieldDepositAmount')}
              type="number"
              step="any"
              inputMode="decimal"
              min="0"
              placeholder="0"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
              leftIcon={<DollarSign size={18} />}
              required
            />

            <Input
              id="savings-contrib-notes"
              label={t('savings.fieldDepositNotes')}
              placeholder={t('savings.placeholderDepositNotes')}
              value={contribNotes}
              onChange={(e) => setContribNotes(e.target.value)}
            />

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              <Button type="button" variant="outline" onClick={() => setGoalToContribute(null)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" isFullWidth isLoading={isSubmittingContrib}>
                {t('savings.confirmDeposit')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Registrar Retiro */}
      <Modal
        isOpen={!!goalToWithdraw}
        onClose={() => setGoalToWithdraw(null)}
        title={t('savings.modalWithdrawTitle')}
      >
        {goalToWithdraw && (
          <form onSubmit={handleWithdrawSavings}>
            <div
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--bg-surface-muted)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-4)',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('savings.sourceGoal')}</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatSavingsTitle(goalToWithdraw.title)}</h4>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 'var(--space-2)',
                  fontSize: '0.9rem',
                }}
              >
                <span>{t('savings.availableInGoal')}</span>
                <strong style={{ color: 'var(--color-savings)' }}>
                  {formatCurrency(goalToWithdraw.currentAmount, settings.currency)}
                </strong>
              </div>
            </div>

            <Input
              id="savings-withdraw-amount"
              label={t('savings.fieldWithdrawAmount')}
              type="number"
              step="any"
              inputMode="decimal"
              min="0"
              max={goalToWithdraw.currentAmount}
              placeholder="0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              leftIcon={<DollarSign size={18} />}
              helperText={t('savings.maxWithdrawable', { amount: formatCurrency(goalToWithdraw.currentAmount, settings.currency) })}
              required
            />

            <Input
              id="savings-withdraw-notes"
              label={t('savings.fieldWithdrawNotes')}
              placeholder={t('savings.placeholderWithdrawNotes')}
              value={withdrawNotes}
              onChange={(e) => setWithdrawNotes(e.target.value)}
            />

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
              <Button type="button" variant="outline" onClick={() => setGoalToWithdraw(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                isFullWidth
                isLoading={isSubmittingWithdraw}
              >
                {t('savings.confirmWithdraw')}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Diálogo Eliminar */}
      <ConfirmDialog
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={handleDeleteGoal}
        title={t('savings.confirmDeleteTitle')}
        message={t('savings.confirmDeleteMsg', { title: goalToDelete ? formatSavingsTitle(goalToDelete.title) : '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
      />
    </div>
  )
}
