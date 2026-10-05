import React, { useState } from 'react'
import type { CurrencyCode } from '../../types'
import { formatCurrency } from '../../utils/formatters'
import { triggerHaptic } from '../../utils/haptics'
import { useLanguage } from '../../context/LanguageContext'

export interface CategoryExpenseItem {
  id: string
  name: string
  color: string
  total: number
  percent: number
}

export interface CategoryDonutChartProps {
  categories: CategoryExpenseItem[]
  totalExpense: number
  currency?: CurrencyCode
}

const SLASH_PALETTE = [
  '#ae9357', // Gilded Gold
  '#cc9166', // Copper
  '#c7c9d1', // Silver
  '#777a88', // Steel
  '#464853', // Smoke
  '#5e616e', // Ash
]

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  categories,
  totalExpense,
  currency,
}) => {
  const { t } = useLanguage()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const size = 180
  const strokeWidth = 18
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Calcular segmentos de arco SVG
  const segments = React.useMemo(() => {
    const topCats = categories.slice(0, 5)
    return topCats.map((cat, index) => {
      const priorSum = topCats.slice(0, index).reduce((sum, c) => sum + c.percent, 0)
      const strokeDashoffset = -((priorSum / 100) * circumference)
      const strokeDasharray = `${(cat.percent / 100) * circumference} ${circumference}`
      const color = SLASH_PALETTE[index % SLASH_PALETTE.length] || cat.color
      return { ...cat, color, strokeDasharray, strokeDashoffset }
    })
  }, [categories, circumference])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-4)',
        width: '100%',
      }}
    >
      {/* Dona SVG */}
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Anillo de fondo Graphite */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-carbon)"
            strokeWidth={strokeWidth}
          />

          {/* Segmentos de categorías con colores Slash */}
          {segments.map((seg, idx) => (
            <circle
              key={seg.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={hoveredIndex === idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                opacity: hoveredIndex !== null && hoveredIndex !== idx ? 0.4 : 1,
              }}
              onMouseEnter={() => {
                triggerHaptic('light')
                setHoveredIndex(idx)
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Centro de la dona con tipografía didone */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            padding: '12px',
          }}
        >
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-fog)' }}>
            {hoveredIndex !== null ? segments[hoveredIndex]?.name : t('charts.expenses')}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: hoveredIndex !== null ? '1.15rem' : '1.35rem',
              fontWeight: 400,
              color: 'var(--color-paper-white)',
              marginTop: '2px',
              lineHeight: 1.1,
            }}
          >
            {hoveredIndex !== null
              ? `${segments[hoveredIndex]?.percent.toFixed(0)}%`
              : formatCurrency(totalExpense, currency)}
          </span>
        </div>
      </div>

      {/* Lista de desglose en estilo editorial */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {segments.map((cat, idx) => (
          <div
            key={cat.id}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: hoveredIndex === idx ? 'var(--color-carbon)' : 'transparent',
              transition: 'background-color var(--transition-fast)',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: cat.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: 'var(--color-bone)', fontWeight: 500 }}>{cat.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--color-fog)', fontSize: '12px' }}>
                {cat.percent.toFixed(0)}%
              </span>
              <strong style={{ color: 'var(--color-paper-white)', fontWeight: 600 }}>
                {formatCurrency(cat.total, currency)}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
