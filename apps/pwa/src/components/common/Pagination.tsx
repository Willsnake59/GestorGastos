import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { IconButton } from './IconButton'
import { useLanguage } from '../../context/LanguageContext'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}) => {
  const { t } = useLanguage()

  if (totalPages <= 1) return null

  return (
    <nav
      aria-label={t('pagination.pageInfo', { current: currentPage, total: totalPages })}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) 0',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
      }}
    >
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {t('pagination.pageInfo', { current: currentPage, total: totalPages })}
        {typeof totalItems === 'number' && ` ${t('pagination.records', { total: totalItems })}`}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        <IconButton
          icon={<ChevronLeft size={18} />}
          aria-label={t('pagination.prev')}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          size="sm"
          variant="outline"
        />
        <IconButton
          icon={<ChevronRight size={18} />}
          aria-label={t('pagination.next')}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          size="sm"
          variant="outline"
        />
      </div>
    </nav>
  )
}
