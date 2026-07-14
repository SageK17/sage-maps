import type { CSSProperties } from 'react'

/** Canonical monogram geometry — 24×24 grid, stroke 2.7, dot r2.2 at (16.6, 4.7). */
export const MONOGRAM_PATH =
  'M16.6 4.7 L10.2 4.7 C8.7 4.7 7.9 5.5 7.9 7 L7.9 9.7 C7.9 11.2 8.7 12 10.2 12 L13.8 12 C15.3 12 16.1 12.8 16.1 14.3 L16.1 17 C16.1 18.5 15.3 19.3 13.8 19.3 L7.4 19.3'

export function Monogram({
  size = 24,
  stroke,
  dot,
  drawIn = false,
  style,
}: {
  size?: number
  stroke: string
  dot: string
  /** splash draw-in: stroke draws 1.1s (+.15s delay), dot pops via spring at 1.15s */
  drawIn?: boolean
  style?: CSSProperties
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      <path
        d={MONOGRAM_PATH}
        fill="none"
        stroke={stroke}
        strokeWidth={2.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={drawIn ? 1 : undefined}
        style={
          drawIn
            ? { animation: 'sgDraw 1.1s cubic-bezier(.3,.7,.3,1) .15s both' }
            : undefined
        }
      />
      <circle
        cx={16.6}
        cy={4.7}
        r={2.2}
        fill={dot}
        style={
          drawIn
            ? {
                transformBox: 'fill-box',
                transformOrigin: 'center',
                animation: 'sgPop .5s cubic-bezier(.2,.9,.3,1.4) 1.15s both',
              }
            : undefined
        }
      />
    </svg>
  )
}

/** Monogram in a gold-tinted circle — Sage's avatar. */
export function SageAvatar({ size = 34 }: { size?: number }) {
  const inner = Math.round(size * (20 / 34))
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--goldT)',
        border: '1px solid color-mix(in oklab, var(--gold), transparent 55%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Monogram size={inner} stroke="var(--acD)" dot="var(--gold)" />
    </div>
  )
}

export function Wordmark({
  size = 27,
  ink,
  muted,
}: {
  size?: number
  ink: string
  muted: string
}) {
  return (
    <span
      style={{
        fontSize: size,
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: ink,
        lineHeight: 1,
      }}
    >
      sage
      <span style={{ fontWeight: 500, color: muted }}> maps</span>
    </span>
  )
}
