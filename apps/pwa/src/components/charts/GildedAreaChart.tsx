import React, { useState, useMemo } from 'react'
import { formatCurrency } from '../../utils/formatters'
import type { CurrencyCode, Movement } from '../../types'
import { triggerHaptic } from '../../utils/haptics'
import { useLanguage } from '../../context/LanguageContext'

export interface GildedAreaChartProps {
  movements: Movement[]
  currentBalance: number
  currency?: CurrencyCode
}

type Period = '7D' | '30D' | 'ALL'

export const GildedAreaChart: React.FC<GildedAreaChartProps> = ({
  movements,
  currentBalance,
  currency,
}) => {
  const { t } = useLanguage()
  const [period, setPeriod] = useState<Period>('30D')
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; date: string; balance: number } | null>(null)

  // Generar puntos de datos ordenados cronológicamente
  const chartData = useMemo(() => {
    const now = new Date()
    let daysToInclude = 30
    if (period === '7D') daysToInclude = 7
    else if (period === 'ALL') daysToInclude = 90

    // Fechas en el rango
    const dates: string[] = []
    for (let i = daysToInclude - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
    }

    // Calcular flujo acumulado simulado o real
    let running = currentBalance * 0.85
    const points = dates.map((date) => {
      const dayMovements = movements.filter((m) => m.date === date)
      const netDay = dayMovements.reduce((sum, m) => {
        if (m.type === 'income') return sum + m.amount
        if (m.type === 'expense') return sum - m.amount
        if (m.type === 'savings_transfer') {
          return sum + (m.transferDirection === 'in' ? m.amount : -m.amount)
        }
        return sum
      }, 0)
      running += netDay
      return { date, balance: running }
    })

    // Asegurar que el último punto coincida con el balance actual
    if (points.length > 0) {
      points[points.length - 1].balance = currentBalance
    }

    return points
  }, [movements, currentBalance, period])

  // Calcular límites para normalización SVG
  const values = chartData.map((d) => d.balance)
  const minVal = Math.min(...values, 0)
  const maxVal = Math.max(...values, currentBalance * 1.15, 100)
  const range = maxVal - minVal || 1

  const width = 640
  const height = 220
  const paddingX = 20
  const paddingY = 30

  // Coordenadas calculadas
  const coords = chartData.map((d, index) => {
    const x = paddingX + (index / (chartData.length - 1 || 1)) * (width - paddingX * 2)
    const y = height - paddingY - ((d.balance - minVal) / range) * (height - paddingY * 2)
    return { ...d, x, y }
  })

  // Generar comando de curva suave Bézier (Smooth curve)
  const pathD = useMemo(() => {
    if (coords.length === 0) return ''
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`

    let d = `M ${coords[0].x} ${coords[0].y}`
    for (let i = 0; i < coords.length - 1; i++) {
      const current = coords[i]
      const next = coords[i + 1]
      const controlX = (current.x + next.x) / 2
      d += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`
    }
    return d
  }, [coords])

  const areaD = useMemo(() => {
    if (coords.length === 0) return ''
    const first = coords[0]
    const last = coords[coords.length - 1]
    return `${pathD} L ${last.x} ${height - paddingY} L ${first.x} ${height - paddingY} Z`
  }, [pathD, coords, height, paddingY])

  return (
    <div
      className="card card-gradient-gold"
      style={{
        padding: 'var(--space-6)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Encabezado del Chart con Filosofía Slash */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div>
          <span className="category-eyebrow" style={{ display: 'block', marginBottom: '4px' }}>
            {t('dashboard.curveEyebrow')}
          </span>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 400,
              color: 'var(--color-paper-white)',
              letterSpacing: '0.01em',
              lineHeight: 1.1,
            }}
          >
            {formatCurrency(currentBalance, currency)}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-fog)', marginTop: '4px' }}>
            {t('dashboard.curveSubtitle')}
          </p>
        </div>

        {/* Selector de Períodos en Píldoras Slash */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--color-carbon)',
            padding: '3px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-graphite)',
          }}
        >
          {(['7D', '30D', 'ALL'] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                triggerHaptic('light')
                setPeriod(p)
              }}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: period === p ? 600 : 400,
                color: period === p ? 'var(--color-obsidian)' : 'var(--color-fog)',
                backgroundColor: period === p ? 'var(--color-paper-white)' : 'transparent',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {p === '7D' ? '7D' : p === '30D' ? '30D' : t('dashboard.periodAll')}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico SVG en Gilded Gradient */}
      <div style={{ position: 'relative', width: '100%', height: '170px' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradiente dorado Slash */}
            <linearGradient id="gilded-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ae9357" />
              <stop offset="40%" stopColor="#fff0cc" />
              <stop offset="70%" stopColor="#ae9357" />
              <stop offset="100%" stopColor="#8c703b" />
            </linearGradient>

            {/* Gradiente de relleno hacia abajo */}
            <linearGradient id="gilded-area-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(174, 147, 87, 0.22)" />
              <stop offset="60%" stopColor="rgba(174, 147, 87, 0.05)" />
              <stop offset="100%" stopColor="rgba(174, 147, 87, 0.0)" />
            </linearGradient>
          </defs>

          {/* Líneas guía sutiles Graphite */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="var(--color-graphite)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="var(--color-graphite)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Relleno translúcido */}
          <path d={areaD} fill="url(#gilded-area-fill)" />

          {/* Línea dorada de trazo fluido */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#gilded-line)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Puntos interactivos transparentes con detección táctil/hover */}
          {coords.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="6"
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={() => {
                triggerHaptic('light')
                setHoveredPoint(pt)
              }}
            />
          ))}

          {/* Punto activo resaltado en dorado */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={paddingY}
                x2={hoveredPoint.x}
                y2={height - paddingY}
                stroke="var(--color-copper)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="5"
                fill="#ffffff"
                stroke="#ae9357"
                strokeWidth="2.5"
              />
            </g>
          )}
        </svg>

        {/* Tooltip interactivo flotante */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: `${(hoveredPoint.x / width) * 100}%`,
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--color-carbon)',
              border: '1px solid var(--color-steel)',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 12px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            }}
          >
            <span style={{ color: 'var(--color-fog)', marginRight: '6px' }}>{hoveredPoint.date}:</span>
            <strong style={{ color: 'var(--color-paper-white)' }}>
              {formatCurrency(hoveredPoint.balance, currency)}
            </strong>
          </div>
        )}
      </div>

      {/* Pie de gráfica con métricas de contabilidad */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--color-graphite)',
          paddingTop: 'var(--space-3)',
          marginTop: 'var(--space-2)',
          fontSize: '12px',
          color: 'var(--color-mist)',
        }}
      >
        <span>{t('charts.accountingBase')}</span>
        <span style={{ color: 'var(--color-copper)', fontWeight: 600 }}>{t('charts.activeLedger')}</span>
        <span>{t('charts.realtime')}</span>
      </div>
    </div>
  )
}
