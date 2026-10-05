import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
  emptyMessage?: string
  renderMobileCard?: (item: T) => React.ReactNode
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage,
  renderMobileCard,
}: DataTableProps<T>) {
  const { t } = useLanguage()
  const displayEmptyMessage = emptyMessage || t('table.empty')

  if (data.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--space-8)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <p>{displayEmptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      {/* Vista de Tarjetas para Móviles (si se proporciona renderMobileCard) */}
      {renderMobileCard && (
        <div className="mobile-only-cards" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {data.map((item) => (
            <div key={keyExtractor(item)} onClick={() => onRowClick?.(item)}>
              {renderMobileCard(item)}
            </div>
          ))}
        </div>
      )}

      {/* Vista de Tabla para Escritorio / Tablets */}
      <div
        className={renderMobileCard ? 'desktop-only-table' : ''}
        style={{
          width: '100%',
          overflowX: 'auto',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-muted)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '0.85rem 1rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)',
                    textAlign: col.align || 'left',
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background-color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = 'var(--bg-surface-muted)'
                }}
                onMouseLeave={(e) => {
                  if (onRowClick) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '1rem',
                      fontSize: '0.925rem',
                      color: 'var(--text-primary)',
                      textAlign: col.align || 'left',
                    }}
                  >
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
