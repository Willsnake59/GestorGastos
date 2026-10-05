import React, { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Plus,
  ShieldAlert,
  Sliders,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import { formatCurrency } from '../utils/formatters'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { Input } from '../components/common/Input'
import { Select } from '../components/common/Select'

export const AnalyticsPage: React.FC = () => {
  const { movements, categories, budgets, saveBudget, totalIncome, totalExpense, netBalance, settings } = useData()
  const { t, formatCategoryName } = useLanguage()
  const { success, error: toastError } = useToast()

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [selectedCatId, setSelectedCatId] = useState('')
  const [budgetLimit, setBudgetLimit] = useState('')
  const [isSavingBudget, setIsSavingBudget] = useState(false)

  // Desglose de Gastos
  const expenseMovements = movements.filter((m) => m.type === 'expense')
  const expensesByCategory = categories
    .filter((c) => c.type === 'expense' || c.type === 'both')
    .map((cat) => {
      const spent = expenseMovements
        .filter((m) => m.categoryId === cat.id)
        .reduce((sum, m) => sum + m.amount, 0)
      const percent = totalExpense > 0 ? (spent / totalExpense) * 100 : 0
      const budget = budgets.find((b) => b.categoryId === cat.id)

      return {
        ...cat,
        spent,
        percent,
        budgetLimit: budget?.monthlyLimit || 0,
        budgetPercent: budget && budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0,
      }
    })
    .sort((a, b) => b.spent - a.spent)

  // Desglose de Ingresos
  const incomeMovements = movements.filter((m) => m.type === 'income')
  const incomeByCategory = categories
    .filter((c) => c.type === 'income' || c.type === 'both')
    .map((cat) => {
      const total = incomeMovements
        .filter((m) => m.categoryId === cat.id)
        .reduce((sum, m) => sum + m.amount, 0)
      const percent = totalIncome > 0 ? (total / totalIncome) * 100 : 0
      return { ...cat, total, percent }
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)

  // Tasa de ahorro
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCatId || !budgetLimit) {
      toastError(t('analytics.selectCatAndLimit'))
      return
    }

    const num = parseFloat(budgetLimit)
    if (isNaN(num) || num <= 0) {
      toastError(t('analytics.limitPositive'))
      return
    }

    setIsSavingBudget(true)
    try {
      await saveBudget(selectedCatId, num)
      success(t('analytics.savedSuccess'))
      setIsBudgetModalOpen(false)
      setSelectedCatId('')
      setBudgetLimit('')
    } catch {
      toastError(t('analytics.saveError'))
    } finally {
      setIsSavingBudget(false)
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
            {t('analytics.eyebrow')}
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
            {t('analytics.title')}
          </h1>
          <p style={{ color: 'var(--slash-silver)', fontSize: '0.925rem', marginTop: '6px' }}>
            {t('analytics.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Sliders size={18} />}
          onClick={() => {
            const firstExp = categories.find((c) => c.type === 'expense')
            if (firstExp) setSelectedCatId(firstExp.id)
            setIsBudgetModalOpen(true)
          }}
        >
          {t('analytics.configureBudget')}
        </Button>
      </div>

      {/* Tarjetas KPI de Resumen Financiero */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <Card>
          <span className="category-eyebrow" style={{ display: 'block', marginBottom: '8px' }}>
            {t('analytics.savingsRate')}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.5rem',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: savingsRate >= 20 ? 'var(--color-income)' : savingsRate > 0 ? 'var(--color-debt)' : 'var(--color-expense)',
              }}
            >
              {savingsRate}%
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--slash-ash)' }}>{t('analytics.ofYourIncome')}</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--slash-silver)', marginTop: '8px' }}>
            {savingsRate >= 20
              ? t('analytics.savingsExcellent')
              : savingsRate > 0
              ? t('analytics.savingsModerate')
              : t('analytics.savingsAttention')}
          </p>
        </Card>

        <Card>
          <span className="category-eyebrow" style={{ display: 'block', marginBottom: '8px' }}>
            {t('analytics.netCashFlow')}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.25rem',
                fontWeight: 400,
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: netBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
              }}
            >
              {formatCurrency(netBalance, settings.currency)}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--slash-silver)', marginTop: '8px' }}>
            {t('analytics.incomeVsExpense', {
              income: formatCurrency(totalIncome, settings.currency),
              expense: formatCurrency(totalExpense, settings.currency),
            })}
          </p>
        </Card>
      </div>

      {/* Sección de Presupuestos Mensuales */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{t('analytics.budgetControlTitle')}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {t('analytics.budgetControlSubtitle')}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            icon={<Plus size={16} />}
            onClick={() => setIsBudgetModalOpen(true)}
          >
            {t('analytics.newLimitBtn')}
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {expensesByCategory.map((item) => {
            const hasBudget = item.budgetLimit > 0
            const isWarning = item.budgetPercent >= 80 && item.budgetPercent < 100
            const isDanger = item.budgetPercent >= 100

            return (
              <div
                key={item.id}
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--bg-surface-muted)',
                  borderRadius: 'var(--radius-lg)',
                  border: isDanger
                    ? '1px solid rgba(239, 68, 68, 0.4)'
                    : isWarning
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: item.color,
                      }}
                    />
                    <strong style={{ fontSize: '1rem' }}>{formatCategoryName(item)}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {hasBudget ? (
                      isDanger ? (
                        <Badge variant="expense" icon={<ShieldAlert size={12} />}>
                          {t('analytics.exceededBadge', { percent: item.budgetPercent.toFixed(0) })}
                        </Badge>
                      ) : isWarning ? (
                        <Badge variant="debt" icon={<AlertTriangle size={12} />}>
                          {t('analytics.alertBadge', { percent: item.budgetPercent.toFixed(0) })}
                        </Badge>
                      ) : (
                        <Badge variant="income" icon={<CheckCircle2 size={12} />}>
                          {t('analytics.onTrackBadge', { percent: item.budgetPercent.toFixed(0) })}
                        </Badge>
                      )
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('analytics.noLimitAssigned')}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>{t('analytics.spentLabel')} <strong>{formatCurrency(item.spent, settings.currency)}</strong></span>
                  <span>
                    {t('analytics.limitLabel')}{' '}
                    <strong>
                      {hasBudget ? formatCurrency(item.budgetLimit, settings.currency) : t('analytics.unlimited')}
                    </strong>
                  </span>
                </div>

                {/* Barra de Consumo */}
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, item.budgetPercent || item.percent)}%`,
                      height: '100%',
                      backgroundColor: isDanger ? 'var(--color-expense)' : isWarning ? 'var(--color-debt)' : item.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width var(--transition-normal)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Desglose de Ingresos */}
      <Card>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
          {t('analytics.incomeSources')}
        </h2>
        {incomeByCategory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('analytics.noIncome')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {incomeByCategory.map((item) => (
              <div key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                  <span>{formatCategoryName(item)}</span>
                  <strong>{formatCurrency(item.total, settings.currency)} ({item.percent.toFixed(0)}%)</strong>
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
                      width: `${item.percent}%`,
                      height: '100%',
                      backgroundColor: 'var(--color-income)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal Configurar Presupuesto */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title={t('analytics.modalTitle')}
      >
        <form onSubmit={handleSaveBudget}>
          <Select
            label={t('analytics.modalCatLabel')}
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(e.target.value)}
            options={categories
              .filter((c) => c.type === 'expense' || c.type === 'both')
              .map((c) => ({ value: c.id, label: formatCategoryName(c) }))}
            required
          />

          <Input
            label={t('analytics.modalLimitLabel')}
            type="number"
            step="any"
            placeholder="0"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            leftIcon={<DollarSign size={18} />}
            helperText={t('analytics.modalLimitHelp')}
            required
          />

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
            <Button type="button" variant="outline" onClick={() => setIsBudgetModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" isFullWidth isLoading={isSavingBudget}>
              {t('analytics.saveBudgetBtn')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
