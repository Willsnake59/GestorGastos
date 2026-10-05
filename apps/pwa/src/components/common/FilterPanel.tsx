import React from 'react'
import type { Category, MovementFilterOptions } from '../../types'
import { useLanguage } from '../../context/LanguageContext'
import { Button } from './Button'
import { Select } from './Select'
import { Input } from './Input'
import { RotateCcw } from 'lucide-react'

export interface FilterPanelProps {
  filters: MovementFilterOptions
  onChange: (filters: MovementFilterOptions) => void
  onReset: () => void
  categories: Category[]
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
  categories,
}) => {
  const { t, formatCategoryName } = useLanguage()

  const categoryOptions = [
    { value: 'all', label: t('movements.allCategories') },
    ...categories.map((c) => ({ value: c.id, label: formatCategoryName(c) })),
  ]

  const typeOptions = [
    { value: 'all', label: t('movements.allTypes') },
    { value: 'expense', label: t('movements.onlyExpense') },
    { value: 'income', label: t('movements.onlyIncome') },
    { value: 'savings_transfer', label: t('movements.onlySavings') },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        marginBottom: 'var(--space-4)',
      }}
    >
      <Select
        label={t('movements.filterType')}
        value={filters.type || 'all'}
        options={typeOptions}
        onChange={(e) =>
          onChange({ ...filters, type: e.target.value as MovementFilterOptions['type'] })
        }
      />

      <Select
        label={t('movements.filterCategory')}
        value={filters.categoryId || 'all'}
        options={categoryOptions}
        onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
      />

      <Input
        label={t('movements.filterStartDate')}
        type="date"
        value={filters.startDate || ''}
        onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
      />

      <Input
        label={t('movements.filterEndDate')}
        type="date"
        value={filters.endDate || ''}
        onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
      />

      <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 'var(--space-4)' }}>
        <Button
          variant="outline"
          size="md"
          icon={<RotateCcw size={16} />}
          onClick={onReset}
          isFullWidth
        >
          {t('movements.resetFilters')}
        </Button>
      </div>
    </div>
  )
}
