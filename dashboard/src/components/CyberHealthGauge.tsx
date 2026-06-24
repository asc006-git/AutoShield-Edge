'use client'

import { motion } from 'framer-motion'

interface CyberHealthGaugeProps {
  score: number
  size?: number
  showDetails?: boolean
  animated?: boolean
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
}

function getRiskCategory(score: number) {
  if (score >= 80) return { label: 'Secure', sub: 'All systems nominal' }
  if (score >= 60) return { label: 'Stable', sub: 'Minor deviations detected' }
  if (score >= 40) return { label: 'Warning', sub: 'Elevated risk factors' }
  if (score >= 20) return { label: 'High Risk', sub: 'Significant threats present' }
  return { label: 'Critical', sub: 'Immediate action required' }
}

export default function CyberHealthGauge({
  score,
  size = 200,
  showDetails = true,
  animated = true,
}: CyberHealthGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score))
  const cx = size / 2
  const cy = size / 2
  const radius = cx - 24
  const startAngle = 225
  const sweep = 270
  const endAngle = startAngle + sweep
  const risk = getRiskCategory(clampedScore)

  const trackPath = describeArc(cx, cy, radius, startAngle, endAngle)

  const pathAnim = animated
    ? {
        initial: { pathLength: 0 },
        animate: { pathLength: clampedScore / 100 },
        transition: { duration: 1.5, ease: [0.25, 0.1, 0.25, 1] as const },
      }
    : {
        initial: { pathLength: clampedScore / 100 },
        animate: { pathLength: clampedScore / 100 },
      }

  const barAnim = animated
    ? {
        initial: { width: 0 },
        animate: { width: '100%' as const },
        transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] as const },
      }
    : {
        initial: { width: '100%' as const },
        animate: { width: '100%' as const },
      }

  const glowPath = describeArc(cx, cy, radius + 6, startAngle, endAngle)

  const tickMarks = [0, 25, 50, 75, 100].map((tick) => {
    const angle = startAngle + sweep * (tick / 100)
    const outer = polarToCartesian(cx, cy, radius + 6, angle)
    const inner = polarToCartesian(cx, cy, radius - 4, angle)
    return { x1: outer.x, y1: outer.y, x2: inner.x, y2: inner.y, label: tick }
  })

  const tickLabels = [0, 25, 50, 75, 100].map((tick) => {
    const angle = startAngle + sweep * (tick / 100)
    const pos = polarToCartesian(cx, cy, radius + 20, angle)
    return { x: pos.x, y: pos.y, label: tick }
  })

  const breakdownItems = [
    {
      label: 'Threat',
      value: Math.round(Math.max(0, Math.min(100, 100 - clampedScore * 0.85 + 5))),
    },
    {
      label: 'Stability',
      value: Math.round(Math.max(0, Math.min(100, clampedScore * 0.9 + 5))),
    },
    {
      label: 'Pressure',
      value: Math.round(Math.max(0, Math.min(100, 100 - clampedScore * 0.75))),
    },
  ]

  return (
    <div
      style={{
        width: size,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id="gauge-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="gauge-ambient" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComponentTransfer in="blur" result="faded">
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="faded" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d={trackPath}
          fill="none"
          stroke="#222"
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        <motion.path
          d={glowPath}
          fill="none"
          stroke="white"
          strokeWidth={10}
          strokeLinecap="round"
          opacity={0.08}
          filter="url(#gauge-glow)"
          {...pathAnim}
        />

        <motion.path
          d={trackPath}
          fill="none"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          filter="url(#gauge-ambient)"
          {...pathAnim}
        />

        {tickMarks.map((tick) => (
          <motion.line
            key={`tick-${tick.label}`}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="#555"
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          />
        ))}

        {tickLabels.map((tick) => (
          <motion.text
            key={`label-${tick.label}`}
            x={tick.x}
            y={tick.y}
            fill="#666"
            fontSize={size * 0.04}
            fontWeight={500}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {tick.label}
          </motion.text>
        ))}

        <motion.text
          x={cx}
          y={cy - 4}
          fill="white"
          fontSize={size * 0.18}
          fontWeight={250}
          textAnchor="middle"
          dominantBaseline="auto"
          fontFamily="ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"
          letterSpacing={4}
          initial={{ opacity: 0, y: cy - 4 + 8 }}
          animate={{ opacity: 1, y: cy - 4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {clampedScore}
        </motion.text>

        <motion.text
          x={cx}
          y={cy + 22}
          fill="#777"
          fontSize={size * 0.042}
          fontWeight={600}
          textAnchor="middle"
          dominantBaseline="hanging"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          letterSpacing={3}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {risk.label.toUpperCase()}
        </motion.text>

        <motion.circle
          cx={polarToCartesian(cx, cy, radius, startAngle).x}
          cy={polarToCartesian(cx, cy, radius, startAngle).y}
          r={3}
          fill="white"
          opacity={0.4}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        />

        <motion.circle
          cx={polarToCartesian(cx, cy, radius, endAngle).x}
          cy={polarToCartesian(cx, cy, radius, endAngle).y}
          r={3}
          fill="white"
          opacity={0.4}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        />
      </svg>

      {showDetails && (
        <motion.div
          style={{
            width: '100%',
            marginTop: Math.max(8, size * 0.06),
            display: 'flex',
            flexDirection: 'column',
            gap: Math.max(6, size * 0.04),
            paddingLeft: 4,
            paddingRight: 4,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {breakdownItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: size * 0.035,
              }}
            >
              <span
                style={{
                  color: '#888',
                  fontSize: Math.max(9, size * 0.058),
                  fontWeight: 500,
                  letterSpacing: 1.5,
                  minWidth: Math.max(48, size * 0.3),
                  fontFamily:
                    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
                }}
              >
                {item.label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: Math.max(3, size * 0.02),
                  background: '#1a1a1a',
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <motion.div
                  style={{
                    height: '100%',
                    background:
                      item.value >= 60
                        ? 'rgba(255,255,255,0.85)'
                        : item.value >= 40
                        ? 'rgba(255,255,255,0.5)'
                        : 'rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    position: 'absolute',
                    left: 0,
                    top: 0,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{
                    duration: 1.2,
                    ease: [0.25, 0.1, 0.25, 1] as const,
                    delay: 0.4 + breakdownItems.indexOf(item) * 0.15,
                  }}
                />
              </div>
              <span
                style={{
                  color: '#555',
                  fontSize: Math.max(8, size * 0.052),
                  fontWeight: 600,
                  minWidth: Math.max(20, size * 0.12),
                  textAlign: 'right',
                  fontFamily:
                    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
