import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Eye,
  Filter,
  Pencil,
  PiggyBank,
  Plus,
  Trash2,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../context/ToastContext'
import type { Movement, MovementFilterOptions, MovementSortOptions } from '../types'
import { formatCurrency } from '../utils/formatters'
import { Button } from '../components/common/Button'
import { IconButton } from '../components/common/IconButton'
import { SearchBar } from '../components/common/SearchBar'
import { FilterPanel } from '../components/common/FilterPanel'
import { DataTable, type Column } from '../components/common/DataTable'
import { Pagination } from '../components/common/Pagination'
import { Badge } from '../components/common/Badge'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { EmptyState } from '../components/feedback/EmptyState'
import { triggerHaptic } from '../utils/haptics'

const ITEMS_PER_PAGE = 8

export const MovementsPage: React.FC = () => {
  const { movements, categories, deleteMovement, settings } = useData()
  const {
    t,
    formatDate,
    getPaymentMethodLabel,
    formatMovementTitle,
    formatCategoryName,
  } = useLanguage()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<MovementFilterOptions>({
    type: 'all',
    categoryId: 'all',
    startDate: '',
    endDate: '',
  })

  // Derivar filtros activos combinando el estado local y los accesos directos por query param
  const queryType = searchParams.get('type')
  const queryCat = searchParams.get('categoryId')
  const activeType = queryType && ['income', 'expense'].includes(queryType) ? (queryType as 'income' | 'expense') : filters.type
  const activeCategoryId = queryCat || filters.categoryId

  const [sort, setSort] = useState<MovementSortOptions>({
    field: 'date',
    order: 'desc',
  })
  const [currentPage, setCurrentPage] = useState(1)

  // Estado para confirmación de eliminación
  const [movementToDelete, setMovementToDelete] = useState<Movement | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filtrado y ordenamiento en memoria reactivo
  const filteredMovements = useMemo(() => {
    let result = [...movements]

    // Búsqueda
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.notes && m.notes.toLowerCase().includes(q))
      )
    }

    // Tipo
    if (activeType && activeType !== 'all') {
      result = result.filter((m) => m.type === activeType)
    }

    // Categoría
    if (activeCategoryId && activeCategoryId !== 'all') {
      result = result.filter((m) => m.categoryId === activeCategoryId)
    }

    // Rango de fechas
    if (filters.startDate) {
      result = result.filter((m) => m.date >= filters.startDate!)
    }
    if (filters.endDate) {
      result = result.filter((m) => m.date <= filters.endDate!)
    }

    // Orden
    result.sort((a, b) => {
      let valA: string | number = a[sort.field]
      let valB: string | number = b[sort.field]

      if (sort.field === 'date') {
        valA = new Date(a.date).getTime()
        valB = new Date(b.date).getTime()
      }

      if (valA < valB) return sort.order === 'asc' ? -1 : 1
      if (valA > valB) return sort.order === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [movements, searchQuery, activeType, activeCategoryId, filters.startDate, filters.endDate, sort])

  // Paginación
  const totalPages = Math.ceil(filteredMovements.length / ITEMS_PER_PAGE) || 1
  const paginatedMovements = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredMovements.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredMovements, currentPage])

  const handleDelete = async () => {
    if (!movementToDelete) return
    setIsDeleting(true)
    try {
      await deleteMovement(movementToDelete.id)
      success(`Movimiento "${movementToDelete.title}" eliminado correctamente`)
      setMovementToDelete(null)
    } catch {
      error('Error al eliminar el movimiento')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilters({ type: 'all', categoryId: 'all', startDate: '', endDate: '' })
    setSort({ field: 'date', order: 'desc' })
    setCurrentPage(1)
  }

  // Columnas para DataTable
  const columns: Column<Movement>[] = [
    {
      key: 'title',
      header: t('movements.colDescription'),
      render: (m) => {
        const cat = categories.find((c) => c.id === m.categoryId)
        const isSavings = m.type === 'savings_transfer'
        const isIncome = m.type === 'income'
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSavings
                  ? 'rgba(192, 132, 252, 0.12)'
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
                <PiggyBank size={18} />
              ) : isIncome ? (
                <ArrowUpRight size={18} />
              ) : (
                <ArrowDownRight size={18} />
              )}
            </div>
            <div>
              <span style={{ fontWeight: 600, display: 'block' }}>{formatMovementTitle(m.title)}</span>
              {cat && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatCategoryName(cat)} • {getPaymentMethodLabel(m.paymentMethod)}
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: 'date',
      header: t('movements.colDate'),
      render: (m) => (
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {formatDate(m.date)}
        </span>
      ),
    },
    {
      key: 'type',
      header: t('movements.colType'),
      render: (m) => {
        if (m.type === 'savings_transfer') {
          return (
            <Badge variant="savings" icon={<PiggyBank size={12} />}>
              {m.transferDirection === 'in' ? t('movements.savingsWithdrawal') : t('movements.savingsDeposit')}
            </Badge>
          )
        }
        return (
          <Badge variant={m.type === 'income' ? 'income' : 'expense'}>
            {m.type === 'income' ? t('movements.income') : t('movements.expense')}
          </Badge>
        )
      },
    },
    {
      key: 'amount',
      header: t('movements.colAmount'),
      align: 'right',
      render: (m) => {
        if (m.type === 'savings_transfer') {
          const isDeposit = m.transferDirection !== 'in'
          return (
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'var(--color-savings)',
              }}
            >
              {isDeposit ? '➔' : '↵'} {formatCurrency(m.amount, settings.currency)}
            </span>
          )
        }
        return (
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: m.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)',
            }}
          >
            {m.type === 'income' ? '+' : '-'} {formatCurrency(m.amount, settings.currency)}
          </span>
        )
      },
    },
    {
      key: 'actions',
      header: t('movements.colActions'),
      align: 'right',
      render: (m) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-1)' }}>
          <IconButton
            icon={<Eye size={16} />}
            aria-label={t('movements.viewDetailsAria', { title: formatMovementTitle(m.title) })}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/movements/${m.id}`)
            }}
            size="sm"
          />
          <IconButton
            icon={<Pencil size={16} />}
            aria-label={t('movements.editAria', { title: formatMovementTitle(m.title) })}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/movements/${m.id}/edit`)
            }}
            size="sm"
          />
          <IconButton
            icon={<Trash2 size={16} />}
            aria-label={t('movements.deleteAria', { title: formatMovementTitle(m.title) })}
            onClick={(e) => {
              e.stopPropagation()
              setMovementToDelete(m)
            }}
            size="sm"
            variant="danger"
          />
        </div>
      ),
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Encabezado */}
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
            {t('movements.eyebrow')}
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
            {t('movements.title')}
          </h1>
          <p style={{ color: 'var(--slash-silver)', fontSize: '0.925rem', marginTop: '6px' }}>
            {t('movements.subtitle')}
          </p>
        </div>
        <Link to="/movements/new" style={{ textDecoration: 'none' }}>
          <Button variant="primary" icon={<Plus size={18} />} title="Presiona 'N'">
            {t('movements.newBtn')}
            <kbd className="shortcut-badge">N</kbd>
          </Button>
        </Link>
      </div>

      {/* Barra de Búsqueda y Botón de Filtros */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            placeholder={t('movements.searchPlaceholder')}
          />
        </div>
        <Button
          variant={showFilters ? 'primary' : 'outline'}
          icon={<Filter size={18} />}
          onClick={() => setShowFilters(!showFilters)}
          title="Filtros"
        >
          {t('movements.filters')}
        </Button>
      </div>

      {/* Panel Desplegable de Filtros */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={(newFilters) => {
            setFilters(newFilters)
            setCurrentPage(1)
          }}
          onReset={handleResetFilters}
          categories={categories}
        />
      )}

      {/* Tabla Adaptable / Tarjetas en Móvil */}
      {filteredMovements.length === 0 ? (
        <EmptyState
          title={t('movements.noResults')}
          description={t('movements.noResultsDesc')}
          actionLabel={t('movements.resetFilters')}
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <DataTable
            data={paginatedMovements}
            columns={columns}
            keyExtractor={(m) => m.id}
            onRowClick={(m) => {
              triggerHaptic('light')
              navigate(`/movements/${m.id}`)
            }}
            renderMobileCard={(m) => {
              const cat = categories.find((c) => c.id === m.categoryId)
              const isSavings = m.type === 'savings_transfer'
              const isIncome = m.type === 'income'
              const isDeposit = m.transferDirection !== 'in'

              return (
                <div
                  className="touch-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSavings
                          ? 'rgba(192, 132, 252, 0.12)'
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
                      }}
                    >
                      {isSavings ? (
                        <PiggyBank size={20} />
                      ) : isIncome ? (
                        <ArrowUpRight size={20} />
                      ) : (
                        <ArrowDownRight size={20} />
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{formatMovementTitle(m.title)}</h4>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Calendar size={12} />
                        <span>{formatDate(m.date)}</span>
                        {cat && <span>• {formatCategoryName(cat)}</span>}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: isSavings
                          ? 'var(--color-savings)'
                          : isIncome
                          ? 'var(--color-income)'
                          : 'var(--color-expense)',
                        display: 'block',
                      }}
                    >
                      {isSavings
                        ? `${isDeposit ? '➔' : '↵'} ${formatCurrency(m.amount, settings.currency)}`
                        : `${isIncome ? '+' : '-'} ${formatCurrency(m.amount, settings.currency)}`}
                    </span>
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
              )
            }}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredMovements.length}
          />
        </>
      )}

      {/* Diálogo de Confirmación para Eliminación */}
      <ConfirmDialog
        isOpen={!!movementToDelete}
        onClose={() => setMovementToDelete(null)}
        onConfirm={handleDelete}
        title={t('movements.confirmDeleteTitle')}
        message={t('movements.confirmDeleteMsg', { title: movementToDelete ? formatMovementTitle(movementToDelete.title) : '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
