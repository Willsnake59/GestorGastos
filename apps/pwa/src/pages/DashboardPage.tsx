import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Camera,
  CreditCard,
  PiggyBank,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useLanguage } from '../context/LanguageContext'
import { formatCurrency } from '../utils/formatters'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { EmptyState } from '../components/feedback/EmptyState'
import { GildedAreaChart } from '../components/charts/GildedAreaChart'
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart'
import { MiniSparkline } from '../components/charts/MiniSparkline'

export const DashboardPage: React.FC = () => {
  const {
    movements,
    categories,
    netBalance,
    totalIncome,
    totalExpense,
    totalDebtsPayable,
    totalDebtsReceivable,
    totalSavings,
    settings,
  } = useData()
  const { t, formatDate, formatMovementTitle, formatCategoryName } = useLanguage()

  const navigate = useNavigate()

  // Movimientos recientes (últimos 5)
  const recentMovements = movements.slice(0, 5)

  // Gastos por categoría para la barra de distribución
  const expenseMovements = movements.filter((m) => m.type === 'expense')
  const expensesByCategory = categories
    .filter((c) => c.type === 'expense' || c.type === 'both')
    .map((cat) => {
      const catTotal = expenseMovements
        .filter((m) => m.categoryId === cat.id)
        .reduce((sum, m) => sum + m.amount, 0)
      const percent = totalExpense > 0 ? (catTotal / totalExpense) * 100 : 0
      return { ...cat, total: catTotal, percent }
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Encabezado del Dashboard estilo Slash */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ minWidth: 0, flex: '1 1 240px' }}>
          <span className="category-eyebrow" style={{ display: 'block', marginBottom: '4px' }}>
            {t('dashboard.eyebrow')}
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.4rem',
              fontWeight: 400,
              letterSpacing: '0.01em',
              color: 'var(--color-paper-white)',
              lineHeight: 1.15,
              wordBreak: 'break-word',
            }}
          >
            {t('dashboard.title')}
          </h1>
          <p style={{ color: 'var(--color-fog)', fontSize: '14px', marginTop: '4px' }}>
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
          <Button
            variant="outline"
            size="sm"
            icon={<Plus size={15} />}
            onClick={() => navigate('/movements/new?type=income')}
            title="[I] Registrar nuevo ingreso"
          >
            {t('dashboard.incomeBtn')}
            <kbd className="shortcut-badge">I</kbd>
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={() => navigate('/movements/new?type=expense')}
            title="[G] Registrar nuevo gasto"
          >
            {t('dashboard.expenseBtn')}
            <kbd className="shortcut-badge">G</kbd>
          </Button>
        </div>
      </div>

      {/* Gráfica Principal de Evolución Financiera Slash (Hero Chart) */}
      <GildedAreaChart
        movements={movements}
        currentBalance={netBalance}
        currency={settings.currency}
      />

      {/* Tarjetas Principales de KPI - Accesos Directos Interactivos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: 'var(--space-4)',
          width: '100%',
        }}
      >
        {/* Balance Neto -> Acceso directo a Análisis */}
        <Card
          interactive
          onClick={() => navigate('/analytics')}
          className="card-gradient-balance shortcut-interactive-card"
          title="Acceso directo: Ver análisis financiero completo [P]"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-fog)' }}>
              {t('dashboard.netBalance')}
            </span>
            <MiniSparkline data={[netBalance * 0.85, netBalance * 0.9, netBalance * 0.88, netBalance * 0.96, netBalance]} color="#ae9357" width={75} height={22} />
          </div>
          <div style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: '1.85rem',
                fontWeight: 400,
                fontFamily: 'var(--font-display)',
                color: 'var(--color-paper-white)',
                letterSpacing: '0.01em',
              }}
            >
              {formatCurrency(netBalance, settings.currency)}
            </span>
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-fog)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {netBalance >= 0 ? (
                <>
                  <TrendingUp size={14} color="var(--color-income)" />
                  <span style={{ color: 'var(--color-income)' }}>{t('dashboard.surplus')}</span>
                </>
              ) : (
                <>
                  <TrendingDown size={14} color="var(--color-expense)" />
                  <span style={{ color: 'var(--color-expense)' }}>{t('dashboard.deficit')}</span>
                </>
              )}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-copper)', fontWeight: 500 }}>
              {t('nav.analytics')} → <kbd className="shortcut-badge shortcut-badge-subtle">P</kbd>
            </span>
          </div>
        </Card>

        {/* Ingresos del Mes -> Acceso directo a Movimientos filtrados por Ingreso */}
        <Card
          interactive
          onClick={() => navigate('/movements?type=income')}
          className="card-gradient-income shortcut-interactive-card"
          title="Ver ingresos [I]"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-fog)' }}>
              {t('dashboard.monthlyIncome')}
            </span>
            <MiniSparkline data={[totalIncome * 0.6, totalIncome * 0.75, totalIncome * 0.9, totalIncome]} color="var(--color-income)" width={75} height={22} />
          </div>
          <div style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: '1.85rem',
                fontWeight: 400,
                fontFamily: 'var(--font-display)',
                color: 'var(--color-paper-white)',
                letterSpacing: '0.01em',
              }}
            >
              {formatCurrency(totalIncome, settings.currency)}
            </span>
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-fog)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{movements.filter((m) => m.type === 'income').length} {t('dashboard.registered')}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-copper)', fontWeight: 500 }}>
              {t('dashboard.viewAll')} → <kbd className="shortcut-badge shortcut-badge-subtle">I</kbd>
            </span>
          </div>
        </Card>

        {/* Gastos del Mes -> Acceso directo a Movimientos filtrados por Gasto */}
        <Card
          interactive
          onClick={() => navigate('/movements?type=expense')}
          className="card-gradient-expense shortcut-interactive-card"
          title="Ver gastos [G]"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-fog)' }}>
              {t('dashboard.monthlyExpense')}
            </span>
            <MiniSparkline data={[totalExpense * 0.5, totalExpense * 0.7, totalExpense * 0.85, totalExpense]} color="var(--color-expense)" width={75} height={22} />
          </div>
          <div style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: '1.85rem',
                fontWeight: 400,
                fontFamily: 'var(--font-display)',
                color: 'var(--color-paper-white)',
                letterSpacing: '0.01em',
              }}
            >
              {formatCurrency(totalExpense, settings.currency)}
            </span>
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-fog)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{expenseMovements.length} {t('dashboard.registered')}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-copper)', fontWeight: 500 }}>
              {t('dashboard.viewAll')} → <kbd className="shortcut-badge shortcut-badge-subtle">G</kbd>
            </span>
          </div>
        </Card>

        {/* Deudas y Ahorros -> Accesos directos a Deudas y Metas */}
        <Card className="card-gradient-savings">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-fog)' }}>
              {t('dashboard.debtsAndReserves')}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-carbon)',
                  border: '1px solid var(--color-graphite)',
                  color: 'var(--color-fog)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/debts')}
                title="Control de Deudas [D]"
              >
                <CreditCard size={14} />
              </button>
              <button
                type="button"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-carbon)',
                  border: '1px solid var(--color-graphite)',
                  color: 'var(--color-savings)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/savings')}
                title="Metas de Ahorro [A]"
              >
                <PiggyBank size={14} />
              </button>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              onClick={() => navigate('/debts')}
              className="shortcut-category-item"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}
              title="Control de Deudas [D]"
            >
              <span style={{ color: 'var(--color-fog)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {t('dashboard.youOwe')} <kbd className="shortcut-badge shortcut-badge-subtle">D</kbd>
              </span>
              <strong style={{ color: 'var(--color-debt)', fontWeight: 600 }}>
                {formatCurrency(totalDebtsPayable, settings.currency)}
              </strong>
            </div>
            <div
              onClick={() => navigate('/debts')}
              className="shortcut-category-item"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}
              title="Control de Deudas [D]"
            >
              <span style={{ color: 'var(--color-fog)' }}>{t('dashboard.owedToYou')}</span>
              <strong style={{ color: 'var(--color-income)', fontWeight: 600 }}>
                {formatCurrency(totalDebtsReceivable, settings.currency)}
              </strong>
            </div>
            <div
              onClick={() => navigate('/savings')}
              className="shortcut-category-item"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}
              title="Metas de Ahorro [A]"
            >
              <span style={{ color: 'var(--color-fog)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {t('dashboard.saved')} <kbd className="shortcut-badge shortcut-badge-subtle">A</kbd>
              </span>
              <strong style={{ color: 'var(--color-savings)', fontWeight: 600 }}>
                {formatCurrency(totalSavings, settings.currency)}
              </strong>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid de 2 columnas: Distribución de Gastos con CategoryDonutChart y Movimientos Recientes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {/* Distribución de Gastos por Categoría con Gráfica Circular de Dona Slash */}
        <Card className="card-gradient-copper">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
              borderBottom: '1px solid var(--color-graphite)',
              paddingBottom: 'var(--space-3)',
            }}
          >
            <div>
              <span className="category-eyebrow" style={{ display: 'block', fontSize: '11px', marginBottom: '2px' }}>
                {t('dashboard.budgetAllocation')}
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400, color: 'var(--color-paper-white)' }}>
                {t('dashboard.expenseDistribution')}
              </h2>
            </div>
            <Link
              to="/analytics"
              style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-copper)' }}
            >
              {t('dashboard.viewAll')} →
            </Link>
          </div>

          {expensesByCategory.length === 0 ? (
            <p style={{ color: 'var(--color-fog)', fontSize: '13px', textAlign: 'center', padding: 'var(--space-4)' }}>
              {t('movements.noResultsDesc')}
            </p>
          ) : (
            <CategoryDonutChart
              categories={expensesByCategory.map((c) => ({ ...c, name: formatCategoryName(c) }))}
              totalExpense={totalExpense}
              currency={settings.currency}
            />
          )}
        </Card>

        {/* Movimientos Recientes */}
        <Card className="card-gradient-slate">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)',
            }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t('dashboard.recentMovements')}</h2>
            <Link
              to="/movements"
              style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}
            >
              {t('dashboard.viewAll')} →
            </Link>
          </div>

          {recentMovements.length === 0 ? (
            <EmptyState
              title={t('movements.noResults')}
              description={t('dashboard.noMovements')}
              actionLabel={t('dashboard.recordFirstExpense')}
              onAction={() => navigate('/movements/new')}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {recentMovements.map((mov) => {
                const cat = categories.find((c) => c.id === mov.categoryId)
                const isSavings = mov.type === 'savings_transfer'
                const isIncome = mov.type === 'income'
                const isDeposit = mov.transferDirection !== 'in'

                return (
                  <Link
                    key={mov.id}
                    to={`/movements/${mov.id}`}
                    className="slash-list-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        {mov.receiptImage ? (
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: 'var(--radius-full)',
                              overflow: 'hidden',
                              border: '1.5px solid rgba(234, 179, 8, 0.45)',
                              backgroundColor: '#000',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                            title="Comprobante con foto"
                          >
                            <img
                              src={mov.receiptImage}
                              alt="Comprobante"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                bottom: -2,
                                right: -2,
                                backgroundColor: '#eab308',
                                color: '#000',
                                borderRadius: '50%',
                                width: '14px',
                                height: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Camera size={9} strokeWidth={2.5} />
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: isSavings
                                ? 'rgba(192, 132, 252, 0.12)'
                                : isIncome
                                ? 'rgba(52, 211, 153, 0.12)'
                                : 'rgba(248, 113, 113, 0.12)',
                              border: isSavings
                                ? '1px solid rgba(192, 132, 252, 0.3)'
                                : isIncome
                                ? '1px solid rgba(52, 211, 153, 0.25)'
                                : '1px solid rgba(248, 113, 113, 0.25)',
                              boxShadow: isSavings
                                ? '0 0 12px rgba(192, 132, 252, 0.15)'
                                : isIncome
                                ? '0 0 12px rgba(52, 211, 153, 0.15)'
                                : '0 0 12px rgba(248, 113, 113, 0.15)',
                              color: isSavings
                                ? 'var(--color-savings)'
                                : isIncome
                                ? 'var(--color-income)'
                                : 'var(--color-expense)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isSavings ? (
                              <PiggyBank size={18} />
                            ) : isIncome ? (
                              <ArrowUpRight size={20} />
                            ) : (
                              <ArrowDownRight size={20} />
                            )}
                          </div>
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h4 style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--color-paper-white)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {formatMovementTitle(mov.title)}
                          </h4>
                          {mov.receiptImage && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                color: '#eab308',
                                backgroundColor: 'rgba(234, 179, 8, 0.12)',
                                border: '1px solid rgba(234, 179, 8, 0.3)',
                                padding: '1px 5px',
                                borderRadius: 'var(--radius-full)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                flexShrink: 0,
                              }}
                            >
                              <Camera size={10} />
                              Foto
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            fontSize: '0.75rem',
                            color: 'var(--color-fog)',
                            marginTop: '2px',
                          }}
                        >
                          <Calendar size={12} />
                          <span>{formatDate(mov.date)}</span>
                          {cat && <span>• {formatCategoryName(cat)}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: isSavings
                            ? 'var(--color-savings)'
                            : isIncome
                            ? 'var(--color-income)'
                            : 'var(--color-expense)',
                          display: 'block',
                          marginBottom: '2px',
                        }}
                      >
                        {isSavings
                          ? `${isDeposit ? '➔' : '↵'} ${formatCurrency(mov.amount, settings.currency)}`
                          : `${isIncome ? '+' : '-'} ${formatCurrency(mov.amount, settings.currency)}`}
                      </span>
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
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Accesos directos y sugerencias */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <Link to="/movements" style={{ textDecoration: 'none' }}>
          <Card interactive className="shortcut-interactive-card" style={{ padding: 'var(--space-4)' }} title="Presiona 'M'">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-bg, rgba(5, 150, 105, 0.1))',
                  color: 'var(--color-primary)',
                }}
              >
                <Receipt size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('dashboard.quickMovements')}</h4>
                  <kbd className="shortcut-badge shortcut-badge-subtle">M</kbd>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('dashboard.quickMovementsDesc')}</span>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/debts" style={{ textDecoration: 'none' }}>
          <Card interactive className="shortcut-interactive-card" style={{ padding: 'var(--space-4)' }} title="Presiona 'D'">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-debt-bg)',
                  color: 'var(--color-debt)',
                }}
              >
                <CreditCard size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('dashboard.debtsVault')}</h4>
                  <kbd className="shortcut-badge shortcut-badge-subtle">D</kbd>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('dashboard.debtsVaultDesc')}</span>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/savings" style={{ textDecoration: 'none' }}>
          <Card interactive className="shortcut-interactive-card" style={{ padding: 'var(--space-4)' }} title="Presiona 'A'">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-savings-bg)',
                  color: 'var(--color-savings)',
                }}
              >
                <PiggyBank size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('dashboard.savingsVault')}</h4>
                  <kbd className="shortcut-badge shortcut-badge-subtle">A</kbd>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('dashboard.savingsVaultDesc')}</span>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
