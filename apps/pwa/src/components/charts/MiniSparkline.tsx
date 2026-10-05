import React from 'react'

export interface MiniSparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  color = '#ae9357',
  width = 90,
  height = 28,
}) => {
  const safeData = !data || data.length < 2 ? [2, 5, 4, 8, 6, 9, 8, 12] : data

  const min = Math.min(...safeData)
  const max = Math.max(...safeData)
  const range = max - min || 1

  const padding = 2
  const points = safeData.map((val, idx) => {
    const x = padding + (idx / (safeData.length - 1)) * (width - padding * 2)
    const y = height - padding - ((val - min) / range) * (height - padding * 2)
    return { x, y }
  })

  let pathD = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    const mx = (current.x + next.x) / 2
    pathD += ` C ${mx} ${current.y}, ${mx} ${next.y}, ${next.x} ${next.y}`
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible', opacity: 0.85 }}
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="2.5"
          fill={color}
        />
      )}
    </svg>
  )
}
